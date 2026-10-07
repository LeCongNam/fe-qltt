import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Chân bảng: tổng số bản ghi và nút chuyển trang. */
export function Pager({
  page,
  pageCount,
  total,
  unit,
  onPage,
}: {
  page: number
  pageCount: number
  total: number
  unit: string
  onPage: (page: number) => void
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-[#758078]">
      <span>
        {total} {unit}
      </span>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <span>
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
