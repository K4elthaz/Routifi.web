import { useEffect, useState } from "react";
import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useParams } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UpdateLead from "./dialog/update-lead";
import RemoveLeadDialog from "./dialog/remove-lead";
import LeadHistoryDialog from "./dialog/lead-history";
import { useLeadStore } from "@/store/leadStore";
import useLoadingStore from "@/store/loadingStore";
import { Lead } from "@/types/lead";

export default function Leads() {
  const { slug } = useParams();
  const { fetchLeads, leads } = useLeadStore();
  const { loading } = useLoadingStore();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchLeads(slug);
    }
  }, [slug, fetchLeads]);

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDialogOpen(true);
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Leads", link: `/org/${slug}/leads` }]} />

        <div className="flex items-start justify-between">
          <Heading
            title="Leads"
            description="Manage your Leads Organization."
          />
        </div>
        <Separator />

        {loading && <p>Loading leads...</p>}

        {!loading && (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Location
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-zinc-900 transition duration-200"
                    onClick={() => handleRowClick(lead)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{lead.name}</span>
                        <span className="text-sm text-gray-400 md:hidden">
                          {lead.email}
                        </span>
                        <span className="text-sm text-gray-400 md:hidden">
                          {lead.phone || "N/A"}
                        </span>
                        <span className="text-sm text-gray-400 md:hidden">
                          {lead.location || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lead.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lead.phone || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lead.location || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lead.tags.join(", ") || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <UpdateLead lead={lead} />
                            </TooltipTrigger>
                            <TooltipContent>Update</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <RemoveLeadDialog lead={lead} />
                            </TooltipTrigger>
                            <TooltipContent>Remove</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedLead && (
          <LeadHistoryDialog
            lead={selectedLead}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
          />
        )}
      </div>
    </PageContainer>
  );
}
