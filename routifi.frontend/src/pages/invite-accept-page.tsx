import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { acceptInvite } from "@/api/organizationAPI";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AcceptInvite() {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token, isAuthenticated } = useAuthStore();
  const [message, setMessage] = useState("Processing invitation...");

  useEffect(() => {
    const handleInvite = async () => {
      console.log("Auth State:", { user, token, isAuthenticated });

      // ✅ 1. Check if user is authenticated
      if (!isAuthenticated || !user || !token) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to accept the invitation",
          variant: "destructive",
        });
        navigate(
          `/sign-in?returnUrl=${encodeURIComponent(
            `/invite/accept/${inviteId}`
          )}`
        );
        return;
      }

      // ✅ 2. Validate inviteId
      if (!inviteId) {
        toast({
          title: "Invalid Invitation",
          description: "The invite link appears to be invalid",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        setMessage("Accepting invitation...");
        const response = await acceptInvite(inviteId);

        toast({
          title: "Invitation Accepted",
          description:
            response.message || "You have successfully joined the organization",
        });

        setMessage("Redirecting to organization...");
        navigate(`/org/${response.organization.slug}`);
      } catch (error) {
        console.error("Accept invite error:", error);

        toast({
          title: "Invitation Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to accept invitation",
          variant: "destructive",
        });

        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    };

    handleInvite();
  }, [inviteId, navigate, toast, isAuthenticated, user]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Organization Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-center text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
