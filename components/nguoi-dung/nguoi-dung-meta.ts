import type { Schemas } from "@/lib/api"

export type LoaiNguoiDung = Schemas["LoaiNguoiDung"]
export type TrangThaiNguoiDung = Schemas["TrangThaiNguoiDung"]
export type TrangThaiTaiKhoan = Schemas["TrangThaiTaiKhoan"]
export type VaiTroTaiKhoan = Schemas["VaiTroTaiKhoan"]

export const LOAI_NGUOI_DUNG: { value: LoaiNguoiDung; label: string }[] = [
  { value: "SINH_VIEN", label: "Sinh viên" },
  { value: "GIANG_VIEN", label: "Giảng viên" },
  { value: "CAN_BO", label: "Cán bộ" },
]

export const TRANG_THAI_NGUOI_DUNG: { value: TrangThaiNguoiDung; label: string; tone: string }[] = [
  { value: "HOAT_DONG", label: "Hoạt động", tone: "bg-[#e6f3ee] text-[#0f6a52]" },
  { value: "TAM_KHOA", label: "Tạm khóa", tone: "bg-[#fff3df] text-[#9a6412]" },
  { value: "NGUNG", label: "Ngừng", tone: "bg-[#eceeeb] text-[#5f6b64]" },
]

export const TRANG_THAI_TAI_KHOAN: { value: TrangThaiTaiKhoan; label: string; tone: string }[] = [
  { value: "HOAT_DONG", label: "Hoạt động", tone: "bg-[#e6f3ee] text-[#0f6a52]" },
  { value: "KHOA", label: "Đã khóa", tone: "bg-[#fbe9e5] text-[#b34a38]" },
]

export const VAI_TRO: { value: VaiTroTaiKhoan; label: string }[] = [
  { value: "ADMIN", label: "Quản trị" },
  { value: "THU_THU", label: "Thủ thư" },
  { value: "BAN_DOC", label: "Bạn đọc" },
]

export const labelOf = <T extends { value: string; label: string }>(list: T[], value: string) =>
  list.find((x) => x.value === value)?.label ?? value
