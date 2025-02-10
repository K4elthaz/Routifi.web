/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

interface AuthState {
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: any) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
}

const MAX_INACTIVITY_DAYS = 7;

const useAuthStore = create<AuthState>((set) => {
  const lastLogin = localStorage.getItem("last_login");
  const currentTime = new Date().getTime();

  if (
    lastLogin &&
    currentTime - Number(lastLogin) > MAX_INACTIVITY_DAYS * 24 * 60 * 60 * 1000
  ) {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    set({ user: null, accessToken: null, refreshToken: null });
  }

  return {
    user: localStorage.getItem("token") ? {} : null,
    accessToken: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refresh_token"),
    setUser: (user) => set({ user }),
    setTokens: (accessToken, refreshToken) => {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("last_login", new Date().getTime().toString());
      set({ accessToken, refreshToken });
    },
    clearAuth: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("last_login");
      set({ user: null, accessToken: null, refreshToken: null });
    },
  };
});

export default useAuthStore;
