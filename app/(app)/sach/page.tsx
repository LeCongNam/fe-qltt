"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Paged, type Schemas } from "@/lib/api"

type SachRow = Schemas["TraCuuSachDto"]

const PAGE_SIZE = 20
const COL_COUNT = 7

export default function SachPage() {
  const { isStaff } = useAuth()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [tuKhoa, setTuKhoa] = useState("")

  const list = useQuery({
    queryKey: ["/sach", "list", page, tuKhoa],
    queryFn: async () => {
      const { data } = await apiClient.get<Paged<SachRow>>("/sach", {
        params: { page, limit: PAGE_SIZE, ...(tuKhoa && { tuKhoa }) },
      })
      return data
    },
    placeholderData: keepPreviousData,
  })

  const rows = list.data?.data ?? []
  const total = list.data?.total ?? 0
  // Có từ khóa thì BE trả toàn bộ kết quả, không phân trang.
  const pageCount = tuKhoa ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE))

  function search(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setTuKhoa(input.trim())
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#e4e8e2] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-[#5f6b64]">Danh mục</p>
          <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Sách</h2>
          <p className="mt-1.5 text-sm text-[#5f6b64]">Tra cứu đầu sách, tác giả và số bản có thể mượn.</p>
        </div>
        {isStaff && (
          <Link
            href="/sach/moi"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#147d64] px-2.5 text-sm font-medium text-white transition-colors hover:bg-[#106a55]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Thêm sách
          </Link>
        )}
      </div>

      <form onSubmit={search} className="mb-4 flex gap-2" role="search">
        <label className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9690]" aria-hidden="true" />
          <Input
            aria-label="Tìm theo tên hoặc mô tả sách"
            placeholder="Tìm theo tên hoặc mô tả sách..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={255}
            className="h-9 rounded-md border-[#dfe5df] bg-white pl-9 text-sm"
          />
        </label>
        <Button type="submit" variant="outline">
          Tìm
        </Button>
        {tuKhoa && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setInput("")
              setTuKhoa("")
              setPage(1)
            }}
          >
            Xóa tìm kiếm
          </Button>
        )}
      </form>

      <div className="rounded-lg border border-[#e4e8e2] bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Mã</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Thể loại</TableHead>
              <TableHead>NXB</TableHead>
              <TableHead className="w-20">Năm</TableHead>
              <TableHead className="w-28 text-right">Có thể mượn</TableHead>
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
                  {getApiErrorMessage(list.error, "Không tải được danh sách sách.")}{" "}
                  <button type="button" className="underline" onClick={() => list.refetch()}>
                    Thử lại
                  </button>
                </TableCell>
              </TableRow>
            )}
            {list.isSuccess && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={COL_COUNT} className="py-10 text-center text-sm text-[#5f6b64]">
                  {tuKhoa ? `Không có sách khớp “${tuKhoa}”.` : "Chưa có sách nào."}
                </TableCell>
              </TableRow>
            )}
            {rows.map((s) => (
              <TableRow key={s.ma_sach}>
                <TableCell className="font-medium">{s.ma_sach}</TableCell>
                <TableCell className="whitespace-normal">
                  <Link href={`/sach/${s.id}`} className="font-medium text-[#147d64] hover:underline">
                    {s.ten_sach}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-normal text-[#5f6b64]">{s.ds_tac_gia ?? "—"}</TableCell>
                <TableCell className="whitespace-normal">{s.ten_the_loai}</TableCell>
                <TableCell className="whitespace-normal text-[#5f6b64]">{s.ten_nxb}</TableCell>
                <TableCell className="text-[#5f6b64]">{s.nam_xuat_ban ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      s.so_ban_san_sang > 0
                        ? "rounded-full bg-[#e6f3ee] px-2 py-0.5 text-xs font-medium text-[#0f6a52]"
                        : "rounded-full bg-[#eceeeb] px-2 py-0.5 text-xs font-medium text-[#5f6b64]"
                    }
                  >
                    {s.so_ban_san_sang > 0 ? `${s.so_ban_san_sang} bản` : "Hết"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-[#5f6b64]">
        <span>{total} đầu sách</span>
        {pageCount > 1 && (
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
        )}
      </div>
    </section>
  )
}
