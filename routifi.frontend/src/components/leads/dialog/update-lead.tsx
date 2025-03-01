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
import { UserRoundPen } from "lucide-react";
import { useLeadStore } from "@/store/leadStore";
import { useToast } from "@/hooks/use-toast";

interface UpdateLeadDialogProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    tags: string[];
  };
}

export default function UpdateLead({ lead }: UpdateLeadDialogProps) {
  const { slug } = useParams<{ slug: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { modifyLead, fetchLeads } = useLeadStore();
  const { toast } = useToast();

  // State for form fields
  const [updatedName, setUpdatedName] = useState(lead.name);
  const [updatedEmail, setUpdatedEmail] = useState(lead.email);
  const [updatedPhone, setUpdatedPhone] = useState(lead.phone);
  const [updatedTags, setUpdatedTags] = useState<string[]>(lead.tags);

  useEffect(() => {
    setUpdatedName(lead.name);
    setUpdatedEmail(lead.email);
    setUpdatedPhone(lead.phone);
    setUpdatedTags(lead.tags);
  }, [lead]);

  const handleTagChange = (tag: string) => {
    setUpdatedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleUpdateLead = async () => {
    if (!slug) {
      toast({ title: "Error", description: "Slug is missing." });
      return;
    }

    const updatedLeadData = {
      name: updatedName,
      email: updatedEmail,
      phone: updatedPhone,
      tags: updatedTags,
    };

    try {
      await modifyLead(slug, lead.id, updatedLeadData);
      await fetchLeads(slug);
      setIsDialogOpen(false);
      toast({
        title: "Update Lead Details",
        description: "Lead updated successfully!",
      });
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <UserRoundPen className="mr-2 cursor-pointer" size={18} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Lead</DialogTitle>
          <DialogDescription>Update lead details.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={updatedEmail}
            onChange={(e) => setUpdatedEmail(e.target.value)}
          />
          <Label htmlFor="phone">Contact no</Label>
          <Input
            id="contact"
            value={updatedPhone}
            onChange={(e) => setUpdatedPhone(e.target.value)}
          />

          <Label>Tags</Label>
          <div className="flex flex-col">
            {lead.tags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id={tag}
                  checked={updatedTags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                />
                <Label htmlFor={tag} className="ml-2 mr-2 cursor-pointer">
                  {tag}
                </Label>
              </div>
            ))}
          </div>

          <Button onClick={handleUpdateLead}>Update Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
