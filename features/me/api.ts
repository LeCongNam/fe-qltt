import { api, unwrap } from "@/lib/api"

/** Dữ liệu của chính tài khoản đang đăng nhập (mọi vai trò), snake_case như view. */
export const meApi = {
  "sach-dang-muon": () => api.GET("/me/sach-dang-muon").then(unwrap),
  "tien-phat": () => api.GET("/me/tien-phat").then(unwrap),
  "lich-su-muon": () => api.GET("/me/lich-su-muon").then(unwrap),
  "dat-truoc": () => api.GET("/me/dat-truoc").then(unwrap),
}

export type MeReport = keyof typeof meApi
