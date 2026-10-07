/** Ngày DATE của BE dạng ISO (`2026-10-07T00:00:00.000Z`): hiển thị theo ngày, không đổi múi giờ. */
export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—"
  const [y, m, d] = iso.slice(0, 10).split("-")
  return `${d}/${m}/${y}`
}

/** Giá tiền VND; BE trả chuỗi thập phân ("95000.00") hoặc null. */
export function formatVnd(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—"
  return `${new Intl.NumberFormat("vi-VN").format(Number(value))} ₫`
}

/** Chữ cái đầu của họ và tên (hoặc 2 ký tự đầu nếu chỉ có một từ), viết hoa; dùng cho avatar. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2) ?? "").toUpperCase()
}
