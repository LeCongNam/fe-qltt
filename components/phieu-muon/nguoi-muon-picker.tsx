"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Loader2, Search, X } from "lucide-react"

import { LOAI_NGUOI_DUNG, TRANG_THAI_NGUOI_DUNG, labelOf } from "@/components/nguoi-dung/nguoi-dung-meta"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useDebounced } from "@/hooks/use-debounced"
import { apiClient, getApiErrorMessage, type Paged, type Schemas } from "@/lib/api"

export type NguoiMuon = Schemas["NguoiDungDto"]

const MIN_CHARS = 2

/** Tra cứu người mượn theo mã / họ tên / email, hiện thông tin để xác nhận trước khi lập phiếu. */
export function NguoiMuonPicker({ value, onChange }: { value: NguoiMuon | null; onChange: (nguoi: NguoiMuon | null) => void }) {
  const [text, setText] = useState("")
  const q = useDebounced(text.trim(), 300)
  const searching = value === null && q.length >= MIN_CHARS

  const results = useQuery({
    queryKey: ["/docgia", "chon-nguoi-muon", q],
    enabled: searching,
    queryFn: async () => (await apiClient.get<Paged<NguoiMuon>>("/docgia", { params: { tuKhoa: q, limit: 6 } })).data,
  })
  const rows = searching && !results.isPending ? (results.data?.data ?? []) : []
  // Kết quả của từ khóa cũ không còn khớp với ô nhập (đang chờ debounce) thì không cho Enter chọn nhầm.
  const fresh = q === text.trim()

  function pick(nguoi: NguoiMuon) {
    onChange(nguoi)
    setText("")
  }

  function onEnter() {
    if (!fresh || results.isPending) return
    const exact = rows.find((r) => r.maNguoiDung.toUpperCase() === text.trim().toUpperCase())
    if (exact) pick(exact)
    else if (rows.length === 1) pick(rows[0])
  }

  if (value) {
    const trangThai = TRANG_THAI_NGUOI_DUNG.find((t) => t.value === value.trangThai)
    const khongMuonDuoc = value.trangThai !== "HOAT_DONG"
    return (
      <Field>
        <FieldLabel>Người mượn</FieldLabel>
        <p role="status" className="sr-only">Đã chọn người mượn {value.hoTen}, {value.maNguoiDung}</p>
        <div className="rounded-lg border border-[#dfe5df] bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#293a32]">{value.hoTen}</p>
              <p className="mt-0.5 text-xs text-[#5f6b64]">
                {value.maNguoiDung} · {labelOf(LOAI_NGUOI_DUNG, value.loaiNguoiDung)}
                {value.khoaDonVi ? ` · ${value.khoaDonVi}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {trangThai && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trangThai.tone}`}>{trangThai.label}</span>}
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} aria-label="Đổi người mượn">
                <X aria-hidden="true" />
                Đổi
              </Button>
            </div>
          </div>
          {khongMuonDuoc && (
            <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-[#a35143]">
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              Tài khoản này đang {trangThai?.label.toLowerCase() ?? "không hoạt động"}, không thể lập phiếu mượn.
            </p>
          )}
        </div>
      </Field>
    )
  }

  return (
    <Field>
      <FieldLabel htmlFor="pm-nguoi-dung">
        Người mượn <span aria-hidden="true" className="text-[#a35143]">*</span>
      </FieldLabel>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9690]" aria-hidden="true" />
        <Input
          id="pm-nguoi-dung"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onEnter()
            }
          }}
          maxLength={50}
          autoComplete="off"
          placeholder="Mã, họ tên hoặc email, ví dụ SV001"
          className="h-10 rounded-md border-[#dfe5df] bg-white pl-9 text-sm"
        />
        {searching && results.isFetching && <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[#8b9690]" aria-hidden="true" />}
      </div>
      <FieldDescription>Nhập từ {MIN_CHARS} ký tự rồi chọn người mượn từ danh sách (hoặc nhấn Enter nếu mã khớp).</FieldDescription>
      {searching && results.isError && (
        <p role="alert" className="text-xs text-[#a35143]">{getApiErrorMessage(results.error)}</p>
      )}
      <p role="status" className="sr-only">
        {searching && fresh && !results.isPending && !results.isError ? (rows.length === 0 ? `Không tìm thấy người dùng nào khớp ${q}` : `${rows.length} người phù hợp`) : ""}
      </p>
      {searching && !results.isPending && !results.isError && (
        rows.length === 0 ? (
          <p className="text-xs text-[#5f6b64]">Không tìm thấy người dùng nào khớp “{q}”.</p>
        ) : (
          <ul aria-label="Kết quả tìm người mượn" className="max-w-sm divide-y divide-[#eef0ec] overflow-hidden rounded-lg border border-[#dfe5df] bg-white">
            {rows.map((r) => {
              const trangThai = TRANG_THAI_NGUOI_DUNG.find((t) => t.value === r.trangThai)
              return (
                <li key={r.id}>
                  <button type="button" onClick={() => pick(r)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-[#f6f8f5] focus-visible:bg-[#f6f8f5] focus-visible:outline-none">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#293a32]">{r.hoTen}</span>
                      <span className="block text-xs text-[#5f6b64]">{r.maNguoiDung} · {labelOf(LOAI_NGUOI_DUNG, r.loaiNguoiDung)}</span>
                    </span>
                    {trangThai && r.trangThai !== "HOAT_DONG" && <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${trangThai.tone}`}>{trangThai.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )
      )}
    </Field>
  )
}
