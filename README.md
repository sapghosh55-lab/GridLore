<div align="center">

# 🌌 GridLore
### **Build a world. Let the world tell its story.**

A spatial storytelling canvas where every place you create can become the beginning of a narrative.

**GeNarrative Clash 2026 · Narrative & Screenplay Track**  
**Submission stage:** 50% pre-build

</div>

---

## The story starts with a place

A tavern beside a mountain is more than two objects on a map. It suggests travelers, danger, trade, secrets—and stories waiting to happen.

**GridLore is a browser-based world-building prototype that turns a creator’s spatial choices into narrative context.** Instead of starting with a blank chat box, you shape a world on an isometric canvas. GridLore uses the things you place—and the relationships between them—to help guide the story that emerges.

> **You are the worldbuilder. GridLore is your narrative co-pilot.**

## Why GridLore?

Generative AI can produce endless text, but a creator still needs to provide direction, continuity, and a sense of place. GridLore explores a more hands-on starting point: let the world itself become the prompt.

- **Create spatially:** place world elements on a 3D grid.
- **Give the story context:** let the setting and nearby elements inform the narrative request.
- **Keep the human in charge:** you choose what exists, where it belongs, and what the world means.
- **Route with intent:** a semantic backend classifies incoming context and selects a lightweight or deeper generation path (currently simulated).

## The 50% pre-build

This submission establishes the foundation for the live sprint. The app is a prototype: its AI response tiers are **simulated**, not live model integrations.

### Built for this submission

- **Isometric world canvas** — a 10×10 grid rendered with React Three Fiber.
- **Placeable world elements** — select and place elements such as a tavern, mountain, or forest.
- **Reactive context card** — a dark interface with neon purple and cyan accents that responds to canvas interactions.
- **Semantic routing foundation** — a FastAPI backend uses `sentence-transformers/all-MiniLM-L6-v2` and cosine similarity to classify incoming context.
- **Simulated routing tiers** — lightweight requests and deeper worldbuilding requests are directed to different demo paths.

### Planned for the live sprint

- Connect the fast lane to a local **Ollama + Gemma 2 2B** setup for dialogue and micro-lore.
- Connect the heavy lane to the **Groq Llama 3.3 70B API** for broader world history and complex narrative generation.
- Refine spatial prompts to include grid coordinates, neighboring elements, and biome context.

These integrations are planned work—not part of the current pre-build. The sprint is scheduled for **November 21, 2026**.

## How it works

```text
Creator places world elements
            ↓
The canvas provides spatial context
            ↓
FastAPI semantic router classifies the request
            ↓
A simulated fast or deep response path is selected
            ↓
The context card shows the result
```

## Run locally

You’ll need **Python 3** and **Node.js/npm**. Start the backend and frontend in separate terminals.

### 1. Start the backend

```bash
cd backend
pip install fastapi uvicorn sentence-transformers numpy
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 2. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Try the canvas

1. Select an element from the toolbar.
2. Click a tile on the grid to place it.
3. Check the context card for the response from the prototype’s routing flow.

## Built with

| Frontend | Backend |
| --- | --- |
| Next.js 14 · React · Tailwind CSS | Python · FastAPI · Uvicorn |
| Three.js · React Three Fiber · Drei | Sentence Transformers · NumPy |

## What’s next

The live sprint focuses on moving from a routing demo to a generative narrative loop: connect the two model tiers, pass richer spatial context into prompts, and make the stories respond meaningfully to the worlds creators build.

## Hackathon

Built with ❤️ for **GeNarrative Clash 2026**  
**Track:** Narrative & Screenplay · **Stage:** 50% pre-build

---

<div align="center">

**Shape the map. Spark the story.**

</div>
