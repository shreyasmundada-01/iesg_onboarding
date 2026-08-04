from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/employee",
    tags=["Employee"]
)

@router.post("/", response_model=schemas.EmployeeResponse)
def create_employee(
    data: schemas.EmployeeCreate,
    db: Session = Depends(get_db)
):
    employee = crud.create_employee(db, data)
    return employee 

@router.get("/", response_model=list[schemas.EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db)
):
    employees = crud.get_employees(db)
    return employees

@router.put("/{eid}", response_model=schemas.EmployeeResponse)
def update_employee(
    eid: int,
    data: schemas.EmployeeCreate,
    db: Session = Depends(get_db)
):
    employee = crud.update_employee(db, eid, data)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.delete("/{eid}", response_model=schemas.EmployeeResponse)
def delete_employee(
    eid:int,
    db: Session = Depends(get_db)
):
    employee = crud.delete_employee(db, eid)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee
