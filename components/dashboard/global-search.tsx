"use client"

import { useEffect, useId, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Search } from "lucide-react"

import { LOAI_NGUOI_DUNG } from "@/components/nguoi-dung/nguoi-dung-meta"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Paged, type Schemas } from "@/lib/api"
import { cn } from "@/lib/utils"

type SachRow = Schemas["TraCuuSachDto"]
type NguoiDungRow = Schemas["NguoiDungDto"]
type PhieuRow = Schemas["PhieuMuonChiTietDto"]

const MIN_CHARS = 2
const MAX_PER_GROUP = 6

type Item = { key: string; href: string; title: string; sub: string; aside?: string }
type Group = { label: string; items: Item[]; more?: { count: number; href: string; label: string } }

/** Ô tìm kiếm ở header: mở hộp tìm nhanh (Ctrl/⌘ + K) gọi các endpoint tìm kiếm sẵn có của BE. */
export function GlobalSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tìm kiếm"
        aria-keyshortcuts="Control+K Meta+K"
        className="hidden h-9 w-56 items-center gap-2 rounded-md border border-border bg-surface px-3 text-left text-xs text-faint transition-colors hover:bg-muted md:flex"
      >
        <Search className="size-4 shrink-0 text-icon" aria-hidden="true" />
        <span className="flex-1">Tìm kiếm...</span>
        <kbd className="rounded border border-input bg-white px-1.5 text-[11px] text-faint">Ctrl K</kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Tìm kiếm"
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted md:hidden"
      >
        <Search className="size-[18px]" aria-hidden="true" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="top-[10%] translate-y-0 gap-0 p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Tìm kiếm</DialogTitle>
          <DialogDescription className="sr-only">Tìm sách, người dùng hoặc phiếu mượn theo từ khóa.</DialogDescription>
          {open && <SearchPanel onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const { isStaff } = useAuth()
  const listId = useId()
  const [input, setInput] = useState("")
  const [active, setActive] = useState(0)
  // Chỉ tìm khi bấm Enter: BE ghi mỗi lượt tra cứu sách vào nhật ký hành vi, tìm theo từng phím gõ sẽ ghi cả các từ khóa dở dang.
  const [q, setQ] = useState("")
  const dirty = input.trim() !== q

  const ready = q.length >= MIN_CHARS
  const isMaPhieu = /^PM\d+$/i.test(q)

  const sach = useQuery({
    queryKey: ["search", "sach", q],
    queryFn: async () => (await apiClient.get<Paged<SachRow>>("/sach", { params: { tuKhoa: q } })).data,
    enabled: ready,
  })
  const nguoiDung = useQuery({
    queryKey: ["search", "nguoi-dung", q],
    queryFn: async () =>
      (await apiClient.get<Paged<NguoiDungRow>>("/docgia", { params: { tuKhoa: q, limit: MAX_PER_GROUP } })).data,
    enabled: ready && isStaff,
  })
  // Mã phiếu không có tìm theo từ khóa, nên chỉ tra thẳng khi gõ đúng dạng PM…; 404 = không có.
  const phieu = useQuery({
    queryKey: ["search", "phieu", q.toUpperCase()],
    queryFn: async () => (await apiClient.get<PhieuRow>(`/phieu-muon/${q.toUpperCase()}`)).data,
    enabled: ready && isStaff && isMaPhieu,
    retry: false,
  })

  const groups: Group[] = []
  if (phieu.data) {
    const p = phieu.data
    groups.push({
      label: "Phiếu mượn",
      items: [{ key: `p-${p.id}`, href: `/phieu-muon/${p.maPhieu}`, title: p.maPhieu ?? q, sub: p.nguoiDung.hoTen }],
    })
  }
  if (sach.data && sach.data.data.length > 0) {
    const rows = sach.data.data
    groups.push({
      label: "Sách",
      items: rows.slice(0, MAX_PER_GROUP).map((s) => ({
        key: `s-${s.id}`,
        href: `/sach/${s.id}`,
        title: s.ten_sach,
        sub: `${s.ma_sach} · ${s.ds_tac_gia ?? "Chưa rõ tác giả"}`,
        aside: s.so_ban_san_sang > 0 ? `Còn ${s.so_ban_san_sang} bản` : "Hết bản",
      })),
      more: rows.length > MAX_PER_GROUP ? { count: rows.length - MAX_PER_GROUP, href: "/sach", label: "Mở trang Sách để lọc thêm" } : undefined,
    })
  }
  if (nguoiDung.data && nguoiDung.data.data.length > 0) {
    const { data: rows, total } = nguoiDung.data
    groups.push({
      label: "Người dùng",
      items: rows.map((u) => ({
        key: `u-${u.id}`,
        href: `/nguoi-dung/${u.id}`,
        title: u.hoTen,
        sub: `${u.maNguoiDung} · ${LOAI_NGUOI_DUNG.find((l) => l.value === u.loaiNguoiDung)?.label ?? u.loaiNguoiDung}`,
      })),
      more: total > rows.length ? { count: total - rows.length, href: "/nguoi-dung", label: "Mở trang Người dùng để lọc thêm" } : undefined,
    })
  }

  const items = groups.flatMap((g) => g.items)
  const current = Math.min(active, Math.max(items.length - 1, 0))
  const loading = ready && (sach.isFetching || nguoiDung.isFetching || phieu.isFetching)
  const failed = sach.error ?? nguoiDung.error
  const optionId = (key: string) => `${listId}-${key}`

  function go(href: string) {
    onClose()
    router.push(href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      if (dirty) {
        if (input.trim().length >= MIN_CHARS) {
          setQ(input.trim())
          setActive(0)
        }
      } else if (items.length > 0) {
        go(items[current].href)
      }
      return
    }
    if (dirty || items.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((current + 1) % items.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((current - 1 + items.length) % items.length)
    }
  }

  let status: string | null = null
  if (dirty) status = `Nhấn Enter để tìm “${input.trim()}” (ít nhất ${MIN_CHARS} ký tự).`
  else if (!ready) status = `Nhập từ khóa rồi nhấn Enter để tìm ${isStaff ? "sách, người dùng hoặc mã phiếu mượn (PM…)" : "sách"}.`
  else if (failed) status = getApiErrorMessage(failed)
  else if (!loading && items.length === 0) status = `Không tìm thấy kết quả cho “${q}”.`

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-border px-3">
        {loading ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-hidden="true" />
        ) : (
          <Search className="size-4 shrink-0 text-icon" aria-hidden="true" />
        )}
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={!dirty && items.length > 0}
          aria-controls={listId}
          aria-activedescendant={!dirty && items.length > 0 ? optionId(items[current].key) : undefined}
          aria-autocomplete="list"
          aria-label="Từ khóa tìm kiếm"
          placeholder={isStaff ? "Tìm sách, người dùng, mã phiếu mượn..." : "Tìm sách theo tên, tác giả, mã..."}
          className="h-12 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-faint"
        />
      </div>

      <div id={listId} role="listbox" aria-label="Kết quả tìm kiếm" className={cn("max-h-[min(60vh,28rem)] overflow-y-auto p-2", dirty && "opacity-50")}>
        {groups.map((group) => (
          <div key={group.label} role="group" aria-label={group.label} className="mb-1 last:mb-0">
            <p className="px-2 pb-1 pt-2 text-[11px] font-semibold tracking-[0.08em] text-faint">{group.label.toUpperCase()}</p>
            {group.items.map((item) => {
              const isActive = items[current]?.key === item.key
              return (
                <Link
                  key={item.key}
                  id={optionId(item.key)}
                  href={item.href}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={-1}
                  onClick={onClose}
                  onMouseMove={() => setActive(items.findIndex((i) => i.key === item.key))}
                  className={cn("flex items-center justify-between gap-3 rounded-md px-2 py-2", isActive && "bg-primary-soft")}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.sub}</span>
                  </span>
                  {item.aside && <span className="shrink-0 text-xs text-muted-foreground">{item.aside}</span>}
                </Link>
              )
            })}
            {group.more && (
              <Link href={group.more.href} onClick={onClose} className="block rounded-md px-2 py-1.5 text-xs text-primary hover:underline">
                Còn {group.more.count} kết quả nữa. {group.more.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      {status && <p className="px-4 pb-4 pt-2 text-sm text-muted-foreground">{status}</p>}
      <p className="sr-only" aria-live="polite">
        {ready && !dirty && !loading ? (items.length > 0 ? `${items.length} kết quả` : "Không có kết quả") : ""}
      </p>
    </div>
  )
}
