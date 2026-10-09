import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { Session } from "@/lib/auth-store"

function tokenExpiringAt(expMs: number) {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url")
  return `${b64({ alg: "HS256" })}.${b64({ exp: Math.floor(expMs / 1000) })}.sig`
}

function sessionExpiringAt(expMs: number): Session {
  return {
    accessToken: tokenExpiringAt(expMs),
    user: { maNguoiDung: "AD001", hoTen: "Quản trị", vaiTro: "ADMIN" } as Session["user"],
  }
}

function fakeStorage(initial?: Session) {
  const data = new Map<string, string>()
  if (initial) data.set("qltt.session", JSON.stringify(initial))
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    },
  })
  return data
}

// Store giữ trạng thái ở cấp module nên nạp lại cho từng test.
async function loadStore() {
  vi.resetModules()
  return import("@/lib/auth-store")
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-10-07T00:00:00Z"))
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("auth-store: hạn token", () => {
  it("phiên lưu từ trước đã hết hạn thì bỏ, báo lý do expired", async () => {
    const data = fakeStorage(sessionExpiringAt(Date.now() - 1000))
    const store = await loadStore()
    expect(store.getSnapshot().session).toBeNull()
    expect(data.has("qltt.session")).toBe(false)
    expect(store.getSessionEndReason()).toBe("expired")
  })

  it("phiên còn hạn được giữ nguyên", async () => {
    const session = sessionExpiringAt(Date.now() + 60_000)
    fakeStorage(session)
    const store = await loadStore()
    expect(store.getSnapshot().session).toEqual(session)
    expect(store.getSessionEndReason()).toBeNull()
  })

  it("tự xóa phiên đúng lúc token hết hạn", async () => {
    fakeStorage()
    const store = await loadStore()
    store.saveSession(sessionExpiringAt(Date.now() + 5000))
    expect(store.getSnapshot().session).not.toBeNull()
    vi.advanceTimersByTime(5001)
    expect(store.getSnapshot().session).toBeNull()
    expect(store.getSessionEndReason()).toBe("expired")
  })

  it("token không có exp thì không hẹn giờ (BE quyết định bằng 401)", async () => {
    fakeStorage()
    const store = await loadStore()
    store.saveSession({ accessToken: "khong-phai-jwt", user: sessionExpiringAt(0).user })
    vi.advanceTimersByTime(24 * 3600 * 1000)
    expect(store.getSnapshot().session).not.toBeNull()
  })
})

describe("auth-store: lý do kết thúc phiên", () => {
  it("giữ lý do đầu tiên khi nhiều request cùng 401", async () => {
    fakeStorage()
    const store = await loadStore()
    store.saveSession(sessionExpiringAt(Date.now() + 60_000))
    store.clearSession("unauthorized")
    store.clearSession("unauthorized")
    expect(store.getSessionEndReason()).toBe("unauthorized")
  })

  it("đăng xuất mặc định là logout; đăng nhập lại xóa lý do cũ", async () => {
    fakeStorage()
    const store = await loadStore()
    store.clearSession()
    expect(store.getSessionEndReason()).toBe("logout")
    store.saveSession(sessionExpiringAt(Date.now() + 60_000))
    expect(store.getSessionEndReason()).toBeNull()
  })

  it("clearSessionEndReason xóa lý do để lần vào /login sau không báo lại", async () => {
    fakeStorage()
    const store = await loadStore()
    store.clearSession("expired")
    store.clearSessionEndReason()
    expect(store.getSessionEndReason()).toBeNull()
  })
})
