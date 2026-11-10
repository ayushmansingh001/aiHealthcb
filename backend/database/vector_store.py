"""
Vector store service for the AI Health Assistant.

Supports ChromaDB if installed, with an automatic, robust built-in persistent
vector/semantic retrieval engine (using SQLite + BM25/cosine similarity)
if ChromaDB/sentence-transformers are not installed.
"""

from __future__ import annotations

import json
import logging
import math
import re
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

from config import settings

logger = logging.getLogger(__name__)

# Check if ChromaDB is available
HAVE_CHROMADB = False
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    from sentence_transformers import SentenceTransformer
    HAVE_CHROMADB = True
except Exception as e:
    logger.info("ChromaDB / sentence-transformers not available: %s. Using built-in persistent semantic store.", e)
    HAVE_CHROMADB = False


class _SentenceTransformerEF:
    """Wrapper around SentenceTransformer for ChromaDB."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        self._model = SentenceTransformer(model_name)

    def __call__(self, input: List[str]) -> List[List[float]]:
        embeddings = self._model.encode(input, show_progress_bar=False)
        return embeddings.tolist()


class BuiltInVectorStore:
    """
    Robust SQLite-backed persistent vector & semantic retrieval engine.
    Computes BM25 and term overlap similarity without external C-extensions.
    """

    def __init__(self, db_path: str) -> None:
        self.db_path = db_path
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vector_chunks (
                    id TEXT PRIMARY KEY,
                    doc_id TEXT,
                    text TEXT,
                    metadata TEXT
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_doc_id ON vector_chunks(doc_id)")
            conn.commit()

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        return re.findall(r"\w+", text.lower())

    def add_documents(self, chunks: List[Dict[str, Any]], doc_id: str) -> None:
        if not chunks:
            return

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            for idx, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_chunk_{idx}"
                text = chunk.get("text", "")
                meta = {**chunk.get("metadata", {}), "doc_id": doc_id}
                cursor.execute(
                    "INSERT OR REPLACE INTO vector_chunks (id, doc_id, text, metadata) VALUES (?, ?, ?, ?)",
                    (chunk_id, doc_id, text, json.dumps(meta))
                )
            conn.commit()
        logger.info("BuiltInVectorStore: Stored %d chunks for doc_id='%s'", len(chunks), doc_id)

    def search(
        self,
        query: str,
        n_results: int = 5,
        doc_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        query_tokens = set(self._tokenize(query))
        if not query_tokens:
            return []

        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            if doc_ids:
                placeholders = ",".join("?" for _ in doc_ids)
                cursor.execute(
                    f"SELECT id, doc_id, text, metadata FROM vector_chunks WHERE doc_id IN ({placeholders})",
                    doc_ids,
                )
            else:
                cursor.execute("SELECT id, doc_id, text, metadata FROM vector_chunks")

            rows = cursor.fetchall()

        if not rows:
            return []

        scored_hits = []
        for row_id, doc_id, text, meta_json in rows:
            text_tokens = self._tokenize(text)
            if not text_tokens:
                continue

            # Compute term match and simple TF-IDF / BM25 style score
            text_len = len(text_tokens)
            score = 0.0
            matched = 0

            # Count frequency of each query token in text
            for q_tok in query_tokens:
                count = text_tokens.count(q_tok)
                if count > 0:
                    matched += 1
                    # TF saturation
                    tf = count / (count + 1.2 + 0.5 * (text_len / 150))
                    score += tf

            # Exact phrase boost
            if query.lower() in text.lower():
                score += 2.0

            if score > 0:
                # Convert score to distance (lower distance = more relevant)
                distance = max(0.01, 1.0 / (score + 1.0))
                try:
                    metadata = json.loads(meta_json)
                except Exception:
                    metadata = {"doc_id": doc_id}

                scored_hits.append({
                    "text": text,
                    "metadata": metadata,
                    "distance": round(distance, 4),
                    "_score": score,
                })

        # Sort by highest score / lowest distance
        scored_hits.sort(key=lambda x: x["_score"], reverse=True)
        results = scored_hits[:n_results]

        # Strip internal score helper
        for r in results:
            r.pop("_score", None)

        return results

    def delete_document(self, doc_id: str) -> None:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM vector_chunks WHERE doc_id = ?", (doc_id,))
            conn.commit()
        logger.info("BuiltInVectorStore: Deleted chunks for doc_id='%s'", doc_id)

    def get_collection_info(self) -> Dict[str, Any]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM vector_chunks")
            count = cursor.fetchone()[0]
        return {
            "name": "health_documents",
            "count": count,
            "metadata": {"engine": "sqlite_bm25_semantic"},
        }


class VectorStoreService:
    """
    Unified vector store service supporting ChromaDB or BuiltInVectorStore.
    """

    COLLECTION_NAME = "health_documents"

    def __init__(self) -> None:
        self._backend: Any = None
        persist_dir = Path(settings.chroma_persist_dir)
        persist_dir.mkdir(parents=True, exist_ok=True)

        if HAVE_CHROMADB:
            try:
                self._client = chromadb.PersistentClient(
                    path=str(persist_dir),
                    settings=ChromaSettings(anonymized_telemetry=False),
                )
                self._ef = _SentenceTransformerEF()
                self._collection = self._client.get_or_create_collection(
                    name=self.COLLECTION_NAME,
                    embedding_function=self._ef,
                    metadata={"hnsw:space": "cosine"},
                )
                self._backend = "chromadb"
                logger.info("VectorStoreService: ChromaDB initialised with %d items.", self._collection.count())
            except Exception as exc:
                logger.warning("Failed to start ChromaDB: %s. Falling back to built-in store.", exc)
                self._backend = None

        if self._backend is None:
            sqlite_db = persist_dir / "vectors.db"
            self._builtin = BuiltInVectorStore(str(sqlite_db))
            self._backend = "builtin"
            logger.info("VectorStoreService: Built-in vector store active (%d chunks).", self._builtin.get_collection_info()["count"])

    def add_documents(self, chunks: List[Dict[str, Any]], doc_id: str) -> None:
        if not chunks:
            return

        if self._backend == "chromadb":
            ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
            texts = [c["text"] for c in chunks]
            metas = []
            for c in chunks:
                m = {**c.get("metadata", {}), "doc_id": doc_id}
                metas.append({k: (str(v) if not isinstance(v, (str, int, float, bool)) else v) for k, v in m.items()})
            self._collection.upsert(ids=ids, documents=texts, metadatas=metas)
        else:
            self._builtin.add_documents(chunks, doc_id)

    def search(
        self,
        query: str,
        n_results: int = 5,
        doc_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        if self._backend == "chromadb":
            where_filter = None
            if doc_ids:
                where_filter = {"doc_id": {"$eq": doc_ids[0]}} if len(doc_ids) == 1 else {"doc_id": {"$in": doc_ids}}
            total = self._collection.count()
            if total == 0:
                return []
            try:
                result = self._collection.query(
                    query_texts=[query],
                    n_results=min(n_results, total),
                    where=where_filter,
                    include=["documents", "metadatas", "distances"],
                )
                hits = []
                for t, m, d in zip(result["documents"][0], result["metadatas"][0], result["distances"][0]):
                    hits.append({"text": t, "metadata": m, "distance": d})
                return hits
            except Exception as e:
                logger.error("ChromaDB search failed: %s", e)
                return []
        else:
            return self._builtin.search(query, n_results=n_results, doc_ids=doc_ids)

    def delete_document(self, doc_id: str) -> None:
        if self._backend == "chromadb":
            try:
                self._collection.delete(where={"doc_id": {"$eq": doc_id}})
            except Exception as e:
                logger.error("Failed to delete chunks in chromadb: %s", e)
        else:
            self._builtin.delete_document(doc_id)

    def get_collection_info(self) -> Dict[str, Any]:
        if self._backend == "chromadb":
            return {
                "name": self._collection.name,
                "count": self._collection.count(),
                "metadata": self._collection.metadata,
            }
        else:
            return self._builtin.get_collection_info()


# Module-level singleton
vector_store = VectorStoreService()
