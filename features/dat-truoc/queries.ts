import { queryOptions } from "@tanstack/react-query"

import { datTruocApi } from "@/features/dat-truoc/api"
import type { QueryOf } from "@/lib/api"

export const datTruocKeys = {
  all: ["dat-truoc"] as const,
  list: (params: QueryOf<"/dat-truoc">) => [...datTruocKeys.all, "list", params] as const,
}

export const datTruocQueries = {
  list: (params: QueryOf<"/dat-truoc">) =>
    queryOptions({ queryKey: datTruocKeys.list(params), queryFn: () => datTruocApi.list(params) }),
}
