import api from '@/utility/api';  // Assuming you have an Axios instance set up

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_by: string;
}

interface InviteResponse {
  message: string;
}

// Create Organization
export const createOrganization = async (orgData: { name: string }): Promise<Organization> => {
  try {
    const response = await api.post("/organization/", orgData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to create organization";
  }
};

// Get Organization by Slug
export const getOrganizationBySlug = async (slug: string): Promise<Organization> => {
  try {
    const response = await api.get(`/organization/${slug}/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch organization";
  }
};

// Invite User to Organization
export const inviteUserToOrganization = async (
  orgId: string,
  email: string
): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/organization/${orgId}/invite/`, { email });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to send invitation";
  }
};

// Accept Organization Invitation
export const acceptInvite = async (inviteId: string): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/invite/accept/${inviteId}/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to accept invitation";
  }
};
