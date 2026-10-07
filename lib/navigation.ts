import {
  BookMarked,
  CircleDollarSign,
  FileChartColumn,
  LayoutDashboard,
  LibraryBig,
  ListFilter,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

import type { VaiTro } from "@/lib/auth-store"

export type NavLeaf = {
  label: string
  href: string
  /** Vai trò được thấy mục này; bỏ trống = mọi tài khoản đã đăng nhập. */
  roles?: VaiTro[]
  /** false = trang chưa làm, mục hiển thị mờ và không bấm được. */
  ready?: boolean
}

export type NavItem = {
  label: string
  icon: LucideIcon
  href?: string
  roles?: VaiTro[]
  ready?: boolean
  children?: NavLeaf[]
}

export type NavGroup = { label: string; items: NavItem[] }

const STAFF: VaiTro[] = ["ADMIN", "THU_THU"]

// Khi làm xong một trang, đổi `ready` của mục đó sang true (hoặc bỏ dòng ready).
export const navigationGroups: NavGroup[] = [
  {
    label: "TỔNG QUAN",
    items: [{ label: "Tổng quan", icon: LayoutDashboard, href: "/", roles: STAFF }],
  },
  {
    label: "TÀI NGUYÊN",
    items: [
      {
        label: "Danh mục",
        icon: LibraryBig,
        children: [
          { label: "Sách", href: "/sach" },
          { label: "Tác giả", href: "/tac-gia" },
          { label: "Thể loại", href: "/the-loai" },
          { label: "Nhà xuất bản", href: "/nha-xuat-ban" },
        ],
      },
    ],
  },
  {
    label: "NGƯỜI DÙNG",
    items: [{ label: "Người dùng & tài khoản", icon: UsersRound, href: "/nguoi-dung", roles: STAFF }],
  },
  {
    label: "LƯU THÔNG",
    items: [
      { label: "Mượn - trả", icon: BookMarked, href: "/phieu-muon", roles: STAFF, ready: false },
      { label: "Đặt trước", icon: ListFilter, href: "/dat-truoc", ready: false },
      { label: "Tiền phạt", icon: CircleDollarSign, href: "/phat", roles: STAFF, ready: false },
    ],
  },
  {
    label: "CÁ NHÂN",
    items: [{ label: "Của tôi", icon: UserRound, href: "/me", ready: false }],
  },
  {
    label: "BÁO CÁO",
    items: [{ label: "Báo cáo", icon: FileChartColumn, href: "/bao-cao", roles: STAFF, ready: false }],
  },
]

export function canSee(roles: VaiTro[] | undefined, vaiTro: VaiTro | undefined) {
  return !roles || (vaiTro !== undefined && roles.includes(vaiTro))
}

// Trang con không nằm dưới href của mục menu: coi như thuộc mục đó.
const PATH_ALIASES: Record<string, string> = { "/add-doc-gia": "/nguoi-dung" }

export function isActivePath(pathname: string, href: string) {
  pathname = PATH_ALIASES[pathname] ?? pathname
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
}

/** Nhãn mục điều hướng ứng với đường dẫn hiện tại, dùng cho breadcrumb ở header. */
export function findNavLabel(pathname: string) {
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.href && isActivePath(pathname, item.href)) return item.label
      const child = item.children?.find((c) => isActivePath(pathname, c.href))
      if (child) return child.label
    }
  }
  return "Tổng quan"
}
