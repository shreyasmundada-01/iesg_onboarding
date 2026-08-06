# Employee Management Portal — Backend

A production-quality REST API built with **FastAPI**, **SQLAlchemy 2.0**, **Pydantic v2**,
and **JWT authentication**, backed by SQLite.

## Tech Stack

- Python 3.12+
- FastAPI
- SQLAlchemy ORM (SQLite)
- Pydantic v2 / pydantic-settings
- JWT via `python-jose`
- Password hashing via `passlib[bcrypt]`
- Uvicorn (ASGI server)

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app, middleware, exception handlers, router registration
│   ├── database.py      # Engine, session, Base, get_db dependency
│   ├── models.py         # SQLAlchemy ORM models (User, Employee, Address)
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── crud.py            # All business logic / DB queries
│   ├── security.py        # Password hashing, JWT, current-user dependencies
│   ├── config.py          # Environment-driven settings
│   ├── routers/
│   │   ├── auth.py         # /auth/register, /auth/login, /auth/me
│   │   ├── employee.py      # /employee CRUD (protected)
│   │   └── address.py       # /addresses CRUD (protected)
│   ├── services/           # Reserved for future service-layer helpers
│   └── utils/               # Reserved for generic utility helpers
├── requirements.txt
├── .env.example
└── README.md
```

## Setup

### 1. Create a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then open `.env` and set a strong, random `SECRET_KEY` (never commit real secrets):

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 4. Run the server

```bash
uvicorn app.main:app --reload
```

The API will be available at **http://localhost:8000**.
Database tables are created automatically on startup (SQLite file `employee_portal.db`).

## API Documentation

- Swagger UI: **http://localhost:8000/docs**
- ReDoc: **http://localhost:8000/redoc**

### Using JWT auth in Swagger

1. Call `POST /auth/register` to create a user.
2. Click the **Authorize** button (top right of `/docs`).
3. Enter your `username` and `password` in the form (this hits `/auth/login` under the hood)
   and click **Authorize**.
4. All protected endpoints will now automatically send the `Authorization: Bearer <token>`
   header.

## Endpoints

### Auth (public)

| Method | Path             | Description               |
|--------|------------------|----------------------------|
| POST   | `/auth/register` | Register a new user        |
| POST   | `/auth/login`    | Login, receive JWT token    |
| GET    | `/auth/me`       | Get current user (protected) |

### Employees (protected)

| Method | Path              | Description                    |
|--------|-------------------|----------------------------------|
| POST   | `/employee`       | Create employee                  |
| GET    | `/employee`       | List employees (paginated/search/sort) |
| GET    | `/employee/{id}`  | Get employee by id                |
| PUT    | `/employee/{id}`  | Update employee                    |
| DELETE | `/employee/{id}`  | Soft-delete employee                |

### Addresses (protected)

| Method | Path               | Description                      |
|--------|--------------------|------------------------------------|
| POST   | `/addresses`       | Create address                      |
| GET    | `/addresses`       | List addresses (paginated/search/filter by eid) |
| GET    | `/addresses/{id}`  | Get address by id                    |
| PUT    | `/addresses/{id}`  | Update address                        |
| DELETE | `/addresses/{id}`  | Soft-delete address                    |

## Notes

- **Soft deletes**: Employees and Addresses are never physically removed; `DELETE`
  sets `is_active = False`. Inactive records are excluded from list/get results.
- **JWT payload**: `{"sub": "<username>", "exp": <timestamp>}`, default expiry 30 minutes
  (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` in `.env`).
- **Passwords** are hashed with bcrypt and never returned in any API response.
- For production use, replace `Base.metadata.create_all()` in `database.py` with
  Alembic migrations, and set `ENVIRONMENT=production` with a securely generated
  `SECRET_KEY` sourced from a secrets manager.
