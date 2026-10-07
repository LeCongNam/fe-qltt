"use client"

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { cn } from "cn"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

export type ComboboxOption = { value: string; label: string }

/**
 * Ô chọn một giá trị có lọc theo chữ gõ (không phân biệt hoa thường và dấu), dùng thay `Select` khi danh sách dài.
 * Giá trị là chuỗi `value` của lựa chọn (không phải cả đối tượng); `null` = chưa chọn.
 */
function Combobox({
  id,
  name,
  options,
  value,
  onValueChange,
  placeholder,
  emptyText = "Không tìm thấy kết quả",
  disabled,
  invalid,
  clearable,
  className,
  ...inputProps
}: {
  id?: string
  name?: string
  options: ComboboxOption[]
  value: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  invalid?: boolean
  /** Hiện nút xóa lựa chọn (mặc định không: các ô bắt buộc không cần). */
  clearable?: boolean
  className?: string
} & Pick<React.ComponentProps<"input">, "aria-label" | "aria-describedby">) {
  const selected = options.find((o) => o.value === value) ?? null

  return (
    <ComboboxPrimitive.Root
      items={options}
      name={name}
      value={selected}
      onValueChange={(option) => onValueChange(option?.value ?? null)}
      isItemEqualToValue={(a, b) => a.value === b.value}
      locale="vi"
      disabled={disabled}
    >
      <ComboboxPrimitive.InputGroup data-slot="combobox-input-group" className="relative w-full">
        <ComboboxPrimitive.Input
          id={id}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          data-slot="combobox-input"
          className={cn(
            "h-10 w-full min-w-0 rounded-md border border-input bg-white py-1 pr-16 pl-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
            className
          )}
          {...inputProps}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          {clearable && (
            <ComboboxPrimitive.Clear
              aria-label="Xóa lựa chọn"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </ComboboxPrimitive.Clear>
          )}
          <ComboboxPrimitive.Trigger
            aria-label="Mở danh sách"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronDownIcon className="size-4" aria-hidden="true" />
          </ComboboxPrimitive.Trigger>
        </div>
      </ComboboxPrimitive.InputGroup>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={4} className="isolate z-50 outline-none">
          <ComboboxPrimitive.Popup
            data-slot="combobox-content"
            className="w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <ComboboxPrimitive.Empty className="px-3 py-4 text-center text-sm text-muted-foreground empty:hidden">
              {emptyText}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto overscroll-contain p-1 outline-none data-empty:p-0">
              {(option: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  className="relative flex w-full cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  <ComboboxPrimitive.ItemIndicator className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                    <CheckIcon className="size-4" aria-hidden="true" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

export { Combobox }
