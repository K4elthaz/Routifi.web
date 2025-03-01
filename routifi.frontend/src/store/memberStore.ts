import { create } from "zustand";
import { MemberData } from "@/types/members";
import { SetTagToMember, GetTagToMember } from "@/api/membersAPI";

interface MemberStore {
  loading: boolean;
  error: null | string;
  memberData: MemberData | null;
  memberTags: Record<string, { tagId: string; tagName: string }[]>; // Store tags by member ID
  setTagsToMember: (
    orgId: string,
    memberId: string,
    tagIds: string[]
  ) => Promise<void>;
  getTagsToMember: (orgId: string, memberId: string) => Promise<void>;
  fetchAllTagsForMembers: (
    orgId: string,
    members: { id: string }[]
  ) => Promise<void>;
}

export const useMemberStore = create<MemberStore>((set) => ({
  loading: false,
  error: null,
  memberData: null,
  memberTags: {},

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

  getTagsToMember: async (orgId, memberId) => {
    set({ loading: true, error: null });
    try {
      const memberTags = await GetTagToMember(orgId, memberId);

      if (!Array.isArray(memberTags.tags)) {
        throw new Error("Invalid response format: expected an array");
      }

      const formattedTags = memberTags.tags.map((tag: [string, string]) => ({
        tagId: tag[0],
        tagName: tag[1],
      }));

      set((state) => ({
        memberTags: { ...state.memberTags, [memberId]: formattedTags },
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch member tags",
        loading: false,
      });
    }
  },

  fetchAllTagsForMembers: async (orgId, members) => {
    set({ loading: true, error: null });
    try {
      const tagsData = await Promise.all(
        members.map(async (member) => {
          const response = await GetTagToMember(orgId, member.id);
          return {
            memberId: member.id,
            tags: response.tags,
          };
        })
      );

      const formattedTagsObject = tagsData.reduce((acc, item) => {
        acc[item.memberId] = Array.isArray(item.tags)
          ? item.tags.map(([tagId, tagName]) => ({ tagId, tagName })) // Destructure tuple
          : [];

        return acc;
      }, {} as Record<string, { tagId: string; tagName: string }[]>);

      set({ memberTags: formattedTagsObject, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch member tags",
        loading: false,
      });
    }
  },
}));
