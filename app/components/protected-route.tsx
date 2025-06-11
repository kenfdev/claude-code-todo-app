import React, { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "../hooks/use-session";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = "/login",
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSession();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated, redirect to home
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}