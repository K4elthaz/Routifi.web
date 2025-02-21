/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { GetOrganziationData, OrgData } from "../types/organization";
import {
  createOrganization,
  getOrganizations,
  inviteUserToOrganization,
  acceptInvite,
} from "../api/organizationAPI";

interface OrganizationStore {
  loading: boolean;
  error: null | string;
  createdOrganizations: OrgData[];
  organizations: GetOrganziationData[];
  addOrganization: (orgData: OrgData) => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  inviteUser: (orgId: string, email: string) => Promise<void>;
  acceptInvitation: (inviteId: string) => Promise<GetOrganziationData>;
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
      const data: GetOrganziationData[] = await getOrganizations();
      set({ organizations: data, loading: false });
    } catch (error) {
      set({ error: (error as any).message, loading: false });
    }
  },

  inviteUser: async (organizationId: string, email: string) => {
    set({ loading: true, error: null });
    try {
      await inviteUserToOrganization(organizationId, email);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as any).message, loading: false });
      throw error;
    }
  },

  acceptInvitation: async (inviteId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await acceptInvite(inviteId);
      await get().fetchOrganizations();
      set({ loading: false });
      return response.organization;
    } catch (error) {
      set({ error: (error as any).message, loading: false });
      throw error;
    }
  },
}));
