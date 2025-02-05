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
export const loginUser = async (
  credentials: UserData
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/app/login/", credentials);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    return { user, access_token, refresh_token };
  } catch (error: any) {
    throw error.response?.data || "Login failed";
  }
};

// Logout User
export const logoutUser = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
};

// Verify Token Function
export const verifyToken = async (): Promise<VerifyTokenResponse> => {
  try {
    const response = await api.get("/verify-token/");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Token verification failed";
  }
};
