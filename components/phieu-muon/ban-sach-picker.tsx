"use client"

import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"

import { TINH_TRANG_BAN_SACH } from "@/components/sach/sach-meta"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { type BanSachInfo, useBanSachIndex } from "@/features/sach/ban-sach-index"

export const MAX_BAN = 20
const MAX_GOI_Y = 8
/** Tình trạng có thể đưa vào phiếu mượn; bản đang giữ có thể là bản đã giữ cho chính người mượn, BE quyết định. */
const MUON_DUOC = new Set(["SAN_SANG", "DANG_GIU"])

const bo_dau = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase()
const tinhTrangOf = (v: string) => TINH_TRANG_BAN_SACH.find((t) => t.value === v)

/** Chọn các bản sách cho phiếu: nhập mã rồi Enter (hợp máy quét mã vạch) hoặc gõ tên sách để chọn từ gợi ý. */
export function BanSachPicker({ value, onChange }: { value: string[]; onChange: (maBans: string[]) => void }) {
  const [text, setText] = useState("")
  const [note, setNote] = useState("")
  const index = useBanSachIndex()
  const map = index.data

  const q = bo_dau(text.trim())
  const goiY: BanSachInfo[] =
    map && q
      ? [...map.values()]
          .filter((i) => MUON_DUOC.has(i.ban.tinhTrang) && !value.includes(i.ban.maBanSach.toUpperCase()))
          .filter((i) => bo_dau(i.ban.maBanSach).includes(q) || bo_dau(i.tenSach).includes(q))
          .slice(0, MAX_GOI_Y)
      : []

  function them(ma: string) {
    if (value.includes(ma)) {
      toast.add({ type: "warning", title: "Bản sách đã có trong danh sách", description: ma })
      return
    }
    if (value.length >= MAX_BAN) {
      toast.add({ type: "warning", title: `Tối đa ${MAX_BAN} bản sách mỗi phiếu` })
      return
    }
    const info = map?.get(ma)
    if (map && !info) {
      toast.add({ type: "warning", title: "Không tìm thấy bản sách", description: ma })
      return
    }
    if (info && !MUON_DUOC.has(info.ban.tinhTrang)) {
      toast.add({ type: "warning", title: `${ma} ${tinhTrangOf(info.ban.tinhTrang)?.label.toLowerCase() ?? "không thể mượn"}`, description: info.tenSach })
      return
    }
    onChange([...value, ma])
    setNote(`Đã thêm ${ma}${info ? `, ${info.tenSach}` : ""}. Phiếu có ${value.length + 1} cuốn`)
    setText("")
  }

  function onEnter() {
    const ma = text.trim().toUpperCase()
    if (!ma) return
    if (map && !map.has(ma) && goiY.length === 1) them(goiY[0].ban.maBanSach.toUpperCase())
    else them(ma)
  }

  return (
    <Field>
      <FieldLabel htmlFor="pm-ban-sach">
        Bản sách <span aria-hidden="true" className="text-destructive">*</span>
      </FieldLabel>
      <div className="flex max-w-sm gap-2">
        <Input
          id="pm-ban-sach"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setNote("")
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onEnter()
            }
          }}
          maxLength={60}
          autoComplete="off"
          placeholder="Mã bản (BS001) hoặc tên sách"
          className="h-10 rounded-md border-input bg-white text-sm"
        />
        <Button type="button" variant="outline" className="h-10" onClick={onEnter}>
          <Plus aria-hidden="true" />
          Thêm
        </Button>
      </div>
      <FieldDescription>
        {index.isPending ? (
          <span className="inline-flex items-center gap-1.5"><Loader2 className="size-3 animate-spin" aria-hidden="true" />Đang tải danh sách bản sách...</span>
        ) : index.isError ? (
          "Không tải được danh sách bản sách; vẫn có thể nhập mã, hệ thống sẽ kiểm tra khi lập phiếu."
        ) : (
          "Quét/nhập mã bản rồi nhấn Enter, hoặc gõ tên sách để chọn từ gợi ý (chỉ hiện bản có thể mượn)."
        )}
      </FieldDescription>

      <p role="status" className="sr-only">
        {note || (map && q ? (goiY.length > 0 ? `${goiY.length} gợi ý bản sách` : "Không có gợi ý") : "")}
      </p>

      {goiY.length > 0 && (
        <ul aria-label="Gợi ý bản sách" className="max-w-sm divide-y divide-line overflow-hidden rounded-lg border border-input bg-white">
          {goiY.map((i) => {
            const tt = tinhTrangOf(i.ban.tinhTrang)
            return (
              <li key={i.ban.id}>
                <button
                  type="button"
                  onClick={() => them(i.ban.maBanSach.toUpperCase())}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-heading">{i.tenSach}</span>
                    <span className="block text-xs text-muted-foreground">{i.ban.maBanSach} · kệ {i.ban.viTriKe}</span>
                  </span>
                  {tt && <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${tt.tone}`}>{tt.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {value.length > 0 && (
        <ul aria-label="Bản sách đã chọn" className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-input bg-white">
          {value.map((ma) => {
            const info = map?.get(ma)
            const tt = info ? tinhTrangOf(info.ban.tinhTrang) : undefined
            return (
              <li key={ma} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-heading">{info ? info.tenSach : ma}</span>
                  <span className="block text-xs text-muted-foreground">
                    {info ? `${ma} · kệ ${info.ban.viTriKe}${info.tacGia ? ` · ${info.tacGia}` : ""}` : index.isPending ? "Đang tải thông tin sách..." : "Không có thông tin sách"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {tt && info?.ban.tinhTrang !== "SAN_SANG" && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tt.tone}`}>{tt.label}</span>}
                  <button type="button" aria-label={`Bỏ ${ma}`} className="rounded-full p-1 text-muted-foreground hover:bg-line" onClick={() => {
                      onChange(value.filter((x) => x !== ma))
                      setNote(`Đã bỏ ${ma}. Phiếu có ${value.length - 1} cuốn`)
                    }}>
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Field>
  )
}
