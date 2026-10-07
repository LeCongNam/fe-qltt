"use client"

import type { ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"

import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getApiErrorMessage } from "@/lib/api"

export type DataColumn<T> = {
  header: string
  cell: (row: T) => ReactNode
  align?: "right"
  /** Class cho `th`/`td` của bảng (desktop), ví dụ `w-28` hoặc `whitespace-normal`. */
  className?: string
  /** Cột làm tiêu đề thẻ trên mobile. Không cột nào đánh dấu thì lấy cột đầu. */
  title?: boolean
  /** Cột thao tác: nằm cuối thẻ, không có nhãn. Thẻ không có nội dung thì ẩn. */
  actions?: boolean
}

type QueryState = Pick<UseQueryResult<unknown>, "isPending" | "isError" | "isSuccess" | "error" | "refetch">

const align = (c: { align?: "right" }) => (c.align === "right" ? "text-right" : "")

/**
 * Bảng dữ liệu dùng chung. Từ `md` trở lên là bảng; dưới `md` mỗi dòng thành một thẻ
 * (tiêu đề + các cặp nhãn/giá trị) để không phải cuộn ngang. Gồm đủ trạng thái tải/lỗi/rỗng.
 */
export function DataTable<T>({
  query,
  rows,
  columns,
  rowKey,
  errorText,
  emptyText,
  skeletonRows = 5,
}: {
  query: QueryState
  rows: T[]
  columns: DataColumn<T>[]
  rowKey: (row: T, index: number) => string | number
  errorText: string
  emptyText: string
  skeletonRows?: number
}) {
  const titleCol = columns.find((c) => c.title) ?? columns.find((c) => !c.actions)
  const fieldCols = columns.filter((c) => c !== titleCol && !c.actions)
  const actionCols = columns.filter((c) => c !== titleCol && c.actions)
  const showRows = query.isSuccess && rows.length > 0

  const retry = (
    <button type="button" className="underline" onClick={() => query.refetch()}>
      Thử lại
    </button>
  )

  return (
    <>
      <div className="hidden rounded-lg border border-[#e4e8e2] bg-white md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.header} className={`${align(c)} ${c.className ?? ""}`}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isPending &&
              Array.from({ length: skeletonRows }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {query.isError && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-[#a35143]">
                  {getApiErrorMessage(query.error, errorText)} {retry}
                </TableCell>
              </TableRow>
            )}
            {query.isSuccess && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-[#5f6b64]">
                  {emptyText}
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, i) => (
              <TableRow key={rowKey(row, i)}>
                {columns.map((c) => (
                  <TableCell key={c.header} className={`${align(c)} ${c.className ?? ""}`}>
                    {c.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden">
        {query.isPending && (
          <div className="grid gap-2" aria-hidden="true">
            {Array.from({ length: Math.min(skeletonRows, 4) }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}
        {query.isError && (
          <p role="alert" className="rounded-lg border border-[#e4e8e2] bg-white px-4 py-8 text-center text-sm text-[#a35143]">
            {getApiErrorMessage(query.error, errorText)} {retry}
          </p>
        )}
        {query.isSuccess && rows.length === 0 && (
          <p className="rounded-lg border border-[#e4e8e2] bg-white px-4 py-8 text-center text-sm text-[#5f6b64]">{emptyText}</p>
        )}
        {showRows && (
          <ul className="grid gap-2">
            {rows.map((row, i) => (
              <li key={rowKey(row, i)} className="rounded-lg border border-[#e4e8e2] bg-white p-3">
                {titleCol && <div className="text-sm font-medium text-[#1c2c26] [&_a]:text-[#147d64]">{titleCol.cell(row)}</div>}
                <dl className={`grid gap-1.5 text-sm ${titleCol ? "mt-2" : ""}`}>
                  {fieldCols.map((c) => (
                    <div key={c.header} className="flex items-baseline justify-between gap-4">
                      <dt className="shrink-0 text-xs text-[#5f6b64]">{c.header}</dt>
                      <dd className="min-w-0 text-right break-words">{c.cell(row)}</dd>
                    </div>
                  ))}
                </dl>
                {actionCols.map((c) => (
                  <div key={c.header} className="mt-2 flex justify-end gap-1 empty:hidden">
                    {c.cell(row)}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
