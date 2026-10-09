import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Đầu trang nội dung: dòng nhỏ phía trên (`eyebrow`, hoặc liên kết quay lại `back`), tiêu đề, mô tả và nút thao tác bên phải.
 * Trang nằm trong container `space-y-6` thì truyền `className="mb-0"`.
 */
export function PageHeader({
  eyebrow,
  back,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  back?: { href: string; label: string }
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-6 border-b border-border pb-5", action && "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        {back ? (
          <Link href={back.href} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {back.label}
          </Link>
        ) : (
          eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>
        )}
        <h2 className="mt-1.5 text-xl font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
