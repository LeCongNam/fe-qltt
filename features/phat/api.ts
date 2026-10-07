import { api, unwrap, type QueryOf, type Schemas } from "@/lib/api"

export const phatApi = {
  list: (query: QueryOf<"/phat">) => api.GET("/phat", { params: { query } }).then(unwrap),
  thanhToan: (id: string) => api.POST("/phat/{id}/thanh-toan", { params: { path: { id } } }).then(unwrap),
  huy: (id: string, body: Schemas["HuyPhatDto"]) =>
    api.POST("/phat/{id}/huy", { params: { path: { id } }, body }).then(unwrap),
}
