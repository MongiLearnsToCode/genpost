# Tasks: Social Media Management MVP

## Relevant Files

- `app/layout.tsx` - Root layout with Clerk authentication provider and global styles
- `app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Clerk sign-in page component
- `app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Clerk sign-up page component
- `app/(dashboard)/page.tsx` - Main dashboard with calendar interface
- `app/(dashboard)/create/page.tsx` - Post creation page with mode selection
- `app/(dashboard)/analytics/page.tsx` - Analytics dashboard component
- `app/(dashboard)/history/page.tsx` - Post history and management interface
- `src/app/(dashboard)/settings/page.tsx` - User profile and account settings page UI.
- `src/app/(dashboard)/settings/page.test.tsx` - Unit tests for the user profile and settings page.
- `components/ui/calendar.tsx` - Interactive calendar component using shadcn/ui
- `components/ui/post-editor.tsx` - Rich text editor for post creation
- `components/ui/platform-preview.tsx` - Preview components for each social platform
- `components/ui/media-uploader.tsx` - File upload component with drag-and-drop
- `components/ui/analytics-charts.tsx` - Chart components using Recharts
- `lib/auth/clerk.ts` - Clerk configuration and utilities
- `lib/integrations/instagram.ts` - Instagram API integration and OAuth handlers
- `lib/integrations/twitter.ts` - Twitter API integration and OAuth handlers
- `lib/integrations/facebook.ts` - Facebook API integration and OAuth handlers
- `lib/integrations/oauth-manager.ts` - Centralized OAuth token management
- `lib/scheduling/queue.ts` - Post scheduling queue using Convex tasks
- `lib/scheduling/retry-logic.ts` - Error handling and retry mechanisms
- `lib/ai/content-suggestions.ts` - AI-powered content generation utilities
- `lib/ai/timing-recommendations.ts` - AI optimal posting time calculations
- `lib/storage/r2-client.ts` - Cloudflare R2 storage client configuration
- `lib/storage/media-processor.ts` - Image processing and thumbnail generation
- `lib/billing/polar-client.ts` - Polar.sh integration for subscriptions
- `lib/billing/usage-tracker.ts` - Post limit tracking and enforcement
- `lib/analytics/data-processor.ts` - Analytics data aggregation and calculations
- `lib/utils/timezone.ts` - Timezone detection and conversion utilities
- `lib/utils/export.ts` - Data export functionality (CSV, Google Docs)
- `convex/schema.ts` - Database schema definitions with teams, teamMemberships, and teamInvitations tables
- `convex/users.ts` - User management Convex functions
- `convex/teams.ts` - Complete team CRUD operations, member management functions, and role-based access controls (added deleteTeam, reviewed RBAC).
- `convex/invitations.ts` - Team invitation system with token-based invites, acceptance/decline (reviewed RBAC).
- `convex/posts.ts` - Post CRUD operations Convex functions (placeholder, file does not exist yet)
- `convex/social-accounts.ts` - Social platform account management
- `convex/analytics.ts` - Analytics data storage and retrieval
- `convex/scheduling.ts` - Scheduling queue management functions
- `src/app/(dashboard)/teams/page.tsx` - Teams management interface with creation, invitation, and role-based UI controls for team/member/invitation management.
- `src/app/invite/[token]/page.tsx` - Invitation acceptance page with auth flow
- `src/components/auth/protected-page.tsx` - Protected page wrapper component
- `src/components/auth/auth-error-boundary.tsx` - Authentication error boundary component
- `src/hooks/use-auth.ts` - Custom authentication hooks and utilities
- `middleware.ts` - Next.js middleware for auth and route protection
- `app/api/webhooks/social/route.ts` - Webhook endpoints for social platform callbacks
- `app/api/webhooks/billing/route.ts` - Webhook endpoints for Polar.sh billing events
- `app/api/export/route.ts` - Data export API endpoints
- `package.json` - Project dependencies and scripts (modified for testing).
- `babel.config.js` - Babel configuration for Jest integration.
- `jest.config.js` - Jest test runner configuration.
- `jest.setup.js` - Jest setup file (e.g., for jest-dom).
- `__mocks__/fileMock.js` - Mock for static file imports in Jest.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- Integration tests for social platform APIs should use dedicated test accounts to avoid affecting real user data.
- Environment variables for API keys and secrets should be configured in `.env.local` for development and proper deployment settings for production.

## Tasks

- [ ] 1.0 Authentication & User Management Setup
  - [x] 1.1 Configure Clerk authentication with Next.js App Router
  - [x] 1.2 Create sign-in and sign-up pages using Clerk components
  - [x] 1.3 Set up middleware for route protection and auth state management
  - [x] 1.4 Implement team creation and invitation functionality
  - [x] 1.5 Create user profile management interface
  - [x] 1.6 Set up Convex schema for users and team relationships
  - [x] 1.7 Implement role-based access for basic team sharing
  - [ ] 1.8 Add user onboarding flow with guided social account connection

- [ ] 2.0 Social Platform Integration & OAuth Implementation
  - [ ] 2.1 Set up Instagram Basic Display API and Instagram Graph API integration
  - [ ] 2.2 Implement Twitter API v2 integration with OAuth 2.0
  - [ ] 2.3 Configure Facebook Pages API and Instagram Business integration
  - [ ] 2.4 Create centralized OAuth token management system with automatic refresh
  - [ ] 2.5 Implement webhook handlers for post status updates from platforms
  - [ ] 2.6 Add rate limiting and retry logic with exponential backoff
  - [ ] 2.7 Create social account connection/disconnection UI
  - [ ] 2.8 Implement platform-specific posting logic (text + single image + carousels)
  - [ ] 2.9 Add comprehensive error handling for API failures and token expiration
  - [ ] 2.10 Create integration test suite with live API testing using test accounts

- [ ] 3.0 Core UI Components & Calendar Interface
  - [ ] 3.1 Set up Tailwind CSS and shadcn/ui component library
  - [ ] 3.2 Create responsive layout with navigation and dashboard structure
  - [ ] 3.3 Build interactive calendar component with post visualization
  - [ ] 3.4 Implement drag-and-drop functionality for post rescheduling
  - [ ] 3.5 Create post status indicators (scheduled, published, failed)
  - [ ] 3.6 Add calendar navigation and view controls (month/week views)
  - [ ] 3.7 Implement timezone detection and display in user's local time
  - [ ] 3.8 Create mobile-responsive calendar interface
  - [ ] 3.9 Add accessibility features (keyboard navigation, screen reader support)

- [ ] 4.0 Post Creation System (Standard & Quick Modes)
  - [ ] 4.1 Create post creation mode selection interface
  - [ ] 4.2 Build Standard Mode editor with rich text capabilities
  - [ ] 4.3 Implement platform-specific customization (captions, hashtags per platform)
  - [ ] 4.4 Create Quick Mode stripped-down editor for fast posting
  - [ ] 4.5 Build media uploader with drag-and-drop and file validation
  - [ ] 4.6 Implement platform preview components (Instagram, Twitter, Facebook)
  - [ ] 4.7 Add AI content generation (captions, hashtags, timing suggestions)
  - [ ] 4.8 Create scheduling interface with optimal time recommendations
  - [ ] 4.9 Implement draft saving and loading functionality
  - [ ] 4.10 Add post duplication from history feature
  - [ ] 4.11 Create instant posting capability for immediate publication

- [ ] 5.0 Scheduling Engine & Background Processing
  - [ ] 5.1 Set up Convex task queue for scheduled post processing
  - [ ] 5.2 Implement job scheduling with precise timing execution
  - [ ] 5.3 Create retry logic with exponential backoff for failed posts
  - [ ] 5.4 Add post status tracking and webhook integration
  - [ ] 5.5 Implement notification system for scheduling failures
  - [ ] 5.6 Create developer alert system for critical platform issues
  - [ ] 5.7 Add post cancellation functionality before publication
  - [ ] 5.8 Implement timezone conversion for accurate scheduling
  - [ ] 5.9 Create monitoring and logging for scheduling system reliability
  - [ ] 5.10 Add queue health checks and performance monitoring

- [ ] 6.0 Analytics Dashboard & Data Visualization
  - [ ] 6.1 Set up data collection from social platform APIs
  - [ ] 6.2 Create analytics data storage schema in Convex
  - [ ] 6.3 Build high-level metrics dashboard with key performance indicators
  - [ ] 6.4 Implement individual post performance tracking
  - [ ] 6.5 Create engagement rate calculations and trending analysis
  - [ ] 6.6 Add date range filtering and platform-specific views
  - [ ] 6.7 Implement AI-powered content performance insights
  - [ ] 6.8 Create best-performing content identification system
  - [ ] 6.9 Build data export functionality (CSV format)
  - [ ] 6.10 Add post history interface with search and filtering
  - [ ] 6.11 Implement Google Docs export for post history

- [ ] 7.0 Media Management & File Storage
  - [ ] 7.1 Configure Cloudflare R2 storage with CDN integration
  - [ ] 7.2 Implement secure file upload with authentication
  - [ ] 7.3 Add file type validation and size limits (JPEG, PNG, GIF, 10MB max)
  - [ ] 7.4 Create automatic image compression and optimization
  - [ ] 7.5 Implement thumbnail generation for uploaded media
  - [ ] 7.6 Build media library interface for browsing and reusing assets
  - [ ] 7.7 Add media deletion and cleanup functionality
  - [ ] 7.8 Implement secure URL generation with expiration
  - [ ] 7.9 Create media organization and tagging system
  - [ ] 7.10 Add bulk media operations and management tools

- [ ] 8.0 Billing Integration & Plan Management
  - [ ] 8.1 Set up Polar.sh integration for subscription management
  - [ ] 8.2 Configure pricing tiers ($9/50 posts, $19/200 posts, $39/unlimited)
  - [ ] 8.3 Implement team billing with scaled post limits
  - [ ] 8.4 Create usage tracking and post limit enforcement
  - [ ] 8.5 Build billing dashboard with current usage and plan details
  - [ ] 8.6 Add upgrade/downgrade flows with prorated billing
  - [ ] 8.7 Implement webhook handlers for billing events
  - [ ] 8.8 Create notification system for usage limits and plan expiration
  - [ ] 8.9 Add team member usage breakdown for admins
  - [ ] 8.10 Implement billing history and invoice management