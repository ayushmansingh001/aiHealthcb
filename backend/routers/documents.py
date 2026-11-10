"""
Document management router.

Handles PDF upload, parsing, embedding, listing, and deletion.
"""

from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database.db import Document, get_db
from database.vector_store import vector_store
from models.document import DocumentResponse, DocumentUploadResponse
from services.document_service import parse_pdf

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/documents", tags=["Documents"])

_MAX_BYTES = settings.max_file_size_mb * 1024 * 1024


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a PDF, parse its text, split into chunks, and embed into ChromaDB.

    - Accepts only ``application/pdf`` files.
    - Enforces the ``MAX_FILE_SIZE_MB`` limit from settings.
    - On success returns the newly created document record.
    """
    # Validate content type
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        # Some browsers send octet-stream; also guard by extension
        if not (file.filename or "").lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported.",
            )

    # Read file bytes
    file_bytes = await file.read()
    if len(file_bytes) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the maximum size of {settings.max_file_size_mb} MB.",
        )
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # Save to disk
    doc_id = str(uuid.uuid4())
    safe_filename = f"{doc_id}.pdf"
    file_path = Path(settings.upload_dir) / safe_filename
    file_path.write_bytes(file_bytes)
    logger.info("Saved uploaded file to '%s'.", file_path)

    # Parse PDF and embed
    try:
        chunks = await parse_pdf(str(file_path), doc_id)
        page_count = max(
            (ch["metadata"].get("page", 0) for ch in chunks), default=0
        )
    except (FileNotFoundError, ValueError) as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        file_path.unlink(missing_ok=True)
        logger.error("Unexpected error parsing PDF: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process the PDF. Please try again.",
        ) from exc

    # Embed into vector store
    try:
        vector_store.add_documents(chunks, doc_id)
    except Exception as exc:
        logger.error("Failed to embed document chunks: %s", exc, exc_info=True)
        # Don't abort — the file is on disk; the user can retry

    # Persist document record
    doc = Document(
        id=doc_id,
        filename=safe_filename,
        original_name=file.filename or safe_filename,
        file_path=str(file_path),
        page_count=page_count,
        processed=True,
    )
    db.add(doc)

    return DocumentUploadResponse(
        document_id=doc_id,
        filename=file.filename or safe_filename,
        page_count=page_count,
        message=f"Document processed successfully. {len(chunks)} chunks embedded.",
    )


@router.get("", response_model=List[DocumentResponse])
@router.get("/", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    """Return all uploaded documents ordered by creation date (newest first)."""
    result = await db.execute(
        select(Document).order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [
        DocumentResponse(
            id=d.id,
            filename=d.filename,
            original_name=d.original_name,
            page_count=d.page_count,
            processed=d.processed,
            created_at=d.created_at,
        )
        for d in docs
    ]


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete a document from the database, disk, and vector store.

    All embedded chunks for this document are removed from ChromaDB.
    """
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Remove from vector store
    try:
        vector_store.delete_document(doc_id)
    except Exception as exc:
        logger.warning("Could not remove chunks from vector store: %s", exc)

    # Remove file from disk
    file_path = Path(doc.file_path)
    if file_path.exists():
        file_path.unlink()
        logger.info("Deleted file '%s'.", file_path)

    await db.delete(doc)


@router.get("/{doc_id}/info", response_model=DocumentResponse)
async def get_document_info(doc_id: str, db: AsyncSession = Depends(get_db)):
    """Return metadata for a single document."""
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return DocumentResponse(
        id=doc.id,
        filename=doc.filename,
        original_name=doc.original_name,
        page_count=doc.page_count,
        processed=doc.processed,
        created_at=doc.created_at,
    )
