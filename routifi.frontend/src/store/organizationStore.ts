import { create } from "zustand";
import { OrgData } from "../types/organization";

interface OrganizationState {
  orgData: OrgData;
  setOrgData: (data: Partial<OrgData>) => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  orgData: {
    name: "",
    description: "",
    logo: null,
  },
  setOrgData: (data) =>
    set((state) => ({
      orgData: { ...state.orgData, ...data },
    })),
}));
