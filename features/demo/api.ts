import { api, unwrap, type Schemas } from "@/lib/api"

export const demoApi = {
  list: () => api.GET("/demo").then(unwrap),
  detail: (id: string) => api.GET("/demo/{id}", { params: { path: { id } } }).then(unwrap),
  bang: (id: string, body: Schemas["DemoThamSoDto"]) =>
    api.POST("/demo/{id}/bang", { params: { path: { id } }, body }).then(unwrap),
  chay: (id: string, body: Schemas["DemoChayDto"]) =>
    api.POST("/demo/{id}/chay", { params: { path: { id } }, body }).then(unwrap),
}
