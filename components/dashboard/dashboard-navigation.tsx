"use client"

import { createContext, useContext } from "react"

type DashboardNavigation = {
  activeItem: string
  onSelect: (label: string) => void
}

export const DashboardNavigationContext = createContext<DashboardNavigation | null>(null)

export function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext)

  if (!context) {
    throw new Error("useDashboardNavigation must be used within LibraryDashboard.")
  }

  return context
}