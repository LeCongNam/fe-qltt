"use client"

import { AlertCircle, ArrowUpRight, BookMarked, Check, ChartArea, ChartColumn, Clock3, LibraryBig, ListFilter, ShieldCheck, WalletCards } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { MetricCard } from "@/components/dashboard/metric-card"
import { isOverdue, todayIso } from "@/components/luu-thong/luu-thong-meta"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type LichSuMuonDong, useBaoCao } from "@/features/bao-cao/queries"
import { formatDate, formatVnd } from "@/lib/format"

const chartConfig = {
  borrowed: { label: "Lượt mượn", color: "var(--chart-1)" },
  returned: { label: "Lượt trả", color: "var(--chart-2)" },
} satisfies ChartConfig

const DAYS = 14
const CHART_MARGIN = { top: 8, right: 8, left: -20, bottom: 0 }

type ChartKind = "bar" | "area"
const CHART_KINDS = [
  { value: "bar", label: "Cột", Icon: ChartColumn },
  { value: "area", label: "Vùng", Icon: ChartArea },
] as const
const RECENT = 6
const pad = (n: number) => String(n).padStart(2, "0")

/** Số lượt mượn / trả theo từng ngày trong DAYS ngày gần nhất (ngày DATE của BE, so theo chuỗi YYYY-MM-DD). */
function buildChartData(history: LichSuMuonDong[]) {
  const today = new Date()
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (DAYS - 1 - i))
    return { iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, day: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`, borrowed: 0, returned: 0 }
  })
  const byIso = new Map(days.map((d) => [d.iso, d]))
  for (const r of history) {
    const borrowed = byIso.get(r.ngay_muon.slice(0, 10))
    if (borrowed) borrowed.borrowed += 1
    const returned = r.ngay_tra ? byIso.get(r.ngay_tra.slice(0, 10)) : undefined
    if (returned) returned.returned += 1
  }
  return days
}

function loanStatus(r: LichSuMuonDong, today: string) {
  if (r.ngay_tra) return { label: "Đã trả", tone: "bg-primary-soft text-[#35755f]", Icon: Check }
  if (isOverdue(r.han_tra, r.ngay_tra)) return { label: "Quá hạn", tone: "bg-destructive-soft text-destructive", Icon: AlertCircle }
  if (r.han_tra.slice(0, 10) === today) return { label: "Đến hạn", tone: "bg-clay-soft text-clay", Icon: Clock3 }
  return { label: "Đang mượn", tone: "bg-warning-soft text-warning", Icon: Clock3 }
}

export function DashboardOverview() {
    const dangMuon = useBaoCao("sach-dang-muon")
  const quaHan = useBaoCao("muon-qua-han")
  const datTruoc = useBaoCao("dat-truoc")
  const danhMuc = useBaoCao("danh-muc-sach")
  const tienPhat = useBaoCao("thong-ke-tien-phat")
  const lichSu = useBaoCao("lich-su-muon")

  const [chartKind, setChartKind] = useState<ChartKind>("bar")

  const today = todayIso()
  const num = (n: number | undefined) => (n === undefined ? "—" : new Intl.NumberFormat("vi-VN").format(n))

  const dueToday = dangMuon.data?.filter((r) => r.han_tra.slice(0, 10) === today).length
  const choXuLy = datTruoc.data?.filter((r) => r.trang_thai === "CHO_XU_LY").length
  const sanSangNhan = datTruoc.data?.filter((r) => r.trang_thai === "SAN_SANG_NHAN").length
  const banSanSang = danhMuc.data?.reduce((s, r) => s + r.so_ban_san_sang, 0)
  const tongBan = danhMuc.data?.reduce((s, r) => s + r.tong_so_ban, 0)
  const chuaThu = tienPhat.data?.reduce((s, r) => s + r.chua_thanh_toan, 0)

  const history = lichSu.data ?? []
  const chartData = buildChartData(history)
  const recent = [...history].sort((a, b) => b.ngay_muon.localeCompare(a.ngay_muon) || b.ma_phieu.localeCompare(a.ma_phieu)).slice(0, RECENT)
  const todayLabel = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <>
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium capitalize text-muted-foreground">{todayLabel}</p>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight text-foreground">Tổng quan</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Tình hình hoạt động và các đầu việc trong thư viện.</p>
        </div>
        <Link href="/bao-cao" className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-input bg-white px-3 text-xs font-medium text-ink shadow-sm transition-colors hover:bg-surface sm:self-auto">
          Xem báo cáo
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section aria-label="Chỉ số thư viện" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Lượt mượn đang hoạt động" value={num(dangMuon.data?.length)} hint={quaHan.data ? `${quaHan.data.length} quá hạn` : undefined} icon={BookMarked} tone="green" />
        <MetricCard label="Phiếu đến hạn hôm nay" value={num(dueToday)} hint={quaHan.data ? `${quaHan.data.length} đã quá hạn` : undefined} icon={Clock3} tone="orange" />
        <MetricCard label="Đặt trước chờ xử lý" value={num(choXuLy)} hint={sanSangNhan !== undefined ? `${sanSangNhan} sẵn sàng nhận` : undefined} icon={ListFilter} tone="blue" />
        <MetricCard label="Bản sách sẵn sàng" value={num(banSanSang)} hint={tongBan !== undefined ? `trên ${num(tongBan)} bản` : undefined} icon={LibraryBig} tone="rose" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.8fr)]">
        <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-heading">Lưu thông {DAYS} ngày qua</h2>
              <p className="mt-1 text-xs text-faint">So sánh lượt mượn và lượt trả theo ngày</p>
            </div>
            <Tabs value={chartKind} onValueChange={(v) => v && setChartKind(v as ChartKind)} className="shrink-0">
              <TabsList aria-label="Loại biểu đồ">
                {CHART_KINDS.map(({ value, label, Icon }) => (
                  <TabsTrigger key={value} value={value} className="gap-1.5 px-2.5 text-xs data-active:text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-5">
            {lichSu.isPending ? (
              <Skeleton className="h-[230px] w-full" role="status" aria-label="Đang tải biểu đồ" />
            ) : lichSu.isError ? (
              <p role="alert" className="py-16 text-center text-sm text-destructive">Không tải được dữ liệu lưu thông.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[230px] w-full" aria-label="Biểu đồ lượt mượn và trả theo ngày">
                {chartKind === "bar" ? (
                  <BarChart accessibilityLayer data={chartData} barGap={2} margin={CHART_MARGIN}>
                    <CartesianGrid vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} interval="equidistantPreserveStart" minTickGap={12} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                    <YAxis allowDecimals={false} domain={[0, (max: number) => Math.max(max, 2)]} axisLine={false} tickLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                    <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="borrowed" fill="var(--color-borrowed)" radius={[3, 3, 0, 0]} maxBarSize={14} />
                    <Bar dataKey="returned" fill="var(--color-returned)" radius={[3, 3, 0, 0]} maxBarSize={14} />
                  </BarChart>
                ) : (
                  <AreaChart accessibilityLayer data={chartData} margin={CHART_MARGIN}>
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
                    <CartesianGrid vertical={false} stroke="var(--line)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} interval="equidistantPreserveStart" minTickGap={12} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                    <YAxis allowDecimals={false} domain={[0, (max: number) => Math.max(max, 2)]} axisLine={false} tickLine={false} tick={{ fill: "var(--faint)", fontSize: 11 }} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Area type="monotone" dataKey="borrowed" stroke="var(--color-borrowed)" strokeWidth={2.5} fill="url(#fillBorrowed)" />
                    <Area type="monotone" dataKey="returned" stroke="var(--color-returned)" strokeWidth={2} fill="url(#fillReturned)" />
                  </AreaChart>
                )}
              </ChartContainer>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-[2px] bg-primary" />Lượt mượn</span>
            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-[2px] bg-chart-2" />Lượt trả</span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-heading">Cần chú ý</h2>
              <p className="mt-1 text-xs text-faint">Các việc cần ưu tiên hôm nay</p>
            </div>
            <span className="flex size-8 items-center justify-center rounded-md bg-clay-soft text-clay"><AlertCircle className="size-4" aria-hidden="true" /></span>
          </div>
          <div className="mt-4 divide-y divide-line">
            <Link href="/phieu-muon" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-clay-soft text-clay"><Clock3 className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-ink">Phiếu mượn quá hạn</span><span className="mt-0.5 block text-xs text-faint">Cần nhắc người mượn trả sách</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-clay">{num(quaHan.data?.length)}</span>
            </Link>
            <Link href="/phat" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive-soft text-destructive"><WalletCards className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-ink">Khoản phạt chưa thu</span><span className="mt-0.5 block text-xs text-faint">Tổng các phiếu phạt chưa thanh toán</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-destructive">{chuaThu === undefined ? "—" : formatVnd(chuaThu)}</span>
            </Link>
            <Link href="/dat-truoc" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-info-soft text-info"><BookMarked className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-ink">Yêu cầu đặt trước</span><span className="mt-0.5 block text-xs text-faint">Đang chờ có bản sách</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-info">{num(choXuLy)}</span>
            </Link>
          </div>
          <Link href="/bao-cao" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-[#0e634f]">
            Xem báo cáo <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-heading">Lượt mượn gần đây</h2>
            <p className="mt-1 text-xs text-faint">Theo dõi tình trạng các giao dịch mới nhất</p>
          </div>
          <Link href="/phieu-muon" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground hover:bg-surface">
            <ListFilter className="size-3.5" aria-hidden="true" />
            Tất cả phiếu
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-surface hover:bg-surface">
              <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-faint">Mã phiếu</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-faint">Người mượn</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-faint md:table-cell">Tên sách</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-faint">Hạn trả</TableHead>
              <TableHead className="pr-5 text-xs font-semibold uppercase tracking-wide text-faint">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lichSu.isPending &&
              Array.from({ length: 3 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="px-5">
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {lichSu.isError && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                  <span role="alert">Không tải được lượt mượn gần đây.</span>
                </TableCell>
              </TableRow>
            )}
            {lichSu.isSuccess && recent.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Chưa có lượt mượn nào.
                </TableCell>
              </TableRow>
            )}
            {recent.map((loan) => {
              const status = loanStatus(loan, today)
              return (
                <TableRow key={`${loan.ma_phieu}-${loan.ma_ban_sach}`} className="border-line">
                  <TableCell className="pl-5 text-xs font-semibold">
                    <Link href={`/phieu-muon/${loan.ma_phieu}`} className="text-ink hover:text-primary hover:underline">
                      {loan.ma_phieu}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{loan.ho_ten}</TableCell>
                  <TableCell className="hidden max-w-[260px] truncate text-xs text-muted-foreground md:table-cell">{loan.ten_sach}</TableCell>
                  <TableCell className={`text-xs ${status.label === "Quá hạn" ? "font-medium text-destructive" : "text-muted-foreground"}`}>
                    {status.label === "Quá hạn" ? `Quá hạn ${loan.so_ngay_qua_han} ngày` : formatDate(loan.han_tra)}
                  </TableCell>
                  <TableCell className="pr-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${status.tone}`}>
                      <status.Icon className="size-3" />
                      {status.label}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </section>
      <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-faint">
        <span>Thư viện số · Bảng điều khiển</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#668f7c]" /> Số liệu đọc trực tiếp từ cơ sở dữ liệu</span>
      </div>
    </>
  )
}
