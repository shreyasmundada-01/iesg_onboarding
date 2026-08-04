from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(
    prefix="/addresses",
    tags=["Addresses"]
)

@router.post("/", response_model=schemas.AddressResponse)
def create_address(
    data: schemas.AddressCreate,
    db: Session = Depends(get_db)
):
    address = crud.create_address(db, data)
    return address

@router.get("/", response_model=list[schemas.AddressResponse])
def get_addresses(
    db: Session = Depends(get_db)
):
    addresses = crud.get_addresses(db)
    return addresses

@router.put("/{aid}", response_model=schemas.AddressResponse)
def update_address(
    aid: int,
    data: schemas.AddressCreate,
    db: Session = Depends(get_db)
):
    address = crud.update_address(db, aid, data)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@router.delete("/{aid}", response_model=schemas.AddressResponse)
def delete_address(
    aid: int,
    db: Session = Depends(get_db)
):
    address = crud.delete_address(db, aid)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address