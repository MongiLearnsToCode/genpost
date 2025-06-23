import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all social accounts connected by the current user
export const getSocialAccountsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not logged in, so no connected accounts
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      // User not found in our DB, so no connected accounts from their perspective
      return [];
    }

    // Find all social accounts where the 'connectedBy' field matches the current user's ID
    // This query assumes that social accounts might be connected by a user across different teams.
    const accounts = await ctx.db
      .query("socialAccounts")
      .filter((q) => q.eq(q.field("connectedBy"), user._id))
      .collect();

    return accounts;
  },
});

// A more specific query might be needed later if we want to count accounts per team, etc.
// For onboarding, just checking if *any* account exists for this user is likely sufficient.

// Helper query to quickly check if a user has any connected social accounts
export const hasConnectedSocialAccounts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return false;

    const firstAccount = await ctx.db
      .query("socialAccounts")
      .filter((q) => q.eq(q.field("connectedBy"), user._id))
      .first(); // Efficiently check for existence

    return !!firstAccount;
  }
});
