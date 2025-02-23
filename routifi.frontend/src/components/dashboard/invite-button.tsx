import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useOrganizationStore } from "@/store/organizationStore";
import { useToast } from "@/hooks/use-toast";
import useLoadingStore from "@/store/loadingStore";

interface InviteButtonProps {
  organizationId: string;
}

export function InviteButton({ organizationId }: InviteButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { loading, setLoading } = useLoadingStore();
  const inviteUser = useOrganizationStore((state) => state.inviteUser);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await inviteUser(organizationId, email);

      if (response?.already_invited) {
        toast({
          title: "Already Invited",
          description: `${email} has already been invited.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Invitation Sent",
          description: `An invitation has been sent to ${email}.`,
        });
      }

      setEmail("");
      setIsDialogOpen(false);
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to send invitation";

      if (error?.already_invited) {
        toast({
          title: "Already Invited",
          description: `${email} has already been invited.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      console.error("Failed to send invitation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Invite new member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogDescription>
            Enter the email of the new member here.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Label>Email Address</Label>
          <div className="group flex items-center gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={loading || !email}>
            {loading ? "Sending..." : "Invite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
