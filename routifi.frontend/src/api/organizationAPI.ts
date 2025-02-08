/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utility/api";

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
}

// ✅ Create Organization (Authenticated)
export const createOrganization = async (orgData: {
  name: string;
  description?: string;
  // logo?: File | null;
}): Promise<Organization> => {
  try {
    const formData = new FormData();
    formData.append("name", orgData.name);
    if (orgData.description) {
      formData.append("description", orgData.description);
    }
    // if (orgData.logo) {
    //   formData.append("logo", orgData.logo);
    // }

    const response = await api.post("/app/organization/", orgData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to create organization";
  }
};

// ✅ Get Organizations for the Authenticated User
export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    const response = await api.get(`/organization/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch organizations";
  }
};

// ✅ Get Organization by Slug (Requires Authentication)
export const getOrganizationBySlug = async (
  slug: string
): Promise<Organization> => {
  try {
    const response = await api.get(`/organization/${slug}/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch organization";
  }
};

// ✅ Invite User to Organization
export const inviteUserToOrganization = async (
  orgId: string,
  email: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/organization/${orgId}/invite/`, {
      email,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to send invitation";
  }
};

// ✅ Accept Organization Invitation
export const acceptInvite = async (
  inviteId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/invite/accept/${inviteId}/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to accept invitation";
  }
};
