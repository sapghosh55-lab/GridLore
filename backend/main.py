"""
GridLore Backend API — Semantic Router Skeleton
==================================================
Hackathon pre-build for GridLore 3D spatial narrative engine.
Implements semantic routing between Local tier (Gemma 2 2B via Ollama)
and Cloud tier (Groq Llama 3.3 70B) using sentence-transformers and cosine similarity.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure offline loading for cached model weights to prevent network retries
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("gridlore.router")

# ---------------------------------------------------------------------------
# Global State & Target Embeddings
# ---------------------------------------------------------------------------
ml_state: Dict[str, Any] = {
    "model": None,
    "target_history_vec": None,
    "target_dialogue_vec": None,
}

# Target descriptions for semantic routing
TARGET_HISTORICAL_TEXT = "generate a 500-year history of a mountain range"
TARGET_DIALOGUE_TEXT = "what is a random rumor heard in a tavern"

# 50% Rule Cosine Similarity Threshold
SIMILARITY_THRESHOLD = 0.50


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager: Load sentence-transformers model once during startup
    and pre-compute normalized target vectors for zero-latency runtime routing.
    """
    logger.info("Initializing GridLore Semantic Router...")
    try:
        from sentence_transformers import SentenceTransformer

        # Load all-MiniLM-L6-v2 (cached locally)
        logger.info("Loading sentence-transformers/all-MiniLM-L6-v2 model...")
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", local_files_only=True)
        ml_state["model"] = model

        # Pre-compute target embeddings (L2-normalized so dot product == cosine similarity)
        logger.info(f"Embedding historical target: '{TARGET_HISTORICAL_TEXT}'")
        target_history = model.encode(TARGET_HISTORICAL_TEXT, normalize_embeddings=True)

        logger.info(f"Embedding dialogue target: '{TARGET_DIALOGUE_TEXT}'")
        target_dialogue = model.encode(TARGET_DIALOGUE_TEXT, normalize_embeddings=True)

        ml_state["target_history_vec"] = np.array(target_history, dtype=np.float32)
        ml_state["target_dialogue_vec"] = np.array(target_dialogue, dtype=np.float32)

        logger.info("Semantic Router successfully initialized and ready for inference!")
    except Exception as e:
        logger.error(f"Failed to load sentence-transformers model: {e}")
        raise e

    yield

    logger.info("Shutting down GridLore Semantic Router...")
    ml_state.clear()


# ---------------------------------------------------------------------------
# FastAPI Application Setup with CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="GridLore Semantic Lore Engine",
    description="Spatial Narrative Router between Local (Gemma 2 2B) and Cloud (Groq Llama 3.3 70B) tiers",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS to accept requests from Next.js frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "*",  # Permissive for local hackathon development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Request / Response Schemas
# ---------------------------------------------------------------------------
class AdjacentBlock(BaseModel):
    block_type: Optional[str] = None
    type: Optional[str] = None
    x: Optional[int] = None
    z: Optional[int] = None
    direction: Optional[str] = None


class GenerateLoreRequest(BaseModel):
    block_type: str = Field(..., description="Voxel block type, e.g. Tavern, Mountain, Forest")
    x: int = Field(..., description="X coordinate on the 10x10 voxel grid")
    z: int = Field(..., description="Z coordinate on the 10x10 voxel grid")
    adjacent_blocks: List[Any] = Field(
        default_factory=list,
        description="List of detected adjacent blocks with coordinates and relative directions",
    )


class GenerateLoreResponse(BaseModel):
    tier: str = Field(..., description="Selected LLM generation tier")
    dummy_lore: str = Field(..., description="Generated dummy narrative text")
    lore: str = Field(..., description="Alias for dummy_lore to maintain frontend compatibility")
    similarity_scores: Dict[str, float] = Field(
        ..., description="Cosine similarity scores against target vectors"
    )
    routing_decision: str = Field(..., description="Explanation of the semantic routing decision")


# ---------------------------------------------------------------------------
# Helper: Cosine Similarity via NumPy Dot Product
# ---------------------------------------------------------------------------
def compute_cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    """
    Computes cosine similarity using NumPy dot product.
    If vectors are unit-normalized, dot product is equivalent to cosine similarity.
    """
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))


# ---------------------------------------------------------------------------
# Route: POST /generate-lore
# ---------------------------------------------------------------------------
@app.post("/generate-lore", response_model=GenerateLoreResponse)
async def generate_lore(payload: GenerateLoreRequest):
    """
    Semantic Router Endpoint:
    1. Embeds incoming block_type (and optional spatial context).
    2. Runs NumPy dot product cosine similarity checks against:
       - 'deep historical lore' target vector
       - 'quick dialogue' target vector
    3. Evaluates the 50% Rule threshold to route to Local vs. Cloud tier.
    4. Returns placeholder lore ready for Ollama / Groq integration.
    """
    model = ml_state.get("model")
    target_history_vec = ml_state.get("target_history_vec")
    target_dialogue_vec = ml_state.get("target_dialogue_vec")

    if model is None or target_history_vec is None or target_dialogue_vec is None:
        raise HTTPException(status_code=503, detail="ML Semantic Router is not yet initialized.")

    logger.info(
        f"Incoming placement request: block_type='{payload.block_type}' at ({payload.x}, {payload.z}) "
        f"with {len(payload.adjacent_blocks)} adjacent blocks."
    )

    # 1. Embed the incoming block_type
    block_vec = model.encode(payload.block_type, normalize_embeddings=True)
    block_vec = np.array(block_vec, dtype=np.float32)

    # 2. Compute cosine similarity against both target vectors using NumPy dot product
    sim_history = compute_cosine_similarity(block_vec, target_history_vec)
    sim_dialogue = compute_cosine_similarity(block_vec, target_dialogue_vec)

    logger.info(
        f"Cosine Similarities -> Dialogue Target: {sim_dialogue:.4f} | "
        f"Historical Target: {sim_history:.4f}"
    )

    # -----------------------------------------------------------------------
    # 3. The 50% Rule Semantic Routing Mechanism
    # -----------------------------------------------------------------------
    # If the semantic similarity to dialogue meets/exceeds 50% (0.50), or if
    # dialogue similarity dominates history, route to the Fast Local Tier (Ollama).
    # Otherwise (e.g. Mountain / ancient terrain lore), route to Heavy Cloud Tier (Groq).
    # -----------------------------------------------------------------------
    is_dialogue_tier = sim_dialogue >= SIMILARITY_THRESHOLD or (sim_dialogue > sim_history)

    if is_dialogue_tier:
        tier = "Local (Gemma 2 2B)"
        dummy_lore = (
            "[Local Generation Placeholder] A tired miner sits in the tavern, "
            "complaining about the adjacent mountain."
        )
        reason = (
            f"Dialogue similarity ({sim_dialogue:.3f}) >= 50% threshold or exceeded "
            f"historical similarity ({sim_history:.3f}). Routed to Fast Local Tier."
        )
        # TODO [Sprint Step]:
        # Connect Ollama API call here:
        # response = await ollama_client.generate(model="gemma2:2b", prompt=f"Write quick tavern dialogue for {payload.block_type} at {payload.x},{payload.z}")
    else:
        tier = "Cloud (Groq Llama 3.3 70B)"
        dummy_lore = (
            "[Cloud Generation Placeholder] The towering peaks were formed centuries ago..."
        )
        reason = (
            f"Historical similarity ({sim_history:.3f}) exceeded dialogue similarity ({sim_dialogue:.3f}). "
            f"Routed to Heavy Cloud Tier for deep lore generation."
        )
        # TODO [Sprint Step]:
        # Connect Groq API call here:
        # response = await groq_client.chat.completions.create(model="llama-3.3-70b-versatile", messages=[...])

    logger.info(f"Routing Decision: {tier} | Reason: {reason}")

    return GenerateLoreResponse(
        tier=tier,
        dummy_lore=dummy_lore,
        lore=dummy_lore,
        similarity_scores={
            "quick_dialogue": round(sim_dialogue, 4),
            "deep_historical_lore": round(sim_history, 4),
        },
        routing_decision=reason,
    )


# ---------------------------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------------------------
@app.get("/")
@app.get("/health")
async def health_check():
    """Health check endpoint to verify server and model status."""
    is_ready = ml_state.get("model") is not None
    return {
        "status": "online" if is_ready else "initializing",
        "service": "GridLore Semantic Router API",
        "model": "sentence-transformers/all-MiniLM-L6-v2",
        "target_vectors_loaded": is_ready,
        "similarity_threshold": SIMILARITY_THRESHOLD,
    }


if __name__ == "__main__":
    import uvicorn

    # Run the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

