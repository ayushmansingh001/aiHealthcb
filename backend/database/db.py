"""
Async SQLAlchemy database setup for the AI Health Assistant.

Tables
------
- sessions   : Chat sessions (id, title, language, timestamps)
- messages   : Individual messages within a session
- documents  : Uploaded and processed PDF documents
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import AsyncGenerator

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    event,
)
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, relationship

from config import settings

# ---------------------------------------------------------------------------
# Engine & session factory
# ---------------------------------------------------------------------------

engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False},
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# ---------------------------------------------------------------------------
# Base model
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


# ---------------------------------------------------------------------------
# ORM models
# ---------------------------------------------------------------------------

class Session(Base):
    """Represents a chat session."""

    __tablename__ = "sessions"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255), nullable=False, default="New Chat")
    language = Column(String(10), nullable=False, default="en")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    messages = relationship(
        "Message", back_populates="session", cascade="all, delete-orphan"
    )


class Message(Base):
    """Represents a single chat message inside a session."""

    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, index=True)
    session_id = Column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role = Column(String(20), nullable=False)          # "user" | "assistant"
    content = Column(Text, nullable=False)
    sources = Column(Text, nullable=True)              # JSON-encoded list of source dicts
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    session = relationship("Session", back_populates="messages")

    # ------------------------------------------------------------------
    # Convenience helpers for the sources JSON field
    # ------------------------------------------------------------------

    def get_sources(self) -> list:
        """Deserialise sources from JSON string."""
        if self.sources:
            try:
                return json.loads(self.sources)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    def set_sources(self, sources: list) -> None:
        """Serialise sources to JSON string."""
        self.sources = json.dumps(sources)


class Document(Base):
    """Represents an uploaded and processed PDF document."""

    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, index=True)
    filename = Column(String(255), nullable=False)          # stored filename (UUID-based)
    original_name = Column(String(255), nullable=False)     # original upload name
    file_path = Column(String(512), nullable=False)
    page_count = Column(Integer, nullable=False, default=0)
    processed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def init_db() -> None:
    """Create all tables if they do not already exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an async DB session and ensures
    it is closed after the request completes.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
