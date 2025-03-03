import api from "@/utility/api";
import { checkAuth, refreshAccessToken } from "@/api/userAuthAPI";

//  Helper function to ensure authentication before making requests
const ensureAuth = async (): Promise<boolean> => {
  const user = await checkAuth();
  if (user) return true;

  console.warn("Access token expired, attempting refresh...");
  const newToken = await refreshAccessToken();
  return !!newToken;
};

//  Fetch Leads by Organization Slug
export const getLeadsByOrgSlug = async (slug: string) => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.get(`/app/org/${slug}/leads/`);
    return response.data.leads;
  } catch (error: any) {
    throw (
      error.response?.data || "Failed to fetch leads | Owner access required"
    );
  }
};
// Update Lead (Only if NOT assigned)
export const updateLead = async (
  slug: string,
  leadId: string,
  leadData: any
) => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.put(
      `/app/org/leads/${slug}/${leadId}/`,
      leadData
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to update lead";
  }
};

//  Delete Lead (Only if NOT assigned)
export const deleteLead = async (slug: string, leadId: string) => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.delete(`/app/org/leads/${slug}/${leadId}/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to delete lead";
  }
};

export const getLeadHistory = async (leadId: string) => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.get(`/app/org/leads/${leadId}/lead-history/`);
    return response.data.history;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch lead history";
  }
};