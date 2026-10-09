import type { Schemas } from "@/lib/api"

export type TrangThaiPhieuMuon = Schemas["TrangThaiPhieuMuon"]
export type TinhTrangTra = Schemas["TinhTrangTra"]
export type TrangThaiPhat = Schemas["TrangThaiPhieuPhat"]
export type TrangThaiDatTruoc = Schemas["TrangThaiDatTruoc"]

export const TRANG_THAI_PHIEU_MUON: { value: TrangThaiPhieuMuon; label: string; tone: string }[] = [
  { value: "DANG_MUON", label: "Đang mượn", tone: "bg-warning-soft text-warning" },
  { value: "HOAN_TAT", label: "Hoàn tất", tone: "bg-primary-soft text-primary-strong" },
  { value: "HUY", label: "Đã hủy", tone: "bg-neutral-soft text-muted-foreground" },
]

export const TINH_TRANG_TRA: { value: TinhTrangTra; label: string; tone: string }[] = [
  { value: "BINH_THUONG", label: "Bình thường", tone: "bg-primary-soft text-primary-strong" },
  { value: "HU_HONG", label: "Hư hỏng", tone: "bg-destructive-soft text-destructive" },
  { value: "MAT", label: "Mất", tone: "bg-lost-soft text-lost" },
]

export const LOAI_PHAT: { value: Schemas["LoaiPhat"]; label: string }[] = [
  { value: "QUA_HAN", label: "Trả quá hạn" },
  { value: "HU_HONG", label: "Hư hỏng" },
  { value: "MAT_SACH", label: "Mất sách" },
]

export const TRANG_THAI_PHAT: { value: TrangThaiPhat; label: string; tone: string }[] = [
  { value: "CHUA_THANH_TOAN", label: "Chưa thanh toán", tone: "bg-warning-soft text-warning" },
  { value: "DA_THANH_TOAN", label: "Đã thanh toán", tone: "bg-primary-soft text-primary-strong" },
  { value: "HUY", label: "Đã hủy", tone: "bg-neutral-soft text-muted-foreground" },
]

export const TRANG_THAI_DAT_TRUOC: { value: TrangThaiDatTruoc; label: string; tone: string }[] = [
  { value: "CHO_XU_LY", label: "Chờ xử lý", tone: "bg-hold-soft text-hold" },
  { value: "SAN_SANG_NHAN", label: "Sẵn sàng nhận", tone: "bg-primary-soft text-primary-strong" },
  { value: "DA_NHAN", label: "Đã nhận", tone: "bg-neutral-soft text-muted-foreground" },
  { value: "HUY", label: "Đã hủy", tone: "bg-neutral-soft text-muted-foreground" },
  { value: "HET_HAN", label: "Hết hạn", tone: "bg-destructive-soft text-destructive" },
]

/** Ngày hôm nay dạng YYYY-MM-DD theo giờ máy (hạn trả của BE là DATE, không có múi giờ). */
export function todayIso() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Lượt mượn đang mở và đã quá hạn trả. */
export function isOverdue(hanTra: string, ngayTra: string | null) {
  return ngayTra === null && hanTra.slice(0, 10) < todayIso()
}
