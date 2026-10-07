import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useAuth } from "@/hooks/use-auth"
import { apiClient, type Schemas } from "@/lib/api"

export type SachDangMuonCuaToi = Schemas["SachDangMuonCuaToiDto"]
export type TienPhatCuaToi = Schemas["TienPhatCuaToiDto"]
export type LichSuMuonCuaToi = Schemas["LichSuMuonCuaToiDto"]
export type DatTruocCuaToi = Schemas["DatTruocCuaToiDto"]

/**
 * Gọi `/me/<path>`: dữ liệu của chính tài khoản đang đăng nhập (mọi vai trò), snake_case như view.
 * `staleTime: 0` để gia hạn/hủy đặt trước ở nơi khác làm số liệu đổi ngay khi quay lại trang.
 */
export function useMe<T>(path: string) {
  const { ready, user } = useAuth()
  return useQuery({
    queryKey: ["/me", path],
    queryFn: async () => (await apiClient.get<T[]>(`/me/${path}`)).data,
    enabled: ready && user !== null,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
