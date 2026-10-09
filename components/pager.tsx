import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Chân bảng: tổng số bản ghi và nút chuyển trang. */
export function Pager({
  page,
  pageCount,
  total,
  unit,
  order,
  onPage,
}: {
  page: number
  pageCount: number
  total: number
  unit: string
  /** Quy tắc sắp xếp của danh sách (BE quyết định), ví dụ "mới nhất trước". */
  order?: string
  onPage: (page: number) => void
}) {
  return (
    <div className="mt-4 flex shrink-0 items-center justify-between text-xs text-muted-foreground">
      <span>
        {total} {unit}
        {order && <span> · Xếp theo {order}</span>}
      </span>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <span aria-live="polite" aria-atomic="true">
            Trang {page} / {pageCount}
          </span>
          <Button variant="outline" size="icon-sm" aria-label="Trang sau" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  )
}
