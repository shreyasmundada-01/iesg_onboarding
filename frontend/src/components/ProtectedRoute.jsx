/**
 * components/ProtectedRoute.jsx
 * -------------------------------
 * Route guards.
 *
 * - ProtectedRoute: redirects unauthenticated users to /login, preserving
 *   the originally requested location so we can send them back after
 *   they log in. Shows a Loader while the auth bootstrap check runs.
 * - AdminRoute: same as ProtectedRoute, but additionally redirects any
 *   authenticated non-admin user to /dashboard. This is a UX convenience
 *   only - the backend independently enforces admin-only access on every
 *   admin endpoint via `require_admin`, so hiding/redirecting here is not
 *   itself a security boundary, just a nicer experience for normal users.
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

export function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader tip="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
