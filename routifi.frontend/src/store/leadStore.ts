import { create } from "zustand";
import { getLeadsByOrgSlug, updateLead, deleteLead } from "@/api/leadsAPI";
import { Lead } from "@/types/lead";

interface LeadStore {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: (slug: string) => Promise<void>;
  modifyLead: (slug: string, leadId: string, leadData: any) => Promise<void>;
  removeLead: (slug: string, leadId: string) => Promise<void>;
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  fetchLeads: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const leads = await getLeadsByOrgSlug(slug);
      set({ leads });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  modifyLead: async (slug: string, leadId: string, leadData: any) => {
    set({ loading: true, error: null });
    try {
      await updateLead(slug, leadId, leadData);
      await get().fetchLeads(slug);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  removeLead: async (slug: string, leadId: string) => {
    set({ loading: true, error: null });
    try {
      await deleteLead(slug, leadId);
      await get().fetchLeads(slug);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
