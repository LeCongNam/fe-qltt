import type { Schemas } from "@/lib/api"

export type LoaiNguoiDung = Schemas["LoaiNguoiDung"]
export type TrangThaiNguoiDung = Schemas["TrangThaiNguoiDung"]
export type TrangThaiTaiKhoan = Schemas["TrangThaiTaiKhoan"]
export type VaiTroTaiKhoan = Schemas["VaiTroTaiKhoan"]
export type NguoiDungChiTiet = Schemas["NguoiDungChiTietDto"]
export type TaiKhoanCongKhai = Schemas["TaiKhoanCongKhaiDto"]

export const LOAI_NGUOI_DUNG: { value: LoaiNguoiDung; label: string }[] = [
  { value: "SINH_VIEN", label: "Sinh viên" },
  { value: "GIANG_VIEN", label: "Giảng viên" },
  { value: "CAN_BO", label: "Cán bộ" },
]

export const TRANG_THAI_NGUOI_DUNG: { value: TrangThaiNguoiDung; label: string; tone: string }[] = [
  { value: "HOAT_DONG", label: "Hoạt động", tone: "bg-primary-soft text-primary-strong" },
  { value: "TAM_KHOA", label: "Tạm khóa", tone: "bg-warning-soft text-warning" },
  { value: "NGUNG", label: "Ngừng", tone: "bg-neutral-soft text-muted-foreground" },
]

export const TRANG_THAI_TAI_KHOAN: { value: TrangThaiTaiKhoan; label: string; tone: string }[] = [
  { value: "HOAT_DONG", label: "Hoạt động", tone: "bg-primary-soft text-primary-strong" },
  { value: "KHOA", label: "Đã khóa", tone: "bg-destructive-soft text-destructive" },
]

export const VAI_TRO: { value: VaiTroTaiKhoan; label: string }[] = [
  { value: "ADMIN", label: "Quản trị" },
  { value: "THU_THU", label: "Thủ thư" },
  { value: "BAN_DOC", label: "Bạn đọc" },
]

export const labelOf = <T extends { value: string; label: string }>(list: T[], value: string) =>
  list.find((x) => x.value === value)?.label ?? value
