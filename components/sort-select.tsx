"use client"

import { ArrowDown, ArrowUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DEFAULT_ORDER = "__default"

/**
 * Ô chọn cột sắp xếp kèm nút đổi chiều. Dành cho mobile, nơi tiêu đề cột của bảng bị ẩn (xem `DataTable`);
 * ở `md` trở lên dùng nút trên tiêu đề cột nên ô này tự ẩn.
 */
export function SortSelect({
  options,
  value,
  dir,
  onValueChange,
  onToggleDir,
  className = "",
}: {
  options: { value: string; label: string }[]
  /** Giá trị đang sắp xếp; `null` = thứ tự mặc định. */
  value: string | null
  dir: "asc" | "desc"
  onValueChange: (value: string | null) => void
  onToggleDir: () => void
  className?: string
}) {
  if (options.length === 0) return null
  return (
    <div className={`flex items-center gap-1 md:hidden ${className}`}>
      <Select
        value={value ?? DEFAULT_ORDER}
        items={[{ value: DEFAULT_ORDER, label: "Thứ tự mặc định" }, ...options]}
        onValueChange={(v) => {
          if (v) onValueChange(v === DEFAULT_ORDER ? null : v)
        }}
      >
        <SelectTrigger aria-label="Sắp xếp theo" className="h-9 w-44 border-input bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DEFAULT_ORDER}>Thứ tự mặc định</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value !== null && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          aria-label={dir === "asc" ? "Đang tăng dần, bấm để giảm dần" : "Đang giảm dần, bấm để tăng dần"}
          onClick={onToggleDir}
        >
          {dir === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
        </Button>
      )}
    </div>
  )
}
