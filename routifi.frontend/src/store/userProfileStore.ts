import { create } from "zustand";
import { getUserProfile } from "@/api/userProfileAPI";
import { UserProfile } from "@/types/account";

interface UserProfileStore {
  loading: boolean;
  error: null | string;
  userProfileData: UserProfile | null;
  getUserProfile: (supabase_uid: string) => Promise<void>;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  loading: false,
  error: null,
  userProfileData: null,

  getUserProfile: async (supabase_uid) => {
    set({ loading: true, error: null });

    try {
      const userProfileData = await getUserProfile(supabase_uid);
      set({ userProfileData, loading: false });
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },
}));
