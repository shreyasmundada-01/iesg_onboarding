"""
config.py
---------
Centralized application configuration.

Loads all runtime configuration (database URL, JWT secret, token expiry,
CORS origins, etc.) from environment variables / a `.env` file using
pydantic-settings. No other module should read `os.environ` directly -
everything flows through the single `settings` object exported here.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application settings."""

    # General
    APP_NAME: str = "Employee Management Portal"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "sqlite:///./employee_portal.db"

    # JWT
    SECRET_KEY: str = "insecure-dev-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS - comma separated string in .env, parsed into a list below
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Return CORS_ORIGINS as a clean list of origin strings."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """
    Return a cached Settings instance.

    Using lru_cache means the .env file is parsed only once per process,
    and every module that calls get_settings() shares the same object.
    """
    return Settings()


# Convenience singleton used throughout the app (e.g. `from app.config import settings`)
settings = get_settings()
