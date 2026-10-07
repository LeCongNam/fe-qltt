import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { apiClient, type Schemas } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

export type DanhMucSachDong = Schemas["DanhMucSachDong"]
export type SachDangMuonDong = Schemas["SachDangMuonDong"]
export type MuonQuaHanDong = Schemas["MuonQuaHanDong"]
export type NguoiDungViPhamDong = Schemas["NguoiDungViPhamDong"]
export type TopSachMuonNhieuDong = Schemas["TopSachMuonNhieuDong"]
export type ThongKeTienPhatDong = Schemas["ThongKeTienPhatDong"]
export type LichSuMuonDong = Schemas["LichSuMuonDong"]
export type DatTruocDong = Schemas["DatTruocDong"]

type Params = Record<string, string | number | undefined>

/**
 * Gọi một báo cáo `/bao-cao/<path>` (chỉ ADMIN, THU_THU). Báo cáo là view đọc từ CSDL nên luôn
 * lấy lại khi mở lại trang — mượn/trả/phạt ở trang khác làm số liệu đổi ngay.
 */
export function useBaoCao<T>(path: string, params?: Params) {
  const { isStaff } = useAuth()
  const clean = Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== ""))
  return useQuery({
    queryKey: ["/bao-cao", path, clean],
    queryFn: async () => (await apiClient.get<T[]>(`/bao-cao/${path}`, { params: clean })).data,
    enabled: isStaff,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
