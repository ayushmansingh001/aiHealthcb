"""
Chat router — handles conversation sessions and the main RAG chat endpoint.
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import Message, Session, get_db
from models.chat import (
    ChatRequest,
    ChatResponse,
    MessageRole,
    SessionCreate,
    SessionResponse,
)
from services.llm_service import generate_response
from services.rag_service import build_prompt, retrieve_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat"])


# ---------------------------------------------------------------------------
# Helper: get-or-create session
# ---------------------------------------------------------------------------

async def _get_or_create_session(
    session_id: str | None,
    language: str,
    db: AsyncSession,
) -> Session:
    """
    Return an existing :class:`Session` row or create a new one.

    Parameters
    ----------
    session_id:
        UUID string of the requested session, or ``None`` to create fresh.
    language:
        BCP-47 language tag for the session.
    db:
        Active async DB session.

    Returns
    -------
    ORM :class:`Session` object (not yet committed).

    Raises
    ------
    HTTPException 404:
        When *session_id* is provided but does not exist in the database.
    """
    if session_id:
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session '{session_id}' not found.",
            )
        return session

    new_session = Session(
        id=str(uuid.uuid4()),
        title="New Chat",
        language=language,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_session)
    await db.flush()  # populate PK without committing
    return new_session


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
@router.post("/message", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    x_api_key: str | None = Header(None, alias="X-API-Key"),
):
    """
    Main RAG chat endpoint.

    Workflow
    --------
    1. Resolve or create a session.
    2. Persist the user's message.
    3. Retrieve recent conversation history.
    4. Run vector-store retrieval for relevant context.
    5. Build the LLM prompt and call Gemini.
    6. Persist the assistant's reply with sources.
    7. Return :class:`ChatResponse`.
    """
    # 1. Session
    session = await _get_or_create_session(
        request.session_id, request.language.value, db
    )

    # Update session title from first user message if still default
    if session.title == "New Chat" and request.message:
        session.title = request.message[:60] + ("…" if len(request.message) > 60 else "")
    session.updated_at = datetime.utcnow()

    # 2. Persist user message
    user_msg_id = str(uuid.uuid4())
    user_msg = Message(
        id=user_msg_id,
        session_id=session.id,
        role=MessageRole.user.value,
        content=request.message,
        created_at=datetime.utcnow(),
    )
    db.add(user_msg)
    await db.flush()

    # 3. Fetch recent conversation history (last 12 messages)
    history_result = await db.execute(
        select(Message)
        .where(Message.session_id == session.id)
        .order_by(Message.created_at.asc())
        .limit(12)
    )
    history_rows = history_result.scalars().all()
    chat_history = [
        {"role": row.role, "content": row.content}
        for row in history_rows
        if row.id != user_msg_id  # exclude the message we just inserted
    ]

    # 4. RAG retrieval
    context_chunks = await retrieve_context(
        query=request.message,
        doc_ids=request.doc_ids,
        n_results=5,
    )

    # 5. Build prompt & call LLM
    prompt = await build_prompt(
        query=request.message,
        context_chunks=context_chunks,
        chat_history=chat_history,
        language=request.language.value,
    )
    response_text = await generate_response(
        prompt,
        api_key=x_api_key,
        context_chunks=context_chunks,
    )

    # 6. Build source list for persistence and response
    sources = [
        {
            "text": ch["text"][:300],   # truncate for storage
            "page": ch["metadata"].get("page"),
            "heading": ch["metadata"].get("heading", ""),
            "doc_id": ch["metadata"].get("doc_id", ""),
            "distance": round(ch.get("distance", 0.0), 4),
        }
        for ch in context_chunks
    ]

    assistant_msg_id = str(uuid.uuid4())
    now_utc = datetime.utcnow()
    assistant_msg = Message(
        id=assistant_msg_id,
        session_id=session.id,
        role=MessageRole.assistant.value,
        content=response_text,
        sources=json.dumps(sources),
        created_at=now_utc,
    )
    db.add(assistant_msg)
    # Commit handled by get_db dependency

    return ChatResponse(
        response=response_text,
        content=response_text,
        sources=sources,
        session_id=session.id,
        message_id=assistant_msg_id,
        language=request.language.value,
        timestamp=now_utc.isoformat(),
    )


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(body: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new chat session and return its metadata."""
    session = Session(
        id=str(uuid.uuid4()),
        title=body.title or "New Chat",
        language=body.language.value,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(session)
    await db.flush()
    return SessionResponse(
        id=session.id,
        title=session.title,
        language=session.language,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0,
    )


@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """Return all sessions ordered by most recently updated."""
    result = await db.execute(
        select(Session).order_by(Session.updated_at.desc())
    )
    sessions = result.scalars().all()

    response: List[SessionResponse] = []
    for s in sessions:
        count_result = await db.execute(
            select(func.count(Message.id)).where(Message.session_id == s.id)
        )
        msg_count = count_result.scalar_one() or 0
        response.append(
            SessionResponse(
                id=s.id,
                title=s.title,
                language=s.language,
                created_at=s.created_at,
                updated_at=s.updated_at,
                message_count=msg_count,
            )
        )
    return response


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """
    Return a session with its full message history.

    Response shape::

        {
            "id": str,
            "title": str,
            "language": str,
            "created_at": datetime,
            "messages": [{"role", "content", "sources", "created_at"}, ...]
        }
    """
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    msgs_result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
    )
    messages = msgs_result.scalars().all()

    return {
        "id": session.id,
        "title": session.title,
        "language": session.language,
        "created_at": session.created_at,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "sources": m.get_sources(),
                "created_at": m.created_at,
            }
            for m in messages
        ],
    }


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a session and all of its messages (cascade)."""
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    await db.delete(session)
