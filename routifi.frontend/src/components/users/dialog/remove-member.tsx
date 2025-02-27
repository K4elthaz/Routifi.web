import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

interface RemoveMemberDialogProps {
  member: {
    name: string;
    email: string;
  };
}

export default function RemoveMemberDialog({
  member,
}: RemoveMemberDialogProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Trash className="mr-2" size={18} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this member?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={member.name} disabled />
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={member.email} disabled />
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              toast({ title: "Member removed successfully" });
            }}
          >
            Remove Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
