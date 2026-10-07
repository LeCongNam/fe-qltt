import { queryOptions } from "@tanstack/react-query"

import { nguoiDungApi } from "@/features/nguoi-dung/api"
import type { QueryOf } from "@/lib/api"

export const nguoiDungKeys = {
  all: ["nguoi-dung"] as const,
  list: (params: QueryOf<"/docgia">) => [...nguoiDungKeys.all, "list", params] as const,
  detail: (id: string) => [...nguoiDungKeys.all, "detail", id] as const,
}

export const nguoiDungQueries = {
  list: (params: QueryOf<"/docgia">) =>
    queryOptions({ queryKey: nguoiDungKeys.list(params), queryFn: () => nguoiDungApi.list(params) }),
  detail: (id: string) =>
    queryOptions({ queryKey: nguoiDungKeys.detail(id), queryFn: () => nguoiDungApi.detail(id) }),
}
