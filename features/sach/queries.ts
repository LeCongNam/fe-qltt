import { queryOptions } from "@tanstack/react-query"

import { sachApi } from "@/features/sach/api"
import type { QueryOf } from "@/lib/api"

/** Khóa gốc `["sach"]` bao cả bản sách và chỉ mục bản sách: làm mới nó là làm mới mọi thứ của sách. */
export const sachKeys = {
  all: ["sach"] as const,
  list: (params: QueryOf<"/sach">) => [...sachKeys.all, "list", params] as const,
  detail: (id: string) => [...sachKeys.all, "detail", id] as const,
  banSach: (id: string) => [...sachKeys.all, id, "ban-sach"] as const,
  banSachIndex: () => [...sachKeys.all, "ban-sach-index"] as const,
}

export const sachQueries = {
  list: (params: QueryOf<"/sach">) =>
    queryOptions({ queryKey: sachKeys.list(params), queryFn: () => sachApi.list(params) }),
  detail: (id: string) => queryOptions({ queryKey: sachKeys.detail(id), queryFn: () => sachApi.detail(id) }),
  banSach: (id: string) => queryOptions({ queryKey: sachKeys.banSach(id), queryFn: () => sachApi.banSach(id) }),
}
