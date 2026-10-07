"use client"

import { Bell, ChevronDown, LogOut, Search } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { LibrarySidebar } from "@/components/dashboard/library-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 text-left outline-none hover:bg-[#f6f7f4] focus-visible:ring-2 focus-visible:ring-[#147d64]/40">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#f3e8d8] text-[11px] font-semibold text-[#845c35]">{user ? initials(user.hoTen) : ""}</span>
                <span className="hidden text-xs font-medium text-[#35463d] lg:block">{user?.hoTen}</span>
                <ChevronDown className="hidden size-3.5 text-[#89938d] lg:block" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-[#283831]">{user?.hoTen}</p>
                  <p className="text-[11px] text-[#78847d]">{user?.maNguoiDung} · {user?.tenDangNhap}</p>
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