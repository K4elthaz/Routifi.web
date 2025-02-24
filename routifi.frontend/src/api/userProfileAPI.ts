import api from "@/utility/api";
import { UserProfile } from "@/types/account";
import { checkAuth, refreshAccessToken, logoutUser } from "@/api/userAuthAPI"; // ✅ Import auth functions

// Helper function to ensure authentication before requests
const ensureAuthenticatedRequest = async () => {
  const user = await checkAuth();
  if (!user) {
    console.warn("Access token expired, refreshing...");
    const newToken = await refreshAccessToken();

    if (!newToken) {
      console.error("Token refresh failed. Logging out...");
      await logoutUser();
      throw new Error("Session expired. Please log in again.");
    }
  }
};

// ✅ Get User Profile with Authentication Check
export const getUserProfile = async (supabase_uid: string): Promise<UserProfile> => {
  await ensureAuthenticatedRequest(); // ✅ Ensure user is authenticated
  try {
    const response = await api.get(`/user/${supabase_uid}/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch user profile";
  }
};

// ✅ Update User Profile with Authentication Check
export const updateUserProfile = async (
  supabase_uid: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  await ensureAuthenticatedRequest(); // ✅ Ensure user is authenticated
  try {
    const response = await api.put(`/user/${supabase_uid}/`, profileData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to update profile";
  }
};

// ✅ Delete User with Authentication Check
export const deleteUser = async (supabase_uid: string): Promise<string> => {
  await ensureAuthenticatedRequest(); // ✅ Ensure user is authenticated
  try {
    await api.delete(`/user/${supabase_uid}/`);
    return "User deleted successfully";
  } catch (error: any) {
    throw error.response?.data || "Failed to delete user";
  }
};
