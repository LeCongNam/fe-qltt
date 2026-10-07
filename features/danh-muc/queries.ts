import { queryOptions } from "@tanstack/react-query"

import type { Paged, QueryOf } from "@/lib/api"

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
  /** Danh sách để chọn trong ô Select (BE giới hạn 100 dòng mỗi trang). */
  options: <T, TCreate>(kind: DanhMucKind, api: DanhMucApi<T, TCreate>) =>
    queryOptions({
      queryKey: danhMucKeys.options(kind),
      queryFn: async () => (await api.list({ page: 1, limit: 100 })).data,
      staleTime: 60_000,
    }),
}
