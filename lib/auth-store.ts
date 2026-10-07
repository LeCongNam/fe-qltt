import type { components } from "@/lib/api-types"

export type SessionUser = components["schemas"]["LoginUserDto"]
export type VaiTro = components["schemas"]["VaiTroTaiKhoan"]
export type Session = { accessToken: string; user: SessionUser }

type Snapshot = { ready: boolean; session: Session | null }

const STORAGE_KEY = "qltt.session"
const SERVER_SNAPSHOT: Snapshot = { ready: false, session: null }

const listeners = new Set<() => void>()
let snapshot: Snapshot | null = null

function readStorage(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function publish(session: Session | null) {
  snapshot = { ready: true, session }
  listeners.forEach((listener) => listener())
}

// Các hàm getSnapshot/subscribe dùng cho useSyncExternalStore; snapshot phải ổn định giữa các lần gọi.
export function getSnapshot(): Snapshot {
  return (snapshot ??= { ready: true, session: readStorage() })
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
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Trình duyệt chặn storage: phiên chỉ sống trong bộ nhớ.
  }
  publish(session)
}

export function clearSession() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // bỏ qua
  }
  publish(null)
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return getSnapshot().session?.accessToken ?? null
}
