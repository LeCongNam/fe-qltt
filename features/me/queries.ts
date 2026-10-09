import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { meApi, type MeReport } from "@/features/me/api"
import { useAuth } from "@/hooks/use-auth"
import type { Schemas } from "@/lib/api"

export type SachDangMuonCuaToi = Schemas["SachDangMuonCuaToiDto"]
export type TienPhatCuaToi = Schemas["TienPhatCuaToiDto"]
export type LichSuMuonCuaToi = Schemas["LichSuMuonCuaToiDto"]
export type DatTruocCuaToi = Schemas["DatTruocCuaToiDto"]

type MeRows<K extends MeReport> = Awaited<ReturnType<(typeof meApi)[K]>>

export const meKeys = {
  all: ["me"] as const,
  report: (name: MeReport) => [...meKeys.all, name] as const,
}

/**
 * Gọi `/me/<name>`: dữ liệu của chính tài khoản đang đăng nhập (mọi vai trò), snake_case như view.
 * `staleTime: 0` để gia hạn/hủy đặt trước ở nơi khác làm số liệu đổi ngay khi quay lại trang.
 */
export function useMe<K extends MeReport>(name: K) {
  const { ready, user } = useAuth()
  return useQuery<MeRows<K>>({
    queryKey: meKeys.report(name),
    queryFn: meApi[name] as () => Promise<MeRows<K>>,
    enabled: ready && user !== null,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}
