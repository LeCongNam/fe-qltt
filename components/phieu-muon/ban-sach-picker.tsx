"use client"

import { useState } from "react"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, X } from "lucide-react"

import { TINH_TRANG_BAN_SACH } from "@/components/sach/sach-meta"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { sachQueries } from "@/features/sach/queries"
import { useDebounced } from "@/hooks/use-debounced"
import { isApiError, type Schemas } from "@/lib/api"

export const MAX_BAN = 20
const MAX_GOI_Y = 8
/** Tình trạng có thể đưa vào phiếu mượn; bản đang giữ có thể là bản đã giữ cho chính người mượn, BE quyết định. */
const MUON_DUOC = new Set<string>(["SAN_SANG", "DANG_GIU"])

type BanSachInfo = Schemas["BanSachKemSachDto"]

const tinhTrangOf = (v: string) => TINH_TRANG_BAN_SACH.find((t) => t.value === v)

/** Chọn các bản sách cho phiếu: nhập mã rồi Enter (hợp máy quét mã vạch) hoặc gõ tên sách để chọn từ gợi ý. */
export function BanSachPicker({ value, onChange }: { value: string[]; onChange: (maBans: string[]) => void }) {
  const queryClient = useQueryClient()
  const [text, setText] = useState("")
  const [note, setNote] = useState("")
  const [checking, setChecking] = useState(false)
  /** Thông tin các bản đã chọn, lấy lúc thêm (từ gợi ý hoặc tra theo mã). */
  const [infos, setInfos] = useState<Record<string, BanSachInfo>>({})

  const q = text.trim()
  const debouncedQ = useDebounced(q, 250)
  // Lấy dư để còn lọc bỏ các bản đã có trong phiếu mà vẫn đủ MAX_GOI_Y gợi ý.
  const suggest = useQuery({
    ...sachQueries.timBanSach({ tuKhoa: debouncedQ, tinhTrang: ["SAN_SANG", "DANG_GIU"], limit: MAX_GOI_Y + MAX_BAN }),
    enabled: debouncedQ !== "",
    placeholderData: keepPreviousData,
  })
  const goiY: BanSachInfo[] =
    q && debouncedQ
      ? (suggest.data ?? []).filter((i) => !value.includes(i.maBanSach.toUpperCase())).slice(0, MAX_GOI_Y)
      : []

  function chon(info: BanSachInfo | undefined, ma: string) {
    if (info) setInfos((cur) => ({ ...cur, [ma]: info }))
    onChange([...value, ma])
    setNote(`Đã thêm ${ma}${info ? `, ${info.tenSach}` : ""}. Phiếu có ${value.length + 1} cuốn`)
    setText("")
  }

  async function them(ma: string, known?: BanSachInfo) {
    if (value.includes(ma)) {
      toast.add({ type: "warning", title: "Bản sách đã có trong danh sách", description: ma })
      return
    }
    if (value.length >= MAX_BAN) {
      toast.add({ type: "warning", title: `Tối đa ${MAX_BAN} bản sách mỗi phiếu` })
      return
    }
    let info = known
    if (!info) {
      setChecking(true)
      try {
        info = await queryClient.fetchQuery({ ...sachQueries.findBanSach(ma), staleTime: 0 })
      } catch (error) {
        if (isApiError(error, 404)) {
          toast.add({ type: "warning", title: "Không tìm thấy bản sách", description: ma })
          return
        }
        // Không tra được (mạng, 5xx): vẫn cho thêm, BE kiểm tra lại khi lập phiếu.
      } finally {
        setChecking(false)
      }
    }
    if (info && !MUON_DUOC.has(info.tinhTrang)) {
      toast.add({ type: "warning", title: `${ma} ${tinhTrangOf(info.tinhTrang)?.label.toLowerCase() ?? "không thể mượn"}`, description: info.tenSach })
      return
    }
    chon(info, ma)
  }

  async function onEnter() {
    const ma = text.trim().toUpperCase()
    if (!ma || checking) return
    // Gõ tên sách mà chỉ còn một gợi ý thì lấy luôn gợi ý đó; còn lại coi là mã bản.
    const only = goiY.length === 1 && goiY[0].maBanSach.toUpperCase() !== ma ? goiY[0] : undefined
    if (only && !/^BS\d+$/i.test(ma)) await them(only.maBanSach.toUpperCase(), only)
    else await them(ma)
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
        <Button type="button" variant="outline" className="h-10" disabled={checking} onClick={onEnter}>
          <Plus aria-hidden="true" />
          Thêm
        </Button>
      </div>
      <FieldDescription>
        {suggest.isError
          ? "Không tải được gợi ý; vẫn có thể nhập mã bản rồi nhấn Enter, hệ thống sẽ kiểm tra khi lập phiếu."
          : "Quét/nhập mã bản rồi nhấn Enter, hoặc gõ tên sách để chọn từ gợi ý (chỉ hiện bản có thể mượn)."}
      </FieldDescription>

      <p role="status" className="sr-only">
        {note || (q && !suggest.isFetching && !suggest.isError ? (goiY.length > 0 ? `${goiY.length} gợi ý bản sách` : "Không có gợi ý") : "")}
      </p>

      {goiY.length > 0 && (
        <ul aria-label="Gợi ý bản sách" className="max-w-sm divide-y divide-line overflow-hidden rounded-lg border border-input bg-white">
          {goiY.map((i) => {
            const tt = tinhTrangOf(i.tinhTrang)
            return (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => them(i.maBanSach.toUpperCase(), i)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-heading">{i.tenSach}</span>
                    <span className="block text-xs text-muted-foreground">{i.maBanSach} · kệ {i.viTriKe}</span>
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
            const info = infos[ma]
            const tt = info ? tinhTrangOf(info.tinhTrang) : undefined
            return (
              <li key={ma} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-heading">{info ? info.tenSach : ma}</span>
                  <span className="block text-xs text-muted-foreground">
                    {info ? `${ma} · kệ ${info.viTriKe}${info.tacGia ? ` · ${info.tacGia}` : ""}` : "Không có thông tin sách"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {tt && info?.tinhTrang !== "SAN_SANG" && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tt.tone}`}>{tt.label}</span>}
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
