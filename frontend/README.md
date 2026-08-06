# Employee Management Portal — Frontend

A responsive, modern React dashboard built with **React 19 (Vite)**, **Ant Design**,
**React Router DOM**, and **Axios**, backed by the FastAPI backend in `../backend`.

## Tech Stack

- React 19 + Vite
- Ant Design (antd) v5
- React Router DOM v6
- Axios
- Context API for authentication state (no Redux)

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js           # Shared Axios instance (token attach + 401 handling)
│   ├── auth/
│   │   └── AuthContext.jsx    # Context API auth provider (login/register/logout)
│   ├── components/
│   │   ├── Navbar.jsx         # Top bar: collapse toggle, breadcrumb, user menu
│   │   ├── Sidebar.jsx        # Collapsible nav menu
│   │   ├── Loader.jsx         # Reusable spinner
│   │   └── ProtectedRoute.jsx # Auth route guard
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── Addresses.jsx
│   │   └── NotFound.jsx
│   ├── layouts/
│   │   └── DashboardLayout.jsx # Sidebar + Navbar + content shell
│   ├── App.jsx                 # Route definitions
│   ├── main.jsx                # React root
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure the API base URL (optional)

By default the app talks to `http://localhost:8000`. To override, create a `.env` file:

```bash
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

### 3. Run the dev server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

> Make sure the backend (`../backend`) is running first — see `../backend/README.md`.

### 4. Build for production

```bash
npm run build
npm run preview
```

## Authentication Flow

```
Register -> Login -> Receive JWT -> Store in localStorage
   -> AuthContext holds current user -> Axios attaches Bearer token
   -> ProtectedRoute guards /dashboard, /employees, /addresses
   -> 401 response anywhere -> auto logout + redirect to /login
```

## Pages

| Route         | Access    | Description                              |
|---------------|-----------|--------------------------------------------|
| `/login`      | Public    | Sign in                                     |
| `/register`   | Public    | Create an account                            |
| `/dashboard`  | Protected | Summary stats overview                        |
| `/employees`  | Protected | Employee table: search, sort, paginate, CRUD    |
| `/addresses`  | Protected | Address table: search, paginate, CRUD            |
| `*`           | -         | 404 Not Found                                     |

## Notes

- All Ant Design components used are limited to the set specified in the project spec
  (Layout, Menu, Table, Form, Input, DatePicker, Button, Modal, Notification/message,
  Spin, Card, Avatar, Breadcrumb, Typography, Tag, Tooltip, Icons, etc.).
- The Sidebar auto-collapses on smaller (`lg` breakpoint and below) screens for
  mobile-friendliness.
- State management is handled entirely with React hooks + Context API — no Redux.
