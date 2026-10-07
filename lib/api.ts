import axios from "axios"

import { clearSession, getAccessToken } from "@/lib/auth-store"
import type { components } from "@/lib/api-types"

export type Schemas = components["schemas"]

/** Dạng danh sách có phân trang của BE. */
export type Paged<T> = { data: T[]; total: number; page: number; limit: number }

export const apiClient = axios.create({
  baseURL: "/backend",
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.set("Authorization", `Bearer ${token}`)
  return config
})

// 401 (hết hạn, tài khoản bị khóa giữa phiên) → xóa phiên; AuthGuard sẽ chuyển về /login.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/login")
    ) {
      clearSession()
    }
    return Promise.reject(error)
  }
)

/** Lấy thông báo lỗi hiển thị cho người dùng từ lỗi axios `{ statusCode, message }` của BE. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại."
) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    if (!error.response) return "Không thể kết nối đến máy chủ. Vui lòng thử lại."

    const message = error.response.data?.message
    if (Array.isArray(message)) return message.join(" ")
    if (typeof message === "string" && message) return message
  }

  return fallback
}
