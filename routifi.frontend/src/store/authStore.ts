import { create } from "zustand";
import { persist, PersistStorage } from "zustand/middleware";
import api from "@/utility/api";

interface AuthState {
  user: any;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setUser: (user: any) => void;
  clearAuth: () => void;
}

const sessionStoragePersist: PersistStorage<AuthState> = {
  getItem: (name) => {
    const data = sessionStorage.getItem(name);
    return data ? JSON.parse(data) : null; // 🔄 Parse JSON
  },
  setItem: (name, value) => {
    sessionStorage.setItem(name, JSON.stringify(value)); // 🔄 Stringify JSON
  },
  removeItem: (name) => {
    sessionStorage.removeItem(name);
  },
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      checkAuth: async () => {
        try {
          const response = await api.get("/app/profile/", {
            withCredentials: true,
          });

          set({
            user: response.data.user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error("Auth check failed:", error);

          const refreshed = await get().refreshAccessToken();
          if (!refreshed) {
            set({ user: null, isAuthenticated: false });
          }
        }
      },

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

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      clearAuth: async () => {
        try {
          await api.post("/auth/logout/", {}, { withCredentials: true });
        } catch (error) {
          console.error("Logout failed:", error);
        }

        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      storage: sessionStoragePersist, // ✅ Use sessionStorage
    }
  )
);

export default useAuthStore;
