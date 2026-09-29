"use client"

import { useState } from "react"
import { Bell, ChevronDown, Search } from "lucide-react"
import { usePathname } from "next/navigation"

import { DashboardNavigationContext } from "@/components/dashboard/dashboard-navigation"
import { LibrarySidebar } from "@/components/dashboard/library-sidebar"
import { Input } from "@/components/ui/input"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function LibraryDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [selectedItem, setSelectedItem] = useState("Tổng quan")
  const activeItem =
    pathname === "/add-doc-gia"
      ? "Người dùng & tài khoản"
      : selectedItem === "Người dùng & tài khoản"
        ? "Tổng quan"
        : selectedItem

  return (
    <DashboardNavigationContext.Provider value={{ activeItem, onSelect: setSelectedItem }}>
      <SidebarProvider>
        <LibrarySidebar activeItem={activeItem} onSelect={setSelectedItem} />
        <SidebarInset className="min-h-svh bg-[#f6f7f4]">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-[#e7e9e4] bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-2 text-[#526159]" />
            <span className="hidden text-sm text-[#87918b] sm:inline">Thư viện</span>
            <span className="hidden text-sm text-[#b2bab5] sm:inline">/</span>
            <span className="truncate text-sm font-semibold text-[#293a32]">{activeItem}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="relative hidden w-56 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9690]" aria-hidden="true" />
              <Input
                aria-label="Tìm kiếm"
                placeholder="Tìm kiếm..."
                className="h-9 rounded-md border-[#e7e9e4] bg-[#fafbf9] pl-9 text-xs shadow-none placeholder:text-[#9ca69f]"
              />
            </label>
            <button type="button" aria-label="Thông báo" className="relative flex size-9 items-center justify-center rounded-md text-[#68756e] transition-colors hover:bg-[#f2f4f1]">
              <Bell className="size-[18px]" aria-hidden="true" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#d16b53]" />
            </button>
            <span className="hidden h-7 w-px bg-[#e7e9e4] sm:block" />
            <button type="button" className="flex items-center gap-2 rounded-md p-1 text-left hover:bg-[#f6f7f4]">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#f3e8d8] text-[11px] font-semibold text-[#845c35]">LT</span>
              <span className="hidden text-xs font-medium text-[#35463d] lg:block">Linh Trần</span>
              <ChevronDown className="hidden size-3.5 text-[#89938d] lg:block" aria-hidden="true" />
            </button>
          </div>
        </header>

          <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 py-6 sm:px-7 sm:py-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardNavigationContext.Provider>
  )
}