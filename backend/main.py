"""
AI Health Assistant — FastAPI application entry point.

Responsibilities
----------------
* Register CORS middleware.
* Mount the uploads directory as static files.
* Include all feature routers (chat, documents, health-info).
* On startup: initialise the database and seed base medical knowledge.
* Expose a /health liveness endpoint.
"""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database.db import init_db
from database.vector_store import vector_store
from routers import chat, documents, health_info
from services.document_service import chunk_text
from services.rag_service import BASE_MEDICAL_KNOWLEDGE

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Base-knowledge seeding
# ---------------------------------------------------------------------------

BASE_KNOWLEDGE_DOC_ID = "base_knowledge"


def _seed_base_knowledge() -> None:
    """
    Insert the built-in medical knowledge corpus into the vector store.

    This runs only when the collection is completely empty so that
    re-starts do not duplicate data.
    """
    info = vector_store.get_collection_info()
    if info["count"] > 0:
        logger.info(
            "Vector store already contains %d items — skipping base-knowledge seeding.",
            info["count"],
        )
        return

    logger.info("Seeding base medical knowledge into vector store …")
    chunks_text = chunk_text(BASE_MEDICAL_KNOWLEDGE, chunk_size=300, overlap=30)
    chunks = [
        {
            "text": c,
            "metadata": {
                "doc_id": BASE_KNOWLEDGE_DOC_ID,
                "source": "built-in",
                "heading": "Base Medical Knowledge",
                "page": 1,
            },
        }
        for c in chunks_text
    ]
    vector_store.add_documents(chunks, BASE_KNOWLEDGE_DOC_ID)
    logger.info("Seeded %d base-knowledge chunks.", len(chunks))


# ---------------------------------------------------------------------------
# Lifespan (replaces on_event decorators in FastAPI ≥ 0.93)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup then shutdown logic."""
    # ---- Startup ----
    logger.info("Starting AI Health Assistant backend …")

    # 1. Create DB tables
    await init_db()
    logger.info("Database tables initialised.")

    # 2. Seed base knowledge
    try:
        _seed_base_knowledge()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not seed base knowledge: %s", exc)

    logger.info("Backend ready. Listening on http://0.0.0.0:8000")
    yield

    # ---- Shutdown ----
    logger.info("Shutting down AI Health Assistant backend.")


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Health Assistant API",
    description=(
        "RAG-powered conversational health assistant with PDF document support, "
        "multilingual responses, and curated medical knowledge."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Static files (uploaded PDFs)
# ---------------------------------------------------------------------------

uploads_path = Path(settings.upload_dir)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(health_info.router, prefix="/api/health-info")
app.include_router(health_info.router, prefix="/api/health")


# ---------------------------------------------------------------------------
# Liveness endpoint
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
async def health_check():
    """
    Liveness probe.

    Returns basic service status and vector-store statistics.
    """
    try:
        vs_info = vector_store.get_collection_info()
        vs_status = "ok"
    except Exception as exc:  # noqa: BLE001
        vs_info = {}
        vs_status = f"error: {exc}"

    return {
        "status": "ok",
        "service": "AI Health Assistant",
        "version": "1.0.0",
        "vector_store": {
            "status": vs_status,
            **vs_info,
        },
        "gemini_configured": bool(settings.gemini_api_key.strip()),
    }


# ---------------------------------------------------------------------------
# Dev entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
