import type { Schemas } from "@/lib/api"

export type TrangThaiPhieuMuon = Schemas["TrangThaiPhieuMuon"]
export type TinhTrangTra = Schemas["TinhTrangTra"]
export type TrangThaiPhat = Schemas["TrangThaiPhieuPhat"]
export type TrangThaiDatTruoc = Schemas["TrangThaiDatTruoc"]

export const TRANG_THAI_PHIEU_MUON: { value: TrangThaiPhieuMuon; label: string; tone: string }[] = [
  { value: "DANG_MUON", label: "Đang mượn", tone: "bg-[#fff3df] text-[#9a6412]" },
  { value: "HOAN_TAT", label: "Hoàn tất", tone: "bg-[#e6f3ee] text-[#147d64]" },
  { value: "HUY", label: "Đã hủy", tone: "bg-[#eceeeb] text-[#5f6b64]" },
]

export const TINH_TRANG_TRA: { value: TinhTrangTra; label: string; tone: string }[] = [
  { value: "BINH_THUONG", label: "Bình thường", tone: "bg-[#e6f3ee] text-[#147d64]" },
  { value: "HU_HONG", label: "Hư hỏng", tone: "bg-[#fbe9e5] text-[#b34a38]" },
  { value: "MAT", label: "Mất", tone: "bg-[#f1e6e6] text-[#8c3b3b]" },
]

export const LOAI_PHAT: { value: Schemas["LoaiPhat"]; label: string }[] = [
  { value: "QUA_HAN", label: "Trả quá hạn" },
  { value: "HU_HONG", label: "Hư hỏng" },
  { value: "MAT_SACH", label: "Mất sách" },
]

export const TRANG_THAI_PHAT: { value: TrangThaiPhat; label: string; tone: string }[] = [
  { value: "CHUA_THANH_TOAN", label: "Chưa thanh toán", tone: "bg-[#fff3df] text-[#9a6412]" },
  { value: "DA_THANH_TOAN", label: "Đã thanh toán", tone: "bg-[#e6f3ee] text-[#147d64]" },
  { value: "HUY", label: "Đã hủy", tone: "bg-[#eceeeb] text-[#5f6b64]" },
]

export const TRANG_THAI_DAT_TRUOC: { value: TrangThaiDatTruoc; label: string; tone: string }[] = [
  { value: "CHO_XU_LY", label: "Chờ xử lý", tone: "bg-[#e8eefb] text-[#3a5fb0]" },
  { value: "SAN_SANG_NHAN", label: "Sẵn sàng nhận", tone: "bg-[#e6f3ee] text-[#147d64]" },
  { value: "DA_NHAN", label: "Đã nhận", tone: "bg-[#eceeeb] text-[#5f6b64]" },
  { value: "HUY", label: "Đã hủy", tone: "bg-[#eceeeb] text-[#5f6b64]" },
  { value: "HET_HAN", label: "Hết hạn", tone: "bg-[#fbe9e5] text-[#b34a38]" },
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
