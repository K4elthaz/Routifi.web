import { create } from "zustand";
import api from "@/utility/api";

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setUser: (user: any) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  // ✅ Check if user is authenticated
  checkAuth: async () => {
    try {
      const response = await api.get("/app/profile/", {
        withCredentials: true, // ✅ Send cookies
      });

      set({
        user: response.data.user,
        isAuthenticated: true,
      });
    } catch (error: any) {
      console.error("Auth check failed:", error);

      // 🔄 Try refreshing the access token
      const refreshed = await useAuthStore.getState().refreshAccessToken();
      if (!refreshed) {
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  // 🔄 Refresh access token if expired
  refreshAccessToken: async () => {
    try {
      const response = await api.post(
        "/auth/refresh/",
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        console.log("Access token refreshed");
        return true;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
    }
    return false;
  },

  // ✅ Set user without storing tokens in localStorage
  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },

  // ❌ Secure logout (removes cookies on backend)
  clearAuth: async () => {
    try {
      await api.post("/auth/logout/", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }

    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
