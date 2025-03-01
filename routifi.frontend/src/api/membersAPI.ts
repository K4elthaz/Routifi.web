import api from "@/utility/api";
import { checkAuth, refreshAccessToken } from "@/api/userAuthAPI";
import { MemberData, GetMemberTag } from "@/types/members";

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

export const GetTagToMember = async (
  orgId: string,
  memberId: string
): Promise<GetMemberTag> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.get(
      `/app/organizations/${orgId}/members/${memberId}/tags/`
    );
    console.log("Data:", response.data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? { message: "Failed to get tags to member" };
  }
};
