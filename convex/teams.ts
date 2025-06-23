import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new team
export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if team name already exists for this user
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existingTeam) {
      throw new Error("Team name already exists");
    }

    const now = Date.now();

    // Create the team
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      ownerId: user._id,
      billingPlan: "free", // Start with free plan
      postsUsedThisMonth: 0,
      postLimitPerMonth: 10, // Free plan limit
      billingPeriodStart: now,
      createdAt: now,
      updatedAt: now,
    });

    // Add the creator as team owner
    await ctx.db.insert("teamMemberships", {
      teamId,
      userId: user._id,
      role: "owner",
      joinedAt: now,
    });

    return teamId;
  },
});

// Get teams for current user
export const getUserTeams = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      return [];
    }

    // Get all team memberships for this user
    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Get team details for each membership
    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        return {
          ...team,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return teams.filter(Boolean); // Filter out any null teams
  },
});

// Get team by ID (with role check)
export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is a member of this team
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .first();

    if (!membership) {
      throw new Error("Access denied: Not a team member");
    }

    const team = await ctx.db.get(args.teamId);
    return {
      ...team,
      userRole: membership.role,
    };
  },
});

// Get team members
export const getTeamMembers = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is a member of this team
    const userMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .first();

    if (!userMembership) {
      throw new Error("Access denied: Not a team member");
    }

    // Get all memberships for this team
    const memberships = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    // Get user details for each membership
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const memberUser = await ctx.db.get(membership.userId);
        return {
          userId: membership.userId,
          role: membership.role,
          joinedAt: membership.joinedAt,
          firstName: memberUser?.firstName,
          lastName: memberUser?.lastName,
          email: memberUser?.email,
          imageUrl: memberUser?.imageUrl,
        };
      })
    );

    return members.filter(Boolean);
  },
});

// Update team
export const updateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is owner or admin
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Access denied: Owner or admin required");
    }

    // If updating name, check for conflicts
    if (args.name !== undefined) {
      const existingTeam = await ctx.db
        .query("teams")
        .withIndex("by_name", (q) => q.eq("name", args.name!))
        .first();

      if (existingTeam && existingTeam._id !== args.teamId) {
        throw new Error("Team name already exists");
      }
    }

    await ctx.db.patch(args.teamId, {
      ...(args.name && { name: args.name }),
      ...(args.description !== undefined && { description: args.description }),
      updatedAt: Date.now(),
    });

    return args.teamId;
  },
});

// Remove team member
export const removeTeamMember = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check if current user is owner or admin
    const currentUserMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", currentUser._id)
      )
      .first();

    if (!currentUserMembership || (currentUserMembership.role !== "owner" && currentUserMembership.role !== "admin")) {
      throw new Error("Access denied: Owner or admin required");
    }

    // Get the membership to remove
    const membershipToRemove = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (!membershipToRemove) {
      throw new Error("User is not a member of this team");
    }

    // Prevent removing the owner
    if (membershipToRemove.role === "owner") {
      throw new Error("Cannot remove team owner");
    }

    // Prevent non-owners from removing admins
    if (membershipToRemove.role === "admin" && currentUserMembership.role !== "owner") {
      throw new Error("Only team owner can remove admins");
    }

    await ctx.db.delete(membershipToRemove._id);
    return true;
  },
});

// Delete team
export const deleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is owner of this team
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) =>
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Access denied: Only team owner can delete the team");
    }

    // 1. Delete all team memberships for this team
    const membershipsToDelete = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    for (const m of membershipsToDelete) {
      await ctx.db.delete(m._id);
    }

    // 2. Delete all team invitations for this team
    const invitationsToDelete = await ctx.db
      .query("teamInvitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    for (const i of invitationsToDelete) {
      await ctx.db.delete(i._id);
    }

    // 3. Delete all posts for this team (TODO: when posts table exists and is populated)
    // const postsToDelete = await ctx.db
    //   .query("posts")
    //   .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
    //   .collect();
    // for (const p of postsToDelete) {
    //   await ctx.db.delete(p._id);
    // }

    // 4. Delete all social accounts for this team (TODO: when socialAccounts exist)
    // const socialAccountsToDelete = await ctx.db
    //  .query("socialAccounts")
    //  .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
    //  .collect();
    // for (const sa of socialAccountsToDelete) {
    //    await ctx.db.delete(sa._id);
    // }

    // 5. Finally, delete the team itself
    await ctx.db.delete(args.teamId);

    return true;
  },
});

// Update team member role
export const updateTeamMemberRole = mutation({
  args: {
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check if current user is owner
    const currentUserMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", currentUser._id)
      )
      .first();

    if (!currentUserMembership || currentUserMembership.role !== "owner") {
      throw new Error("Access denied: Owner required");
    }

    // Get the membership to update
    const membershipToUpdate = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", args.userId)
      )
      .first();

    if (!membershipToUpdate) {
      throw new Error("User is not a member of this team");
    }

    // Prevent changing owner role
    if (membershipToUpdate.role === "owner") {
      throw new Error("Cannot change owner role");
    }

    await ctx.db.patch(membershipToUpdate._id, {
      role: args.role,
    });

    return true;
  },
});
