/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { GetOrganziationData, OrgData } from "../types/organization";
import { createOrganization, getOrganizations } from "../api/organizationAPI";

interface OrganizationStore {
  loading: boolean;
  error: null | string;
  createdOrganizations: OrgData[];
  organizations: GetOrganziationData[];
  addOrganization: (orgData: OrgData) => Promise<void>;
  fetchOrganizations: () => Promise<void>;
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
}));
