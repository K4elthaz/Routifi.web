/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utility/api";
import { OrgData, GetOrganizationData } from "@/types/organization";

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
export const getOrganizations = async (): Promise<GetOrganizationData[]> => {
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
): Promise<GetOrganizationData> => {
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
): Promise<{
  message: string;
  is_user: boolean;
  already_invited?: boolean;
}> => {
  try {
    const response = await api.post(
      `/app/${orgId}/invite/`,
      { email },
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw { message: "Failed to send invitation" };
  }
};

// ✅ Accept Organization Invitation
export const handleInviteResponse = async (
  inviteId: string,
  action: "accept" | "reject"
): Promise<{ message: string; slug?: string }> => {
  try {
    const response = await api.post(`/app/invite/accept/${inviteId}/`, {
      action,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to process invitation";
  }
};
