// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  checkWorkspaceRole?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  checkWorkspaceRole = false 
}: ProtectedRouteProps) {
  const { user } = useApp();
  const { currentWorkspace } = useWorkspace();
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  // In development mode, bypass role checks
  if (isDevelopment) {
    return <>{children}</>;
  }

  // If no roles are specified, allow access
  if (!allowedRoles) {
    return <>{children}</>;
  }

  // Check workspace-specific role if required
  if (checkWorkspaceRole && currentWorkspace) {
    const workspaceRole = user.workspaceAccess?.find(
      access => access.workspaceId === currentWorkspace.id
    )?.role;
    
    if (!workspaceRole || !allowedRoles.includes(workspaceRole)) {
      return <Navigate to="/landing" replace />;
    }
  } else {
    // Check global role
    if (!allowedRoles.includes(user.globalRole)) {
      return <Navigate to="/landing" replace />;
    }
  }

  return <>{children}</>;
} 