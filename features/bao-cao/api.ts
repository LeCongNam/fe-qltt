import { api, unwrap, type QueryOf } from "@/lib/api"

/** Các báo cáo `/bao-cao/*` (chỉ ADMIN, THU_THU), mỗi báo cáo là một view đọc từ CSDL, snake_case. */
export const baoCaoApi = {
  "danh-muc-sach": () => api.GET("/bao-cao/danh-muc-sach").then(unwrap),
  "sach-dang-muon": () => api.GET("/bao-cao/sach-dang-muon").then(unwrap),
  "muon-qua-han": () => api.GET("/bao-cao/muon-qua-han").then(unwrap),
  "nguoi-dung-vi-pham": () => api.GET("/bao-cao/nguoi-dung-vi-pham").then(unwrap),
  "top-sach-muon-nhieu": (query: QueryOf<"/bao-cao/top-sach-muon-nhieu">) =>
    api.GET("/bao-cao/top-sach-muon-nhieu", { params: { query } }).then(unwrap),
  "thong-ke-tien-phat": () => api.GET("/bao-cao/thong-ke-tien-phat").then(unwrap),
  "lich-su-muon": (query: QueryOf<"/bao-cao/lich-su-muon">) =>
    api.GET("/bao-cao/lich-su-muon", { params: { query } }).then(unwrap),
  "dat-truoc": (query: QueryOf<"/bao-cao/dat-truoc">) =>
    api.GET("/bao-cao/dat-truoc", { params: { query } }).then(unwrap),
}
