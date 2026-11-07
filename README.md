<div align="center">

# 🌌 GridLore
### Build a world. Let the world tell its story.

A spatial storytelling engine where the geography you sculpt becomes the prompt for the narrative that follows.

**GeNarrative Clash 2026**  
**Track:** Narrative & Screenplay  
**Submission Stage:** 50% Pre-Build

</div>

---

## ✨ The Idea

A tavern beside a mountain is not just a layout choice—it is a story seed.

**GridLore** is a browser-based world-building prototype that turns spatial composition into narrative context. Instead of writing a prompt in a blank chat box, the creator physically designs the world on an interactive 3D grid. Each placed object, terrain shift, and neighbor relationship influences the story, mood, and lore that emerge.

This project explores a new creative workflow:

- The human remains the architect of the world.
- The system acts as a narrative co-pilot.
- AI responds to spatial meaning, not just text.
- Storytelling begins from place, not from a prompt alone.

> The map becomes the memory.  
> The world becomes the prompt.

---

## 🎯 Why this fits the theme

This project sits at the intersection of human creativity and generative AI.

GridLore does not replace the author. It scaffolds the creative process:

- You decide what exists in the world.
- You decide how the world is structured.
- The AI helps interpret the resulting narrative possibilities.

This makes the tool collaborative, intentional, and spatially grounded—turning world design into a story-generation interface.

---

## 🧠 What is currently built

This repository contains the structural foundation and routing architecture for the prototype.

### Frontend
- 10×10 isometric voxel-style world canvas
- React + Next.js interface
- 3D block placement using React Three Fiber
- Dark neon UI with cinematic visual styling
- Context card that reacts to placed elements

### Backend
- FastAPI server
- Semantic routing system using sentence-transformers
- Cosine similarity-based classification of incoming world context
- Simulated “fast lane” and “deep lore” response paths

### Demo logic
- A tavern or local settlement triggers a lightweight, immediate narrative response.
- A mountain, ruins, or larger world-building pattern triggers a more layered narrative path.
- The routing logic is currently a working prototype layer, designed to support final AI model integration.

---

## 🏗️ Tech Stack

### Frontend
- Next.js 14
- React
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei

### Backend
- Python
- FastAPI
- Uvicorn
- SentenceTransformers
- NumPy

---

## 🚀 Run locally

You’ll need two terminals running side by side: one for the backend, one for the frontend.

### 1) Start the backend
```bash
cd backend
pip install fastapi uvicorn sentence-transformers numpy
uvicorn main:app --reload
```

Backend runs at:
```bash
http://localhost:8000
```

### 2) Start the frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
```bash
http://localhost:3000
```

### 3) Use the app
- Select a block from the toolbar
- Place it on the grid
- Observe the context card update based on spatial choices and routed intent

---

## 🔜 Next phase: live sprint

The final build will move beyond semantic classification into real generative storytelling.

### Planned integrations
- **Tier 1:** Local Ollama + Gemma 2 2B
  - for fast dialogue and micro-lore generation
- **Tier 2:** Groq Llama 3.3 70B API
  - for deeper world history and large-scale narrative output
- **Prompt engineering**
  - incorporate spatial coordinates, nearby elements, and biome logic for richer continuity

The goal is to transform GridLore from a world-building prototype into a living narrative engine that understands place, context, and story continuity.

---

## 🏁 Project status

This is a 50% pre-build submission for the hackathon, focused on:

- interaction design
- spatial storytelling concept
- architecture and routing logic
- prototype demonstration of AI-assisted narrative response generation

We are building the foundation for the final live sprint.

---

## ❤️ Built for

**GeNarrative Clash 2026**  
**Narrative & Screenplay Track**

---

<div align="center">

**Shape the world. Trigger the story.**

</div>
