# 🌌 GridLore: Spatial Narrative Engine

**A GeNarrative Clash 2026 Hackathon Project**  
**Organized by:** GFG Student Chapter — Techno India University, Kolkata  
**Track:** Empowering the Creative Artist (Open Track) — *Narrative & Screenplay*  
**Status:** Complete Hackathon Prototype (100% Build)

---

## 🔗 Quick Links
* **Live Web App (Vercel):** `[Add your Vercel URL here]`
* **Backend API Docs (Render):** `[Add your Render URL/docs here]`
* **Demo Video:** `[Add your Demo Video URL here]`

---

## 📖 The Concept

**GridLore** is an interactive, browser-based 3D world-building canvas where the geography you sculpt directly drives the story that is written. Built as a generative co-pilot for indie game developers, tabletop Dungeon Masters, and fantasy authors, GridLore eliminates the friction of typing repetitive prompts into chatbots.

Instead of describing your map in a text box, you physically place terrain and structure blocks (Taverns, Mountains, Forests) onto a 3D voxel grid. The engine automatically reads the exact `[x, z]` coordinates and neighboring biomes to generate grounded, coordinate-aware lore, NPC rumors, and regional histories in real time.

## 🎯 Theme Alignment: *"Where GenAI Meets Human Creativity"*

GridLore never replaces the creator—it provides intelligent narrative scaffolding. The human remains 100% the architect, making every spatial, structural, and aesthetic decision on the map. GenAI acts strictly as the historian and continuity assistant, keeping the world's lore physically consistent with the geography the creator designed.

---

## ✨ Key Features

* **3D Isometric Voxel Canvas:** Built with Next.js 14 and React Three Fiber, featuring unobstructed natural ambient lighting (no fog of war or pitch-black obscures) wrapped in a sleek dark-mode UI with neon purple (`#8a2be2`) and cyan (`#00ffff`) accents.
* **Spatial Context Detection ($O(1)$ Scaling):** Every block placement automatically extracts `[x, z]` coordinates and immediate `adjacent_blocks`, keeping prompt token sizes constant whether the grid has 5 blocks or 100.
* **Dual-Tier Semantic LLM Router:** Powered by `sentence-transformers/all-MiniLM-L6-v2` and NumPy cosine similarity inside FastAPI to classify creative intent in milliseconds before touching a generative model.
* **Hybrid Local + Cloud AI Pipeline:**
  * **Tier 1 (Fast / Local):** Routes quick, localized NPC dialogue and rumors to **Gemma 2 2B via Ollama** for instant, zero-cost generation (with an automatic cloud fallback to Groq's **Llama 3.1 8B Instant** when deployed on the web).
  * **Tier 2 (Heavy / Cloud):** Routes complex, 500-year geographical histories to **Groq (`llama-3.3-70b-versatile`)** for sub-second, high-depth worldbuilding.
* **Floating Context Card & World History Log:** Displays live generated lore with routing tier badges and maintains a chronological World History sidebar that acts as a living world bible.

---

## 🏗️ System Architecture

```text
[3D Voxel Grid (Next.js + R3F)]
        │  POST /generate-lore { block_type, x, z, adjacent_blocks }
        ▼
[FastAPI Backend Gateway]
        │  Embed & Cosine Similarity (all-MiniLM-L6-v2)
        ▼
  ┌─────┴─────────────────────────────┐
  ▼                                   ▼
[Tier 1: Fast Lane]            [Tier 2: Heavy Lane]
Local Ollama (gemma:2b)        Groq Cloud API
*(Cloud Fallback:              (llama-3.3-70b-versatile)
 Llama 3.1 8B Instant)*        Deep 500-Year World History
Quick NPC Rumors                      │
  │                                   │
  └─────┬─────────────────────────────┘
        ▼
[Context Card + World History Sidebar]
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend & 3D Engine** | Next.js 14 (App Router), Tailwind CSS, Three.js, React Three Fiber, Drei |
| **Backend & API** | Python 3, FastAPI, Uvicorn |
| **Semantic Routing** | Hugging Face `sentence-transformers` (`all-MiniLM-L6-v2`), NumPy |
| **Generative AI Models** | Ollama (`gemma:2b`), Groq API (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 💻 Running Locally

### Prerequisites
* **Node.js** (v18+)
* **Python** (3.10+)
* **Groq API Key** (from [console.groq.com](https://console.groq.com))
* **Ollama** (optional for local Tier 1): Install from [ollama.com](https://ollama.com) and run `ollama pull gemma:2b`

### 1. Start the Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Run the FastAPI server:
```bash
uvicorn main:app --reload
```
*Backend runs on `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`).*

### 2. Start the Frontend (Next.js)
Open a second terminal:
```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend` folder (optional for local dev):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the development server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🚀 Deployment Overview

* **Backend (Render):** Deployed as a Python Web Service with start command `uvicorn main:app --host 0.0.0.0 --port $PORT` and `GROQ_API_KEY` set in Environment Variables. If local Ollama is unreachable in the cloud, Tier 1 gracefully falls back to Groq's `llama-3.1-8b-instant`.
* **Frontend (Vercel):** Deployed directly from GitHub with `NEXT_PUBLIC_API_URL` pointing to the live Render backend URL.

---

## 🔮 Future Scope

* **Persistent Vector Memory:** Store every generated tile in Qdrant/Chroma so new locations dynamically reference factions, characters, and past events across massive maps.
* **Game Engine Plugins & Exports:** One-click export to JSON, Markdown, and Twine, plus native plugins for Unity and Unreal Engine.
* **Massive World Scaling:** Upgrade rendering to Three.js `InstancedMesh` with custom 3D GLTF assets and multi-level elevation.
* **Non-Destructive Human Editing & Co-Op:** Allow authors to manually edit/lock lore entries as ground truth and collaborate in real time via WebSockets.

---

*Built with ❤️ for **GeNarrative Clash 2026** — GFG Student Chapter, Techno India University.*
