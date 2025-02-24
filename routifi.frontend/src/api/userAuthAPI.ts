import api from "@/utility/api";
import { UserData, LoginResponse } from "@/types/auth";

// Register User
export const registerUser = async (userData: UserData): Promise<any> => {
  try {
    const response = await api.post("/app/user/", userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Registration failed";
  }
};

// Login User
export const loginUser = async (credentials: UserData): Promise<LoginResponse> => {
  try {
    const response = await api.post("/app/login/", credentials, { withCredentials: true });

    if (!response.data?.user) {
      throw new Error("Invalid API response: Missing user data");
    }

    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Login failed";
  }
};

// Check Authentication
export const checkAuth = async (): Promise<any> => {
  try {
    const response = await api.get("/app/verify-token/", { withCredentials: true });
    return response.data.user; // ✅ Return user data if valid
  } catch (error) {
    console.error("User not authenticated", error);
    return null; // ❌ Return null if user is not authenticated
  }
};

// Logout User
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/app/logout/");
    console.log("User logged out successfully");
    window.location.href = "/sign-in"; // ✅ Redirect to login after logout
  } catch (error: any) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
};


export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await api.post("/app/token-refresh/", {}, { withCredentials: true });

    if (response.data.access_token) {
      console.log("Access token refreshed");
      return response.data.access_token; // ✅ Return new access token
    }
    return null;
  } catch (error) {
    console.error("Refresh token invalid or expired");
    return null; // ❌ Refresh token expired, force logout
  }
};