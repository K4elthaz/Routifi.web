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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserRoundPen } from "lucide-react";
import { useTagStore } from "@/store/tagStore";
import { useOrganizationStore } from "@/store/organizationStore";
import { useMemberStore } from "@/store/memberStore";
import { Checkbox } from "@/components/ui/checkbox";

interface UpdateMembersDialogProps {
  member: {
    name: string;
    email: string;
    id: string;
  };
}

export default function UpdateMembersDialog({
  member,
}: UpdateMembersDialogProps) {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { tags, getTags } = useTagStore();
  const { organizations, fetchOrganizations } = useOrganizationStore();
  const { setTagsToMember } = useMemberStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  const handleUpdateMember = async () => {
    if (!organizationId || !member.id) {
      toast({
        title: "Error",
        description: "Organization or member ID is missing.",
      });
      return;
    }

    try {
      await setTagsToMember(organizationId, member.id, selectedTags);
      toast({ title: "Member updated successfully" });
      setIsDialogOpen(false);
      setSelectedTags([]);
    } catch (error: any) {
      toast({ title: "Error updating member", description: error.message });
    }
  };

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <UserRoundPen className="mr-2" size={18} />
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
          <Label>Tags</Label>
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleTagChange(tag.id)}
                />
                <Label htmlFor={tag.id}>{tag.name}</Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No tags available</p>
          )}
          <Button onClick={handleUpdateMember}>Update Member</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
