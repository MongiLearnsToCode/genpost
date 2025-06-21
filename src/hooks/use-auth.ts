'use client'

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Custom hook for client-side authentication state and actions
 */
export function useAuth() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser()
  const { signOut, isLoaded: authLoaded } = useClerkAuth()
  const router = useRouter()

  const isLoaded = userLoaded && authLoaded
  const isAuthenticated = isSignedIn && !!user

  /**
   * Sign out user and redirect to home page
   */
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [signOut, router])

  /**
   * Redirect to sign-in page with optional return URL
   */
  const redirectToSignIn = useCallback((returnUrl?: string) => {
    const url = returnUrl ? `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}` : '/sign-in'
    router.push(url)
  }, [router])

  /**
   * Redirect to dashboard
   */
  const redirectToDashboard = useCallback(() => {
    router.push('/dashboard')
  }, [router])

  /**
   * Get user display name
   */
  const getUserDisplayName = useCallback(() => {
    if (!user) return null
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user.firstName) {
      return user.firstName
    }
    return user.primaryEmailAddress?.emailAddress || 'Unknown User'
  }, [user])

  /**
   * Get user profile image URL
   */
  const getUserProfileImage = useCallback(() => {
    return user?.imageUrl || null
  }, [user])

  /**
   * Get user email
   */
  const getUserEmail = useCallback(() => {
    return user?.primaryEmailAddress?.emailAddress || null
  }, [user])

  return {
    // Auth state
    isLoaded,
    isAuthenticated,
    user,
    
    // User data helpers
    getUserDisplayName,
    getUserProfileImage,
    getUserEmail,
    
    // Actions
    signOut: handleSignOut,
    redirectToSignIn,
    redirectToDashboard,
  }
}

/**
 * Hook to require authentication - redirects if not authenticated
 */
export function useRequireAuth() {
  const { isLoaded, isAuthenticated, redirectToSignIn } = useAuth()

  if (isLoaded && !isAuthenticated) {
    redirectToSignIn(window.location.pathname)
    return { isLoading: true, isAuthenticated: false }
  }

  return { 
    isLoading: !isLoaded, 
    isAuthenticated: isLoaded && isAuthenticated 
  }
}
