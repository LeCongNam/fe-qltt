/**
 * Thời điểm hết hạn (ms từ epoch) của JWT, đọc từ claim `exp` ở phần payload.
 * Chỉ để FE biết sớm phiên đã hết hạn; không xác thực chữ ký (BE mới là nơi kiểm tra, trả 401).
 * Token sai định dạng hoặc không có `exp` trả `null` (coi như không biết hạn, để BE quyết định).
 */
export function getTokenExpiry(token: string): number | null {
  const payload = token.split(".")[1]
  if (!payload) return null
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      Array.from(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
        (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`
      ).join("")
    )
    const exp = (JSON.parse(json) as { exp?: unknown }).exp
    return typeof exp === "number" && Number.isFinite(exp) ? exp * 1000 : null
  } catch {
    return null
  }
}
