"""
Pydantic models for the document management API.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    """Full document record returned by list/detail endpoints."""

    id: str
    filename: str = Field(..., description="Internal (UUID-based) filename on disk.")
    original_name: str = Field(..., description="Original upload filename.")
    page_count: int
    processed: bool = Field(..., description="True once the document has been embedded.")
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentUploadResponse(BaseModel):
    """Response returned immediately after a successful PDF upload and processing."""

    document_id: str
    filename: str
    page_count: int
    message: str = Field(..., description="Human-readable status message.")
