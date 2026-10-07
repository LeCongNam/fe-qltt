"use client"

import type { ReactNode } from "react"
import type { UseQueryResult } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

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
  /** Có thì tiêu đề cột là nút sắp xếp. `dir` null = cột chưa là khóa sắp xếp; `isDefault` = chiều này là thứ tự có sẵn của dữ liệu. */
  sort?: { dir: "asc" | "desc" | null; isDefault?: boolean; onToggle: () => void }
}

type QueryState = Pick<UseQueryResult<unknown>, "isPending" | "isError" | "isSuccess" | "error" | "refetch">

// Viền dưới vẽ bằng bóng vì `border-collapse` làm viền của ô dính không đi theo khi cuộn.
const STICKY_HEAD = "sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_0_var(--border)]"

const align = (c: { align?: "right" }) => (c.align === "right" ? "text-right" : "")

function HeadContent<T>({ column: c }: { column: DataColumn<T> }) {
  if (!c.sort) return c.header
  const { dir, isDefault, onToggle } = c.sort
  const Icon = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isDefault ? "Thứ tự mặc định, bấm để đổi chiều" : "Sắp xếp theo cột này"}
      className="inline-flex items-center gap-1 rounded-sm whitespace-nowrap hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {c.header}
      <Icon aria-hidden="true" className={`size-3.5 ${dir === null ? "text-icon" : isDefault ? "text-faint" : "text-primary"}`} />
    </button>
  )
}

/**
 * Bảng dữ liệu dùng chung. Từ `md` trở lên là bảng; dưới `md` mỗi dòng thành một thẻ
 * (tiêu đề + các cặp nhãn/giá trị) để không phải cuộn ngang. Gồm đủ trạng thái tải/lỗi/rỗng.
 * Không truyền `query` khi dữ liệu đã có sẵn (coi như đã tải xong). `embedded`: bảng nằm trong một khung có sẵn
 * viền (thẻ có tiêu đề riêng), nên bảng bỏ viền và thẻ mobile có đệm.
 * `fill`: trang vừa khít màn hình (xem `isFitPage`), từ `md` bảng tự cuộn trong khung và cố định hàng tiêu đề;
 * phần tử cha phải là cột flex có `min-h-0`.
 */
export function DataTable<T>({
  query,
  rows,
  columns,
  rowKey,
  errorText,
  emptyText,
  skeletonRows = 5,
  embedded = false,
  fill = false,
}: {
  query?: QueryState
  rows: T[]
  columns: DataColumn<T>[]
  rowKey: (row: T, index: number) => string | number
  errorText: string
  emptyText: string
  skeletonRows?: number
  embedded?: boolean
  fill?: boolean
}) {
  const isPending = query?.isPending ?? false
  const isError = query?.isError ?? false
  const isSuccess = query?.isSuccess ?? true
  const titleCol = columns.find((c) => c.title) ?? columns.find((c) => !c.actions)
  const fieldCols = columns.filter((c) => c !== titleCol && !c.actions)
  const actionCols = columns.filter((c) => c !== titleCol && c.actions)
  const showRows = isSuccess && rows.length > 0

  const retry = query && (
    <button type="button" className="underline" onClick={() => query.refetch()}>
      Thử lại
    </button>
  )

  // Một vùng thông báo chung cho cả hai chế độ (bảng/thẻ) để trình đọc màn hình biết trạng thái tải, lỗi, số dòng.
  const liveText = isPending
    ? "Đang tải dữ liệu"
    : isError
      ? getApiErrorMessage(query?.error, errorText)
      : rows.length === 0
        ? emptyText
        : `${rows.length} dòng`

  return (
    <>
      <p role={isError ? "alert" : "status"} className="sr-only">
        {liveText}
      </p>
      <div
        aria-busy={isPending}
        className={`hidden md:block ${embedded ? "" : "rounded-lg border border-border bg-white"} ${fill ? "md:min-h-0 md:overflow-auto" : ""}`}
      >
        <Table containerClassName={fill ? "overflow-visible" : undefined}>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead
                  key={c.header}
                  aria-sort={c.sort?.dir ? (c.sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={`${align(c)} ${c.className ?? ""} ${fill ? STICKY_HEAD : ""}`}
                >
                  <HeadContent column={c} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: skeletonRows }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={columns.length}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {isError && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-destructive">
                  {getApiErrorMessage(query?.error, errorText)} {retry}
                </TableCell>
              </TableRow>
            )}
            {isSuccess && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
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

      <div aria-busy={isPending} className={embedded ? "p-3 md:hidden" : "md:hidden"}>
        {isPending && (
          <div className="grid gap-2" aria-hidden="true">
            {Array.from({ length: Math.min(skeletonRows, 4) }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}
        {isError && (
          <p className="rounded-lg border border-border bg-white px-4 py-8 text-center text-sm text-destructive">
            {getApiErrorMessage(query?.error, errorText)} {retry}
          </p>
        )}
        {isSuccess && rows.length === 0 && (
          <p className="rounded-lg border border-border bg-white px-4 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
        )}
        {showRows && (
          <ul className="grid gap-2">
            {rows.map((row, i) => (
              <li key={rowKey(row, i)} className="rounded-lg border border-border bg-white p-3">
                {titleCol && <div className="text-sm font-medium text-foreground [&_a]:text-primary">{titleCol.cell(row)}</div>}
                <dl className={`grid gap-1.5 text-sm ${titleCol ? "mt-2" : ""}`}>
                  {fieldCols.map((c) => (
                    <div key={c.header} className="flex items-baseline justify-between gap-4">
                      <dt className="shrink-0 text-xs text-muted-foreground">{c.header}</dt>
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
