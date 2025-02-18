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
export const loginUser = async (credentials: UserData): Promise<LoginResponse> => {
  try {
    const response = await api.post("/app/login/", credentials, {
      withCredentials: true, // ✅ Ensures cookies are stored in the browser
    });

    return response.data.user;
  } catch (error: any) {
    throw error.response?.data || "Login failed";
  }
};


// Logout User
export const logoutUser = (): void => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

// Verify Token Function (To verify user and token)
export const verifyToken = async (): Promise<any> => {
  try {
    const response = await api.get("/verify-token/");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Token verification failed";
  }
};
