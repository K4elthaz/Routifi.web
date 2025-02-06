import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";

export function JoinOrgForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <SendIcon className="w-4 h-4 mr-2" />
          Join
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Join Organization
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enjoy the benefits of collaboration and access to exclusive
            resources.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Invite Code</label>
            <Input placeholder="example: 1269342045" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Join</Button>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
