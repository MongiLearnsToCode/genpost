"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary specifically for authentication-related errors
 */
export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Authentication error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <AuthErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface AuthErrorFallbackProps {
  error?: Error;
}

function AuthErrorFallback({ error }: AuthErrorFallbackProps) {
  const isAuthError =
    error?.message?.includes("authentication") ||
    error?.message?.includes("not authenticated") ||
    error?.message?.includes("Unauthorized");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isAuthError ? "Authentication Error" : "Something went wrong"}
        </h2>

        <p className="text-gray-600 mb-6">
          {isAuthError
            ? "There was a problem with your authentication. Please try signing in again."
            : "An unexpected error occurred. Please refresh the page or try again later."}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Refresh Page
          </button>

          {isAuthError && (
            <button
              onClick={() => (window.location.href = "/sign-in")}
              className="w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
            >
              Sign In Again
            </button>
          )}

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Go Home
          </button>
        </div>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
