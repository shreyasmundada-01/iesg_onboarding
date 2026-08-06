"""
routers/address.py
-------------------
Address CRUD endpoints. All routes require authentication. No SQL/business
logic here - everything delegates to crud.py.

Endpoints:
    POST   /addresses
    GET    /addresses
    GET    /addresses/{id}
    PUT    /addresses/{id}
    DELETE /addresses/{id}   (soft delete)
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import User
from app.schemas import AddressCreate, AddressOut, AddressPage, AddressUpdate, MessageResponse
from app.security import get_current_active_user, require_admin

router = APIRouter(prefix="/addresses", tags=["Addresses"])


@router.post(
    "",
    response_model=AddressOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new address for an employee",
)
def create_address(
    address_in: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return crud.create_address(db, address_in)


@router.get(
    "",
    response_model=AddressPage,
    summary="List addresses (paginated, searchable, filterable by employee)",
)
def list_addresses(
    page: int = Query(1, ge=1, description="Page number, starting at 1"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search within the address text"),
    eid: Optional[int] = Query(None, description="Filter addresses by employee id"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    addresses, total = crud.list_addresses(db, page, page_size, search, eid)
    return AddressPage(total=total, page=page, page_size=page_size, items=addresses)


@router.get(
    "/{aid}",
    response_model=AddressOut,
    summary="Get a single address by id",
)
def get_address(
    aid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return crud.get_address(db, aid)


@router.put(
    "/{aid}",
    response_model=AddressOut,
    summary="Update an address",
)
def update_address(
    aid: int,
    address_in: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return crud.update_address(db, aid, address_in)


@router.delete(
    "/{aid}",
    response_model=MessageResponse,
    summary="Soft-delete an address",
)
def delete_address(
    aid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    crud.delete_address(db, aid)
    return MessageResponse(detail=f"Address {aid} deactivated successfully")
