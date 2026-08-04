from fastapi import FastAPI

from app.database import engine
from app import models
from app.routers import employee, address

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

app.include_router(employee.router)
app.include_router(address.router)
