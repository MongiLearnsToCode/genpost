"use client";

import { ProtectedPage } from "@/components/auth/protected-page";
import { useAuth } from "@/hooks/use-auth";
import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <DashboardContent />
    </ProtectedPage>
  );
}

function DashboardContent() {
  const { getUserDisplayName, getUserEmail } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-900">GenPost</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {getUserDisplayName()}
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">
                Welcome to GenPost!
              </h3>
              <p className="text-blue-800 mt-2">
                Your social media management dashboard is being built. Soon
                you&apos;ll be able to:
              </p>
              <ul className="list-disc list-inside mt-2 text-blue-800 space-y-1">
                <li>
                  Create and schedule posts across Instagram, Twitter, and
                  Facebook
                </li>
                <li>View your content calendar</li>
                <li>Analyze post performance</li>
                <li>Manage your team and billing</li>
              </ul>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">Quick Stats</h4>
                <p className="text-gray-600 mt-2">Posts this month: 0</p>
                <p className="text-gray-600">Connected accounts: 0</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                <p className="text-gray-600 mt-2">No recent activity</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">Account Info</h4>
                <p className="text-gray-600 mt-2">Email: {getUserEmail()}</p>
                <p className="text-gray-600">Plan: Free Trial</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
