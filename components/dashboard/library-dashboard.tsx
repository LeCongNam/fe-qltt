"use client"

import { Bell, ChevronDown, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { GlobalSearch } from "@/components/dashboard/global-search"
import { LibrarySidebar } from "@/components/dashboard/library-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { logout, useAuth } from "@/hooks/use-auth"
import { findNavLabel } from "@/lib/navigation"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2) ?? "").toUpperCase()
}

export function LibraryDashboard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const activeItem = findNavLabel(pathname)

  function handleLogout() {
    logout()
    router.replace("/login")
  }

  return (
    <SidebarProvider>
      <LibrarySidebar />
      <SidebarInset className="min-h-svh min-w-0 bg-canvas">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-border bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-2 text-ink" />
            <span className="hidden shrink-0 whitespace-nowrap text-sm text-faint sm:inline">Thư viện</span>
            <span aria-hidden="true" className="hidden text-sm text-[#b2bab5] sm:inline">/</span>
            <span className="truncate text-sm font-semibold text-heading">{activeItem}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <GlobalSearch />
            <button type="button" aria-label="Thông báo" className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted">
              <Bell className="size-[18px]" aria-hidden="true" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#d16b53]" />
            </button>
            <span className="hidden h-7 w-px bg-border sm:block" />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 text-left outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-primary/40">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#f3e8d8] text-xs font-semibold text-[#845c35]">{user ? initials(user.hoTen) : ""}</span>
                <span className="hidden max-w-40 truncate text-xs font-medium text-ink lg:block">{user?.hoTen}</span>
                <ChevronDown className="hidden size-3.5 text-icon lg:block" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-heading">{user?.hoTen}</p>
                  <p className="text-xs text-muted-foreground">{user?.maNguoiDung} · {user?.tenDangNhap}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut aria-hidden="true" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

          <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 py-6 sm:px-7 sm:py-8">
            {children}
          </div>
      </SidebarInset>
    </SidebarProvider>
  )
}