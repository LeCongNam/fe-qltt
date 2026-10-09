import { api, unwrap, type Schemas } from "@/lib/api"

export const muonTraApi = {
  tra: (body: Schemas["TraSachDto"]) => api.POST("/muon-tra/tra", { body }).then(unwrap),
  giaHan: (body: Schemas["GiaHanDto"]) => api.POST("/muon-tra/gia-han", { body }).then(unwrap),
}
