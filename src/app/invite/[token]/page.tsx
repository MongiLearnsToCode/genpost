'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Users, Clock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const token = params.token as string;
  
  // Fetch invitation details
  const invitation = useQuery(api.invitations.getInvitationByToken, 
    token ? { token } : "skip"
  );
  
  const acceptInvitation = useMutation(api.invitations.acceptInvitation);
  const declineInvitation = useMutation(api.invitations.declineInvitation);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // Store the current URL to redirect back after sign-in
      sessionStorage.setItem('postSignInRedirect', window.location.pathname);
      router.push('/sign-in');
    }
  }, [isSignedIn, isLoaded, router]);

  const handleAccept = async () => {
    if (!token) return;
    
    setIsProcessing(true);
    try {
      const teamId = await acceptInvitation({ token });
      toast.success('Successfully joined the team!');
      router.push(`/teams`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    
    setIsProcessing(true);
    try {
      await declineInvitation({ token });
      toast.success('Invitation declined');
      router.push('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

  // Handle loading state for invitation
  if (invitation === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle invalid or expired invitation
  if (invitation === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => router.push('/')}
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Team Information */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{invitation.teamName}</h3>
              {invitation.teamDescription && (
                <p className="text-gray-600 mt-1">{invitation.teamDescription}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 mx-auto text-gray-500 mb-1" />
                <p className="font-medium">Role</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {invitation.role}
                </Badge>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 mx-auto text-gray-500 mb-1" />
                <p className="font-medium">Invited by</p>
                <p className="text-gray-600 mt-1 text-xs">
                  {invitation.inviterName}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handleAccept}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept Invitation
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDecline}
              disabled={isProcessing}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </div>

          {/* Additional Information */}
          <div className="text-xs text-gray-500 text-center">
            By accepting this invitation, you'll be able to collaborate on social media management with this team.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
