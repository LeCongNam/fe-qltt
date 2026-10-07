import { api, unwrap, type Clearable, type QueryOf, type Schemas } from "@/lib/api"

export const sachApi = {
  list: (query: QueryOf<"/sach">) => api.GET("/sach", { params: { query } }).then(unwrap),
  detail: (id: string) => api.GET("/sach/{id}", { params: { path: { id } } }).then(unwrap),
  create: (body: Schemas["CreateSachDto"]) => api.POST("/sach", { body }).then(unwrap),
  update: (id: string, body: Clearable<Schemas["UpdateSachDto"]>) =>
    api.PATCH("/sach/{id}", { params: { path: { id } }, body: body as Schemas["UpdateSachDto"] }).then(unwrap),
  remove: (id: string) => api.DELETE("/sach/{id}", { params: { path: { id } } }).then(unwrap),

  banSach: (id: string) => api.GET("/sach/{id}/ban-sach", { params: { path: { id } } }).then(unwrap),
  nhapBanSach: (id: string, body: Schemas["CreateBanSachDto"]) =>
    api.POST("/sach/{id}/ban-sach", { params: { path: { id } }, body }).then(unwrap),
  doiTinhTrangBan: (maBanSach: string, body: Schemas["CapNhatTinhTrangBanSachDto"]) =>
    api.PATCH("/ban-sach/{maBanSach}/tinh-trang", { params: { path: { maBanSach } }, body }).then(unwrap),
}
