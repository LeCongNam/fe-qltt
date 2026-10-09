import type { FormEvent, ReactNode } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/**
 * Ô tìm/lọc kèm nút gửi; chỉ gọi `onSubmit` khi bấm nút hoặc Enter (không gọi API mỗi lần gõ).
 * `children` hiện sau nút gửi (ví dụ nút "Xóa tìm kiếm").
 */
export function SearchForm({
  value,
  onChange,
  onSubmit,
  label,
  placeholder,
  maxLength,
  submitLabel = "Tìm",
  className,
  fieldClassName = "max-w-md",
  children,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  /** Nhãn đọc cho trình đọc màn hình. */
  label: string
  placeholder: string
  maxLength: number
  submitLabel?: string
  className?: string
  /** Chiều rộng tối đa của ô nhập (class Tailwind). */
  fieldClassName?: string
  children?: ReactNode
}) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <label className={cn("relative w-full", fieldClassName)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
        <Input
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className="h-9 rounded-md border-input bg-white pl-9 text-sm"
        />
      </label>
      <Button type="submit" variant="outline">
        {submitLabel}
      </Button>
      {children}
    </form>
  )
}
