import api from "@/utility/api";
import { checkAuth, refreshAccessToken } from "@/api/userAuthAPI";
import { MemberData } from "@/types/members";

const ensureAuth = async (): Promise<boolean> => {
  const user = await checkAuth();
  if (user) return true;

  console.warn("Access token expired, attempting refresh...");
  const newToken = await refreshAccessToken();
  return !!newToken;
};

export const SetTagToMember = async (
  orgId: string,
  memberId: string,
  tagIds: string[]
): Promise<MemberData> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.put(
      `/app/organizations/${orgId}/members/${memberId}/tags/`,
      { tag_ids: tagIds }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? { message: "Failed to set tags to member" };
  }
};
