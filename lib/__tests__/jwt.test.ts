import { describe, expect, it } from "vitest"

import { getTokenExpiry } from "@/lib/jwt"

function jwt(payload: object) {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url")
  return `${b64({ alg: "HS256" })}.${b64(payload)}.chu-ky`
}

describe("getTokenExpiry", () => {
  it("đổi claim exp (giây) sang mili giây", () => {
    expect(getTokenExpiry(jwt({ exp: 1_800_000_000 }))).toBe(1_800_000_000_000)
  })

  it("đọc được payload có tiếng Việt (UTF-8)", () => {
    expect(getTokenExpiry(jwt({ hoTen: "Nguyễn Văn Ấn", exp: 10 }))).toBe(10_000)
  })

  it("không có exp hoặc exp không phải số thì trả null", () => {
    expect(getTokenExpiry(jwt({ sub: "1" }))).toBeNull()
    expect(getTokenExpiry(jwt({ exp: "soon" }))).toBeNull()
  })

  it("token sai định dạng thì trả null, không ném lỗi", () => {
    expect(getTokenExpiry("")).toBeNull()
    expect(getTokenExpiry("abc")).toBeNull()
    expect(getTokenExpiry("a.%%%.c")).toBeNull()
    expect(getTokenExpiry("a.bm90LWpzb24.c")).toBeNull()
  })
})
