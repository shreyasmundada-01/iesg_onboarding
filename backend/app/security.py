"""
security.py
------------
Owns ONLY security concerns:
- Password hashing / verification (bcrypt via passlib)
- JWT creation and decoding (python-jose)
- OAuth2PasswordBearer scheme
- `get_current_user` / `get_current_active_user` FastAPI dependencies
- Role-based authorization dependencies (`require_admin`, `require_role`)

No routes, no SQL queries live here - crud.py and the routers call into
this module, never the other way around.

SECURITY NOTE ON ROLES:
The JWT payload carries a `role` claim per the RBAC spec, but that claim
is informational only and is NEVER trusted for authorization decisions.
`get_current_user` always re-fetches the user row from the database by
username on every request, and every role check in this file compares
against `current_user.role` as read fresh from the database. This means
a stale or hand-edited token cannot grant elevated privileges: even if
someone decodes their token and edits the `role` field, the signature
check will fail (since the payload changed) and, even hypothetically if
it didn't, the actual authorization check never looks at the token's
role claim - only the database's.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import TokenPayload

# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------

# tokenUrl points Swagger's "Authorize" button at the login endpoint so the
# interactive docs can obtain and attach a bearer token automatically.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def create_access_token(
    subject: str, role: Optional[str] = None, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT access token.

    The token payload contains `sub` (the username), `role` (the user's
    role at the time of login, for informational/debugging purposes only -
    see the SECURITY NOTE above), and `exp` (expiration timestamp).
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> TokenPayload:
    """
    Decode and validate a JWT. Raises 401 if the token is invalid,
    malformed, or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if username is None:
            raise credentials_exception
        return TokenPayload(sub=username, role=payload.get("role"), exp=payload.get("exp"))
    except JWTError as exc:
        raise credentials_exception from exc


# ---------------------------------------------------------------------------
# Current-user dependencies
# ---------------------------------------------------------------------------

def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """
    Decode the bearer token, look up the corresponding user, and return it.

    Used as a FastAPI dependency to protect any route that requires
    authentication: `current_user: User = Depends(get_current_user)`.
    """
    token_data = decode_access_token(token)

    user = db.query(User).filter(User.username == token_data.sub).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the authenticated user's account is still active."""
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    return current_user


# ---------------------------------------------------------------------------
# Role-based authorization dependencies
# ---------------------------------------------------------------------------

def require_role(*allowed_roles: str):
    """
    Dependency factory: returns a FastAPI dependency that only allows
    through users whose (freshly-fetched-from-DB) role is one of
    `allowed_roles`. Raises 403 Forbidden otherwise.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
        or
        current_user: User = Depends(require_role("admin"))
    """

    def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency that only allows through users with role == "admin".

    Equivalent to require_role("admin") but kept as a dedicated,
    explicitly-named function since admin-only access is the primary
    authorization boundary in this application.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges are required to perform this action",
        )
    return current_user
