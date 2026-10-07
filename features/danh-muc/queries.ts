import { queryOptions } from "@tanstack/react-query"

import type { Paged, QueryOf } from "@/lib/api"
import { fetchAllPages } from "@/lib/paging"

/** Ba danh mục: `/the-loai`, `/nha-xuat-ban`, `/tac-gia`. */
export type DanhMucKind = "the-loai" | "nha-xuat-ban" | "tac-gia"

export type DanhMucApi<T, TCreate> = {
  list: (query: QueryOf<"/the-loai">) => Promise<Paged<T>>
  create: (body: Partial<TCreate>) => Promise<unknown>
  update: (id: string, body: Partial<TCreate>) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
}

export const danhMucKeys = {
  all: (kind: DanhMucKind) => ["danh-muc", kind] as const,
  list: (kind: DanhMucKind, page: number) => [...danhMucKeys.all(kind), "list", page] as const,
  options: (kind: DanhMucKind) => [...danhMucKeys.all(kind), "options"] as const,
}

export const danhMucQueries = {
  list: <T, TCreate>(kind: DanhMucKind, api: DanhMucApi<T, TCreate>, page: number, limit: number) =>
    queryOptions({ queryKey: danhMucKeys.list(kind, page), queryFn: () => api.list({ page, limit }) }),
  /** Toàn bộ danh mục để chọn trong ô chọn: gom mọi trang vì BE giới hạn 100 dòng mỗi trang và chưa có tham số tìm kiếm. */
  options: <T, TCreate>(kind: DanhMucKind, api: DanhMucApi<T, TCreate>) =>
    queryOptions({
      queryKey: danhMucKeys.options(kind),
      queryFn: () => fetchAllPages((page, limit) => api.list({ page, limit })),
      staleTime: 60_000,
    }),
}
