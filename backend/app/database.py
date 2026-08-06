"""
database.py
-----------
Owns ONLY the database connection concerns:
- SQLAlchemy engine
- Session factory
- Declarative Base
- FastAPI dependency (`get_db`) that yields a request-scoped session.

No models, no business logic, no queries live in this file.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# `check_same_thread` is only required for SQLite, since SQLite by default
# only allows one thread to interact with a connection. FastAPI can handle
# requests in multiple threads, so this flag is necessary for SQLite only.
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base class that all ORM models inherit from."""

    pass


def get_db():
    """
    FastAPI dependency that provides a database session per request.

    Ensures the session is always closed after the request completes,
    even if an exception is raised while handling it.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Create all database tables based on the models registered against Base.

    Called once at application startup (see app/main.py). In a production
    system this would typically be replaced by Alembic migrations, but for
    this project a simple create_all() keeps things self-contained and lets
    the app run immediately after cloning.
    """
    # Import models here (not at module top-level) to avoid circular imports
    # between database.py and models.py, while still ensuring all model
    # classes are registered on Base.metadata before create_all() runs.
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
