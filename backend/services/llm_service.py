"""
LLM service — wraps the Google Gemini generative AI API.

Provides a single async entry point :func:`generate_response` that
handles authentication, error recovery, and graceful fallbacks for
cases where the API key is missing or the remote call fails.
"""

from __future__ import annotations

import logging

import google.generativeai as genai

from config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Initialise Gemini
# ---------------------------------------------------------------------------

_cached_key: str = ""
_cached_models: list[str] = []


def _get_active_key(override_key: str | None = None) -> str:
    key = (override_key or "").strip()
    if not key or key == "your_gemini_api_key_here":
        key = settings.gemini_api_key.strip()
    if key == "your_gemini_api_key_here":
        key = ""
    return key


def _get_candidate_models(key: str) -> list[str]:
    """Discover available models for the given API key, with fallback."""
    global _cached_key, _cached_models
    if _cached_models and _cached_key == key:
        return _cached_models

    genai.configure(api_key=key)
    discovered: list[str] = []
    try:
        for m in genai.list_models():
            methods = getattr(m, "supported_generation_methods", []) or []
            if "generateContent" in methods:
                name = m.name.replace("models/", "")
                discovered.append(name)
    except Exception as exc:
        logger.warning("Could not query list_models: %s", exc)

    if discovered:
        # Prioritize flash, then pro, then others
        def score(n: str) -> int:
            ln = n.lower()
            if "flash" in ln and "1.5" in ln:
                return 0
            if "flash" in ln:
                return 1
            if "pro" in ln:
                return 2
            return 3

        discovered.sort(key=score)
        _cached_key = key
        _cached_models = discovered
        return discovered

    fallbacks = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"]
    _cached_key = key
    _cached_models = fallbacks
    return fallbacks


# ---------------------------------------------------------------------------
# Fallback message helper
# ---------------------------------------------------------------------------

_FALLBACK_NO_KEY = (
    "⚠️ **AI model not configured.**\n\n"
    "The Gemini API key has not been set yet. To enable AI-powered chat:\n"
    "1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).\n"
    "2. Paste it in the **Settings** tab in this app (or add it to `backend/.env` as `GEMINI_API_KEY`).\n\n"
    "You can also upload medical PDFs in the **PDF Library** to browse and query documents."
)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def generate_response(
    prompt: str,
    api_key: str | None = None,
    context_chunks: list[dict] | None = None,
) -> str:
    """
    Generate a text response for the given *prompt* using the Gemini API.

    Tries available models discovered for the API key, with graceful fallbacks.
    """
    key = _get_active_key(api_key)

    if not key:
        if context_chunks and len(context_chunks) > 0:
            relevant = "\n\n---\n\n".join(
                f"**{c.get('metadata', {}).get('heading', 'Medical Reference')}**:\n{c.get('text', '')}"
                for c in context_chunks[:3]
            )
            return (
                f"👋 Hello! Here is relevant information from our built-in medical database:\n\n"
                f"{relevant}\n\n"
                f"---\n"
                f"💡 *Tip: To enable full conversational AI responses, please add your free Gemini API key in **Settings**.*"
            )
        return _FALLBACK_NO_KEY

    candidates = _get_candidate_models(key)
    logger.info("Attempting Gemini generation with models: %s", candidates[:4])

    last_error: Exception | None = None
    for model_name in candidates:
        try:
            m = genai.GenerativeModel(model_name)
            response = m.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(  # type: ignore[attr-defined]
                    temperature=0.3,
                    max_output_tokens=1024,
                    top_p=0.9,
                ),
            )
            if response and response.text:
                logger.info("Successfully generated response using model '%s'", model_name)
                return response.text.strip()
        except Exception as exc:
            logger.warning("Model '%s' failed: %s", model_name, exc)
            last_error = exc
            continue

    logger.error("All Gemini candidate models failed. Last error: %s", last_error)

    if context_chunks and len(context_chunks) > 0:
        relevant = "\n\n---\n\n".join(
            f"**{c.get('metadata', {}).get('heading', 'Medical Reference')}**:\n{c.get('text', '')}"
            for c in context_chunks[:3]
        )
        return (
            f"⚠️ Could not generate an AI response ({last_error}).\n\n"
            f"Here is what our medical database found for your query:\n\n"
            f"{relevant}"
        )

    return (
        f"I'm sorry — I encountered an issue connecting to the AI model:\n\n"
        f"**Error:** `{last_error}`\n\n"
        f"Please check that your Gemini API key in **Settings** or `.env` is valid and active."
    )
