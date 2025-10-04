import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  // Simple check for an auth token in localStorage.
  // Adjust to your auth mechanism as needed.
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth.token') : null;
  if (!token) return <Navigate to="/auth/signin" replace />;
  return children;
}
