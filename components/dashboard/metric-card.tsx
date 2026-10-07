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
  green: "bg-[#e6f3ed] text-[#0f6a52]",
  orange: "bg-[#fbefe3] text-[#975e34]",
  blue: "bg-[#e9f0f3] text-[#456a7c]",
  rose: "bg-[#f8e9e6] text-[#a35143]",
}

export function MetricCard({ label, value, hint, icon: Icon, tone }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-[#e7e9e4] bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-[#65716b]">{label}</p>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${toneClasses[tone]}`}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="text-[26px] font-semibold leading-none tabular-nums text-[#1c2c26]">{value}</p>
        {hint && <span className="text-xs font-medium text-[#5f6b64]">{hint}</span>}
      </div>
    </div>
  )
}
