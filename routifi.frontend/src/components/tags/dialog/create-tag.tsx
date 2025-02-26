import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useTagStore } from "@/store/tagStore";
import useLoadingStore from "@/store/loadingStore";
import { Loader2 } from "lucide-react";

export default function CreateTagDialog() {
  const { slug } = useParams<{ slug: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { createTag } = useTagStore();
  const { loading, setLoading } = useLoadingStore();
  const [tagName, setTagName] = useState("");

  const handleCreateTag = async () => {
    if (!slug) {
      toast({
        title: "Error",
        description: "Organization slug is missing.",
      });
      return;
    }

    setLoading(true);
    try {
      await createTag(slug, { name: tagName });
      setIsDialogOpen(false);
      toast({
        title: "Tag created successfully",
      });
      setTagName("");
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
        <Button>Create Tag</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Tag</DialogTitle>
          <DialogDescription>
            Create a new tag for your organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Tag Name</Label>
            <Input
              id="tag-name"
              placeholder="Tag Name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsDialogOpen(false)}
            disabled={loading}
          >
            Close
          </Button>
          <Button onClick={handleCreateTag}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Create Tag"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
