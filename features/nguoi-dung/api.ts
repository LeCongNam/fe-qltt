import { api, unwrap, type QueryOf, type Schemas } from "@/lib/api"

export const nguoiDungApi = {
  list: (query: QueryOf<"/docgia">) => api.GET("/docgia", { params: { query } }).then(unwrap),
  detail: (id: string) => api.GET("/docgia/{id}", { params: { path: { id } } }).then(unwrap),
  create: (body: Schemas["CreateDocgiaDto"]) => api.POST("/docgia", { body }).then(unwrap),
  update: (id: string, body: Schemas["UpdateDocgiaDto"]) =>
    api.PATCH("/docgia/{id}", { params: { path: { id } }, body }).then(unwrap),
  doiTrangThai: (id: string, body: Schemas["DoiTrangThaiNguoiDungDto"]) =>
    api.PATCH("/docgia/{id}/trang-thai", { params: { path: { id } }, body }).then(unwrap),

  taoTaiKhoan: (id: string, body: Schemas["CreateTaiKhoanDto"]) =>
    api.POST("/docgia/{id}/tai-khoan", { params: { path: { id } }, body }).then(unwrap),
  doiTrangThaiTaiKhoan: (id: string, body: Schemas["DoiTrangThaiTaiKhoanDto"]) =>
    api.PATCH("/docgia/{id}/tai-khoan/trang-thai", { params: { path: { id } }, body }).then(unwrap),
}
