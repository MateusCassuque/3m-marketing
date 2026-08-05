import { create } from "zustand"

interface UIState {
  isMobileNavOpen: boolean
  isContactOpen: boolean
  activeSection: string
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void
  openContact: () => void
  closeContact: () => void
  setActiveSection: (section: string) => void
}

/**
 * Global UI store (Zustand).
 * Keeps cross-component UI state — mobile navigation, the "Vamos conversar"
 * contact dialog, and the section currently in view for the nav highlight —
 * outside of prop-drilling territory.
 */
export const useUIStore = create<UIState>((set) => ({
  isMobileNavOpen: false,
  isContactOpen: false,
  activeSection: "inicio",
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
  toggleMobileNav: () =>
    set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),
  openContact: () => set({ isContactOpen: true, isMobileNavOpen: false }),
  closeContact: () => set({ isContactOpen: false }),
  setActiveSection: (section) => set({ activeSection: section }),
}))
