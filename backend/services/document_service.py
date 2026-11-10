"""
Document processing service.

Handles PDF parsing with PyMuPDF (fitz) and splits extracted text
into overlapping chunks suitable for embedding into a vector store.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any, Dict, List

try:
    import fitz  # PyMuPDF
    HAVE_FITZ = True
except ImportError:
    fitz = None
    HAVE_FITZ = False

try:
    from pypdf import PdfReader
    HAVE_PYPDF = True
except ImportError:
    PdfReader = None
    HAVE_PYPDF = False

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Text chunking helper
# ---------------------------------------------------------------------------

def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 50,
) -> List[str]:
    """
    Split *text* into overlapping chunks of approximately *chunk_size* tokens.

    A "token" is approximated as a whitespace-separated word.

    Parameters
    ----------
    text:
        The raw text to split.
    chunk_size:
        Target number of tokens per chunk.
    overlap:
        Number of tokens shared between consecutive chunks.

    Returns
    -------
    List of non-empty chunk strings.
    """
    if not text or not text.strip():
        return []

    words = text.split()
    if not words:
        return []

    chunks: List[str] = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        chunk = " ".join(chunk_words).strip()
        if chunk:
            chunks.append(chunk)
        # Advance by (chunk_size - overlap) so consecutive chunks share *overlap* words
        step = max(1, chunk_size - overlap)
        start += step

    return chunks


# ---------------------------------------------------------------------------
# Heading extraction helper
# ---------------------------------------------------------------------------

_HEADING_RE = re.compile(
    r"^(?:[A-Z][A-Z\s]{3,}|(?:\d+\.)+\s+[A-Z].{0,60})$",
    re.MULTILINE,
)


def _extract_heading(text: str) -> str:
    """
    Attempt to extract a section heading from the beginning of *text*.

    Returns an empty string if no heading is detected.
    """
    # Look at the first 3 lines for a likely heading
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()][:3]
    for line in lines:
        if _HEADING_RE.match(line) and len(line) < 120:
            return line
    return ""


# ---------------------------------------------------------------------------
# PDF parsing
# ---------------------------------------------------------------------------

async def parse_pdf(file_path: str, doc_id: str) -> List[Dict[str, Any]]:
    """
    Parse a PDF file and return a list of text chunks with metadata.

    Each returned dict has the shape::

        {
            "text": "<chunk content>",
            "metadata": {
                "doc_id": str,
                "page": int,          # 1-based page number
                "heading": str,       # detected section heading (may be "")
                "chunk_index": int,   # position among all chunks in the document
            },
        }

    Parameters
    ----------
    file_path:
        Absolute or relative path to the PDF file.
    doc_id:
        Logical document identifier to embed in every chunk's metadata.

    Returns
    -------
    List of chunk dicts ready to be passed to :func:`VectorStoreService.add_documents`.

    Raises
    ------
    FileNotFoundError:
        If *file_path* does not point to an existing file.
    ValueError:
        If the file cannot be opened as a PDF or contains no extractable text.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    logger.info("Parsing PDF '%s' (doc_id='%s') …", path.name, doc_id)

    all_chunks: List[Dict[str, Any]] = []
    global_chunk_idx = 0

    if HAVE_FITZ and fitz is not None:
        try:
            pdf_doc = fitz.open(str(path))
        except Exception as exc:
            raise ValueError(f"Cannot open PDF '{file_path}': {exc}") from exc

        try:
            for page_number in range(len(pdf_doc)):
                page = pdf_doc[page_number]
                page_text: str = page.get_text("text")

                if not page_text or not page_text.strip():
                    logger.debug("Page %d has no extractable text — skipping.", page_number + 1)
                    continue

                heading = _extract_heading(page_text)
                page_chunks = chunk_text(page_text, chunk_size=500, overlap=50)
                for chunk_str in page_chunks:
                    all_chunks.append(
                        {
                            "text": chunk_str,
                            "metadata": {
                                "doc_id": doc_id,
                                "page": page_number + 1,
                                "heading": heading,
                                "chunk_index": global_chunk_idx,
                            },
                        }
                    )
                    global_chunk_idx += 1
        finally:
            pdf_doc.close()
    elif HAVE_PYPDF and PdfReader is not None:
        try:
            reader = PdfReader(str(path))
            for page_number, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if not page_text.strip():
                    continue
                heading = _extract_heading(page_text)
                page_chunks = chunk_text(page_text, chunk_size=500, overlap=50)
                for chunk_str in page_chunks:
                    all_chunks.append(
                        {
                            "text": chunk_str,
                            "metadata": {
                                "doc_id": doc_id,
                                "page": page_number + 1,
                                "heading": heading,
                                "chunk_index": global_chunk_idx,
                            },
                        }
                    )
                    global_chunk_idx += 1
        except Exception as exc:
            raise ValueError(f"Cannot open PDF with pypdf '{file_path}': {exc}") from exc
    else:
        raise ValueError("Neither PyMuPDF (fitz) nor pypdf is installed to parse PDFs.")

    if not all_chunks:
        raise ValueError(
            f"No text could be extracted from '{path.name}'. "
            "The PDF may be scanned or image-based."
        )

    logger.info(
        "Extracted %d chunks from '%s' (%d pages processed).",
        len(all_chunks),
        path.name,
        len(pdf_doc) if not pdf_doc.is_closed else "?",
    )
    return all_chunks
