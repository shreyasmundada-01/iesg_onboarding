"""
models.py
---------
Owns ONLY the SQLAlchemy ORM model definitions (database table schema
and relationships). No Pydantic schemas, no business logic, no queries.
"""

from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _utcnow() -> datetime:
    """Return a timezone-aware UTC timestamp used for created_at/updated_at defaults."""
    return datetime.now(timezone.utc)


class User(Base):
    """Application user account used for authentication."""

    __tablename__ = "users"

    uid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging helper only
        return f"<User uid={self.uid} username={self.username!r} role={self.role!r}>"


class Employee(Base):
    """An employee record. One employee can have multiple addresses."""

    __tablename__ = "employees"

    eid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    dob: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # One employee -> many addresses.
    addresses: Mapped[list["Address"]] = relationship(
        "Address",
        back_populates="employee",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Employee eid={self.eid} name={self.name!r}>"


class Address(Base):
    """An address belonging to a single employee."""

    __tablename__ = "addresses"

    aid: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    eid: Mapped[int] = mapped_column(
        Integer, ForeignKey("employees.eid", ondelete="CASCADE"), nullable=False, index=True
    )
    addres: Mapped[str] = mapped_column(String(500), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Many addresses -> one employee.
    employee: Mapped["Employee"] = relationship(
        "Employee", back_populates="addresses", lazy="joined"
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Address aid={self.aid} eid={self.eid}>"
