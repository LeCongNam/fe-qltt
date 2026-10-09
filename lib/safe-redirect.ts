/**
 * Chỉ nhận đường dẫn nội bộ làm đích quay lại sau đăng nhập (chống open redirect): phải bắt đầu bằng một `/`,
 * không phải `//host` hay `/\host`, không chứa ký tự điều khiển, và không quay lại chính trang `/login`.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null
  if (/[\u0000-\u001f\u007f]/.test(raw)) return null
  if (raw === "/login" || raw.startsWith("/login?") || raw.startsWith("/login/")) return null
  return raw
}
