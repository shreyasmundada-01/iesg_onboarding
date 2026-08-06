/**
 * auth/AuthContext.jsx
 * --------------------
 * Global authentication state via React Context API (no Redux).
 *
 * Responsibilities:
 * - Hold the current user + loading state.
 * - login(username, password): calls /auth/login, stores JWT + user, updates state.
 * - register(payload): calls /auth/register.
 * - logout(): clears storage and state.
 * - On mount, if a token exists in localStorage, fetch /auth/me to restore the session.
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (username, password) => {
    // /auth/login uses OAuth2PasswordRequestForm, which expects
    // application/x-www-form-urlencoded data, not JSON.
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const { data } = await api.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("access_token", data.access_token);

    const { data: currentUser } = await api.get("/auth/me");
    setUser(currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));

    return currentUser;
  };

  const register = async ({ username, email, password }) => {
    const { data } = await api.post("/auth/register", { username, email, password });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export default AuthContext;
