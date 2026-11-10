"""
Application configuration using pydantic-settings.
Loads values from environment variables or a .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from pathlib import Path
from typing import List, Union
import json


class Settings(BaseSettings):
    """Central settings object populated from environment / .env file."""

    gemini_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./health_assistant.db"
    chroma_persist_dir: str = "./data/chroma_db"
    upload_dir: str = "./data/uploads"
    max_file_size_mb: int = 50
    allowed_origins: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    @field_validator("allowed_origins", mode="after")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure required directories exist at import time
Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
