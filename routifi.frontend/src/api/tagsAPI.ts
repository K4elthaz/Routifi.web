import api from "@/utility/api";
import { checkAuth, refreshAccessToken } from "@/api/userAuthAPI";
import { Tag } from "@/types/tags";

const ensureAuth = async (): Promise<boolean> => {
  const user = await checkAuth();
  if (user) return true;

  console.warn("Access token expired, attempting refresh...");
  const newToken = await refreshAccessToken();
  return !!newToken;
};

export const createTag = async (
  slug: string,
  tagData: { name: string }
): Promise<Tag> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.post(`/app/${slug}/tags/`, tagData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? { message: "Failed to create tag" };
  }
};

export const getTags = async (slug: string): Promise<Tag[]> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.get(`/app/${slug}/tags/`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? { message: "Failed to fetch tags" };
  }
};

export const updateTag = async (
  slug: string,
  tagId: string,
  tagData: { name: string }
): Promise<Tag> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    const response = await api.put(`/app/${slug}/tags/${tagId}/`, tagData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data ?? { message: "Failed to update tag" };
  }
};

export const deleteTag = async (slug: string, tagId: string): Promise<void> => {
  if (!(await ensureAuth())) {
    window.location.href = "/sign-in";
    throw new Error("User not authenticated");
  }

  try {
    await api.delete(`/app/${slug}/tags/${tagId}/`);
  } catch (error: any) {
    throw error.response?.data ?? { message: "Failed to delete tag" };
  }
};
