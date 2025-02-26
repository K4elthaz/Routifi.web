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
import { Trash, Loader2 } from "lucide-react";

interface DeleteTagDialogProps {
  tag: { id: string; name: string };
}

export default function DeleteTagDialog({ tag }: DeleteTagDialogProps) {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const { deleteTag } = useTagStore();
  const { loading, setLoading } = useLoadingStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagName, setTagName] = useState(tag.name);

  const handleDeleteTag = async () => {
    if (!slug) {
      toast({ title: "Error", description: "Slug is missing." });
      return;
    }

    setLoading(true);
    try {
      await deleteTag(slug, tag.id);
      setIsDialogOpen(false);
      toast({ title: "Tag deleted successfully" });
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
        <Trash className="mr-2" size={18} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Tag</DialogTitle>
          <DialogDescription>
            Delete the details of the tag here.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Label>Tag Name</Label>
          <Input
            type="text"
            placeholder="Enter the name of the tag"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            disabled
          />
          <Button onClick={handleDeleteTag}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
