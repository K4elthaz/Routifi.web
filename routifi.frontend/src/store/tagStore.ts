import { create } from "zustand";
import { Tag } from "@/types/tags";
import { createTag, deleteTag, getTags, updateTag } from "@/api/tagsAPI";

interface TagStore {
  loading: boolean;
  error: null | string;
  tags: Tag[];
  createTag: (slug: string, tagData: { name: string }) => Promise<void>;
  getTags: (slug: string) => Promise<void>;
  updateTag: (
    slug: string,
    tagId: string,
    tagData: { name: string }
  ) => Promise<void>;
  deleteTag: (slug: string, tagId: string) => Promise<void>;
}

export const useTagStore = create<TagStore>((set, get) => ({
  loading: false,
  error: null,
  tags: [],

  createTag: async (slug, tagData) => {
    set({ loading: true, error: null });
    try {
      await createTag(slug, tagData);
      await get().getTags(slug);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },

  getTags: async (slug) => {
    set({ loading: true, error: null });
    try {
      const tags = await getTags(slug);
      set({ tags, loading: false });
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },

  updateTag: async (slug, tagId, tagData) => {
    set({ loading: true, error: null });
    try {
      await updateTag(slug, tagId, tagData);
      await get().getTags(slug);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },

  deleteTag: async (slug, tagId) => {
    set({ loading: true, error: null });
    try {
      await deleteTag(slug, tagId);
      await get().getTags(slug);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },
}));
