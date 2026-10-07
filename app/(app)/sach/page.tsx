"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { sachQueries } from "@/features/sach/queries"
import type { Schemas } from "@/lib/api"
import { PAGE_SIZE } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { SearchForm } from "@/components/search-form"

type SachRow = Schemas["TraCuuSachDto"]

const COLUMNS: DataColumn<SachRow>[] = [
  {
    header: "Tên sách",
    title: true,
    className: "whitespace-normal",
    cell: (s) => (
      <Link href={`/sach/${s.id}`} className="font-medium text-primary hover:underline">
        {s.ten_sach}
      </Link>
    ),
  },
  { header: "Mã", className: "w-24", cell: (s) => <span className="font-medium">{s.ma_sach}</span> },
  { header: "Tác giả", className: "whitespace-normal text-muted-foreground", cell: (s) => s.ds_tac_gia ?? "—" },
  { header: "Thể loại", className: "whitespace-normal", cell: (s) => s.ten_the_loai },
  { header: "NXB", className: "whitespace-normal text-muted-foreground", cell: (s) => s.ten_nxb },
  { header: "Năm", className: "w-20 text-muted-foreground", cell: (s) => s.nam_xuat_ban ?? "—" },
  {
    header: "Có thể mượn",
    align: "right",
    className: "w-28",
    cell: (s) => (
      <span
        className={
          s.so_ban_san_sang > 0
            ? "rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-strong"
            : "rounded-full bg-neutral-soft px-2 py-0.5 text-xs font-medium text-muted-foreground"
        }
      >
        {s.so_ban_san_sang > 0 ? `${s.so_ban_san_sang} bản` : "Hết"}
      </span>
    ),
  },
]

export default function SachPage() {
  const { isStaff } = useAuth()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [tuKhoa, setTuKhoa] = useState("")

  const list = useQuery({
    ...sachQueries.list({ page, limit: PAGE_SIZE, ...(tuKhoa && { tuKhoa }) }),
    placeholderData: keepPreviousData,
  })

  const rows = list.data?.data ?? []
  const total = list.data?.total ?? 0
  // Có từ khóa thì BE trả toàn bộ kết quả, không phân trang.
  const pageCount = tuKhoa ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE))

  function search() {
    setPage(1)
    setTuKhoa(input.trim())
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow="Danh mục"
        title="Sách"
        description="Tra cứu đầu sách, tác giả và số bản có thể mượn."
        action={
          isStaff && (
            <Link
              href="/sach/moi"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <Plus className="size-4" aria-hidden="true" />
              Thêm sách
            </Link>
          )
        }
      />

      <SearchForm
        value={input}
        onChange={setInput}
        onSubmit={search}
        label="Tìm theo tên hoặc mô tả sách"
        placeholder="Tìm theo tên hoặc mô tả sách..."
        maxLength={255}
        className="mb-4"
      >
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
      </SearchForm>

      <DataTable
        query={list}
        rows={rows}
        columns={COLUMNS}
        rowKey={(s) => s.ma_sach}
        errorText="Không tải được danh sách sách."
        emptyText={tuKhoa ? `Không có sách khớp “${tuKhoa}”.` : "Chưa có sách nào."}
        skeletonRows={6}
      />

      <Pager page={page} pageCount={pageCount} total={total} unit="đầu sách" order="tên sách A–Z" onPage={setPage} />
    </section>
  )
}
