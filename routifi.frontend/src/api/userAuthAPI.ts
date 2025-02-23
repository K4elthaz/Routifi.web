/* eslint-disable @typescript-eslint/no-explicit-any */
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
// authUserAPI.ts
export const loginUser = async (credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const response = await api.post("/app/login/", credentials, {
      withCredentials: true,
    });

    // console.log("Full login response:", response.data);

    const { user, session } = response.data;

    if (!session || !session.access_token || !session.refresh_token) {
      console.error("Tokens missing in response:", response.data);
      throw new Error("Missing tokens in login response");
    }

    return { user, session };
  } catch (error: any) {
    throw error.response?.data || "Login failed";
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/app/logout/");
    console.log("User logged out successfully");
  } catch (error: any) {
    console.error("Logout failed:", error.response?.data || error.message);
  }
};

// // Logout User
// export const logoutUser = (): void => {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
// };

// Verify Token Function (To verify user and token)
export const verifyToken = async (): Promise<any> => {
  try {
    const response = await api.get("/verify-token/");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Token verification failed";
  }
};
