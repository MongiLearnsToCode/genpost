import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/create(.*)',
  '/analytics(.*)',
  '/history(.*)',
  '/settings(.*)',
  '/api/posts(.*)',
  '/api/analytics(.*)',
  '/api/upload(.*)',
  '/api/social(.*)',
  '/api/billing(.*)',
])

// Define public routes that should redirect authenticated users
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // Webhooks should be accessible without auth
])

// Define auth routes
const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const url = req.nextUrl.clone()

  // Handle authenticated users accessing auth pages
  if (userId && isAuthRoute(req)) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Handle unauthenticated users accessing the home page
  if (!userId && url.pathname === '/') {
    // Allow access to home page for unauthenticated users
    return NextResponse.next()
  }

  // Handle protected routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      // Redirect to sign-in with return URL
      url.pathname = '/sign-in'
      url.searchParams.set('redirect_url', req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    
    // User is authenticated, allow access
    return NextResponse.next()
  }

  // For all other routes, proceed normally
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
