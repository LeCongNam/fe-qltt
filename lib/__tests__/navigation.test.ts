import { describe, expect, it } from "vitest"

import { canSee, getRouteRoles, isActivePath, isFitPage } from "@/lib/navigation"

describe("isActivePath", () => {
  it("trang chủ chỉ khớp đúng /", () => {
    expect(isActivePath("/", "/")).toBe(true)
    expect(isActivePath("/sach", "/")).toBe(false)
  })

  it("khớp chính nó và trang con, không khớp tiền tố chữ cái", () => {
    expect(isActivePath("/sach", "/sach")).toBe(true)
    expect(isActivePath("/sach/12", "/sach")).toBe(true)
    expect(isActivePath("/sachmoi", "/sach")).toBe(false)
  })
})

describe("canSee", () => {
  it("không khai báo roles thì ai cũng thấy", () => {
    expect(canSee(undefined, "BAN_DOC")).toBe(true)
    expect(canSee(undefined, undefined)).toBe(true)
  })

  it("có roles thì phải đúng vai trò; chưa đăng nhập thì không", () => {
    expect(canSee(["ADMIN", "THU_THU"], "THU_THU")).toBe(true)
    expect(canSee(["ADMIN", "THU_THU"], "BAN_DOC")).toBe(false)
    expect(canSee(["ADMIN"], undefined)).toBe(false)
  })
})

describe("getRouteRoles", () => {
  it("lấy quyền của route khớp dài nhất", () => {
    expect(getRouteRoles("/sach/moi")).toEqual(["ADMIN", "THU_THU"])
    expect(getRouteRoles("/bao-cao")).toEqual(["ADMIN", "THU_THU"])
  })

  it("route mở cho mọi tài khoản trả undefined", () => {
    expect(getRouteRoles("/me")).toBeUndefined()
    expect(getRouteRoles("/khong-co-trang-nay")).toBeUndefined()
  })
})

describe("isFitPage", () => {
  it("chỉ gồm các trang bảng, không gồm trang chi tiết hay trang nhiều khối", () => {
    for (const p of ["/sach", "/nguoi-dung", "/phieu-muon", "/dat-truoc", "/phat", "/the-loai", "/tac-gia", "/nha-xuat-ban", "/bao-cao", "/sach/"]) {
      expect(isFitPage(p)).toBe(true)
    }
    for (const p of ["/", "/me", "/demo", "/sach/moi", "/sach/12", "/phieu-muon/PM001"]) {
      expect(isFitPage(p)).toBe(false)
    }
  })
})
