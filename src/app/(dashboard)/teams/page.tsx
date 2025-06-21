'use client';

import { useState } from 'react';
import { ProtectedPage } from '@/components/auth/protected-page';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserButton } from '@clerk/nextjs';
import { useAuth } from '@/hooks/use-auth';
import { Plus, Users, Settings, Mail, Crown, Shield, User } from 'lucide-react';
import { toast } from 'sonner';
import { Id } from '../../../../convex/_generated/dataModel';

export default function TeamsPage() {
  return (
    <ProtectedPage>
      <TeamsContent />
    </ProtectedPage>
  );
}

function TeamsContent() {
  const { getUserDisplayName } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(null);
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
                setSelectedTeamId(team._id);
                setInviteTeamOpen(true);
              }}
            />
          ))}
          
          {teams?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
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

interface TeamCardProps {
  team: any;
  onSelect: (teamId: Id<"teams">) => void;
  onInvite: () => void;
}

function TeamCard({ team, onSelect, onInvite }: TeamCardProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{team.name}</CardTitle>
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
              {team.billingPlan}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Posts this month:</span>
            <span className="font-medium">
              {team.postsUsedThisMonth} / {team.postLimitPerMonth}
            </span>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelect(team._id)}
              className="flex-1"
            >
              <Settings className="mr-1 h-3 w-3" />
              Manage
            </Button>
            {(team.role === 'owner' || team.role === 'admin') && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onInvite}
              >
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      
      toast.success('Team created successfully!');
      setName('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create team');
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
              Create a team to collaborate with others on social media management.
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
              {isLoading ? 'Creating...' : 'Create Team'}
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

function InviteTeamDialog({ teamId, open, onOpenChange }: InviteTeamDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
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
      
      toast.success('Invitation sent successfully!');
      // In a real app, you'd copy the invite link or send an email
      console.log('Invite link:', result.inviteLink);
      
      setEmail('');
      setRole('member');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
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
                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !email.trim()}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
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
  const invitations = useQuery(api.teams.getTeamInvitations, { teamId });

  if (!team) {
    return <div>Loading team details...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="mt-1">{team.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="mt-1">{team.description || 'No description'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Billing Plan</Label>
              <Badge variant="outline" className="mt-1 capitalize">
                {team.billingPlan}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Usage</Label>
              <p className="mt-1">
                {team.postsUsedThisMonth} / {team.postLimitPerMonth} posts this month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <Badge className={`capitalize ${
                    member.role === 'owner' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : member.role === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No team members found.</p>
          )}
        </CardContent>
      </Card>

      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations
                .filter(inv => inv.status === 'pending')
                .map((invitation) => (
                <div key={invitation._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-gray-500">
                      Invited by {invitation.inviterName} • Role: {invitation.role}
                    </p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
