import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api, { setAuthToken } from "../lib/api";
import type { Admin } from "../types";

interface AuthContextValue {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateAdmin: (updated: Admin) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "asla_admin_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { token: string; admin: Admin };
        setToken(parsed.token);
        setAdmin(parsed.admin);
        setAuthToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const res = await api.post("/auth/login", { username, password });
    const { token: newToken, admin: newAdmin } = res.data.data;
    setToken(newToken);
    setAdmin(newAdmin);
    setAuthToken(newToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, admin: newAdmin }));
  }

  function logout() {
    setToken(null);
    setAdmin(null);
    setAuthToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function updateAdmin(updated: Admin) {
    setAdmin(updated);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, admin: updated }));
    }
  }

  return (
    <AuthContext.Provider value={{ admin, token, loading, login, logout, updateAdmin }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
