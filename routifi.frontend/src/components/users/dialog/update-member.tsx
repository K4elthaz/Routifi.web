import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { useTagStore } from "@/store/tagStore";
import { useOrganizationStore } from "@/store/organizationStore";

import { createPortal } from "react-dom";

interface UpdateMembersDialogProps {
  member: {
    name: string;
    email: string;
  };
}

export default function UpdateMembersDialog({
  member,
}: UpdateMembersDialogProps) {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { tags, getTags } = useTagStore();
  const { organizations, fetchOrganizations } = useOrganizationStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (slug) {
      getTags(slug);
    }
  }, [slug]);

  const organization = organizations.find((org) => org.slug === slug);
  const organizationId = organization?.id;

  const filteredTags = organizationId
    ? tags.filter((tag) => tag.organization === organizationId)
    : [];

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
            {createPortal(
              <SelectContent>
                {filteredTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>,
              document.body
            )}
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
