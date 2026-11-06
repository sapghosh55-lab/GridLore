#!/usr/bin/env python3
"""
GridLore Backend Runner
Runs the FastAPI Semantic Router application on http://localhost:8000
"""

import sys
import os
import uvicorn

# Ensure the backend directory is in the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from main import app

if __name__ == "__main__":
    print("==================================================")
    print(" Starting GridLore Semantic Lore Router API")
    print(" Host: http://localhost:8000")
    print(" Endpoint: POST http://localhost:8000/generate-lore")
    print(" Model: sentence-transformers/all-MiniLM-L6-v2")
    print("==================================================")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
