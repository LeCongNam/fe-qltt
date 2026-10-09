"use client"

import { useState, type ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { Download } from "lucide-react"

import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { Button } from "@/components/ui/button"
import { SortSelect } from "@/components/sort-select"

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
  /** Khóa sắp xếp khi khác `value` (ví dụ ngày: `value` là chuỗi dd/MM/yyyy, khóa là ISO). */
  sortBy?: (row: T) => string | number | null
  /** Tắt sắp xếp cho cột này (mặc định cột nào cũng sắp xếp được, trừ cột `actions`). */
  sortable?: false
}

type SortDir = "asc" | "desc"
type SortState = { header: string; dir: SortDir }

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" })

function compareKeys(a: string | number, b: string | number) {
  return typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a), String(b))
}

const PAGE_SIZE = 15

/** Sắp xếp ổn định theo khóa của cột; ô trống luôn xếp cuối, bất kể chiều. */
function sortRows<T>(rows: T[], col: Column<T>, dir: SortDir) {
  const key = (row: T) => {
    const k = col.sortBy ? col.sortBy(row) : col.value(row)
    return k === "" ? null : k
  }
  const sign = dir === "asc" ? 1 : -1
  return rows
    .map((row, i) => ({ row, i, k: key(row) }))
    .sort((a, b) => {
      if (a.k === null || b.k === null) return a.k === b.k ? a.i - b.i : a.k === null ? 1 : -1
      return compareKeys(a.k, b.k) * sign || a.i - b.i
    })
    .map((x) => x.row)
}

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
  defaultOrder,
  emptyText = "Không có dữ liệu.",
}: {
  query: UseQueryResult<T[]>
  columns: Column<T>[]
  rowKey: (row: T, index: number) => string
  unit: string
  /** Có tên file thì hiện nút xuất CSV. */
  filename?: string
  toolbar?: ReactNode
  /** Thứ tự BE đang trả (chỉ để hiển thị trên tiêu đề cột, không sắp xếp lại). Bỏ trống nếu BE không nêu rõ. */
  defaultOrder?: SortState
  emptyText?: string
}) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState | null>(null)
  const data = query.data ?? []
  const sortCol = sort ? columns.find((c) => c.header === sort.header && !c.actions && c.sortable !== false) : undefined
  const rows = sortCol && sort ? sortRows(data, sortCol, sort.dir) : data
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const sortableColumns = columns.filter((c) => !c.actions && c.sortable !== false)

  // Bấm lần lượt: tăng dần → giảm dần → về thứ tự mặc định của BE.
  function toggleSort(header: string) {
    setPage(1)
    setSort((cur) => (cur?.header !== header ? { header, dir: "asc" } : cur.dir === "asc" ? { header, dir: "desc" } : null))
  }

  const tableColumns: DataColumn<T>[] = columns.map((c) => ({
    header: c.header,
    sort:
      c.actions || c.sortable === false
        ? undefined
        : {
            dir: sort?.header === c.header ? sort.dir : !sort && defaultOrder?.header === c.header ? defaultOrder.dir : null,
            isDefault: !sort && defaultOrder?.header === c.header,
            onToggle: () => toggleSort(c.header),
          },
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

  const sortNote = sort && sortCol ? `Đang sắp xếp theo ${sortCol.header}, ${sort.dir === "asc" ? "tăng dần" : "giảm dần"}` : "Thứ tự mặc định"

  return (
    <div className="md:flex md:min-h-72 md:flex-1 md:flex-col">
      <p role="status" className="sr-only">
        {sortNote}
      </p>
      <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          <SortSelect
            options={sortableColumns.map((c) => ({ value: c.header, label: c.header }))}
            value={sortCol?.header ?? null}
            dir={sort?.dir ?? "asc"}
            onValueChange={(v) => {
              setPage(1)
              setSort(v === null ? null : { header: v, dir: "asc" })
            }}
            onToggleDir={() => sort && setSort({ header: sort.header, dir: sort.dir === "asc" ? "desc" : "asc" })}
          />
        </div>
        {filename && (
          <Button type="button" variant="outline" size="sm" disabled={rows.length === 0} onClick={exportCsv}>
            <Download aria-hidden="true" />
            Xuất CSV
          </Button>
        )}
      </div>
      <DataTable
        fill
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
