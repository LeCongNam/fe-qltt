import type { ReactNode } from "react"

/** Một cặp nhãn/giá trị trong `<dl>` của trang chi tiết; giá trị rỗng hiện "—". */
export function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{children || "—"}</dd>
    </div>
  )
}
