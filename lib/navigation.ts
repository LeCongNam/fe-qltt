import {
  BookMarked,
  CircleDollarSign,
  DatabaseZap,
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
      { label: "Mượn - trả", icon: BookMarked, href: "/phieu-muon", roles: STAFF },
      { label: "Đặt trước", icon: ListFilter, href: "/dat-truoc" },
      { label: "Tiền phạt", icon: CircleDollarSign, href: "/phat", roles: STAFF },
    ],
  },
  {
    label: "CÁ NHÂN",
    items: [{ label: "Của tôi", icon: UserRound, href: "/me" }],
  },
  {
    label: "BÁO CÁO",
    items: [{ label: "Báo cáo", icon: FileChartColumn, href: "/bao-cao", roles: STAFF }],
  },
  {
    label: "DEMO",
    items: [{ label: "Xử lý thông tin", icon: DatabaseZap, href: "/demo", roles: STAFF }],
  },
]

export function canSee(roles: VaiTro[] | undefined, vaiTro: VaiTro | undefined) {
  return !roles || (vaiTro !== undefined && roles.includes(vaiTro))
}

// Quyền theo route: lấy từ `roles` của mục menu, cộng thêm các trang con không có mục menu
// nhưng hẹp quyền hơn trang cha. Route khớp dài nhất (theo tiền tố) được áp dụng.
const ROUTE_ROLES_EXTRA: Record<string, VaiTro[]> = { "/sach/moi": STAFF }

function collectRouteRoles() {
  const entries: [string, VaiTro[] | undefined][] = Object.entries(ROUTE_ROLES_EXTRA)
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.href) entries.push([item.href, item.roles])
      for (const child of item.children ?? []) entries.push([child.href, child.roles])
    }
  }
  return entries.sort((a, b) => b[0].length - a[0].length)
}

const ROUTE_ROLES = collectRouteRoles()

/** Vai trò được vào route này; `undefined` = mọi tài khoản đã đăng nhập (hoặc route không có trong cấu hình). */
export function getRouteRoles(pathname: string) {
  return ROUTE_ROLES.find(([href]) => isActivePath(pathname, href))?.[1]
}

export function isActivePath(pathname: string, href: string) {
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

// Trang con không có mục menu riêng nên cần tiêu đề riêng; khớp trước, mục menu là mặc định.
const SUB_PAGE_TITLES: [RegExp, (match: RegExpMatchArray) => string][] = [
  [/^\/sach\/moi$/, () => "Thêm sách"],
  [/^\/sach\/[^/]+$/, () => "Chi tiết sách"],
  [/^\/nguoi-dung\/moi$/, () => "Thêm người dùng"],
  [/^\/nguoi-dung\/[^/]+$/, () => "Chi tiết người dùng"],
  [/^\/phieu-muon\/moi$/, () => "Lập phiếu mượn"],
  [/^\/phieu-muon\/([^/]+)$/, (m) => `Phiếu mượn ${decodeURIComponent(m[1])}`],
]

/** Tiêu đề trang (không kèm tên ứng dụng) theo đường dẫn, dùng cho `<title>`. */
export function getPageTitle(pathname: string) {
  for (const [pattern, title] of SUB_PAGE_TITLES) {
    const match = pathname.match(pattern)
    if (match) return title(match)
  }
  return findNavLabel(pathname)
}
