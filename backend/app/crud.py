"""
crud.py
-------
Owns ALL business logic and database queries. Routers call these
functions and never issue SQL / ORM queries themselves.
"""

from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Address, Employee, User
from app.schemas import (
    AddressCreate,
    AddressUpdate,
    EmployeeCreate,
    EmployeeUpdate,
    UserCreate,
)
from app.security import hash_password, verify_password


# ---------------------------------------------------------------------------
# User CRUD
# ---------------------------------------------------------------------------

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, uid: int) -> User:
    user = db.query(User).filter(User.uid == uid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {uid} not found"
        )
    return user


def create_user(db: Session, user_in: UserCreate) -> User:
    """
    Register a new user. Raises 400 if username/email already exist.

    SECURITY: Role is ALWAYS hardcoded to "user" here, regardless of what
    the UserCreate schema does or does not contain. UserCreate has no
    `role` field at all (see schemas.py), so even if a client sends a
    `role` key in the JSON body, Pydantic silently ignores it as an
    unrecognized field and it never reaches this function. This line is
    the second, defense-in-depth layer of that guarantee: every new
    account becomes role="user" no matter what.
    """
    if get_user_by_username(db, user_in.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered"
        )
    if get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role="user",
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_first_admin(
    db: Session, *, email: str, username: str, password: str
) -> Optional[User]:
    """
    Bootstrap the very first admin account, but ONLY if no admin account
    exists anywhere in the users table yet. Safe to call on every
    application startup - it is idempotent and a strict no-op once any
    admin exists.
    """
    admin_exists = db.query(User).filter(User.role == "admin").first()
    if admin_exists:
        return None

    # If a user with this email/username already exists (e.g. re-running
    # against an existing DB) but isn't an admin, promote them instead of
    # trying to insert a duplicate row.
    existing = get_user_by_email(db, email) or get_user_by_username(db, username)
    if existing:
        existing.role = "admin"
        db.commit()
        db.refresh(existing)
        return existing

    admin_user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        role="admin",
        is_active=True,
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """Return the user if credentials are valid, else None."""
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def list_users(db: Session) -> Tuple[List[User], int]:
    """Return every registered user (admin-only view) plus the total count."""
    query = db.query(User).order_by(User.uid.asc())
    total = query.with_entities(func.count(User.uid)).scalar() or 0
    return query.all(), total


def count_admins(db: Session) -> int:
    return db.query(User).filter(User.role == "admin").with_entities(func.count(User.uid)).scalar() or 0


def set_user_role(db: Session, uid: int, new_role: str) -> User:
    """
    Promote/demote a user. Refuses to demote the last remaining admin,
    since that would leave the application with no admin account at all.
    """
    user = get_user_by_id(db, uid)

    if user.role == "admin" and new_role == "user" and count_admins(db) <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote the last remaining admin",
        )

    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def change_own_password(db: Session, user: User, current_password: str, new_password: str) -> User:
    """Let a user change their own password after verifying the current one."""
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect"
        )
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user


# ---------------------------------------------------------------------------
# Employee CRUD
# ---------------------------------------------------------------------------

def create_employee(db: Session, employee_in: EmployeeCreate) -> Employee:
    db_employee = Employee(name=employee_in.name, dob=employee_in.dob, is_active=True)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


def get_employee(db: Session, eid: int, include_inactive: bool = False) -> Employee:
    """Fetch a single employee by id. Raises 404 if not found (or soft-deleted)."""
    query = db.query(Employee).filter(Employee.eid == eid)
    if not include_inactive:
        query = query.filter(Employee.is_active.is_(True))
    employee = query.first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Employee with id {eid} not found"
        )
    return employee


def list_employees(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    sort_by: str = "eid",
    sort_order: str = "asc",
) -> Tuple[List[Employee], int]:
    """
    Return a page of active employees plus the total active-employee count.

    Supports simple search-by-name and sorting by any column defined on
    the Employee model (falls back to `eid` if an invalid column is given).
    """
    query = db.query(Employee).filter(Employee.is_active.is_(True))

    if search:
        query = query.filter(Employee.name.ilike(f"%{search}%"))

    total = query.with_entities(func.count(Employee.eid)).scalar() or 0

    sort_column = getattr(Employee, sort_by, Employee.eid)
    query = query.order_by(sort_column.desc() if sort_order == "desc" else sort_column.asc())

    offset = (page - 1) * page_size
    employees = query.offset(offset).limit(page_size).all()

    return employees, total


def update_employee(db: Session, eid: int, employee_in: EmployeeUpdate) -> Employee:
    employee = get_employee(db, eid, include_inactive=True)
    update_data = employee_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, eid: int) -> Employee:
    """Soft delete: flips is_active to False rather than removing the row."""
    employee = get_employee(db, eid, include_inactive=True)
    employee.is_active = False
    db.commit()
    db.refresh(employee)
    return employee


# ---------------------------------------------------------------------------
# Address CRUD
# ---------------------------------------------------------------------------

def create_address(db: Session, address_in: AddressCreate) -> Address:
    # Ensure the parent employee exists and is active before attaching an address.
    get_employee(db, address_in.eid)

    db_address = Address(eid=address_in.eid, addres=address_in.addres, is_active=True)
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address


def get_address(db: Session, aid: int, include_inactive: bool = False) -> Address:
    query = db.query(Address).filter(Address.aid == aid)
    if not include_inactive:
        query = query.filter(Address.is_active.is_(True))
    address = query.first()
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Address with id {aid} not found"
        )
    return address


def list_addresses(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    eid: Optional[int] = None,
) -> Tuple[List[Address], int]:
    """Return a page of active addresses plus the total active-address count."""
    query = db.query(Address).filter(Address.is_active.is_(True))

    if eid is not None:
        query = query.filter(Address.eid == eid)

    if search:
        query = query.filter(Address.addres.ilike(f"%{search}%"))

    total = query.with_entities(func.count(Address.aid)).scalar() or 0

    query = query.order_by(Address.aid.asc())
    offset = (page - 1) * page_size
    addresses = query.offset(offset).limit(page_size).all()

    return addresses, total


def update_address(db: Session, aid: int, address_in: AddressUpdate) -> Address:
    address = get_address(db, aid, include_inactive=True)

    update_data = address_in.model_dump(exclude_unset=True)
    if "eid" in update_data and update_data["eid"] is not None:
        # Validate the new parent employee exists before reassigning.
        get_employee(db, update_data["eid"])

    for field, value in update_data.items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, aid: int) -> Address:
    """Soft delete: flips is_active to False rather than removing the row."""
    address = get_address(db, aid, include_inactive=True)
    address.is_active = False
    db.commit()
    db.refresh(address)
    return address
