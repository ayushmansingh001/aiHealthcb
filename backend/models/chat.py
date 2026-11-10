"""
Pydantic models for the chat API.

Defines request/response schemas for messages, sessions, and the main
chat endpoint.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class MessageRole(str, Enum):
    """Allowed roles for a chat message."""

    user = "user"
    assistant = "assistant"


class Language(str, Enum):
    """Supported interface/response languages."""

    en = "en"
    hi = "hi"


# ---------------------------------------------------------------------------
# Core message model
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    """A single turn in a conversation."""

    role: MessageRole
    content: str
    sources: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="List of source document chunks used to generate this response.",
    )
    timestamp: Optional[datetime] = Field(
        default=None,
        description="UTC timestamp when the message was created.",
    )


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Payload for the main chat endpoint."""

    message: str = Field(..., min_length=1, max_length=4096, description="The user's message.")
    session_id: Optional[str] = Field(
        default=None,
        description="Existing session ID. A new session is created when omitted.",
    )
    language: Language = Field(
        default=Language.en,
        description="Preferred language for the assistant's response.",
    )
    doc_ids: Optional[List[str]] = Field(
        default=None,
        description="Restrict RAG retrieval to these document IDs. Leave empty to search all.",
    )


class SessionCreate(BaseModel):
    """Payload for creating a new chat session."""

    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Human-readable session title.  Defaults to 'New Chat'.",
    )
    language: Language = Field(
        default=Language.en,
        description="Primary language for the session.",
    )


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class ChatResponse(BaseModel):
    """Response body returned by the main chat endpoint."""

    response: str = Field(..., description="The assistant's reply.")
    content: Optional[str] = Field(default=None, description="The assistant's reply (frontend compatibility).")
    sources: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Source chunks used to generate the response.",
    )
    session_id: str = Field(..., description="The session this message belongs to.")
    message_id: str = Field(..., description="Unique ID of the assistant message saved to the DB.")
    language: Optional[str] = Field(default="en", description="Response language.")
    timestamp: Optional[str] = Field(default=None, description="ISO timestamp.")


class SessionResponse(BaseModel):
    """Summary of a chat session returned in list/detail views."""

    id: str
    title: str
    language: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_message: Optional[str] = None
    message_count: int = Field(default=0, description="Total number of messages in the session.")

    class Config:
        from_attributes = True
