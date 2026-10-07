import { queryOptions } from "@tanstack/react-query"

import { phieuMuonApi } from "@/features/phieu-muon/api"
import type { QueryOf } from "@/lib/api"

export const phieuMuonKeys = {
  all: ["phieu-muon"] as const,
  list: (params: QueryOf<"/phieu-muon">) => [...phieuMuonKeys.all, "list", params] as const,
  detail: (maPhieu: string) => [...phieuMuonKeys.all, "detail", maPhieu] as const,
}

export const phieuMuonQueries = {
  list: (params: QueryOf<"/phieu-muon">) =>
    queryOptions({ queryKey: phieuMuonKeys.list(params), queryFn: () => phieuMuonApi.list(params) }),
  detail: (maPhieu: string) =>
    queryOptions({ queryKey: phieuMuonKeys.detail(maPhieu), queryFn: () => phieuMuonApi.detail(maPhieu) }),
}
