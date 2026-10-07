"use client"

import { DanhMucPage, type DanhMucConfig } from "@/components/danh-muc/danh-muc-page"
import type { Schemas } from "@/lib/api"

type TacGia = Schemas["TacGiaDto"]

const config: DanhMucConfig<TacGia> = {
  endpoint: "/tac-gia",
  singular: "tác giả",
  title: "Tác giả",
  description: "Quản lý tác giả của các đầu sách.",
  fields: [
    { name: "maTacGia", label: "Mã tác giả", required: true, maxLength: 20, placeholder: "Ví dụ: TG001" },
    { name: "tenTacGia", label: "Tên tác giả", required: true, maxLength: 160, placeholder: "Nhập tên tác giả" },
    { name: "quocTich", label: "Quốc tịch", maxLength: 80 },
    { name: "namSinh", label: "Năm sinh", kind: "number", placeholder: "Ví dụ: 1975" },
  ],
  columns: [
    { header: "Mã", cell: (r) => r.maTacGia, className: "w-28 font-medium" },
    { header: "Tên tác giả", cell: (r) => r.tenTacGia },
    { header: "Quốc tịch", cell: (r) => r.quocTich ?? "—", className: "text-muted-foreground" },
    { header: "Năm sinh", cell: (r) => r.namSinh ?? "—", className: "w-28 text-muted-foreground" },
  ],
  labelOf: (r) => r.tenTacGia,
  toFormValues: (r) => ({
    maTacGia: r.maTacGia,
    tenTacGia: r.tenTacGia,
    quocTich: r.quocTich ?? "",
    namSinh: r.namSinh == null ? "" : String(r.namSinh),
  }),
}

export default function TacGiaPage() {
  return <DanhMucPage config={config} />
}
