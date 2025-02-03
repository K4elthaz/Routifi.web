import api from "@/utility/api";

interface UserProfile {
  supabase_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
}

// Get User Profile
export const getUserProfile = async (supabase_uid: string): Promise<UserProfile> => {
  try {
    const response = await api.get(`/user/${supabase_uid}/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to fetch user profile";
  }
};

// Update User Profile
export const updateUserProfile = async (supabase_uid: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await api.put(`/user/${supabase_uid}/`, profileData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Failed to update profile";
  }
};

// Delete User
export const deleteUser = async (supabase_uid: string): Promise<string> => {
  try {
    await api.delete(`/user/${supabase_uid}/`);
    return "User deleted successfully";
  } catch (error: any) {
    throw error.response?.data || "Failed to delete user";
  }
};
