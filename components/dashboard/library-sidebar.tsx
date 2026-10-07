"use client"

import { BookOpen, Settings2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { canSee, isActivePath, navigationGroups } from "@/lib/navigation"
import { initials } from "@/lib/format"

const ROLE_LABEL = { ADMIN: "Quản trị viên", THU_THU: "Thủ thư", BAN_DOC: "Bạn đọc" } as const

export function LibrarySidebar() {
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()

  function closeOnMobile() {
    if (isMobile) setOpenMobile(false)
  }

  const groups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => canSee(item.roles, user?.vaiTro))
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => canSee(child.roles, user?.vaiTro)),
        })),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-surface">
      <SidebarHeader className="px-5 pb-5 pt-6 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white group-data-[collapsible=icon]:size-8">
            <BookOpen className="size-5 group-data-[collapsible=icon]:size-4" aria-hidden="true" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-foreground">Quản lý thư viện</p>
            <p className="mt-0.5 text-xs text-muted-foreground">NHÓM 8 · QUẢN TRỊ</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="px-2 py-1 group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="px-2 text-[11px] font-semibold tracking-[0.08em] text-faint">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const enabled = item.href !== undefined && item.ready !== false
                  const buttonClass =
                    "h-9 rounded-md px-2.5 text-[13px] text-ink data-active:bg-primary-soft data-active:text-primary-strong data-active:font-semibold"

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        render={enabled ? <Link href={item.href!} onClick={closeOnMobile} /> : undefined}
                        isActive={item.href !== undefined && isActivePath(pathname, item.href)}
                        tooltip={item.label}
                        disabled={!enabled && !item.children}
                        className={buttonClass}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.children && (
                        <SidebarMenuSub className="mb-1 mt-0.5 gap-0 border-border">
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton
                                render={child.ready === false ? undefined : <Link href={child.href} onClick={closeOnMobile} />}
                                aria-disabled={child.ready === false}
                                isActive={isActivePath(pathname, child.href)}
                                className="h-7 text-xs text-faint data-active:font-medium data-active:text-primary-strong"
                              >
                                {child.label}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border px-4 py-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3e8d8] text-xs font-semibold text-[#845c35] group-data-[collapsible=icon]:size-8">
            {user ? initials(user.hoTen) : ""}
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold text-heading">{user?.hoTen}</p>
            <p className="truncate text-xs text-muted-foreground">{user ? ROLE_LABEL[user.vaiTro] : ""}</p>
          </div>
          <Settings2 className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" aria-hidden="true" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}