/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/utility/api";
import { UserData, LoginResponse, VerifyTokenResponse } from "@/types/auth";

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
    const response = await api.post("/app/login/", credentials, {
      withCredentials: true,
    });

    return { user: response.data.user };
  } catch (error: any) {
    throw error.response?.data || "Login failed";
  }
};

// Logout User
export const logoutUser = async (): Promise<void> => {
  try {
    await api.post("/app/logout/", {}, { withCredentials: true });
  } catch (error: any) {
    throw error.response?.data || "Logout failed";
  }
};


// Verify Token Function
export const verifyToken = async (): Promise<VerifyTokenResponse> => {
  try {
    const response = await api.get("/app/verify-token/", { withCredentials: true });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Token verification failed";
  }
};

