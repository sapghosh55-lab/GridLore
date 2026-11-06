🌌 GridLore: Spatial Narrative Engine

A GeNarrative Clash 2026 Hackathon Project
Track: Narrative & Screenplay
Status: 50% Pre-Build Stage (Online Submission)

📖 The Concept

GridLore is an interactive, browser-based world-building canvas where the geography you sculpt dictates the story that is written. It acts as a generative co-pilot for game designers, Dungeon Masters, or fantasy authors.

Instead of typing text prompts into a standard chatbox, the human creator physically builds a 3D environment. As they place assets (like a tavern next to a mountain), the system detects the spatial relationships and generates the underlying lore, history, and NPC dialogue specific to those exact geographical coordinates.

🎯 How It Fits The Theme ("Where GenAI meets human creativity")

GridLore does not replace the author; it provides scaffolding. The human remains the architect, making all structural, aesthetic, and spatial decisions. The GenAI simply acts as a smart memory bank and co-author, eliminating the friction of tracking continuity and tedious lore-writing across sprawling maps.

🚀 Current State: The 50% Pre-Build

In accordance with the GeNarrative Clash 50/50 rule, this repository contains the structural foundation and routing architecture.

What is currently built and working:

The 3D Canvas (Frontend): A Next.js 14 application rendering a 10x10 isometric voxel grid using React Three Fiber. Users can select and place blocks (Tavern, Mountain, Forest) on the grid.

The UI Shell: A strict dark-mode interface with neon purple and cyan accents, featuring a reactive "Context Card" that triggers upon block placement.

The Semantic Router (Backend): A Python FastAPI server that acts as a "traffic cop." It uses sentence-transformers/all-MiniLM-L6-v2 to calculate cosine similarity on incoming block data.

Dummy Routing Logic: The backend successfully classifies intent. Lightweight requests (e.g., Tavern = quick dialogue) route to a simulated "Local/Fast" tier, while deep worldbuilding requests (e.g., Mountain = geographical history) route to a simulated "Cloud/Heavy" tier, returning dummy JSON text to the frontend.

🛠️ Tech Stack (So Far)

Frontend: Next.js 14 (App Router), Tailwind CSS, Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei).

Backend: Python 3, FastAPI, Uvicorn, SentenceTransformers (Hugging Face).

💻 How to Run Locally

You will need two terminal windows to run the brain (backend) and the canvas (frontend) simultaneously.

1. Start the Backend (FastAPI)

Navigate to the backend directory:

cd backend
pip install fastapi uvicorn sentence-transformers numpy
uvicorn main:app --reload


The backend will run on http://localhost:8000

2. Start the Frontend (Next.js)

Open a new terminal and navigate to the frontend directory:

cd frontend
npm install
npm run dev


The frontend will run on http://localhost:3000

3. Test the Engine

Open http://localhost:3000 in your browser.

Select a block from the bottom toolbar.

Click any tile on the 3D grid.

Watch the Context Card on the right populate with the dynamically routed response from the backend!

🏁 Next Steps: The 50% Live Sprint (Nov 21, 2026)

For the final 6-hour offline hackathon sprint, we will replace the backend dummy endpoints with live Generative AI models:

Tier 1 Integration (Fast Lane): Connect a local Ollama instance running Gemma 2 2B for instant, low-latency dialogue and micro-lore generation.

Tier 2 Integration (Heavy Lane): Connect the Groq Llama 3.3 70B API for complex, overarching historical text generation.

Prompt Engineering: Finalize the spatial context prompt templates so the models can read exact grid coordinates and adjacent biomes for deep continuity.

Built with ❤️ for GeNarrative Clash 2026
