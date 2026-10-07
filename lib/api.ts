import createClient from "openapi-fetch"

import { clearSession, getAccessToken } from "@/lib/auth-store"
import type { components, paths } from "@/lib/api-types"

export type Schemas = components["schemas"]

/** Dạng danh sách có phân trang của BE. */
export type Paged<T> = { data: T[]; total: number; page: number; limit: number }

/** Kiểu tham số query của `GET <đường dẫn>` theo spec. */
export type QueryOf<P extends keyof paths> = paths[P] extends { get: { parameters: { query?: infer Q } } }
  ? NonNullable<Q>
  : never

/**
 * Client gọi BE, kiểm tra đường dẫn, tham số, body và kiểu trả về theo `lib/api-types.ts` (sinh từ openapi.json).
 * Không gọi trực tiếp trong component: mỗi module có hàm riêng trong `features/<module>/api.ts`.
 */
export const api = createClient<paths>({ baseUrl: "/backend" })

api.use({
  onRequest({ request }) {
    const token = getAccessToken()
    if (token) request.headers.set("Authorization", `Bearer ${token}`)
  },
  // 401 (hết hạn, tài khoản bị khóa giữa phiên) → xóa phiên; AuthGuard sẽ chuyển về /login.
  onResponse({ response, schemaPath }) {
    if (response.status === 401 && schemaPath !== "/auth/login") clearSession()
  },
})

/** Lỗi HTTP của BE (`{ statusCode, message }`). Lỗi mạng không phải `ApiError` (là `TypeError` của fetch). */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/** `true` nếu là lỗi HTTP của BE, kèm kiểm tra mã trạng thái khi truyền `status`. */
export function isApiError(error: unknown, status?: number): error is ApiError {
  return error instanceof ApiError && (status === undefined || error.status === status)
}

function messageOf(error: unknown) {
  const message = (error as { message?: string | string[] } | undefined)?.message
  if (Array.isArray(message)) return message.join(" ")
  return typeof message === "string" ? message : ""
}

/** Lấy phần dữ liệu của kết quả `api.GET/POST/...`; lỗi HTTP thì ném `ApiError` để React Query xử lý như lỗi thường. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (!result.response.ok) throw new ApiError(result.response.status, messageOf(result.error))
  return result.data as T
}

/** Lấy thông báo lỗi hiển thị cho người dùng: 400 là mảng thông báo, 422 là thông báo nghiệp vụ của CSDL (hiện nguyên văn). */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại."
) {
  if (isApiError(error)) return error.message || fallback
  // `fetch` ném TypeError khi không tới được máy chủ.
  if (error instanceof TypeError) return "Không thể kết nối đến máy chủ. Vui lòng thử lại."
  return fallback
}
