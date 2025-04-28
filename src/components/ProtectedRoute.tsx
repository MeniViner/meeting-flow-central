import { Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
} 