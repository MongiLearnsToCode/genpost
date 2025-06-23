"use client";

import { useState } from "react";
import { ProtectedPage } from "@/components/auth/protected-page";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@/hooks/use-auth";
import { Plus, Users, Settings, Mail, Crown, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

export default function TeamsPage() {
  return (
    <ProtectedPage>
      <TeamsContent />
    </ProtectedPage>
  );
}

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: { userId: Id<"users">; firstName?: string; lastName?: string; email?: string };
  currentRole: "admin" | "member";
  onUpdateRole: (newRole: "admin" | "member") => Promise<void>;
}

function ChangeRoleDialog({ open, onOpenChange, member, currentRole, onUpdateRole }: ChangeRoleDialogProps) {
  const [newRole, setNewRole] = useState<"admin" | "member">(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNewRole(currentRole);
  }, [currentRole, open]);

  const handleSubmit = async () => {
    setIsLoading(true);
    await onUpdateRole(newRole);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role for {member.firstName} {member.lastName}</DialogTitle>
          <DialogDescription>Select the new role for {member.email}.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="new-role">New Role</Label>
          <select
            id="new-role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as "admin" | "member")}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || newRole === currentRole}>
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberEmail?: string;
  onConfirmRemove: () => Promise<void>;
}

function RemoveMemberDialog({ open, onOpenChange, memberEmail, onConfirmRemove }: RemoveMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirmRemove();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {memberEmail || "this member"} from the team? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TeamsContent() {
  const { getUserDisplayName } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(
    null,
  );
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [inviteTeamOpen, setInviteTeamOpen] = useState(false);

  // Fetch user's teams
  const teams = useQuery(api.teams.getUserTeams);

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Teams</h2>
            <p className="text-gray-600 mt-2">
              Manage your teams and collaborate with others
            </p>
          </div>
          <CreateTeamDialog
            open={createTeamOpen}
            onOpenChange={setCreateTeamOpen}
          />
        </div>

        {/* Teams Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team) => (
            <TeamCard
              key={team._id}
              team={team}
              onSelect={setSelectedTeamId}
              onInvite={() => {
                if (team._id) {
                  setSelectedTeamId(team._id);
                  setInviteTeamOpen(true);
                }
              }}
            />
          ))}

          {teams?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No teams
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first team.
              </p>
              <div className="mt-6">
                <Button onClick={() => setCreateTeamOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Team Details and Management */}
        {selectedTeamId && (
          <div className="mt-8">
            <TeamManagement teamId={selectedTeamId} />
          </div>
        )}

        {/* Invite Team Member Dialog */}
        {selectedTeamId && (
          <InviteTeamDialog
            teamId={selectedTeamId}
            open={inviteTeamOpen}
            onOpenChange={setInviteTeamOpen}
          />
        )}
      </main>
    </div>
  );
}

interface TeamData {
  _id?: Id<"teams">;
  name?: string;
  description?: string;
  role: "owner" | "admin" | "member";
  billingPlan?: string;
  postsUsedThisMonth?: number;
  postLimitPerMonth?: number;
  joinedAt?: number;
  _creationTime?: number;
  createdAt?: number;
  updatedAt?: number;
  ownerId?: Id<"users">;
  billingPeriodStart?: number;
}

interface TeamCardProps {
  team: TeamData;
  onSelect: (teamId: Id<"teams"> | null) => void;
  onInvite: () => void;
}

function TeamCard({ team, onSelect, onInvite }: TeamCardProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {team.name || "Untitled Team"}
          </CardTitle>
          <div className="flex items-center space-x-1">
            {getRoleIcon(team.role)}
            <Badge className={`text-xs ${getRoleBadgeColor(team.role)}`}>
              {team.role}
            </Badge>
          </div>
        </div>
        {team.description && (
          <CardDescription>{team.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Plan:</span>
            <Badge variant="outline" className="capitalize">
              {team.billingPlan || "free"}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Posts this month:</span>
            <span className="font-medium">
              {team.postsUsedThisMonth || 0} / {team.postLimitPerMonth || 0}
            </span>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => team._id && onSelect(team._id)}
              className="flex-1"
            >
              <Settings className="mr-1 h-3 w-3" />
              Manage
            </Button>
            {(team.role === "owner" || team.role === "admin") && (
              <Button variant="outline" size="sm" onClick={onInvite}>
                <Mail className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateTeamDialog({ open, onOpenChange }: CreateTeamDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createTeam = useMutation(api.teams.createTeam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await createTeam({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      toast.success("Team created successfully!");
      setName("");
      setDescription("");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create team",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a team to collaborate with others on social media
              management.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Team"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your team..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface InviteTeamDialogProps {
  teamId: Id<"teams">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InviteTeamDialog({
  teamId,
  open,
  onOpenChange,
}: InviteTeamDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);

  const createInvitation = useMutation(api.invitations.createInvitation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const result = await createInvitation({
        teamId,
        email: email.trim(),
        role,
      });

      toast.success("Invitation sent successfully!");
      // In a real app, you'd copy the invite link or send an email
      console.log("Invite link:", result.inviteLink);

      setEmail("");
      setRole("member");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "member")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditTeamDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  teamDescription: string;
  onSubmit: (values: { name: string; description?: string }) => Promise<void>;
}

function EditTeamDetailsDialog({
  open,
  onOpenChange,
  teamName,
  teamDescription,
  onSubmit,
}: EditTeamDetailsDialogProps) {
  const [name, setName] = useState(teamName);
  const [description, setDescription] = useState(teamDescription);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName(teamName);
    setDescription(teamDescription);
  }, [teamName, teamDescription, open]); // Reset when dialog opens or props change

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    await onSubmit({ name: name.trim(), description: description.trim() || undefined });
    setIsLoading(false);
    // onOpenChange(false); // Parent will handle closing on success
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Team Details</DialogTitle>
            <DialogDescription>
              Update your team's name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-team-name">Team Name *</Label>
              <Input
                id="edit-team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Team"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-team-description">Description</Label>
              <Textarea
                id="edit-team-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your team..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


interface TeamManagementProps {
  teamId: Id<"teams">;
}

function TeamManagement({ teamId }: TeamManagementProps) {
  const team = useQuery(api.teams.getTeam, { teamId });
  const members = useQuery(api.teams.getTeamMembers, { teamId });
  const invitations = useQuery(api.invitations.getTeamInvitations, { teamId });
  const { user: authUser, redirectToDashboard } = useAuth(); // Get current auth user for ID comparison

  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false);
  // States for member management
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  // Delete Team Dialog
  const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);


  const updateTeamMutation = useMutation(api.teams.updateTeam);
  const updateTeamMemberRoleMutation = useMutation(api.teams.updateTeamMemberRole);
  const removeTeamMemberMutation = useMutation(api.teams.removeTeamMember);
  const cancelInvitationMutation = useMutation(api.invitations.cancelInvitation);
  const resendInvitationMutation = useMutation(api.invitations.resendInvitation);
  const deleteTeamMutation = useMutation(api.teams.deleteTeam);

  const handleUpdateTeam = async (values: { name: string; description?: string }) => {
    try {
      await updateTeamMutation({
        teamId,
        name: values.name,
        description: values.description,
      });
      toast.success("Team details updated successfully!");
      setIsEditTeamDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update team");
    }
  };

  if (!team) {
    return <div>Loading team details...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Details</CardTitle>
          {(team.userRole === "owner" || team.userRole === "admin") && (
            <Button variant="outline" size="sm" onClick={() => setIsEditTeamDialogOpen(true)}>
              <Settings className="mr-1 h-3 w-3" /> Edit Team
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="mt-1">{team.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Description
              </Label>
              <p className="mt-1">{team.description || "No description"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Billing Plan
              </Label>
              <Badge variant="outline" className="mt-1 capitalize">
                {team.billingPlan}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Usage</Label>
              <p className="mt-1">
                {team.postsUsedThisMonth} / {team.postLimitPerMonth} posts this
                month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditTeamDetailsDialog
        open={isEditTeamDialogOpen}
        onOpenChange={setIsEditTeamDialogOpen}
        teamName={team.name || ""}
        teamDescription={team.description || ""}
        onSubmit={handleUpdateTeam}
      />

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={`${member.firstName} ${member.lastName}`} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                    <div>
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                          {member.userId === team.ownerId && member.role === "owner" && " (Owner)"}
                          {member.userId === authUser?.id && " (You)"}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`capitalize ${
                          member.role === "owner"
                            ? "bg-yellow-100 text-yellow-800"
                            : member.role === "admin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role}
                      </Badge>
                      {/* Actions for members */}
                      {team.userRole === 'owner' && member.role !== 'owner' && member.userId !== authUser?.id && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => { setEditingMember(member); setShowChangeRoleDialog(true); }}>
                            Change Role
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => { setEditingMember(member); setShowRemoveMemberDialog(true); }}>
                            Remove
                          </Button>
                        </>
                      )}
                      {team.userRole === 'admin' && member.role === 'member' && member.userId !== authUser?.id && (
                         <Button variant="destructive" size="sm" onClick={() => { setEditingMember(member); setShowRemoveMemberDialog(true); }}>
                            Remove
                          </Button>
                      )}
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No team members found.</p>
          )}
        </CardContent>
      </Card>

        {/* Dialogs for member management */}
        {editingMember && showChangeRoleDialog && (
          <ChangeRoleDialog
            open={showChangeRoleDialog}
            onOpenChange={setShowChangeRoleDialog}
            member={editingMember}
            currentRole={editingMember.role}
            onUpdateRole={async (newRole) => {
              try {
                await updateTeamMemberRoleMutation({ teamId, userId: editingMember.userId, role: newRole });
                toast.success("Member role updated successfully!");
                setShowChangeRoleDialog(false);
                setEditingMember(null);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to update role");
              }
            }}
          />
        )}

        {editingMember && showRemoveMemberDialog && (
          <RemoveMemberDialog
            open={showRemoveMemberDialog}
            onOpenChange={setShowRemoveMemberDialog}
            memberEmail={editingMember.email}
            onConfirmRemove={async () => {
              try {
                await removeTeamMemberMutation({ teamId, userId: editingMember.userId });
                toast.success("Member removed successfully!");
                setShowRemoveMemberDialog(false);
                setEditingMember(null);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Failed to remove member");
              }
            }}
          />
        )}


      {invitations && invitations.filter(inv => inv.status === "pending").length > 0 && (team.userRole === "owner" || team.userRole === "admin") && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations
                .filter((inv) => inv.status === "pending")
                .map((invitation) => (
                  <div
                    key={invitation._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-gray-500">
                        Invited by {invitation.inviterName} • Role:{" "}
                        {invitation.role}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                        {(team.userRole === "owner" || team.userRole === "admin") && (
                            <>
                                <Button variant="outline" size="sm" onClick={async () => {
                                    try {
                                        await resendInvitationMutation({ invitationId: invitation._id as Id<"teamInvitations">});
                                        toast.success("Invitation resent!");
                                    } catch (error) {
                                        toast.error(error instanceof Error ? error.message : "Failed to resend invitation");
                                    }
                                }}>Resend</Button>
                                <Button variant="ghost" size="sm" onClick={async () => {
                                    try {
                                        await cancelInvitationMutation({ invitationId: invitation._id as Id<"teamInvitations">});
                                        toast.success("Invitation cancelled!");
                                    } catch (error) {
                                        toast.error(error instanceof Error ? error.message : "Failed to cancel invitation");
                                    }
                                }}>Cancel</Button>
                            </>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      {team.userRole === 'owner' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={() => setShowDeleteTeamDialog(true)}>
              Delete Team
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Permanently delete this team and all its data. This action cannot be undone.
            </p>
          </CardContent>
        </Card>
      )}

      {showDeleteTeamDialog && (
        <Dialog open={showDeleteTeamDialog} onOpenChange={setShowDeleteTeamDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Team: {team.name}?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to permanently delete this team? All associated data, including members, invitations, and (eventually) posts, will be removed. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteTeamDialog(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={async () => {
                        try {
                            await deleteTeamMutation({ teamId });
                            toast.success(`Team "${team.name}" deleted successfully.`);
                            setShowDeleteTeamDialog(false);
                            // Potentially redirect or update state to remove the team from UI
                            // For now, user will need to refresh or navigate away.
                            // A better UX would be to call a method passed from parent to deselect teamId
                            redirectToDashboard(); // Simple redirect for now
                        } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Failed to delete team");
                        }
                    }}>
                        Delete Team
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
