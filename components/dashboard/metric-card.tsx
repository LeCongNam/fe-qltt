import type { LucideIcon } from "lucide-react"

type MetricCardProps = {
  label: string
  value: string
  /** Dòng phụ nhỏ cạnh số liệu (ví dụ "2 phiếu quá hạn"). */
  hint?: string
  icon: LucideIcon
  tone: "green" | "orange" | "blue" | "rose"
}

const toneClasses = {
  green: "bg-primary-soft text-primary-strong",
  orange: "bg-clay-soft text-clay",
  blue: "bg-info-soft text-info",
  rose: "bg-destructive-soft text-destructive",
}

export function MetricCard({ label, value, hint, icon: Icon, tone }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${toneClasses[tone]}`}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="text-[26px] font-semibold leading-none tabular-nums text-foreground">{value}</p>
        {hint && <span className="text-xs font-medium text-muted-foreground">{hint}</span>}
      </div>
    </div>
  )
}
