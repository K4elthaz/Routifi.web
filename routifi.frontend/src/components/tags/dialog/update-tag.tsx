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
import { useTagStore } from "@/store/tagStore";
import useLoadingStore from "@/store/loadingStore";
import { Pencil, Loader2 } from "lucide-react";

interface UpdateTagDialogProps {
  tag: { id: string; name: string };
}

export default function UpdateTagDialog({ tag }: UpdateTagDialogProps) {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { updateTag } = useTagStore();
  const { loading, setLoading } = useLoadingStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagName, setTagName] = useState(tag.name);

  const handleUpdateTag = async () => {
    if (!slug) {
      toast({ title: "Error", description: "Slug is missing." });
      return;
    }

    setLoading(true);
    try {
      await updateTag(slug, tag.id, { name: tagName });
      setIsDialogOpen(false);
      toast({ title: "Tag updated successfully" });
    } catch (error) {
      toast({
        title: "An error occurred",
        description: (error as any).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Pencil className="mr-2" size={18} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Tag</DialogTitle>
          <DialogDescription>Update the tag name.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label htmlFor="tag-name">Tag Name</Label>
          <Input
            id="tag-name"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
          />
          <Button onClick={handleUpdateTag}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
