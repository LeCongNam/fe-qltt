import { describe, expect, it } from "vitest"

import { safeNextPath } from "@/lib/safe-redirect"

describe("safeNextPath", () => {
  it("nhận đường dẫn nội bộ, giữ query và hash", () => {
    expect(safeNextPath("/phat")).toBe("/phat")
    expect(safeNextPath("/sach?tuKhoa=java&page=2")).toBe("/sach?tuKhoa=java&page=2")
    expect(safeNextPath("/")).toBe("/")
  })

  it("từ chối giá trị rỗng hoặc không bắt đầu bằng /", () => {
    expect(safeNextPath(null)).toBeNull()
    expect(safeNextPath(undefined)).toBeNull()
    expect(safeNextPath("")).toBeNull()
    expect(safeNextPath("phat")).toBeNull()
    expect(safeNextPath("https://evil.example/phat")).toBeNull()
    expect(safeNextPath("javascript:alert(1)")).toBeNull()
  })

  it("từ chối URL cùng giao thức tới máy chủ khác", () => {
    expect(safeNextPath("//evil.example")).toBeNull()
    expect(safeNextPath("/\\evil.example")).toBeNull()
  })

  it("từ chối ký tự điều khiển", () => {
    expect(safeNextPath("/phat\r\nSet-Cookie: x=1")).toBeNull()
  })

  it("không quay lại chính trang đăng nhập", () => {
    expect(safeNextPath("/login")).toBeNull()
    expect(safeNextPath("/login?reason=expired")).toBeNull()
    expect(safeNextPath("/loginx")).toBe("/loginx")
  })
})
