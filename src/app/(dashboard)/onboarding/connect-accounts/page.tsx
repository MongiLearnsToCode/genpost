"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, Twitter, Facebook, CheckSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ProtectedPage } from "@/components/auth/protected-page";

export default function ConnectAccountsPage() {
  return (
    <ProtectedPage>
      <ConnectAccountsContent />
    </ProtectedPage>
  );
}

function ConnectAccountsContent() {
  const router = useRouter();
  const markOnboardingComplete = useMutation(api.users.markOnboardingComplete);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      await markOnboardingComplete();
      toast.success("Onboarding marked as complete!");
      router.push("/dashboard"); // Redirect to the main dashboard
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update onboarding status.");
      setIsLoading(false);
    }
    // No finally block to set isLoading to false, as page will redirect on success
  };

  const handleConnectPlatform = (platformName: string) => {
    // Placeholder for actual connection logic (Task 2.0)
    toast.info(`Connecting to ${platformName} - Coming Soon!`);
    // In the future, this would initiate OAuth flow for the platform
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Connect Your Social Accounts</CardTitle>
          <CardDescription className="text-center pt-2">
            To get the most out of GenPost, connect your social media accounts. You can always do this later from your settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            className="w-full justify-start text-lg py-6"
            onClick={() => handleConnectPlatform("Instagram")}
          >
            <Instagram className="mr-3 h-6 w-6 text-[#E1306C]" />
            Connect Instagram
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-lg py-6"
            onClick={() => handleConnectPlatform("Twitter")}
          >
            <Twitter className="mr-3 h-6 w-6 text-[#1DA1F2]" />
            Connect Twitter / X
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-lg py-6"
            onClick={() => handleConnectPlatform("Facebook")}
          >
            <Facebook className="mr-3 h-6 w-6 text-[#1877F2]" />
            Connect Facebook
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <Button
            onClick={handleCompleteOnboarding}
            disabled={isLoading}
            className="w-full text-lg py-6"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <CheckSquare className="mr-2 h-5 w-5" />
                Skip and Complete Onboarding
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500">
            You can connect accounts later from your settings page.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
