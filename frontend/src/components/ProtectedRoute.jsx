/**
 * components/ProtectedRoute.jsx
 * -------------------------------
 * Route guard: redirects unauthenticated users to /login, preserving
 * the originally requested location so we can send them back after
 * they log in. Shows a Loader while the auth bootstrap check runs.
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader tip="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
