"""
main.py
-------
FastAPI application entrypoint. Wires together config, database
initialization, CORS, exception handlers, and routers.

Run with:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import SessionLocal, init_db
from app.routers import address, auth, employee, users
from app import crud

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "A production-quality Employee Management Portal API. "
        "Use the **Authorize** button below with a bearer token obtained "
        "from `POST /auth/login` to access protected endpoints."
    ),
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True},
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup() -> None:
    """
    Create database tables if they do not already exist, then ensure
    exactly one admin account exists by auto-creating the default admin
    the first time the app ever starts (idempotent - a no-op on every
    subsequent startup once any admin exists).
    """
    init_db()

    db = SessionLocal()
    try:
        crud.create_first_admin(
            db,
            email="shreyas@gmail.com",
            username="shreyas",
            password="shreyas123",
        )
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Global exception handlers - consistent, meaningful JSON error responses
# ---------------------------------------------------------------------------
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(employee.router)
app.include_router(address.router)
app.include_router(users.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"], summary="Health check")
def health_check() -> dict:
    return {"status": "ok", "app": settings.APP_NAME, "environment": settings.ENVIRONMENT}
