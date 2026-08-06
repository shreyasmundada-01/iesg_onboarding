/**
 * App.jsx
 * --------
 * Top-level route definitions.
 *
 * - /login, /register       -> public
 * - /dashboard, /employees, /addresses -> protected, rendered inside DashboardLayout
 * - /                        -> redirects to /dashboard
 * - *                        -> 404
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Addresses from "./pages/Addresses";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

// Design tokens for the whole app. Component-level overrides here keep
// Ant Design's defaults from fighting the design system defined in index.css.
const theme = {
  token: {
    colorPrimary: "#5b5fef",
    colorSuccess: "#17a06b",
    colorWarning: "#d98a1e",
    colorError: "#e5484d",
    colorInfo: "#5b5fef",
    colorTextBase: "#14151f",
    colorBgLayout: "#f5f6fb",
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    controlHeight: 38,
  },
  components: {
    Button: {
      controlHeight: 38,
      fontWeight: 500,
      primaryShadow: "none",
    },
    Card: {
      borderRadiusLG: 14,
      boxShadowTertiary: "0 1px 2px rgba(20,21,31,0.05)",
    },
    Input: {
      controlHeight: 38,
      borderRadius: 10,
    },
    Select: {
      controlHeight: 38,
      borderRadius: 10,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Menu: {
      itemBorderRadius: 8,
      itemHeight: 42,
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
    },
    Table: {
      borderRadiusLG: 12,
    },
  },
};

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes, rendered inside the dashboard shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/addresses" element={<Addresses />} />

              {/* Admin-only */}
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          {/* Default + fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ConfigProvider>
  );
}
