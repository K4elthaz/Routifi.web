import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { SendIcon, Loader2 } from "lucide-react";
import { useOrganizationStore } from "@/store/organizationStore";
import { useToast } from "@/hooks/use-toast";

export function JoinOrg() {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const { toast } = useToast();
  const { acceptInvite, loading } = useOrganizationStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (inviteCode.length !== 8) {
      toast({
        title: "Invalid code",
        description: "Please enter an 8-digit code",
      });
      return;
    }

    try {
      const response = await acceptInvite(inviteCode);

      console.log("Accept Invite Response:", response); // ✅ Debugging log

      if (response) {
        setRedirecting(true);
        setInviteCode("");

        toast({
          title: "Organization joined",
          description: "You have successfully joined the organization",
        });

        setTimeout(() => {
          navigate(`/org/${response}/`);
          setIsOpen(false);
          setRedirecting(false);
        }, 1500);
      } else {
        throw new Error("No organization received");
      }
    } catch (error: any) {
      toast({
        title: "Failed to join",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <SendIcon className="w-4 h-4 mr-2" />
          Join
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join an Organization</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Enter the 8-digit code provided in your invitation email.
        </DialogDescription>
        <div className="justify-center items-center flex gap-4">
          <InputOTP
            maxLength={8}
            value={inviteCode}
            onChange={(value) => setInviteCode(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={6} />
              <InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <DialogFooter>
          <Button
            form="joinDialogForm"
            type="submit"
            onClick={handleSubmit}
            disabled={loading || redirecting}
          >
            {redirecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Join"
            )}
          </Button>

          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default JoinOrg;
