import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate a random invitation token
function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Create team invitation
export const createInvitation = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
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

    // Check if user can invite to this team (owner or admin)
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", user._id)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Access denied: Owner or admin required");
    }

    // Check if user is already a member
    const invitedUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (invitedUser) {
      const existingMembership = await ctx.db
        .query("teamMemberships")
        .withIndex("by_team_and_user", (q) => 
          q.eq("teamId", args.teamId).eq("userId", invitedUser._id)
        )
        .first();

      if (existingMembership) {
        throw new Error("User is already a member of this team");
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await ctx.db
      .query("teamInvitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => 
        q.and(
          q.eq(q.field("teamId"), args.teamId),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingInvitation) {
      throw new Error("Invitation already pending for this email");
    }

    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days
    const token = generateInviteToken();

    const invitationId = await ctx.db.insert("teamInvitations", {
      teamId: args.teamId,
      invitedBy: user._id,
      email: args.email,
      role: args.role,
      status: "pending",
      token,
      expiresAt,
      createdAt: now,
    });

    // TODO: Send invitation email here
    // In a real implementation, you'd integrate with an email service
    
    return {
      invitationId,
      inviteLink: `${process.env.SITE_URL}/invite/${token}`,
    };
  },
});

// Get invitations for a team
export const getTeamInvitations = query({
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

    const invitations = await ctx.db
      .query("teamInvitations")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();

    // Get inviter details for each invitation
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.invitedBy);
        return {
          ...invitation,
          inviterName: inviter ? `${inviter.firstName} ${inviter.lastName}`.trim() : "Unknown",
          inviterEmail: inviter?.email,
        };
      })
    );

    return invitationsWithDetails;
  },
});

// Get invitation by token
export const getInvitationByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("teamInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return null;
    }

    // Check if invitation is expired (but don't update in query)
    if (invitation.expiresAt < Date.now() || invitation.status !== "pending") {
      return null;
    }

    // Get team and inviter details
    const team = await ctx.db.get(invitation.teamId);
    const inviter = await ctx.db.get(invitation.invitedBy);

    return {
      ...invitation,
      teamName: team?.name,
      teamDescription: team?.description,
      inviterName: inviter ? `${inviter.firstName} ${inviter.lastName}`.trim() : "Unknown",
      inviterEmail: inviter?.email,
    };
  },
});

// Accept invitation
export const acceptInvitation = mutation({
  args: { token: v.string() },
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

    const invitation = await ctx.db
      .query("teamInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    // Check if invitation email matches user email
    if (invitation.email !== user.email) {
      throw new Error("This invitation is not for your email address");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", invitation.teamId).eq("userId", user._id)
      )
      .first();

    if (existingMembership) {
      throw new Error("You are already a member of this team");
    }

    const now = Date.now();

    // Create team membership
    await ctx.db.insert("teamMemberships", {
      teamId: invitation.teamId,
      userId: user._id,
      role: invitation.role,
      joinedAt: now,
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      status: "accepted",
    });

    return invitation.teamId;
  },
});

// Decline invitation
export const declineInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("teamInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    await ctx.db.patch(invitation._id, {
      status: "declined",
    });

    return true;
  },
});

// Cancel invitation (by team admin/owner)
export const cancelInvitation = mutation({
  args: { invitationId: v.id("teamInvitations") },
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

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if user can cancel this invitation
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", invitation.teamId).eq("userId", user._id)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Access denied: Owner or admin required");
    }

    if (invitation.status !== "pending") {
      throw new Error("Can only cancel pending invitations");
    }

    await ctx.db.delete(invitation._id);
    return true;
  },
});

// Resend invitation (generates new token and extends expiry)
export const resendInvitation = mutation({
  args: { invitationId: v.id("teamInvitations") },
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

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if user can resend this invitation
    const membership = await ctx.db
      .query("teamMemberships")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", invitation.teamId).eq("userId", user._id)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("Access denied: Owner or admin required");
    }

    if (invitation.status !== "pending" && invitation.status !== "expired") {
      throw new Error("Can only resend pending or expired invitations");
    }

    const now = Date.now();
    const newToken = generateInviteToken();
    const newExpiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    await ctx.db.patch(invitation._id, {
      token: newToken,
      expiresAt: newExpiresAt,
      status: "pending",
    });

    // TODO: Send new invitation email here
    
    return {
      inviteLink: `${process.env.SITE_URL}/invite/${newToken}`,
    };
  },
});
