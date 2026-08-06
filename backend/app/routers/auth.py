"""
routers/auth.py
----------------
Authentication endpoints only. No SQL/business logic here - everything
delegates to crud.py and security.py.

Endpoints:
    POST /auth/register
    POST /auth/login
    GET  /auth/me
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import User
from app.schemas import PasswordChange, Token, UserCreate, UserOut
from app.security import create_access_token, get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    """Create a new user account. Username and email must be unique."""
    return crud.create_user(db, user_in)


@router.post(
    "/login",
    response_model=Token,
    summary="Login and obtain a JWT access token",
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """
    Authenticate with username + password (OAuth2 password flow) and
    receive a JWT bearer token. This is the same endpoint Swagger's
    "Authorize" button submits to.
    """
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    access_token = create_access_token(subject=user.username, role=user.role)
    return Token(access_token=access_token, token_type="bearer")


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get the currently authenticated user",
)
def read_current_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Return the profile of the user identified by the bearer token."""
    return current_user


@router.post(
    "/change-password",
    response_model=UserOut,
    summary="Change the current user's own password",
)
def change_password(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Any authenticated user (admin or user) can change their OWN password
    by supplying their current password for verification. This endpoint
    never accepts a target user id - it always acts on the caller.
    """
    return crud.change_own_password(
        db, current_user, payload.current_password, payload.new_password
    )
