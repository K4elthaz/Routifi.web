import api from "@/utility/api";
import { checkAuth, refreshAccessToken } from "@/api/userAuthAPI";
import {
  OrgData,
  GetOrganizationData,
  AcceptInviteResponse,
} from "@/types/organization";

// ✅ Helper function to ensure authentication before making requests
const ensureAuth = async (): Promise<boolean> => {
  const user = await checkAuth();
  if (user) return true;

  console.warn("Access token expired, attempting refresh...");
  const newToken = await refreshAccessToken();
  return !!newToken; // ✅ If refresh worked, return true; else, false
};

// ✅ Create Organization (Authenticated)
export const createOrganization = async (
  orgData: OrgData
): Promise<OrgData> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in"; // ❌ Redirect if refresh fails
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.post("/app/organization/", orgData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to create organization";
  }
};

// ✅ Get Organizations for the Authenticated User
export const getOrganizations = async (): Promise<GetOrganizationData[]> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

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
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

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
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

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
export const acceptInviteToOrganization = async (
  inviteCode: string
): Promise<AcceptInviteResponse> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.post<AcceptInviteResponse>(
      "/app/accept-invite/",
      { invite_code: inviteCode },
      { withCredentials: true }
    );

    console.log("API Response:", response.data); // ✅ Debugging log

    if (!response.data || !response.data.organization) {
      throw new Error("Invalid response from server");
    }

    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Failed to accept invitation");
  }
};
