"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus, RotateCcw } from "lucide-react"

import { TRANG_THAI_PHIEU_MUON, isOverdue, type TrangThaiPhieuMuon } from "@/components/luu-thong/luu-thong-meta"
import { TraSachDialog } from "@/components/luu-thong/tra-sach-dialog"
import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { SortSelect } from "@/components/sort-select"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useServerSort } from "@/hooks/use-server-sort"
import { phieuMuonQueries } from "@/features/phieu-muon/queries"
import type { Schemas } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { PAGE_SIZE } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { SearchForm } from "@/components/search-form"
import { NguoiDungLink } from "@/components/nguoi-dung/nguoi-dung-link"

type Phieu = Schemas["PhieuMuonChiTietDto"]

const ALL = "ALL"
const COLUMNS: DataColumn<Phieu>[] = [
  {
    header: "Mã phiếu",
    className: "w-28",
    cell: (p) => (
      <Link href={`/phieu-muon/${p.maPhieu}`} className="font-medium text-primary hover:underline">
        {p.maPhieu}
      </Link>
    ),
  },
  {
    header: "Người mượn",
    className: "whitespace-normal",
    cell: (p) => (
      <NguoiDungLink maNguoiDung={p.nguoiDung.maNguoiDung} hoTen={p.nguoiDung.hoTen} />
    ),
  },
  { header: "Ngày mượn", className: "w-28 text-muted-foreground", cell: (p) => formatDate(p.ngayMuon) },
  { header: "Số sách", align: "right", className: "w-24", cell: (p) => p.ctPhieuMuons.length },
  {
    header: "Quá hạn",
    className: "w-28",
    cell: (p) => {
      const quaHan = p.ctPhieuMuons.filter((c) => isOverdue(c.hanTra, c.ngayTra)).length
      return quaHan > 0 ? (
        <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-medium text-destructive">{quaHan} cuốn</span>
      ) : (
        "—"
      )
    },
  },
  { header: "Trạng thái", className: "w-28", cell: (p) => <StatusPill list={TRANG_THAI_PHIEU_MUON} value={p.trangThai} /> },
]

const TRANG_THAI_FILTER = [{ value: ALL, label: "Mọi trạng thái" }, ...TRANG_THAI_PHIEU_MUON]
const SORT_FIELDS = { "Mã phiếu": "maPhieu", "Ngày mượn": "ngayMuon" } as const

export default function PhieuMuonPage() {
  const { isStaff } = useAuth()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const [trangThai, setTrangThai] = useState<TrangThaiPhieuMuon | typeof ALL>(ALL)
  const [traOpen, setTraOpen] = useState(false)
  const sort = useServerSort(SORT_FIELDS, { defaultOrder: { field: "ngayMuon", dir: "desc" }, onChange: () => setPage(1) })

  const list = useQuery({
    ...phieuMuonQueries.list({
      page,
      limit: PAGE_SIZE,
      ...(sort.sapXep && { sapXep: sort.sapXep }),
      ...(maNguoiDung && { maNguoiDung }),
      ...(trangThai !== ALL && { trangThai }),
    }),
    placeholderData: keepPreviousData,
    enabled: isStaff,
  })

  const rows = list.data?.data ?? []
  const total = list.data?.total ?? 0
  const filtering = maNguoiDung !== "" || trangThai !== ALL

  return (
    <section className="mx-auto w-full max-w-6xl md:flex md:min-h-0 md:flex-1 md:flex-col">
      <PageHeader
        eyebrow="Lưu thông"
        title="Mượn - trả"
        description="Lập phiếu mượn, gia hạn và nhận trả sách."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setTraOpen(true)}>
              <RotateCcw aria-hidden="true" />
              Trả sách nhanh
            </Button>
            <Link
              href="/phieu-muon/moi"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <Plus className="size-4" aria-hidden="true" />
              Lập phiếu mượn
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchForm
          value={input}
          onChange={setInput}
          onSubmit={() => {
            setPage(1)
            setMaNguoiDung(input.trim())
          }}
          label="Lọc theo mã người mượn"
          placeholder="Mã người mượn, ví dụ SV001"
          maxLength={20}
          submitLabel="Lọc"
          className="flex flex-1 gap-2"
          fieldClassName="max-w-sm"
        />
        <div className="flex gap-2">
          <Select
            value={trangThai}
            items={TRANG_THAI_FILTER}
            onValueChange={(v) => {
              if (!v) return
              setTrangThai(v as TrangThaiPhieuMuon | typeof ALL)
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái" className="h-9 w-40 border-input bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANG_THAI_FILTER.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtering && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setInput("")
                setMaNguoiDung("")
                setTrangThai(ALL)
                setPage(1)
              }}
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      <SortSelect {...sort.selectProps} className="mb-3" />

      <DataTable

        fill
        query={list}
        rows={rows}
        columns={sort.columns(COLUMNS)}
        rowKey={(p) => p.id}
        errorText="Không tải được danh sách phiếu mượn."
        emptyText={filtering ? "Không có phiếu mượn khớp bộ lọc." : "Chưa có phiếu mượn nào."}
        skeletonRows={6}
      />

      <Pager page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} unit="phiếu mượn" order={sort.orderText("ngày mượn, mới nhất trước")} onPage={setPage} />

      <TraSachDialog key={traOpen ? "open" : "closed"} open={traOpen} onClose={() => setTraOpen(false)} />
    </section>
  )
}
