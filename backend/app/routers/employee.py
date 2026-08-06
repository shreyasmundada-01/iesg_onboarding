"""
routers/employee.py
--------------------
Employee CRUD endpoints. All routes require authentication. No SQL/business
logic here - everything delegates to crud.py.

Endpoints:
    POST   /employee
    GET    /employee
    GET    /employee/{id}
    PUT    /employee/{id}
    DELETE /employee/{id}   (soft delete)
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import User
from app.schemas import EmployeeCreate, EmployeeOut, EmployeePage, EmployeeUpdate, MessageResponse
from app.security import get_current_active_user

router = APIRouter(prefix="/employee", tags=["Employees"])


@router.post(
    "",
    response_model=EmployeeOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new employee",
)
def create_employee(
    employee_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return crud.create_employee(db, employee_in)


@router.get(
    "",
    response_model=EmployeePage,
    summary="List employees (paginated, searchable, sortable)",
)
def list_employees(
    page: int = Query(1, ge=1, description="Page number, starting at 1"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by employee name"),
    sort_by: str = Query("eid", description="Column to sort by: eid, name, dob, created_at"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    employees, total = crud.list_employees(db, page, page_size, search, sort_by, sort_order)
    return EmployeePage(total=total, page=page, page_size=page_size, items=employees)


@router.get(
    "/{eid}",
    response_model=EmployeeOut,
    summary="Get a single employee by id",
)
def get_employee(
    eid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return crud.get_employee(db, eid)


@router.put(
    "/{eid}",
    response_model=EmployeeOut,
    summary="Update an employee",
)
def update_employee(
    eid: int,
    employee_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return crud.update_employee(db, eid, employee_in)


@router.delete(
    "/{eid}",
    response_model=MessageResponse,
    summary="Soft-delete an employee",
)
def delete_employee(
    eid: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    crud.delete_employee(db, eid)
    return MessageResponse(detail=f"Employee {eid} deactivated successfully")
