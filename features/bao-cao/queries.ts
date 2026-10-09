import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { baoCaoApi } from "@/features/bao-cao/api"
import { useAuth } from "@/hooks/use-auth"
import type { Schemas } from "@/lib/api"

export type DanhMucSachDong = Schemas["DanhMucSachDong"]
export type SachDangMuonDong = Schemas["SachDangMuonDong"]
export type MuonQuaHanDong = Schemas["MuonQuaHanDong"]
export type NguoiDungViPhamDong = Schemas["NguoiDungViPhamDong"]
export type TopSachMuonNhieuDong = Schemas["TopSachMuonNhieuDong"]
export type ThongKeTienPhatDong = Schemas["ThongKeTienPhatDong"]
export type LichSuMuonDong = Schemas["LichSuMuonDong"]
export type DatTruocDong = Schemas["DatTruocDong"]

export type BaoCaoName = keyof typeof baoCaoApi
export type BaoCaoRows<K extends BaoCaoName> = Awaited<ReturnType<(typeof baoCaoApi)[K]>>
type BaoCaoParams<K extends BaoCaoName> = Parameters<(typeof baoCaoApi)[K]>[0]

export const baoCaoKeys = {
  all: ["bao-cao"] as const,
  report: (name: BaoCaoName, params: object) => [...baoCaoKeys.all, name, params] as const,
}

/**
 * Gọi một báo cáo `/bao-cao/<name>` (chỉ ADMIN, THU_THU). Báo cáo là view đọc từ CSDL nên luôn
 * lấy lại khi mở lại trang — mượn/trả/phạt ở trang khác làm số liệu đổi ngay.
 * Tham số rỗng (`undefined`, `""`) bị bỏ trước khi gửi.
 */
export function useBaoCao<K extends BaoCaoName>(name: K, params?: BaoCaoParams<K>) {
  const { isStaff } = useAuth()
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== ""))
  return useQuery<BaoCaoRows<K>>({
    queryKey: baoCaoKeys.report(name, clean),
    queryFn: () => (baoCaoApi[name] as (query?: object) => Promise<BaoCaoRows<K>>)(clean),
    enabled: isStaff,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
