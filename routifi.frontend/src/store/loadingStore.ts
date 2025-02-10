import { create } from "zustand";

export interface LoadingState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  toggleLoading: () => void;
}

const useLoadingStore = create<LoadingState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
  toggleLoading: () => set((state) => ({ loading: !state.loading })),
}));

export default useLoadingStore;
