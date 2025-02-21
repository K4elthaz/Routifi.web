/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utility/api";
import { OrgData, GetOrganziationData } from "@/types/organization";

// ✅ Create Organization (Authenticated)
export const createOrganization = async (
  orgData: OrgData
): Promise<OrgData> => {
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
export const getOrganizations = async (): Promise<GetOrganziationData[]> => {
  try {
    const response = await api.get(`/app/organization/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch organizations";
  }
};

// ✅ Get Organization by Slug (Requires Authentication)
export const getOrganizationBySlug = async (
  slug: string
): Promise<GetOrganziationData> => {
  try {
    const response = await api.get(`/app/organization/${slug}/`);
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
    const response = await api.post(`/app/${orgId}/invite/`, {
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
): Promise<{ message: string; organization: GetOrganziationData }> => {
  try {
    const response = await api.post(
      `/app/invite/accept/${inviteId}/`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to accept invitation";
  }
};
