"""
GridLore Backend API — Semantic Router
==================================================
Hackathon build for GridLore 3D spatial narrative engine.
Implements semantic routing between Local tier (Gemma 2 2B via Ollama)
and Cloud tier (Groq Llama 3.3 70B) using sentence-transformers and cosine similarity.
"""

import os
import sys
import logging
import inspect
from contextlib import asynccontextmanager
from typing import List, Dict, Any, Optional

import numpy as np
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import AsyncGroq, Groq
from pydantic import BaseModel, Field

# Ensure offline loading for cached model weights to prevent network retries
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

# Load environment variables from .env file
# Look in current working directory and parent paths
load_dotenv()
_backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(_backend_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(_backend_dir), ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(_backend_dir)), ".env"))

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

# ---------------------------------------------------------------------------
# Dynamic Prompt Templates
# ---------------------------------------------------------------------------
# Cloud Tier: Deep Worldbuilding
WORLDBUILDING_PROMPT_TEMPLATE = (
    "You are a master fantasy worldbuilder. The creator has just placed a {block_type} at coordinates X:{x}, Z:{z}. "
    "Adjacent to this location are: {adjacent_blocks}. "
    "Write a 3-paragraph historical lore entry about this specific {block_type}. "
    "Focus on how its geography and neighboring biomes shaped its 500-year history. "
    "Be atmospheric and creative."
)

# Local Tier: Quick NPC Dialogue & Rumors
DIALOGUE_PROMPT_TEMPLATE = (
    "You are an NPC living in a {block_type}. The surrounding area contains: {adjacent_blocks}. "
    "Keep it under 2 sentences. Generate a quick, flavorful rumor or passing comment that a traveler might hear here. "
    "Do not explain the setting, just provide the dialogue."
)


def format_adjacent_blocks(adjacent_blocks: Any) -> str:
    """Format adjacent blocks list or structure into human-readable description for prompt."""
    if not adjacent_blocks:
        return "None"
    if isinstance(adjacent_blocks, str):
        return adjacent_blocks
    if isinstance(adjacent_blocks, list):
        formatted = []
        for item in adjacent_blocks:
            if isinstance(item, str):
                formatted.append(item)
            elif isinstance(item, dict):
                b_type = item.get("block_type") or item.get("type") or "Unknown"
                direction = item.get("direction")
                x = item.get("x")
                z = item.get("z")
                desc = b_type
                if direction:
                    desc += f" ({direction}"
                    if x is not None and z is not None:
                        desc += f", X:{x}, Z:{z}"
                    desc += ")"
                elif x is not None and z is not None:
                    desc += f" (X:{x}, Z:{z})"
                formatted.append(desc)
            else:
                formatted.append(str(item))
        return ", ".join(formatted) if formatted else "None"
    return str(adjacent_blocks)


def build_worldbuilding_prompt(block_type: str, x: int, z: int, adjacent_blocks: Any) -> str:
    """Dynamically populate the worldbuilding prompt template."""
    adj_str = format_adjacent_blocks(adjacent_blocks)
    return WORLDBUILDING_PROMPT_TEMPLATE.format(
        block_type=block_type,
        x=x,
        z=z,
        adjacent_blocks=adj_str,
    )


def build_dialogue_prompt(block_type: str, adjacent_blocks: Any) -> str:
    """Dynamically populate the dialogue prompt template."""
    adj_str = format_adjacent_blocks(adjacent_blocks)
    return DIALOGUE_PROMPT_TEMPLATE.format(
        block_type=block_type,
        adjacent_blocks=adj_str,
    )


def get_groq_client() -> AsyncGroq:
    """
    Instantiate AsyncGroq client using GROQ_API_KEY from environment or .env file.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY is not set in environment or .env file.")
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set. Please configure it in your .env file or environment variables.",
        )
    return AsyncGroq(api_key=api_key)


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
        logger.warning(
            f"Sentence-transformers could not be loaded ({e}). "
            "Falling back to heuristic semantic routing mode."
        )
        ml_state["model"] = "heuristic_fallback"
        ml_state["target_history_vec"] = np.zeros(384, dtype=np.float32)
        ml_state["target_dialogue_vec"] = np.zeros(384, dtype=np.float32)

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
    adjacent_blocks: Optional[List[Any]] = Field(
        default_factory=list,
        description="List of detected adjacent blocks with coordinates and relative directions",
    )


class GenerateLoreResponse(BaseModel):
    tier: str = Field(..., description="Selected LLM generation tier")
    lore: str = Field(..., description="Generated narrative text")

    @property
    def dummy_lore(self) -> str:
        """Backward compatibility alias for frontend components checking dummy_lore."""
        return self.lore


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
    4. For Local tier: Calls local Ollama instance (gemma:2b) via POST http://localhost:11434/api/generate.
    5. For Cloud tier: Calls Groq API using llama-3.3-70b-versatile with dynamic prompt.
    6. Returns {"tier": "...", "lore": "<generated_text>"}.
    """
    model = ml_state.get("model")
    target_history_vec = ml_state.get("target_history_vec")
    target_dialogue_vec = ml_state.get("target_dialogue_vec")

    if model is None:
        raise HTTPException(status_code=503, detail="ML Semantic Router is not yet initialized.")

    logger.info(
        f"Incoming placement request: block_type='{payload.block_type}' at ({payload.x}, {payload.z}) "
        f"with {len(payload.adjacent_blocks or [])} adjacent blocks."
    )

    # 1. Compute similarity scores
    if model == "heuristic_fallback" or target_history_vec is None or target_dialogue_vec is None:
        if payload.block_type.lower() in ["tavern", "inn", "pub", "house"]:
            sim_dialogue = 0.85
            sim_history = 0.20
        else:
            sim_dialogue = 0.20
            sim_history = 0.85
    else:
        # Embed the incoming block_type
        block_vec = model.encode(payload.block_type, normalize_embeddings=True)
        block_vec = np.array(block_vec, dtype=np.float32)

        # Compute cosine similarity against both target vectors using NumPy dot product
        sim_history = compute_cosine_similarity(block_vec, target_history_vec)
        sim_dialogue = compute_cosine_similarity(block_vec, target_dialogue_vec)

    logger.info(
        f"Cosine Similarities -> Dialogue Target: {sim_dialogue:.4f} | "
        f"Historical Target: {sim_history:.4f}"
    )

    # -----------------------------------------------------------------------
    # 2. The 50% Rule Semantic Routing Mechanism
    # -----------------------------------------------------------------------
    # If the semantic similarity to dialogue meets/exceeds 50% (0.50), or if
    # dialogue similarity dominates history, route to the Fast Local Tier (Ollama).
    # Otherwise (e.g. Mountain / ancient terrain lore), route to Heavy Cloud Tier (Groq).
    # -----------------------------------------------------------------------
    is_dialogue_tier = sim_dialogue >= SIMILARITY_THRESHOLD or (sim_dialogue > sim_history)

    if is_dialogue_tier:
        tier = "Local (Gemma 2 2B)"
        reason = (
            f"Dialogue similarity ({sim_dialogue:.3f}) >= 50% threshold or exceeded "
            f"historical similarity ({sim_history:.3f}). Routed to Fast Local Tier."
        )
        logger.info(f"Routing Decision: {tier} | Reason: {reason}")

        # Construct dynamic prompt from dialogue template
        prompt = build_dialogue_prompt(
            block_type=payload.block_type,
            adjacent_blocks=payload.adjacent_blocks,
        )
        logger.info(f"Dialogue Prompt:\n{prompt}")

        try:
            ollama_url = os.getenv("OLLAMA_GENERATE_URL", "http://localhost:11434/api/generate")
            ollama_payload = {
                "model": "gemma:2b",
                "prompt": prompt,
                "stream": False,
            }
            resp = requests.post(
                ollama_url,
                json=ollama_payload,
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            generated_text = data.get("response", "")
            lore = generated_text.strip() if generated_text else ""
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Ollama API call error: {e}")
            raise HTTPException(status_code=500, detail=f"Ollama API call failed: {str(e)}")

        return GenerateLoreResponse(
            tier=tier,
            lore=lore,
        )
    else:
        tier = "Cloud (Groq Llama 3.3 70B)"
        reason = (
            f"Historical similarity ({sim_history:.3f}) exceeded dialogue similarity ({sim_dialogue:.3f}). "
            f"Routed to Heavy Cloud Tier for deep lore generation."
        )
        logger.info(f"Routing Decision: {tier} | Reason: {reason}")

        # Construct dynamic prompt from worldbuilding template
        prompt = build_worldbuilding_prompt(
            block_type=payload.block_type,
            x=payload.x,
            z=payload.z,
            adjacent_blocks=payload.adjacent_blocks,
        )
        logger.info(f"Worldbuilding Prompt:\n{prompt}")

        client = get_groq_client()
        try:
            call_res = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )
            if inspect.isawaitable(call_res):
                chat_completion = await call_res
            else:
                chat_completion = call_res

            generated_text = chat_completion.choices[0].message.content
            lore = generated_text.strip() if generated_text else ""
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Groq API call error: {e}")
            raise HTTPException(status_code=500, detail=f"Groq API call failed: {str(e)}")

        return GenerateLoreResponse(
            tier=tier,
            lore=lore,
        )


# ---------------------------------------------------------------------------
# Health Check Endpoint
# ---------------------------------------------------------------------------
@app.get("/")
@app.get("/health")
async def health_check():
    """Health check endpoint to verify server and model status."""
    is_ready = ml_state.get("model") is not None
    is_neural = is_ready and ml_state.get("model") != "heuristic_fallback"
    return {
        "status": "online" if is_ready else "initializing",
        "service": "GridLore Semantic Router API",
        "model": "sentence-transformers/all-MiniLM-L6-v2" if is_neural else "heuristic_fallback",
        "target_vectors_loaded": is_ready,
        "similarity_threshold": SIMILARITY_THRESHOLD,
    }


if __name__ == "__main__":
    import uvicorn

    # Run the server on port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
