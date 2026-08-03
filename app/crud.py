from sqlalchemy.orm import Session
from app import models, schemas

# Employee CRUD operations

def create_employee(db: Session, data: schemas.EmployeeCreate):
    employee = models.Employee(
        name=data.name,
        dob=data.dob
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee

def get_employees(db: Session):
    return db.query(models.Employee).filter(models.Employee.is_active == True).all()

def update_employee(db: Session, eid: int, data: schemas.EmployeeCreate):
    employee = db.query(models.Employee).filter(models.Employee.eid == eid).first()
    
    if employee is None:
        return None
    
    employee.name = data.name
    employee.dob = data.dob
    
    db.commit()
    db.refresh(employee)
    
    return employee

def delete_employee(db: Session, eid: int):
    employee = db.query(models.Employee).filter(models.Employee.eid == eid).first()
    
    if employee is None:
        return None
    
    employee.is_active = False
    
    db.commit()
    db.refresh(employee)
    
    return employee

# Address CRUD opertaions

def create_address(db: Session, data: schemas.AddressCreate):
    address = models.Address(
        eid=data.eid,
        address=data.address
    )
    
    db.add(address)
    db.commit()
    db.refresh(address)
    
    return address

def get_addresses(db: Session):
    return db.query(models.Address).filter(models.Address.is_active == True).all()

def update_address(db: Session, aid: int, data: schemas.AddressCreate):
    address_obj = db.query(models.Address).filter(models.Address.aid == aid).first()
    
    if address_obj is None:
        return None
    
    address_obj.address = data.address
    address_obj.eid = data.eid
    
    db.commit()
    db.refresh(address_obj)
    
    return address_obj

def delete_address(db: Session, aid: int):
    address_obj = db.query(models.Address).filter(models.Address.aid == aid).first()
    
    if address_obj is None:
        return None
    
    address_obj.is_active = False
    
    db.commit()
    db.refresh(address_obj)
    
    return address_obj