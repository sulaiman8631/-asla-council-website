import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../ui";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  return <>{children}</>;
}
