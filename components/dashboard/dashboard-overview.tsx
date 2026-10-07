"use client"

import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  BookMarked,
  Check,
  ChevronDown,
  Clock3,
  LibraryBig,
  ListFilter,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MetricCard } from "@/components/dashboard/metric-card"

const chartData = [
  { day: "T2", borrowed: 58, returned: 42 },
  { day: "T3", borrowed: 72, returned: 55 },
  { day: "T4", borrowed: 64, returned: 49 },
  { day: "T5", borrowed: 91, returned: 67 },
  { day: "T6", borrowed: 78, returned: 73 },
  { day: "T7", borrowed: 108, returned: 82 },
  { day: "CN", borrowed: 86, returned: 70 },
]

const chartConfig = {
  borrowed: { label: "Lượt mượn", color: "#147d64" },
  returned: { label: "Lượt trả", color: "#e99a68" },
} satisfies ChartConfig

const loanRows = [
  { id: "PM-2048", reader: "Nguyễn Minh Anh", book: "Dữ liệu lớn và ứng dụng", due: "Hôm nay", status: "Đến hạn" },
  { id: "PM-2046", reader: "Trần Hoàng Nam", book: "Tư duy thiết kế", due: "01/10/2026", status: "Đang mượn" },
  { id: "PM-2041", reader: "Lê Thu Hà", book: "Nhập môn trí tuệ nhân tạo", due: "Quá hạn 2 ngày", status: "Quá hạn" },
  { id: "PM-2039", reader: "Phạm Quốc Bảo", book: "Khoa học dữ liệu thực hành", due: "02/10/2026", status: "Đang mượn" },
]

export function DashboardOverview() {
  return (
    <>
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-[#738078]">Thứ Tư, 30 tháng 9, 2026</p>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight text-[#1c2c26]">Tổng quan</h1>
          <p className="mt-1.5 text-sm text-[#758078]">Tình hình hoạt động và các đầu việc trong thư viện.</p>
        </div>
        <button type="button" className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-[#dfe5df] bg-white px-3 text-xs font-medium text-[#45554c] shadow-sm transition-colors hover:bg-[#f9faf8] sm:self-auto">
          <ArrowDownToLine className="size-4" aria-hidden="true" />
          Xuất báo cáo
        </button>
      </section>

      <section aria-label="Chỉ số thư viện" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Lượt mượn đang hoạt động" value="1.248" change="8,2%" icon={BookMarked} tone="green" />
        <MetricCard label="Phiếu đến hạn hôm nay" value="18" change="3 cần nhắc" icon={Clock3} tone="orange" />
        <MetricCard label="Đặt trước chờ xử lý" value="32" change="12 mới" icon={ListFilter} tone="blue" />
        <MetricCard label="Bản sách khả dụng" value="8.462" change="4,6%" icon={LibraryBig} tone="rose" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.8fr)]">
        <div className="rounded-lg border border-[#e7e9e4] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[#293a32]">Lưu thông trong tuần</h2>
              <p className="mt-1 text-xs text-[#87918b]">So sánh lượt mượn và lượt trả</p>
            </div>
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e5e9e4] px-2.5 text-xs text-[#58665e] hover:bg-[#f8f9f7]">
              7 ngày qua <ChevronDown className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5">
            <ChartContainer config={chartConfig} className="h-[230px] w-full" aria-label="Biểu đồ lượt mượn và trả trong tuần">
              <AreaChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillBorrowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-borrowed)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-borrowed)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-returned)" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="var(--color-returned)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#edf0eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} tick={{ fill: "#87918b", fontSize: 11 }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area type="monotone" dataKey="borrowed" stroke="var(--color-borrowed)" strokeWidth={2.5} fill="url(#fillBorrowed)" />
                <Area type="monotone" dataKey="returned" stroke="var(--color-returned)" strokeWidth={2} fill="url(#fillReturned)" />
              </AreaChart>
            </ChartContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-[#68756e]">
            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#147d64]" />Lượt mượn</span>
            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#e99a68]" />Lượt trả</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#e7e9e4] bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#293a32]">Cần chú ý</h2>
              <p className="mt-1 text-xs text-[#87918b]">Các việc cần ưu tiên hôm nay</p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-md bg-[#fbefe3] text-[#bd713c]"><AlertCircle className="size-4" aria-hidden="true" /></span>
          </div>
          <div className="mt-4 divide-y divide-[#eef0ec]">
            <Link href="/phieu-muon" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#fafbf9]">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#fbefe3] text-[#bd713c]"><Clock3 className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-[#37483f]">Phiếu mượn đến hạn</span><span className="mt-0.5 block text-[11px] text-[#87918b]">Cần nhắc độc giả trả sách</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-[#bd713c]">18</span>
            </Link>
            <Link href="/phat" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#fafbf9]">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#f8e9e6] text-[#bb6759]"><WalletCards className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-[#37483f]">Khoản phạt chưa thu</span><span className="mt-0.5 block text-[11px] text-[#87918b]">Từ 7 phiếu quá hạn</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-[#bb6759]">1,25 tr</span>
            </Link>
            <Link href="/dat-truoc" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#fafbf9]">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#e9f0f3] text-[#537687]"><BookMarked className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-[#37483f]">Yêu cầu đặt trước</span><span className="mt-0.5 block text-[11px] text-[#87918b]">Đang chờ xác nhận</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-[#537687]">32</span>
            </Link>
          </div>
          <Link href="/bao-cao" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#147d64] hover:text-[#0e634f]">
            Xem báo cáo <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e7e9e4] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-[#293a32]">Phiếu mượn gần đây</h2>
            <p className="mt-1 text-xs text-[#87918b]">Theo dõi tình trạng các giao dịch mới nhất</p>
          </div>
          <Link href="/phieu-muon" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#e5e9e4] px-2.5 text-xs font-medium text-[#58665e] hover:bg-[#f8f9f7]">
            <ListFilter className="size-3.5" aria-hidden="true" />
            Tất cả phiếu
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#fafbf9] hover:bg-[#fafbf9]">
              <TableHead className="pl-5 text-[11px] font-semibold uppercase tracking-wide text-[#87918b]">Mã phiếu</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-[#87918b]">Độc giả</TableHead>
              <TableHead className="hidden text-[11px] font-semibold uppercase tracking-wide text-[#87918b] md:table-cell">Tên sách</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-[#87918b]">Hạn trả</TableHead>
              <TableHead className="pr-5 text-[11px] font-semibold uppercase tracking-wide text-[#87918b]">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanRows.map((loan) => (
              <TableRow key={loan.id} className="border-[#eef0ec]">
                <TableCell className="pl-5 text-xs font-semibold text-[#43534a]">{loan.id}</TableCell>
                <TableCell className="text-xs text-[#59675f]">{loan.reader}</TableCell>
                <TableCell className="hidden max-w-[260px] truncate text-xs text-[#758078] md:table-cell">{loan.book}</TableCell>
                <TableCell className={`text-xs ${loan.status === "Quá hạn" ? "font-medium text-[#bb6759]" : "text-[#758078]"}`}>{loan.due}</TableCell>
                <TableCell className="pr-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ${loan.status === "Quá hạn" ? "bg-[#f8e9e6] text-[#a95245]" : loan.status === "Đến hạn" ? "bg-[#fbefe3] text-[#a66739]" : "bg-[#e8f3ed] text-[#35755f]"}`}>
                    {loan.status === "Quá hạn" ? <AlertCircle className="size-3" /> : loan.status === "Đến hạn" ? <Clock3 className="size-3" /> : <Check className="size-3" />}
                    {loan.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
      <div className="flex items-center justify-between border-t border-[#e7e9e4] pt-4 text-[11px] text-[#8a948e]">
        <span>Thư viện số · Bảng điều khiển</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#668f7c]" /> Hệ thống hoạt động ổn định</span>
      </div>
    </>
  )
}