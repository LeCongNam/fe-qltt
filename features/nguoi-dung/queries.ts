import { queryOptions } from "@tanstack/react-query"

import { nguoiDungApi } from "@/features/nguoi-dung/api"
import type { QueryOf } from "@/lib/api"

export const isNumericId = (value: string) => /^\d+$/.test(value)

export const nguoiDungKeys = {
  all: ["nguoi-dung"] as const,
  list: (params: QueryOf<"/docgia">) => [...nguoiDungKeys.all, "list", params] as const,
  detail: (id: string) => [...nguoiDungKeys.all, "detail", id] as const,
}

export const nguoiDungQueries = {
  list: (params: QueryOf<"/docgia">) =>
    queryOptions({ queryKey: nguoiDungKeys.list(params), queryFn: () => nguoiDungApi.list(params) }),
  /** `idOrMa` là id số hoặc mã người dùng (từ link ở báo cáo, danh sách lưu thông). */
  detail: (idOrMa: string) =>
    queryOptions({
      queryKey: nguoiDungKeys.detail(idOrMa),
      queryFn: async () =>
        nguoiDungApi.detail(isNumericId(idOrMa) ? idOrMa : (await nguoiDungApi.byMa(idOrMa)).id),
    }),
}
