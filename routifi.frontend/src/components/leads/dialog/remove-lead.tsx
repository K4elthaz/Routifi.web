import { useState } from "react";
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
import { UserRoundX } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLeadStore } from "@/store/leadStore";

interface RemoveLeadDialogProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    tags: string[];
  };
}

export default function RemoveLeadDialog({ lead }: RemoveLeadDialogProps) {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { removeLead } = useLeadStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRemoveLead = async () => {
    if (!slug) {
      toast({ title: "Error", description: "Slug is missing." });
      return;
    }

    try {
      await removeLead(slug, lead.id);
      toast({ title: "Lead removed successfully." });
      setIsDialogOpen(false);
    } catch (error) {
      const errorMessage = (error as any).message || "Error removing lead.";
      toast({ title: errorMessage });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <UserRoundX className="mr-2" size={18} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Lead</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this lead?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={lead.name} disabled />
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={lead.email} disabled />
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={lead.phone} disabled />
          <Label htmlFor="tags">Tags</Label>
          <div className="flex flex-col">
            {lead.tags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id={tag}
                  value={tag}
                  checked={lead.tags.includes(tag)}
                  disabled
                />
                <Label htmlFor={tag}>{tag}</Label>
              </div>
            ))}
          </div>
          <Button onClick={handleRemoveLead}>Remove Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
