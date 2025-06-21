import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Server-side function to get authenticated user ID
 * Throws error if user is not authenticated
 */
export async function getAuthUserId() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('User not authenticated')
  }
  return userId
}

/**
 * Server-side function to get authenticated user ID or null
 * Returns null if user is not authenticated (no error thrown)
 */
export async function getAuthUserIdOptional() {
  const { userId } = await auth()
  return userId
}

/**
 * Server-side function to get current user data
 * Throws error if user is not authenticated
 */
export async function getAuthUser() {
  const user = await currentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  return user
}

/**
 * Server-side function to get current user data or null
 * Returns null if user is not authenticated (no error thrown)
 */
export async function getAuthUserOptional() {
  const user = await currentUser()
  return user
}

/**
 * Server-side function to protect page routes
 * Redirects to sign-in if user is not authenticated
 */
export async function protectRoute() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  return userId
}

/**
 * Server-side function to redirect authenticated users
 * Useful for auth pages that should redirect logged-in users
 */
export async function redirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const { userId } = await auth()
  if (userId) {
    redirect(redirectTo)
  }
}

/**
 * Type definitions for user roles and permissions
 */
export type UserRole = 'owner' | 'admin' | 'member'

export interface TeamMember {
  userId: string
  role: UserRole
  joinedAt: Date
  email: string
  name: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  profileImage?: string
  timezone?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Helper function to check if user has permission for team actions
 */
export function hasTeamPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    member: 0,
    admin: 1,
    owner: 2,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Helper function to format user display name
 */
export function formatUserDisplayName(user: { firstName?: string | null, lastName?: string | null, email?: string }): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user.firstName) {
    return user.firstName
  }
  return user.email || 'Unknown User'
}
