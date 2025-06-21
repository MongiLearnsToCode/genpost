"use client";

import { useRequireAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedPageProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that protects pages and shows loading state
 * Automatically redirects to sign-in if user is not authenticated
 */
export function ProtectedPage({ children, fallback }: ProtectedPageProps) {
  const { isLoading, isAuthenticated } = useRequireAuth();

  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    // The useRequireAuth hook will handle the redirect
    return null;
  }

  return <>{children}</>;
}

/**
 * Loading component for auth states
 */
export function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Loading GenPost
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Please wait while we load your dashboard...
        </p>
      </div>
    </div>
  );
}
