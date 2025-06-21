import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  teams: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.id("users"),
    billingPlan: v.union(
      v.literal("free"),
      v.literal("basic"),
      v.literal("pro"),
      v.literal("unlimited")
    ),
    postsUsedThisMonth: v.number(),
    postLimitPerMonth: v.number(),
    billingPeriodStart: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_name", ["name"]),

  teamMemberships: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    joinedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_and_user", ["teamId", "userId"]),

  teamInvitations: defineTable({
    teamId: v.id("teams"),
    invitedBy: v.id("users"),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("member")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),

  // Future tables for posts, social accounts, etc.
  posts: defineTable({
    teamId: v.id("teams"),
    authorId: v.id("users"),
    content: v.string(),
    platforms: v.array(v.union(
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("facebook")
    )),
    scheduledFor: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed")
    ),
    mediaUrls: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .index("by_scheduled_time", ["scheduledFor"]),

  socialAccounts: defineTable({
    teamId: v.id("teams"),
    platform: v.union(
      v.literal("instagram"),
      v.literal("twitter"),
      v.literal("facebook")
    ),
    platformUserId: v.string(),
    username: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    isActive: v.boolean(),
    connectedBy: v.id("users"),
    connectedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_platform", ["platform"])
    .index("by_team_and_platform", ["teamId", "platform"]),
});
