"use client"

import { DanhMucPage, type DanhMucConfig } from "@/components/danh-muc/danh-muc-page"
import type { Schemas } from "@/lib/api"

type TheLoai = Schemas["TheLoaiDto"]

const config: DanhMucConfig<TheLoai> = {
  endpoint: "/the-loai",
  singular: "thể loại",
  title: "Thể loại",
  description: "Quản lý các thể loại sách trong thư viện.",
  fields: [
    { name: "maTheLoai", label: "Mã thể loại", required: true, maxLength: 20, placeholder: "Ví dụ: TL001" },
    { name: "tenTheLoai", label: "Tên thể loại", required: true, maxLength: 120, placeholder: "Nhập tên thể loại" },
    { name: "moTa", label: "Mô tả", maxLength: 255, fullWidth: true },
  ],
  columns: [
    { header: "Mã", cell: (r) => r.maTheLoai, className: "w-32 font-medium" },
    { header: "Tên thể loại", cell: (r) => r.tenTheLoai },
    { header: "Mô tả", cell: (r) => r.moTa ?? "—", className: "text-muted-foreground" },
  ],
  labelOf: (r) => r.tenTheLoai,
  toFormValues: (r) => ({ maTheLoai: r.maTheLoai, tenTheLoai: r.tenTheLoai, moTa: r.moTa ?? "" }),
}

export default function TheLoaiPage() {
  return <DanhMucPage config={config} />
}
