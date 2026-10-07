"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"

import {
  LOAI_NGUOI_DUNG,
  TRANG_THAI_NGUOI_DUNG,
  labelOf,
} from "@/components/nguoi-dung/nguoi-dung-meta"
import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { StatusPill } from "@/components/status-pill"
import type { NguoiDung } from "@/components/nguoi-dung/nguoi-dung-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, type Paged } from "@/lib/api"

const PAGE_SIZE = 20
const ALL = "ALL"

const COLUMNS: DataColumn<NguoiDung>[] = [
  { header: "Mã", className: "w-28", cell: (u) => <span className="font-medium">{u.maNguoiDung}</span> },
  {
    header: "Họ tên",
    title: true,
    className: "whitespace-normal",
    cell: (u) => (
      <Link href={`/nguoi-dung/${u.id}`} className="font-medium text-primary hover:underline">
        {u.hoTen}
      </Link>
    ),
  },
  { header: "Loại", className: "w-28", cell: (u) => labelOf(LOAI_NGUOI_DUNG, u.loaiNguoiDung) },
  { header: "Email", className: "whitespace-normal text-muted-foreground", cell: (u) => u.email || "—" },
  { header: "Khoa / đơn vị", className: "whitespace-normal text-muted-foreground", cell: (u) => u.khoaDonVi || "—" },
  { header: "Trạng thái", className: "w-28", cell: (u) => <StatusPill list={TRANG_THAI_NGUOI_DUNG} value={u.trangThai} /> },
]

const LOAI_FILTER = [{ value: ALL, label: "Mọi loại" }, ...LOAI_NGUOI_DUNG]
const TRANG_THAI_FILTER = [{ value: ALL, label: "Mọi trạng thái" }, ...TRANG_THAI_NGUOI_DUNG]

export default function NguoiDungPage() {
  const { isStaff } = useAuth()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [tuKhoa, setTuKhoa] = useState("")
  const [loai, setLoai] = useState(ALL)
  const [trangThai, setTrangThai] = useState(ALL)

  const list = useQuery({
    queryKey: ["/docgia", "list", page, tuKhoa, loai, trangThai],
    queryFn: async () => {
      const { data } = await apiClient.get<Paged<NguoiDung>>("/docgia", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(tuKhoa && { tuKhoa }),
          ...(loai !== ALL && { loaiNguoiDung: loai }),
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
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const filtering = tuKhoa !== "" || loai !== ALL || trangThai !== ALL

  function search(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setTuKhoa(input.trim())
  }

  function reset() {
    setInput("")
    setTuKhoa("")
    setLoai(ALL)
    setTrangThai(ALL)
    setPage(1)
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Người dùng</p>
          <h2 className="mt-1.5 text-xl font-semibold text-foreground">Người dùng &amp; tài khoản</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Quản lý hồ sơ bạn đọc, cán bộ và tài khoản đăng nhập.</p>
        </div>
        <Link
          href="/add-doc-gia"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus className="size-4" aria-hidden="true" />
          Thêm người dùng
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-2 lg:flex-row">
        <form onSubmit={search} className="flex flex-1 gap-2" role="search">
          <label className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
            <Input
              aria-label="Tìm theo mã, họ tên hoặc email"
              placeholder="Tìm theo mã, họ tên hoặc email..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={160}
              className="h-9 rounded-md border-input bg-white pl-9 text-sm"
            />
          </label>
          <Button type="submit" variant="outline">
            Tìm
          </Button>
        </form>
        <div className="flex gap-2">
          <Select
            value={loai}
            items={LOAI_FILTER}
            onValueChange={(v) => {
              if (!v) return
              setLoai(v)
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Lọc theo loại" className="h-9 w-36 border-input bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOAI_FILTER.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={trangThai}
            items={TRANG_THAI_FILTER}
            onValueChange={(v) => {
              if (!v) return
              setTrangThai(v)
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
            <Button type="button" variant="ghost" onClick={reset}>
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      <DataTable
        query={list}
        rows={rows}
        columns={COLUMNS}
        rowKey={(u) => u.id}
        errorText="Không tải được danh sách người dùng."
        emptyText={filtering ? "Không có người dùng khớp bộ lọc." : "Chưa có người dùng nào."}
        skeletonRows={6}
      />

      <Pager page={page} pageCount={pageCount} total={total} unit="người dùng" order="mã người dùng" onPage={setPage} />
    </section>
  )
}
