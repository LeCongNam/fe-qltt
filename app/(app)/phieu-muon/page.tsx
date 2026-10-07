"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus, RotateCcw, Search } from "lucide-react"

import { TRANG_THAI_PHIEU_MUON, isOverdue } from "@/components/luu-thong/luu-thong-meta"
import { TraSachDialog } from "@/components/luu-thong/tra-sach-dialog"
import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, type Paged, type Schemas } from "@/lib/api"
import { formatDate } from "@/lib/format"

type Phieu = Schemas["PhieuMuonChiTietDto"]

const PAGE_SIZE = 20
const ALL = "ALL"
const COLUMNS: DataColumn<Phieu>[] = [
  {
    header: "Mã phiếu",
    className: "w-28",
    cell: (p) => (
      <Link href={`/phieu-muon/${p.maPhieu}`} className="font-medium text-[#147d64] hover:underline">
        {p.maPhieu}
      </Link>
    ),
  },
  {
    header: "Người mượn",
    className: "whitespace-normal",
    cell: (p) => (
      <>
        {p.nguoiDung.hoTen} <span className="text-[#5f6b64]">({p.nguoiDung.maNguoiDung})</span>
      </>
    ),
  },
  { header: "Ngày mượn", className: "w-28 text-[#5f6b64]", cell: (p) => formatDate(p.ngayMuon) },
  { header: "Số sách", align: "right", className: "w-24", cell: (p) => p.ctPhieuMuons.length },
  {
    header: "Quá hạn",
    className: "w-28",
    cell: (p) => {
      const quaHan = p.ctPhieuMuons.filter((c) => isOverdue(c.hanTra, c.ngayTra)).length
      return quaHan > 0 ? (
        <span className="rounded-full bg-[#fbe9e5] px-2 py-0.5 text-xs font-medium text-[#b34a38]">{quaHan} cuốn</span>
      ) : (
        "—"
      )
    },
  },
  { header: "Trạng thái", className: "w-28", cell: (p) => <StatusPill list={TRANG_THAI_PHIEU_MUON} value={p.trangThai} /> },
]

const TRANG_THAI_FILTER = [{ value: ALL, label: "Mọi trạng thái" }, ...TRANG_THAI_PHIEU_MUON]

export default function PhieuMuonPage() {
  const { isStaff } = useAuth()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const [trangThai, setTrangThai] = useState(ALL)
  const [traOpen, setTraOpen] = useState(false)

  const list = useQuery({
    queryKey: ["/phieu-muon", "list", page, maNguoiDung, trangThai],
    queryFn: async () => {
      const { data } = await apiClient.get<Paged<Phieu>>("/phieu-muon", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(maNguoiDung && { maNguoiDung }),
          ...(trangThai !== ALL && { trangThai }),
        },
      })
      return data
    },
    placeholderData: keepPreviousData,
    enabled: isStaff,
  })

  const rows = list.data?.data ?? []
  const total = list.data?.total ?? 0
  const filtering = maNguoiDung !== "" || trangThai !== ALL

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e4e8e2] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#5f6b64]">Lưu thông</p>
          <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Mượn - trả</h2>
          <p className="mt-1.5 text-sm text-[#5f6b64]">Lập phiếu mượn, gia hạn và nhận trả sách.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTraOpen(true)}>
            <RotateCcw aria-hidden="true" />
            Trả sách nhanh
          </Button>
          <Link
            href="/phieu-muon/moi"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#147d64] px-2.5 text-sm font-medium text-white transition-colors hover:bg-[#106a55]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Lập phiếu mượn
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <form
          role="search"
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setMaNguoiDung(input.trim())
          }}
        >
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9690]" aria-hidden="true" />
            <Input
              aria-label="Lọc theo mã người mượn"
              placeholder="Mã người mượn, ví dụ SV001"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={20}
              className="h-9 rounded-md border-[#dfe5df] bg-white pl-9 text-sm"
            />
          </label>
          <Button type="submit" variant="outline">
            Lọc
          </Button>
        </form>
        <div className="flex gap-2">
          <Select
            value={trangThai}
            items={TRANG_THAI_FILTER}
            onValueChange={(v) => {
              if (!v) return
              setTrangThai(v)
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái" className="h-9 w-40 border-[#dfe5df] bg-white">
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

      <DataTable
        query={list}
        rows={rows}
        columns={COLUMNS}
        rowKey={(p) => p.id}
        errorText="Không tải được danh sách phiếu mượn."
        emptyText={filtering ? "Không có phiếu mượn khớp bộ lọc." : "Chưa có phiếu mượn nào."}
        skeletonRows={6}
      />

      <Pager page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} unit="phiếu mượn" onPage={setPage} />

      <TraSachDialog key={traOpen ? "open" : "closed"} open={traOpen} onClose={() => setTraOpen(false)} />
    </section>
  )
}
