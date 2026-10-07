import { api, unwrap, type QueryOf, type Schemas } from "@/lib/api"

/**
 * Nội dung đặt trước thật của BE. Spec sinh sai: BE có hai class cùng tên `DatTruocDto` (yêu cầu và kết quả) nên
 * openapi.json dùng kết quả làm body. Khi BE đổi tên class thì thay bằng kiểu sinh ra.
 */
export type DatTruocBody = { maSach: string; maNguoiDung?: string }

export const datTruocApi = {
  list: (query: QueryOf<"/dat-truoc">) => api.GET("/dat-truoc", { params: { query } }).then(unwrap),
  create: (body: DatTruocBody) =>
    api.POST("/dat-truoc", { body: body as unknown as Schemas["DatTruocDto"] }).then(unwrap),
  /** Cán bộ hủy hộ phải nêu `maNguoiDung`; bạn đọc bỏ trống để BE lấy từ token. */
  huy: (maSach: string, maNguoiDung?: string) =>
    api.DELETE("/dat-truoc/{maSach}", { params: { path: { maSach }, query: { maNguoiDung } } }).then(unwrap),
}
