import { useEffect, useState } from "react";
import PageContainer from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getLeadsByOrgSlug, updateLead, deleteLead } from "@/api/leadsAPI";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Leads() {
  const { slug } = useParams(); // Get organization slug from URL
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null); // Store selected lead

  useEffect(() => {
    const fetchLeads = async () => {
      if (!slug) return; // ✅ Prevent API call if slug is undefined
      try {
        const data = await getLeadsByOrgSlug(slug);
        setLeads(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [slug]);

  // ✅ Handle Lead Deletion (Only if not assigned)
  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(slug!, leadId);
      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleUpdateLead = async (leadId: string) => {
    const updatedData = { status: "Updated Lead" }; // Example update
    try {
      const updatedLead = await updateLead(slug!, leadId, updatedData);
      setLeads((prevLeads) =>
        prevLeads.map((lead) => (lead.id === leadId ? updatedLead.lead : lead))
      );
    } catch (error) {
      console.error("Update failed:", error);
    }
  };


  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={[{ title: "Leads", link: "/dashboard/leads" }]} />

        <div className="flex items-start justify-between">
          <Heading title="Leads" description="Manage your Leads Organization." />
        </div>
        <Separator />

        {loading && <p>Loading leads...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <Dialog key={lead.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone || "N/A"}</TableCell>
                        <TableCell>{lead.location || "N/A"}</TableCell>
                        <TableCell>{lead.tags ? lead.tags.join(", ") : "N/A"}</TableCell>
                        <TableCell>
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateLead(lead.id);
                            }}
                          >
                            Update
                          </button>
                          <span className="mx-2"></span>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id);
                            }}
                          >
                            Delete
                          </button>
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    {selectedLead && selectedLead.id === lead.id && (
                      <DialogContent className="w-[80vw] max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Lead Details</DialogTitle>
                        </DialogHeader>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-bold">Name</TableCell>
                              <TableCell>{selectedLead.name}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-bold">Email</TableCell>
                              <TableCell>{selectedLead.email}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-bold">Phone</TableCell>
                              <TableCell>{selectedLead.phone || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-bold">Location</TableCell>
                              <TableCell>{selectedLead.location || "N/A"}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-bold">Tags</TableCell>
                              <TableCell>{selectedLead.tags ? selectedLead.tags.join(", ") : "N/A"}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </DialogContent>
                    )}
                  </Dialog>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
