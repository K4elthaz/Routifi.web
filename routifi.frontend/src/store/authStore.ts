/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface AuthState {
  user: any;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: any, token: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => {
  // ✅ Prevent JSON.parse() from breaking on undefined
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return {
    user,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!user, // ✅ Ensure valid check

    setUser: (user, token) => {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      set({ user, token, isAuthenticated: true });
    },

    clearAuth: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

export default useAuthStore;
