"use client"

import { DanhMucPage, type DanhMucConfig } from "@/components/danh-muc/danh-muc-page"
import { nhaXuatBanApi } from "@/features/danh-muc/api"
import type { Schemas } from "@/lib/api"

type NhaXuatBan = Schemas["NhaXuatBanDto"]

const config: DanhMucConfig<NhaXuatBan, Schemas["CreateNhaXuatBanDto"]> = {
  kind: "nha-xuat-ban",
  api: nhaXuatBanApi,
  singular: "nhà xuất bản",
  title: "Nhà xuất bản",
  description: "Quản lý các nhà xuất bản có sách trong thư viện.",
  fields: [
    { name: "maNxb", label: "Mã NXB", required: true, maxLength: 20, placeholder: "Ví dụ: NXB001" },
    { name: "tenNxb", label: "Tên nhà xuất bản", required: true, maxLength: 160, placeholder: "Nhập tên nhà xuất bản" },
    { name: "email", label: "Email", kind: "email", maxLength: 120, placeholder: "lienhe@nxb.vn" },
    { name: "sdt", label: "Số điện thoại", maxLength: 20 },
    { name: "diaChi", label: "Địa chỉ", maxLength: 255, fullWidth: true },
  ],
  columns: [
    { header: "Mã", cell: (r) => r.maNxb, className: "w-28 font-medium" },
    { header: "Tên nhà xuất bản", cell: (r) => r.tenNxb },
    { header: "Email", cell: (r) => r.email ?? "—", className: "text-muted-foreground" },
    { header: "Điện thoại", cell: (r) => r.sdt ?? "—", className: "text-muted-foreground" },
    { header: "Địa chỉ", cell: (r) => r.diaChi ?? "—", className: "text-muted-foreground" },
  ],
  labelOf: (r) => r.tenNxb,
  toFormValues: (r) => ({
    maNxb: r.maNxb,
    tenNxb: r.tenNxb,
    email: r.email ?? "",
    sdt: r.sdt ?? "",
    diaChi: r.diaChi ?? "",
  }),
}

export default function NhaXuatBanPage() {
  return <DanhMucPage config={config} />
}
