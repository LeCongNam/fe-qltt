"use client"

import {
  Activity,
  BookCopy,
  BookMarked,
  BookOpenCheck,
  CircleDollarSign,
  Clock3,
  FileChartColumn,
  KeyRound,
  LayoutDashboard,
  LibraryBig,
  ListFilter,
  Search,
  Settings2,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"

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

type NavigationItem = {
  label: string
  icon: LucideIcon
  href?: string
  children?: string[]
}

const navigationGroups: { label: string; items: NavigationItem[] }[] = [
  { label: "TỔNG QUAN", items: [{ label: "Tổng quan", icon: LayoutDashboard, href: "/" }] },
  {
    label: "TÀI NGUYÊN",
    items: [
      { label: "Danh mục", icon: LibraryBig, children: ["Sách", "Tác giả", "Thể loại", "Nhà xuất bản"] },
      { label: "Bản sách & tình trạng", icon: BookCopy },
    ],
  },
  { label: "ĐỘC GIẢ", items: [{ label: "Người dùng & tài khoản", icon: UsersRound, href: "/add-doc-gia" }] },
  {
    label: "LƯU THÔNG",
    items: [
      { label: "Mượn - trả", icon: BookMarked },
      { label: "Gia hạn", icon: Clock3 },
      { label: "Đặt trước", icon: ListFilter },
      { label: "Tiền phạt", icon: CircleDollarSign },
      { label: "Hành vi", icon: Activity },
    ],
  },
  {
    label: "TRA CỨU & HỆ THỐNG",
    items: [
      { label: "Tra cứu", icon: Search },
      { label: "Báo cáo", icon: FileChartColumn },
      { label: "Xác thực & phân quyền", icon: KeyRound },
    ],
  },
]

type LibrarySidebarProps = {
  activeItem: string
  onSelect: (label: string) => void
}

export function LibrarySidebar({ activeItem, onSelect }: LibrarySidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()

  function selectItem(label: string) {
    onSelect(label)
    if (isMobile) setOpenMobile(false)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-[#e6e9e3] bg-[#fbfcf9]">
      <SidebarHeader className="px-5 pb-5 pt-6 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#147d64] text-white">
            <BookOpenCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-[#1b2c27]">Thư viện số</p>
            <p className="mt-0.5 text-xs text-[#78847d]">QUẢN TRỊ HỆ THỐNG</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-2 py-1">
            <SidebarGroupLabel className="px-2 text-[10px] font-semibold tracking-[0.08em] text-[#89938d]">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={item.href ? <Link href={item.href} /> : undefined}
                      isActive={activeItem === item.label}
                      tooltip={item.label}
                      onClick={() => selectItem(item.label)}
                      className="h-9 rounded-md px-2.5 text-[13px] text-[#47564f] data-active:bg-[#e7f3ee] data-active:text-[#11684f] data-active:font-semibold"
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.children && (
                      <SidebarMenuSub className="mb-1 mt-0.5 gap-0 border-[#e2e8e3]">
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child}>
                            <SidebarMenuSubButton
                              isActive={activeItem === child}
                              onClick={() => selectItem(child)}
                              className="h-7 text-xs text-[#66736c] data-active:font-medium data-active:text-[#11684f]"
                            >
                              {child}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-[#e6e9e3] px-4 py-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3e8d8] text-xs font-semibold text-[#845c35]">
            LT
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold text-[#283831]">Linh Trần</p>
            <p className="truncate text-[11px] text-[#78847d]">Quản trị viên</p>
          </div>
          <Settings2 className="size-4 shrink-0 text-[#78847d] group-data-[collapsible=icon]:hidden" aria-hidden="true" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}