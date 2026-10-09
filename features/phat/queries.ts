import { queryOptions } from "@tanstack/react-query"

import { phatApi } from "@/features/phat/api"
import type { QueryOf } from "@/lib/api"

export const phatKeys = {
  all: ["phat"] as const,
  list: (params: QueryOf<"/phat">) => [...phatKeys.all, "list", params] as const,
}

export const phatQueries = {
  list: (params: QueryOf<"/phat">) =>
    queryOptions({ queryKey: phatKeys.list(params), queryFn: () => phatApi.list(params) }),
}
