import { api, unwrap, type Clearable, type QueryOf, type Schemas } from "@/lib/api"

type PageQuery = QueryOf<"/the-loai">

/**
 * Ba danh mục có cùng hình dạng (danh sách phân trang, thêm, sửa, xóa). Nội dung thêm/sửa là `Partial` vì form
 * đã bắt buộc các trường bắt buộc theo cấu hình từng trang; khóa của nó lấy từ DTO nên gõ sai tên trường sẽ báo lỗi.
 */
export const theLoaiApi = {
  list: (query: PageQuery) => api.GET("/the-loai", { params: { query } }).then(unwrap),
  create: (body: Partial<Schemas["CreateTheLoaiDto"]>) =>
    api.POST("/the-loai", { body: body as Schemas["CreateTheLoaiDto"] }).then(unwrap),
  update: (id: string, body: Clearable<Schemas["UpdateTheLoaiDto"]>) =>
    api.PATCH("/the-loai/{id}", { params: { path: { id } }, body: body as never }).then(unwrap),
  remove: (id: string) => api.DELETE("/the-loai/{id}", { params: { path: { id } } }).then(unwrap),
}

export const nhaXuatBanApi = {
  list: (query: PageQuery) => api.GET("/nha-xuat-ban", { params: { query } }).then(unwrap),
  create: (body: Partial<Schemas["CreateNhaXuatBanDto"]>) =>
    api.POST("/nha-xuat-ban", { body: body as Schemas["CreateNhaXuatBanDto"] }).then(unwrap),
  update: (id: string, body: Clearable<Schemas["UpdateNhaXuatBanDto"]>) =>
    api.PATCH("/nha-xuat-ban/{id}", { params: { path: { id } }, body: body as never }).then(unwrap),
  remove: (id: string) => api.DELETE("/nha-xuat-ban/{id}", { params: { path: { id } } }).then(unwrap),
}

export const tacGiaApi = {
  list: (query: PageQuery) => api.GET("/tac-gia", { params: { query } }).then(unwrap),
  create: (body: Partial<Schemas["CreateTacGiaDto"]>) =>
    api.POST("/tac-gia", { body: body as Schemas["CreateTacGiaDto"] }).then(unwrap),
  update: (id: string, body: Clearable<Schemas["UpdateTacGiaDto"]>) =>
    api.PATCH("/tac-gia/{id}", { params: { path: { id } }, body: body as never }).then(unwrap),
  remove: (id: string) => api.DELETE("/tac-gia/{id}", { params: { path: { id } } }).then(unwrap),
}
