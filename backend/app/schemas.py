"""
schemas.py
----------
Owns ONLY Pydantic (v2) request/response schemas. No ORM models, no
business logic, no DB access. Routers use these for request validation
and `response_model` typing; crud.py converts between these and the
SQLAlchemy models in models.py.
"""

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# User / Auth Schemas
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr


class UserCreate(UserBase):
    """Payload for POST /auth/register."""

    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_no_spaces(cls, v: str) -> str:
        if " " in v:
            raise ValueError("username must not contain spaces")
        return v


class UserOut(UserBase):
    """Public-facing user representation. Never includes hashed_password."""

    model_config = ConfigDict(from_attributes=True)

    uid: int
    role: str
    is_active: bool
    created_at: datetime


class UserLogin(BaseModel):
    """Payload for POST /auth/login when not using the OAuth2 form."""

    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Decoded JWT payload shape."""

    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


class UserRoleUpdate(BaseModel):
    """Payload for PATCH /users/{uid}/role - admin-only promote/demote."""

    role: str = Field(..., description="Must be either 'admin' or 'user'")

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        if v not in ("admin", "user"):
            raise ValueError("role must be either 'admin' or 'user'")
        return v


class UserPage(BaseModel):
    """Paginated envelope for GET /users list responses (admin-only)."""

    total: int
    items: List[UserOut]


class PasswordChange(BaseModel):
    """Payload for POST /auth/change-password - users change their own password."""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=128)


# ---------------------------------------------------------------------------
# Address Schemas
# ---------------------------------------------------------------------------

class AddressBase(BaseModel):
    addres: str = Field(..., min_length=1, max_length=500, description="Address line")


class AddressCreate(AddressBase):
    eid: int = Field(..., gt=0, description="Employee this address belongs to")


class AddressUpdate(BaseModel):
    addres: Optional[str] = Field(None, min_length=1, max_length=500)
    eid: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None


class AddressOut(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    aid: int
    eid: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Employee Schemas
# ---------------------------------------------------------------------------

class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    dob: date

    @field_validator("dob")
    @classmethod
    def dob_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("dob cannot be in the future")
        return v


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    dob: Optional[date] = None
    is_active: Optional[bool] = None

    @field_validator("dob")
    @classmethod
    def dob_not_in_future(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v > date.today():
            raise ValueError("dob cannot be in the future")
        return v


class EmployeeOut(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    eid: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class EmployeeWithAddresses(EmployeeOut):
    """Employee detail view including nested addresses."""

    addresses: List[AddressOut] = []


# ---------------------------------------------------------------------------
# Generic / Shared Schemas
# ---------------------------------------------------------------------------

class MessageResponse(BaseModel):
    """Simple message envelope for delete/confirmation responses."""

    detail: str


class EmployeePage(BaseModel):
    """Paginated envelope for GET /employee list responses."""

    total: int
    page: int
    page_size: int
    items: List[EmployeeOut]


class AddressPage(BaseModel):
    """Paginated envelope for GET /addresses list responses."""

    total: int
    page: int
    page_size: int
    items: List[AddressOut]
