import { describe, expect, it } from "vitest"

import { ApiError, getApiErrorMessage, isApiError, unwrap } from "@/lib/api"

describe("getApiErrorMessage", () => {
  it("lấy nguyên văn thông báo của BE (kể cả 422 nghiệp vụ)", () => {
    expect(getApiErrorMessage(new ApiError(422, "Người dùng không hoạt động"))).toBe("Người dùng không hoạt động")
  })

  it("dùng fallback khi BE không có thông báo", () => {
    expect(getApiErrorMessage(new ApiError(500, ""), "Lỗi X")).toBe("Lỗi X")
    expect(getApiErrorMessage("lạ", "Lỗi X")).toBe("Lỗi X")
  })

  it("lỗi mạng (TypeError của fetch) có thông báo riêng", () => {
    expect(getApiErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Không thể kết nối đến máy chủ. Vui lòng thử lại."
    )
  })
})

describe("isApiError", () => {
  it("kiểm tra cả mã trạng thái khi truyền status", () => {
    const error = new ApiError(404, "x")
    expect(isApiError(error)).toBe(true)
    expect(isApiError(error, 404)).toBe(true)
    expect(isApiError(error, 401)).toBe(false)
    expect(isApiError(new Error("x"))).toBe(false)
  })
})

describe("unwrap", () => {
  it("trả data khi response ok", () => {
    expect(unwrap({ data: { a: 1 }, response: new Response("{}", { status: 200 }) })).toEqual({ a: 1 })
  })

  it("ném ApiError, nối mảng thông báo của lỗi 400", () => {
    const run = () => unwrap({ error: { message: ["Sai A.", "Sai B."] }, response: new Response("", { status: 400 }) })
    expect(run).toThrow(ApiError)
    expect(run).toThrow("Sai A. Sai B.")
  })
})
