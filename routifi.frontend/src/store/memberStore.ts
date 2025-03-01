import { create } from "zustand";
import { MemberData } from "@/types/members";
import { SetTagToMember } from "@/api/membersAPI";

interface MemberStore {
  loading: boolean;
  error: null | string;
  memberData: MemberData | null;
  setTagsToMember: (
    orgId: string,
    memberId: string,
    tagIds: string[]
  ) => Promise<void>;
}

export const useMemberStore = create<MemberStore>((set) => ({
  loading: false,
  error: null,
  memberData: null,
  setTagsToMember: async (orgId, memberId, tagIds) => {
    set({ loading: true, error: null });
    try {
      const updatedMember = await SetTagToMember(orgId, memberId, tagIds);
      set({ memberData: updatedMember, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to set tags to member",
        loading: false,
      });
    }
  },
}));
