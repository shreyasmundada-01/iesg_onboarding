"""
routers/users.py
------------------
Admin-only user management endpoints. Every route in this router is
protected by `require_admin`, so only authenticated users whose role is
"admin" (checked fresh from the database on every request) can reach
them. No SQL/business logic here - everything delegates to crud.py.

Endpoints:
    GET   /users              List all registered users
    PATCH /users/{uid}/role   Promote a user to admin, or demote an admin to user
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import User
from app.schemas import UserOut, UserPage, UserRoleUpdate
from app.security import require_admin

router = APIRouter(prefix="/users", tags=["User Management (Admin)"])


@router.get(
    "",
    response_model=UserPage,
    summary="List all registered users (admin-only)",
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users, total = crud.list_users(db)
    return UserPage(total=total, items=users)


@router.patch(
    "/{uid}/role",
    response_model=UserOut,
    summary="Promote a user to admin or demote an admin to user (admin-only)",
)
def update_user_role(
    uid: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Change a target user's role.

    - Only reachable by an authenticated admin (enforced by `require_admin`).
    - `crud.set_user_role` additionally refuses to demote the sole
      remaining admin, so the application can never end up with zero
      admin accounts.
    - Admins are allowed to change their own role too (e.g. demote
      themselves), EXCEPT when they are the last admin - that specific
      case is where the "cannot demote themselves if they are the only
      remaining admin" rule bites, and it is enforced in crud.py so it
      applies uniformly regardless of who is calling the endpoint.
    """
    return crud.set_user_role(db, uid, payload.role)
