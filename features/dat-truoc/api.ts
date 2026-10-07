import { api, unwrap, type QueryOf, type Schemas } from "@/lib/api"

export const datTruocApi = {
  list: (query: QueryOf<"/dat-truoc">) => api.GET("/dat-truoc", { params: { query } }).then(unwrap),
  create: (body: Schemas["TaoDatTruocDto"]) => api.POST("/dat-truoc", { body }).then(unwrap),
  /** Cán bộ hủy hộ phải nêu `maNguoiDung`; bạn đọc bỏ trống để BE lấy từ token. */
  huy: (maSach: string, maNguoiDung?: string) =>
    api.DELETE("/dat-truoc/{maSach}", { params: { path: { maSach }, query: { maNguoiDung } } }).then(unwrap),
}
