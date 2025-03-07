/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { GetOrganizationData, OrgData } from "../types/organization";
import {
  createOrganization,
  getOrganizations,
  inviteUserToOrganization,
  acceptInviteToOrganization,
} from "../api/organizationAPI";

interface OrganizationStore {
  loading: boolean;
  error: null | string;
  createdOrganizations: OrgData[];
  organizations: GetOrganizationData[];
  addOrganization: (orgData: OrgData) => Promise<void>;
  fetchOrganizations: () => Promise<GetOrganizationData[]>;
  inviteUser: (
    orgId: string,
    email: string
  ) => Promise<{
    message: string;
    is_user: boolean;
    already_invited?: boolean;
  }>;
  acceptInvite: (inviteCode: string) => Promise<string | undefined>;
}

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
  loading: false,
  error: null,
  createdOrganizations: [],
  organizations: [],

  addOrganization: async (orgData: OrgData) => {
    set({ loading: true, error: null });
    try {
      const data = await createOrganization(orgData);
      set((state) => ({
        createdOrganizations: [...state.createdOrganizations, data],
        loading: false,
      }));
      await get().fetchOrganizations();
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },

  fetchOrganizations: async () => {
    set({ loading: true, error: null });

    try {
      // console.log("Fetching organizations...");
      const data: GetOrganizationData[] = await getOrganizations();

      if (!data || data.length === 0) {
        console.warn("No organizations found or authentication issue.");
      }

      set({ organizations: data, loading: false });
      return data;
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      set({ error: (error as any).message, loading: false });
      return [];
    }
  },

  inviteUser: async (organizationId: string, email: string) => {
    set({ loading: true, error: null });
    try {
      const response = await inviteUserToOrganization(organizationId, email);
      set({ loading: false });
      return response; // Ensure the response is returned
    } catch (error) {
      set({ error: (error as any).message, loading: false });
      throw error;
    }
  },

  acceptInvite: async (inviteCode: string) => {
    set({ loading: true, error: null });
    try {
      const response = await acceptInviteToOrganization(inviteCode);

      if (!response || !response.organization) {
        throw new Error("Failed to accept invite");
      }

      await get().fetchOrganizations();
      set({ loading: false });
      return response.organization;
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },
}));
