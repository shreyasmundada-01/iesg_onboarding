# Employee & Address Management REST API

A simple REST API built using **FastAPI**, **SQLAlchemy**, and **SQLite** for managing Employees and their Addresses. This project was developed as part of the IESG Labs onboarding assignment.

---

## Technologies Used

- Python 3
- FastAPI
- SQLAlchemy
- SQLite
- Uvicorn

---

## Project Structure

```
iesg_onboarding/
│
├── app/
│   ├── routers/
│   │   ├── employee.py
│   │   └── address.py
│   │
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
│
├── venv/
├── requirements.txt
├── README.md
└── .gitignore
```

---

## Features

### Employee Management

- Create Employee
- Get All Active Employees
- Update Employee
- Soft Delete Employee

### Address Management

- Create Address
- Get All Active Addresses
- Update Address
- Soft Delete Address

---

## Database Design

### Employee Table

| Column | Type |
|---------|------|
| eid | Integer (Primary Key) |
| name | String |
| dob | Date |
| is_active | Boolean |

### Address Table

| Column | Type |
|---------|------|
| aid | Integer (Primary Key) |
| eid | Integer (Foreign Key) |
| address | String |
| is_active | Boolean |

One Employee can have multiple Addresses (One-to-Many Relationship).

---

## API Endpoints

### Employee APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /employee/ | Create Employee |
| GET | /employee/ | Get All Employees |
| PUT | /employee/{eid} | Update Employee |
| DELETE | /employee/{eid} | Soft Delete Employee |

### Address APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /addresses/ | Create Address |
| GET | /addresses/ | Get All Addresses |
| PUT | /addresses/{aid} | Update Address |
| DELETE | /addresses/{aid} | Soft Delete Address |

---

## How to Run

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Move into the project

```bash
cd iesg_onboarding
```

### 3. Create a virtual environment (if not already created)

```bash
python -m venv venv
```

### 4. Activate the virtual environment

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

### 5. Install dependencies

```bash
pip install -r requirements.txt
```

### 6. Run the application

```bash
uvicorn app.main:app --reload
```

---

## API Documentation

Swagger UI:

```
http://127.0.0.1:8000/docs
```

ReDoc:

```
http://127.0.0.1:8000/redoc
```

---

## Testing

The APIs were successfully tested using:

- FastAPI Swagger UI
- CRUD Operations
- SQLite Database

The following operations were verified:

- Employee Create
- Employee Read
- Employee Update
- Employee Soft Delete
- Address Create
- Address Read
- Address Update
- Address Soft Delete

---

## Soft Delete

Instead of permanently deleting records, the application performs a **Soft Delete** by setting the `is_active` field to `False`. Only records with `is_active = True` are returned in GET requests.

---

## Author

**Shreyas Mundada**