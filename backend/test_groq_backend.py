"""
Unit & Integration Tests for GridLore Routing Engine (Groq Cloud & Ollama Local Tiers)
"""

import os
import sys
import unittest
from unittest.mock import patch, MagicMock

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import (
    app,
    ml_state,
    WORLDBUILDING_PROMPT_TEMPLATE,
    DIALOGUE_PROMPT_TEMPLATE,
    format_adjacent_blocks,
    build_worldbuilding_prompt,
    build_dialogue_prompt,
    GenerateLoreRequest,
    GenerateLoreResponse,
    generate_lore,
    get_groq_client,
)
from fastapi import HTTPException


def run_coroutine_sync(coro):
    """Helper to run a coroutine synchronously when calls are mocked."""
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value


class TestGridLoreBackend(unittest.TestCase):
    def setUp(self):
        # Set up heuristic fallback state so tests don't require external ML weights
        ml_state["model"] = "heuristic_fallback"
        ml_state["target_history_vec"] = None
        ml_state["target_dialogue_vec"] = None

    # -------------------------------------------------------------------------
    # Groq & Worldbuilding Prompt Tests
    # -------------------------------------------------------------------------
    def test_01_groq_sdk_installed(self):
        """Verify the groq Python SDK is installed and can be imported."""
        import groq
        self.assertTrue(hasattr(groq, "Groq"))
        self.assertTrue(hasattr(groq, "AsyncGroq"))

    def test_02_worldbuilding_prompt_template_content(self):
        """Verify the worldbuilding prompt template matches exact specifications."""
        expected_template = (
            "You are a master fantasy worldbuilder. The creator has just placed a {block_type} at coordinates X:{x}, Z:{z}. "
            "Adjacent to this location are: {adjacent_blocks}. "
            "Write a 3-paragraph historical lore entry about this specific {block_type}. "
            "Focus on how its geography and neighboring biomes shaped its 500-year history. "
            "Be atmospheric and creative."
        )
        self.assertEqual(WORLDBUILDING_PROMPT_TEMPLATE, expected_template)

    def test_03_worldbuilding_prompt_generation(self):
        """Verify worldbuilding prompt generation with coordinates and adjacent blocks."""
        adj = [
            {"block_type": "Forest", "direction": "North", "x": 5, "z": 1},
            {"block_type": "Tavern", "direction": "West", "x": 4, "z": 2},
        ]
        prompt = build_worldbuilding_prompt("Mountain", 5, 2, adj)
        self.assertIn("placed a Mountain at coordinates X:5, Z:2.", prompt)
        self.assertIn("Forest (North, X:5, Z:1)", prompt)
        self.assertIn("Tavern (West, X:4, Z:2)", prompt)

    def test_04_missing_api_key_raises_http_exception(self):
        """Verify that get_groq_client raises an HTTPException if GROQ_API_KEY is not set."""
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(HTTPException) as ctx:
                get_groq_client()
            self.assertEqual(ctx.exception.status_code, 500)
            self.assertIn("GROQ_API_KEY", ctx.exception.detail)

    def test_05_cloud_tier_groq_call_and_response_format(self):
        """Verify that routing to Cloud tier calls Groq API with llama-3.3-70b-versatile and returns expected JSON format."""
        mock_content = (
            "Paragraph 1: Five centuries ago, the Obsidian Peak erupted from the subterranean mantle...\n\n"
            "Paragraph 2: The adjacent Whispering Forest provided shelter to ancient druids...\n\n"
            "Paragraph 3: Today, the mountain stands as an eternal sentinel over the realm."
        )

        mock_choice = MagicMock()
        mock_choice.message.content = mock_content

        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]

        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = mock_completion

        payload = GenerateLoreRequest(
            block_type="Mountain",
            x=3,
            z=7,
            adjacent_blocks=[{"block_type": "Forest", "direction": "North"}],
        )

        with patch.dict(os.environ, {"GROQ_API_KEY": "gsk_test_mock_key"}):
            with patch("main.get_groq_client", return_value=mock_client):
                coro = generate_lore(payload)
                response = run_coroutine_sync(coro)

        # Verify Groq API call arguments
        mock_client.chat.completions.create.assert_called_once()
        call_kwargs = mock_client.chat.completions.create.call_args.kwargs
        self.assertEqual(call_kwargs["model"], "llama-3.3-70b-versatile")
        self.assertEqual(len(call_kwargs["messages"]), 1)
        self.assertEqual(call_kwargs["messages"][0]["role"], "user")
        self.assertIn("Mountain at coordinates X:3, Z:7", call_kwargs["messages"][0]["content"])

        # Verify response object structure and exact JSON dictionary format
        self.assertEqual(response.tier, "Cloud (Groq Llama 3.3 70B)")
        self.assertEqual(response.lore, mock_content)
        self.assertEqual(
            response.model_dump(),
            {
                "tier": "Cloud (Groq Llama 3.3 70B)",
                "lore": mock_content,
            },
        )

    # -------------------------------------------------------------------------
    # Ollama & Dialogue Prompt Tests
    # -------------------------------------------------------------------------
    def test_06_dialogue_prompt_template_content(self):
        """Verify the dialogue prompt template matches exact specifications."""
        expected_template = (
            "You are an NPC living in a {block_type}. The surrounding area contains: {adjacent_blocks}. "
            "Keep it under 2 sentences. Generate a quick, flavorful rumor or passing comment that a traveler might hear here. "
            "Do not explain the setting, just provide the dialogue."
        )
        self.assertEqual(DIALOGUE_PROMPT_TEMPLATE, expected_template)

    def test_07_dialogue_prompt_generation(self):
        """Verify dynamic dialogue prompt generation with block_type and adjacent blocks."""
        adj = [{"block_type": "Mountain", "direction": "North"}]
        prompt = build_dialogue_prompt("Tavern", adj)
        self.assertIn("You are an NPC living in a Tavern.", prompt)
        self.assertIn("The surrounding area contains: Mountain (North).", prompt)
        self.assertIn("Keep it under 2 sentences.", prompt)
        self.assertIn("Generate a quick, flavorful rumor or passing comment that a traveler might hear here.", prompt)
        self.assertIn("Do not explain the setting, just provide the dialogue.", prompt)

    def test_08_local_tier_ollama_call_and_response_format(self):
        """Verify that routing to Local tier calls Ollama gemma:2b with stream:false and returns expected JSON format."""
        mock_dialogue = '"Keep your voice down... they say something stirred inside the old mountain mines last night."'

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "model": "gemma:2b",
            "created_at": "2026-11-21T14:00:00Z",
            "response": mock_dialogue,
            "done": True,
        }

        payload = GenerateLoreRequest(
            block_type="Tavern",
            x=2,
            z=4,
            adjacent_blocks=[{"block_type": "Mountain", "direction": "North"}],
        )

        with patch("main.requests.post", return_value=mock_resp) as mock_post:
            coro = generate_lore(payload)
            response = run_coroutine_sync(coro)

            # Verify requests.post call arguments
            mock_post.assert_called_once()
            args, kwargs = mock_post.call_args
            self.assertEqual(args[0], "http://localhost:11434/api/generate")
            self.assertEqual(kwargs["json"]["model"], "gemma:2b")
            self.assertEqual(kwargs["json"]["stream"], False)
            self.assertIn("You are an NPC living in a Tavern.", kwargs["json"]["prompt"])
            self.assertIn("Mountain (North)", kwargs["json"]["prompt"])

        # Verify response object structure and exact JSON dictionary format
        self.assertEqual(response.tier, "Local (Gemma 2 2B)")
        self.assertEqual(response.lore, mock_dialogue)
        self.assertEqual(
            response.model_dump(),
            {
                "tier": "Local (Gemma 2 2B)",
                "lore": mock_dialogue,
            },
        )

    def test_09_local_tier_ollama_error_handling(self):
        """Verify that Ollama connection errors are handled and return an HTTPException."""
        mock_resp = MagicMock()
        mock_resp.raise_for_status.side_effect = Exception("Connection refused by Ollama daemon")

        payload = GenerateLoreRequest(
            block_type="Tavern",
            x=1,
            z=1,
            adjacent_blocks=[],
        )

        with patch("main.requests.post", return_value=mock_resp):
            with self.assertRaises(HTTPException) as ctx:
                coro = generate_lore(payload)
                run_coroutine_sync(coro)
            self.assertEqual(ctx.exception.status_code, 500)
            self.assertIn("Ollama API call failed", ctx.exception.detail)


if __name__ == "__main__":
    unittest.main()
