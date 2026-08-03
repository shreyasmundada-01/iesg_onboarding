from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base

class Employee(Base):
    __tablename__="employees"
    
    eid=Column(Integer, primary_key=True, index=True)
    name=Column(String, nullable=False)
    dob=Column(Date, nullable=False)
    is_active=Column(Boolean, default=True)
    
    addresses=relationship("Address", back_populates="employee")
    
class Address(Base):
    __tablename__ = "addresses"
    
    aid = Column(Integer, primary_key=True, index=True)
    eid = Column(Integer, ForeignKey("employees.eid"))
    address = Column(String)
    is_active = Column(Boolean, default=True)
    
    employee = relationship(
        "Employee", 
        back_populates="addresses")
    