from datetime import date
from pydantic import BaseModel

class EmployeeCreate(BaseModel):
    name: str
    dob: date
    
class EmployeeResponse(BaseModel):
    eid: int
    name: str
    dob: date
    is_active: bool
        
    class Config:
        from_attributes = True
        
class AddressCreate(BaseModel):
    address: str
    eid: int
    
class AddressResponse(BaseModel):
    aid: int
    eid: int
    address: str
    is_active: bool
        
    class Config:
        from_attributes = True
         