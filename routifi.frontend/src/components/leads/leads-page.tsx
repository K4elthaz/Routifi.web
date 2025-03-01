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
  DialogDescription,
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

  // ✅ Handle Lead Update (Only if not assigned)
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

  // ✅ Handle Lead Deletion (Only if not assigned)
  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLead(slug!, leadId);
      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));
    } catch (error) {
      console.error("Delete failed:", error);
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
            <table className="min-w-full">
              <thead>
                <tr className="">
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Phone</th>
                  <th className="px-4 py-2 border">Location</th>
                  <th className="px-4 py-2 border">Tags</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="text-center border">
                    <td className="px-4 py-2 border">{lead.name}</td>
                    <td className="px-4 py-2 border">{lead.email}</td>
                    <td className="px-4 py-2 border">{lead.phone || "N/A"}</td>
                    <td className="px-4 py-2 border">{lead.location || "N/A"}</td>
                    <td className="px-4 py-2 border">
                      {lead.tags ? lead.tags.join(", ") : "N/A"}
                    </td>
                    <td className="px-4 py-2 border space-x-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleUpdateLead(lead.id)}
                      >
                        Update
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
