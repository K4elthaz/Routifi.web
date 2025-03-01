import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LeadHistoryProps {
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    tags: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadHistoryDialog({
  lead,
  isOpen,
  onClose,
}: LeadHistoryProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl w-full">
        <DialogHeader>
          <DialogTitle>Lead History</DialogTitle>
          <DialogDescription>
            Lead queue history for {lead.name}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
