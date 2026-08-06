# Full Stack Employee Management Portal

A production-quality, full-stack Employee Management Portal:

- **Backend**: Python 3.12+, FastAPI, SQLAlchemy ORM, SQLite, Pydantic v2, JWT auth
  (OAuth2PasswordBearer + python-jose + passlib/bcrypt), Uvicorn.
- **Frontend**: React 19 (Vite), Ant Design, React Router DOM, Axios, Context API.

```
employee-portal/
├── backend/     # FastAPI REST API (see backend/README.md)
└── frontend/    # React + Ant Design dashboard (see frontend/README.md)
```

## Architecture Overview

```
┌─────────────────────┐        HTTPS / JSON        ┌──────────────────────────┐
│   React (Vite) SPA   │ ─────────────────────────▶ │      FastAPI Backend      │
│  Ant Design UI        │ ◀───────────────────────── │   SQLAlchemy + SQLite      │
│  Context API (auth)    │      JWT Bearer token       │   JWT Auth (python-jose)    │
└─────────────────────┘                              └──────────────────────────┘
```

- The frontend never talks to the database directly — all data access goes through
  the FastAPI REST API.
- Authentication is stateless: the backend issues a signed JWT on login; the frontend
  stores it in `localStorage` and attaches it as a `Bearer` token on every subsequent
  request via a shared Axios instance.
- `Employee` ↔ `Address` is a one-to-many relationship (`Employee.addresses`), enforced
  at the database level with a foreign key and cascading delete.
- Both `Employee` and `Address` use **soft deletes** (`is_active` flag) — `DELETE`
  requests never physically remove rows.

## Quickstart

You'll need two terminals — one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then set a real SECRET_KEY, see backend/README.md
uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000** (Swagger docs at `/docs`).

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

### First run

1. Open **http://localhost:5173/register** and create an account.
2. Log in.
3. You'll land on the Dashboard — start adding Employees and Addresses.

## Full Documentation

- Backend setup, environment variables, and full API reference: [`backend/README.md`](backend/README.md)
- Frontend setup, routes, and project structure: [`frontend/README.md`](frontend/README.md)

## Security Notes

- Passwords are hashed with bcrypt and never returned by the API.
- All Employee and Address endpoints require a valid JWT; only `/auth/register` and
  `/auth/login` are public.
- Tokens expire after 30 minutes by default (`ACCESS_TOKEN_EXPIRE_MINUTES` in
  `backend/.env`); the frontend detects a `401` response from any protected call,
  clears the stored session, and redirects to `/login`.
- **Never commit a real `.env` file.** Both `backend/.gitignore` and
  `frontend/.gitignore` already exclude `.env`.
