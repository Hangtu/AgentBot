import { create } from "zustand";

// =============================================================================
// Example Zustand store — replace with your own
// =============================================================================

interface AppState {
  /** Whether the sidebar/navigation is open (mobile) */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
