"""
Translation service for the AI Health Assistant.

Provides async-friendly wrappers around the ``deep-translator`` library
and a lightweight Unicode-range-based language detector.

Supported languages
-------------------
- ``"en"``  English
- ``"hi"``  Hindi
"""

from __future__ import annotations

import logging
import re
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Language detection helpers
# ---------------------------------------------------------------------------

# Unicode ranges for Devanagari script (used by Hindi, Marathi, Nepali, etc.)
_DEVANAGARI_RANGE = re.compile(r"[\u0900-\u097F]")

# Rough threshold — if ≥10 % of chars are Devanagari, treat as Hindi
_HINDI_THRESHOLD = 0.10


def detect_language(text: str) -> str:
    """
    Detect the primary language of *text* using Unicode character ranges.

    Currently distinguishes Hindi (Devanagari script) from English.
    Falls back to ``"en"`` for all other scripts.

    Parameters
    ----------
    text:
        The input string to analyse.

    Returns
    -------
    BCP-47 language tag: ``"hi"`` or ``"en"``.
    """
    if not text:
        return "en"

    total_alpha = sum(1 for ch in text if ch.isalpha())
    if total_alpha == 0:
        return "en"

    devanagari_chars = len(_DEVANAGARI_RANGE.findall(text))
    ratio = devanagari_chars / total_alpha

    return "hi" if ratio >= _HINDI_THRESHOLD else "en"


# ---------------------------------------------------------------------------
# Translation helpers
# ---------------------------------------------------------------------------

# Map from BCP-47 tag to deep-translator language codes (Google Translate codes)
_LANG_MAP: dict[str, str] = {
    "en": "en",
    "hi": "hi",
    "auto": "auto",
}


async def translate(
    text: str,
    target_lang: str,
    source_lang: str = "auto",
) -> str:
    """
    Translate *text* from *source_lang* to *target_lang*.

    Uses :class:`deep_translator.GoogleTranslator` under the hood.
    If translation fails for any reason (network error, unsupported language,
    etc.) the **original text** is returned unchanged so the application
    continues to function gracefully.

    Parameters
    ----------
    text:
        The string to translate.
    target_lang:
        BCP-47 target language code (``"en"`` or ``"hi"``).
    source_lang:
        BCP-47 source language code or ``"auto"`` for auto-detection.
        Defaults to ``"auto"``.

    Returns
    -------
    Translated string, or the original string on error.
    """
    if not text or not text.strip():
        return text

    # Normalise language codes
    resolved_target = _LANG_MAP.get(target_lang, target_lang)
    resolved_source = _LANG_MAP.get(source_lang, source_lang)

    # Skip translation if source and target are the same
    if resolved_target == resolved_source and resolved_source != "auto":
        return text

    try:
        from deep_translator import GoogleTranslator  # local import to avoid startup cost

        translator = GoogleTranslator(source=resolved_source, target=resolved_target)
        translated = translator.translate(text)
        if translated:
            logger.debug(
                "Translated %d chars from '%s' to '%s'.",
                len(text),
                resolved_source,
                resolved_target,
            )
            return translated
        return text
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Translation failed (%s → %s): %s. Returning original text.",
            resolved_source,
            resolved_target,
            exc,
        )
        return text
