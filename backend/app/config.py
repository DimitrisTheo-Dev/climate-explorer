from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration derived from environment variables."""

    model_config = SettingsConfigDict(env_prefix="CLIMATE_", env_file=".env", extra="ignore")

    data_path: Path = Field(
        default=Path(__file__).resolve().parent / "data" / "temperature_data_extended.csv",
        description="Filesystem path to the temperature dataset CSV.",
    )
    allowed_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173"],
        description="CORS origins permitted to access the API.",
    )
