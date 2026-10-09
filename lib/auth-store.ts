import type { components } from "@/lib/api-types"
import { getTokenExpiry } from "@/lib/jwt"

export type SessionUser = components["schemas"]["LoginUserDto"]
export type VaiTro = components["schemas"]["VaiTroTaiKhoan"]
export type Session = { accessToken: string; user: SessionUser }

type Snapshot = { ready: boolean; session: Session | null }

/** Vì sao phiên kết thúc: `logout` do người dùng bấm; hai lý do còn lại hiện thông báo ở trang đăng nhập. */
export type SessionEndReason = "logout" | "expired" | "unauthorized"

const STORAGE_KEY = "qltt.session"
const SERVER_SNAPSHOT: Snapshot = { ready: false, session: null }

const listeners = new Set<() => void>()
let snapshot: Snapshot | null = null
let endReason: SessionEndReason | null = null
let expiryTimer: ReturnType<typeof setTimeout> | undefined

// setTimeout lưu độ trễ 32 bit có dấu; quá giới hạn thì chạy ngay.
const MAX_TIMEOUT = 2 ** 31 - 1

function isExpired(session: Session) {
  const expiry = getTokenExpiry(session.accessToken)
  return expiry !== null && expiry <= Date.now()
}

function readStorage(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const session = raw ? (JSON.parse(raw) as Session) : null
    if (session && isExpired(session)) {
      // Token đã hết hạn từ lần trước: bỏ luôn, trang đăng nhập sẽ báo lý do.
      window.localStorage.removeItem(STORAGE_KEY)
      endReason = "expired"
      return null
    }
    return session
  } catch {
    return null
  }
}

/** Hẹn giờ xóa phiên đúng lúc token hết hạn (không cần chờ một request bị 401). */
function scheduleExpiry(session: Session | null) {
  clearTimeout(expiryTimer)
  const expiry = session ? getTokenExpiry(session.accessToken) : null
  if (expiry === null) return
  expiryTimer = setTimeout(
    () => {
      if (snapshot?.session === session) clearSession("expired")
    },
    Math.min(Math.max(expiry - Date.now(), 0), MAX_TIMEOUT)
  )
}

function publish(session: Session | null) {
  snapshot = { ready: true, session }
  scheduleExpiry(session)
  listeners.forEach((listener) => listener())
}

// Các hàm getSnapshot/subscribe dùng cho useSyncExternalStore; snapshot phải ổn định giữa các lần gọi.
export function getSnapshot(): Snapshot {
  if (!snapshot) {
    snapshot = { ready: true, session: readStorage() }
    scheduleExpiry(snapshot.session)
  }
  return snapshot
}

export function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function saveSession(session: Session) {
  endReason = null
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Trình duyệt chặn storage: phiên chỉ sống trong bộ nhớ.
  }
  publish(session)
}

export function clearSession(reason: SessionEndReason = "logout") {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // bỏ qua
  }
  // Nhiều request cùng 401 liên tiếp: giữ lý do đầu tiên.
  endReason ??= reason
  publish(null)
}

/** Lý do phiên vừa kết thúc, để AuthGuard đưa vào URL `/login`. Không xóa khi đọc (effect chạy hai lần ở StrictMode). */
export function getSessionEndReason(): SessionEndReason | null {
  return endReason
}

/** Trang đăng nhập gọi sau khi đã đọc lý do từ URL, để lần vào `/login` sau không bị báo lại. */
export function clearSessionEndReason() {
  endReason = null
}

// Tab nằm nền có thể bị trình duyệt làm chậm timer: khi quay lại tab thì kiểm tra hạn ngay.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const session = snapshot?.session
    if (document.visibilityState === "visible" && session && isExpired(session)) clearSession("expired")
  })
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return getSnapshot().session?.accessToken ?? null
}
