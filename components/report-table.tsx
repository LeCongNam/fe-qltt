"use client"

import { useState, type ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { Download } from "lucide-react"

import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { Button } from "@/components/ui/button"

export type Column<T> = {
  header: string
  /** Giá trị thô của ô, cũng là giá trị xuất CSV. */
  value: (row: T) => string | number | null
  /** Cách hiển thị riêng; bỏ trống = hiện `value`. */
  cell?: (row: T) => ReactNode
  align?: "right"
  className?: string
  /** Cột làm tiêu đề thẻ trên mobile (mặc định cột đầu). */
  title?: boolean
  /** Cột nút thao tác: nằm cuối thẻ trên mobile, không có nhãn. */
  actions?: boolean
}

const PAGE_SIZE = 15

function toCsv<T>(columns: Column<T>[], rows: T[]) {
  const esc = (v: string | number | null) => {
    const s = v === null ? "" : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [columns.map((c) => esc(c.header)).join(","), ...rows.map((r) => columns.map((c) => esc(c.value(r))).join(","))]
  return `﻿${lines.join("\r\n")}` // BOM để Excel đọc đúng tiếng Việt
}

/** Bảng báo cáo: phân trang phía FE (view trả cả mảng), xuất CSV, đủ trạng thái tải/lỗi/rỗng. */
export function ReportTable<T>({
  query,
  columns,
  rowKey,
  unit,
  filename,
  toolbar,
  emptyText = "Không có dữ liệu.",
}: {
  query: UseQueryResult<T[]>
  columns: Column<T>[]
  rowKey: (row: T, index: number) => string
  unit: string
  /** Có tên file thì hiện nút xuất CSV. */
  filename?: string
  toolbar?: ReactNode
  emptyText?: string
}) {
  const [page, setPage] = useState(1)
  const rows = query.data ?? []
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const tableColumns: DataColumn<T>[] = columns.map((c) => ({
    header: c.header,
    cell: (row) => (c.cell ? c.cell(row) : (c.value(row) ?? "—")),
    align: c.align,
    className: c.className,
    title: c.title,
    actions: c.actions,
  }))

  function exportCsv() {
    if (!filename) return
    const url = URL.createObjectURL(new Blob([toCsv(columns, rows)], { type: "text/csv;charset=utf-8" }))
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
        {filename && (
          <Button type="button" variant="outline" size="sm" disabled={rows.length === 0} onClick={exportCsv}>
            <Download aria-hidden="true" />
            Xuất CSV
          </Button>
        )}
      </div>
      <DataTable
        query={query}
        rows={visible}
        columns={tableColumns}
        rowKey={(row, i) => rowKey(row, (current - 1) * PAGE_SIZE + i)}
        errorText="Không tải được báo cáo."
        emptyText={emptyText}
      />
      <Pager page={current} pageCount={pageCount} total={rows.length} unit={unit} onPage={setPage} />
    </div>
  )
}
