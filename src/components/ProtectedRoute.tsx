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

  // TEMPORARILY DISABLED ROLE CHECK FOR TESTING
  // if (process.env.NODE_ENV !== "development" && allowedRoles && !allowedRoles.includes(user.globalRole)) {
  //   return <Navigate to="/landing" replace />;
  // }

  // Always allow access regardless of role (temporary for testing)
  return <>{children}</>;
} 