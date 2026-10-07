import type { Schemas } from "@/lib/api"

export type TinhTrangBanSach = Schemas["BanSachDto"]["tinhTrang"]

export const NGON_NGU = ["Tiếng Việt", "English", "Français", "日本語", "中文", "Khác"] as const

export const TINH_TRANG_BAN_SACH: { value: TinhTrangBanSach; label: string; tone: string }[] = [
  { value: "SAN_SANG", label: "Sẵn sàng", tone: "bg-[#e6f3ee] text-[#0f6a52]" },
  { value: "DANG_MUON", label: "Đang mượn", tone: "bg-[#fff3df] text-[#9a6412]" },
  { value: "DANG_GIU", label: "Đang giữ", tone: "bg-[#e8eefb] text-[#3a5fb0]" },
  { value: "HU_HONG", label: "Hư hỏng", tone: "bg-[#fbe9e5] text-[#b34a38]" },
  { value: "MAT", label: "Mất", tone: "bg-[#f1e6e6] text-[#8c3b3b]" },
  { value: "NGUNG_PHUC_VU", label: "Ngừng phục vụ", tone: "bg-[#eceeeb] text-[#5f6b64]" },
]
