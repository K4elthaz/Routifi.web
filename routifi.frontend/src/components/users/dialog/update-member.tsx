import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";

export default function UpdateMembersDialog({ member }) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Pencil className="mr-2" size={18} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Member</DialogTitle>
          <DialogDescription>Update the member details.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={member.name} disabled />
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={member.email} disabled />
          <Label htmlFor="tags">Tags</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tag1">Tag 1</SelectItem>
              <SelectItem value="tag2">Tag 2</SelectItem>
              <SelectItem value="tag3">Tag 3</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => toast({ title: "Member updated successfully" })}
          >
            Update Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
