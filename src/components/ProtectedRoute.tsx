import { Navigate } from "react-router-dom";
import { UserRole, getDefaultDashboardPath, useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: UserRole[];
}) => {
  const { user, role, loading, roleLoading } = useAuth();
  if (loading || (user && roleLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && role === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={getDefaultDashboardPath(role)} replace />;
  }
  return children;
};
