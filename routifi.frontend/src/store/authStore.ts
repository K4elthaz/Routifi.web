import { create } from "zustand";
import api from "@/utility/api";

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  checkAuth: () => Promise<void>;
  setUser: (user: any, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,

  checkAuth: async () => {
    try {
      const response = await api.get("/app/profile/", {
        withCredentials: true, // ✅ Send cookies with request
      });

      set({
        user: response.data.user,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
      });
    }
  },

  setUser: (user, accessToken, refreshToken) => {
    set({
      user,
      isAuthenticated: true,
      accessToken,
      refreshToken,
    });

    // ✅ Store tokens in localStorage
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  },

  clearAuth: () => {
    set({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });

    // ✅ Remove tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
}));

export default useAuthStore;
