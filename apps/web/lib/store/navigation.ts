import { create } from 'zustand'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface NavigationState {
  isMobileMenuOpen: boolean
  breadcrumbs: BreadcrumbItem[]
  currentPage: string | null

  setMobileMenuOpen: (open: boolean) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  setCurrentPage: (page: string) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isMobileMenuOpen: false,
  breadcrumbs: [],
  currentPage: null,

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  setCurrentPage: (page) => set({ currentPage: page }),
}))
