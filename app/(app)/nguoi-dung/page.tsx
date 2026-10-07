"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"

import {
  LOAI_NGUOI_DUNG,
  TRANG_THAI_NGUOI_DUNG,
  labelOf,
} from "@/components/nguoi-dung/nguoi-dung-meta"
import { StatusPill } from "@/components/status-pill"
import type { NguoiDung } from "@/components/nguoi-dung/nguoi-dung-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Paged } from "@/lib/api"

const PAGE_SIZE = 20
const COL_COUNT = 6
const ALL = "ALL"

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
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e4e8e2] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#5f6b64]">Người dùng</p>
          <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Người dùng &amp; tài khoản</h2>
          <p className="mt-1.5 text-sm text-[#5f6b64]">Quản lý hồ sơ bạn đọc, cán bộ và tài khoản đăng nhập.</p>
        </div>
        <Link
          href="/add-doc-gia"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#147d64] px-2.5 text-sm font-medium text-white transition-colors hover:bg-[#106a55]"
        >
          <Plus className="size-4" aria-hidden="true" />
          Thêm người dùng
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-2 lg:flex-row">
        <form onSubmit={search} className="flex flex-1 gap-2" role="search">
          <label className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9690]" aria-hidden="true" />
            <Input
              aria-label="Tìm theo mã, họ tên hoặc email"
              placeholder="Tìm theo mã, họ tên hoặc email..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={160}
              className="h-9 rounded-md border-[#dfe5df] bg-white pl-9 text-sm"
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
            <SelectTrigger aria-label="Lọc theo loại" className="h-9 w-36 border-[#dfe5df] bg-white">
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
            <Button type="button" variant="ghost" onClick={reset}>
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[#e4e8e2] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Mã</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead className="w-28">Loại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Khoa / đơn vị</TableHead>
              <TableHead className="w-28">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isPending &&
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={COL_COUNT}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {list.isError && (
              <TableRow>
                <TableCell colSpan={COL_COUNT} className="py-10 text-center text-sm text-[#a35143]">
                  {getApiErrorMessage(list.error, "Không tải được danh sách người dùng.")}{" "}
                  <button type="button" className="underline" onClick={() => list.refetch()}>
                    Thử lại
                  </button>
                </TableCell>
              </TableRow>
            )}
            {list.isSuccess && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COL_COUNT} className="py-10 text-center text-sm text-[#5f6b64]">
                  {filtering ? "Không có người dùng khớp bộ lọc." : "Chưa có người dùng nào."}
                </TableCell>
              </TableRow>
            )}
            {rows.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.maNguoiDung}</TableCell>
                <TableCell className="whitespace-normal">
                  <Link href={`/nguoi-dung/${u.id}`} className="font-medium text-[#147d64] hover:underline">
                    {u.hoTen}
                  </Link>
                </TableCell>
                <TableCell>{labelOf(LOAI_NGUOI_DUNG, u.loaiNguoiDung)}</TableCell>
                <TableCell className="whitespace-normal text-[#5f6b64]">{u.email || "—"}</TableCell>
                <TableCell className="whitespace-normal text-[#5f6b64]">{u.khoaDonVi || "—"}</TableCell>
                <TableCell>
                  <StatusPill list={TRANG_THAI_NGUOI_DUNG} value={u.trangThai} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[#5f6b64]">
        <span>{total} người dùng</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <span>
            Trang {page} / {pageCount}
          </span>
          <Button variant="outline" size="icon-sm" aria-label="Trang sau" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
