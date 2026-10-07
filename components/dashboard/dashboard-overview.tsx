"use client"

import { AlertCircle, ArrowUpRight, BookMarked, Check, Clock3, LibraryBig, ListFilter, ShieldCheck, WalletCards } from "lucide-react"
import Link from "next/link"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { MetricCard } from "@/components/dashboard/metric-card"
import { isOverdue, todayIso } from "@/components/luu-thong/luu-thong-meta"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import {
  type DanhMucSachDong,
  type DatTruocDong,
  type LichSuMuonDong,
  type MuonQuaHanDong,
  type SachDangMuonDong,
  type ThongKeTienPhatDong,
  useBaoCao,
} from "@/lib/bao-cao"
import { formatDate, formatVnd } from "@/lib/format"

const chartConfig = {
  borrowed: { label: "Lượt mượn", color: "#147d64" },
  returned: { label: "Lượt trả", color: "#e99a68" },
} satisfies ChartConfig

const DAYS = 14
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
  if (r.ngay_tra) return { label: "Đã trả", tone: "bg-[#e8f3ed] text-[#35755f]", Icon: Check }
  if (isOverdue(r.han_tra, r.ngay_tra)) return { label: "Quá hạn", tone: "bg-[#f8e9e6] text-[#a95245]", Icon: AlertCircle }
  if (r.han_tra.slice(0, 10) === today) return { label: "Đến hạn", tone: "bg-[#fbefe3] text-[#a66739]", Icon: Clock3 }
  return { label: "Đang mượn", tone: "bg-[#fff3df] text-[#9a6412]", Icon: Clock3 }
}

export function DashboardOverview() {
  const { isStaff, ready } = useAuth()
  const dangMuon = useBaoCao<SachDangMuonDong>("sach-dang-muon")
  const quaHan = useBaoCao<MuonQuaHanDong>("muon-qua-han")
  const datTruoc = useBaoCao<DatTruocDong>("dat-truoc")
  const danhMuc = useBaoCao<DanhMucSachDong>("danh-muc-sach")
  const tienPhat = useBaoCao<ThongKeTienPhatDong>("thong-ke-tien-phat")
  const lichSu = useBaoCao<LichSuMuonDong>("lich-su-muon")

  if (ready && !isStaff) {
    return <p className="text-sm text-[#bb6759]">Bạn không có quyền xem trang tổng quan.</p>
  }

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
          <p className="text-xs font-medium capitalize text-[#738078]">{todayLabel}</p>
          <h1 className="mt-1.5 text-[26px] font-semibold leading-tight text-[#1c2c26]">Tổng quan</h1>
          <p className="mt-1.5 text-sm text-[#758078]">Tình hình hoạt động và các đầu việc trong thư viện.</p>
        </div>
        <Link href="/bao-cao" className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-md border border-[#dfe5df] bg-white px-3 text-xs font-medium text-[#45554c] shadow-sm transition-colors hover:bg-[#f9faf8] sm:self-auto">
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
        <div className="rounded-lg border border-[#e7e9e4] bg-white p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-semibold text-[#293a32]">Lưu thông {DAYS} ngày qua</h2>
            <p className="mt-1 text-xs text-[#87918b]">So sánh lượt mượn và lượt trả theo ngày</p>
          </div>
          <div className="mt-5">
            {lichSu.isPending ? (
              <Skeleton className="h-[230px] w-full" />
            ) : lichSu.isError ? (
              <p className="py-16 text-center text-sm text-[#bb6759]">Không tải được dữ liệu lưu thông.</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-[230px] w-full" aria-label="Biểu đồ lượt mượn và trả theo ngày">
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
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} interval="preserveStartEnd" minTickGap={16} tick={{ fill: "#87918b", fontSize: 11 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#87918b", fontSize: 11 }} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area type="monotone" dataKey="borrowed" stroke="var(--color-borrowed)" strokeWidth={2.5} fill="url(#fillBorrowed)" />
                  <Area type="monotone" dataKey="returned" stroke="var(--color-returned)" strokeWidth={2} fill="url(#fillReturned)" />
                </AreaChart>
              </ChartContainer>
            )}
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
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#fbefe3] text-[#bd713c]"><Clock3 className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-[#37483f]">Phiếu mượn quá hạn</span><span className="mt-0.5 block text-[11px] text-[#87918b]">Cần nhắc người mượn trả sách</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-[#bd713c]">{num(quaHan.data?.length)}</span>
            </Link>
            <Link href="/phat" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#fafbf9]">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#f8e9e6] text-[#bb6759]"><WalletCards className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-[#37483f]">Khoản phạt chưa thu</span><span className="mt-0.5 block text-[11px] text-[#87918b]">Tổng các phiếu phạt chưa thanh toán</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-[#bb6759]">{chuaThu === undefined ? "—" : formatVnd(chuaThu)}</span>
            </Link>
            <Link href="/dat-truoc" className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-[#fafbf9]">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#e9f0f3] text-[#537687]"><BookMarked className="size-4" /></span><span className="min-w-0"><span className="block text-xs font-medium text-[#37483f]">Yêu cầu đặt trước</span><span className="mt-0.5 block text-[11px] text-[#87918b]">Đang chờ có bản sách</span></span></span>
              <span className="text-sm font-semibold tabular-nums text-[#537687]">{num(choXuLy)}</span>
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
            <h2 className="text-sm font-semibold text-[#293a32]">Lượt mượn gần đây</h2>
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
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-[#87918b]">Người mượn</TableHead>
              <TableHead className="hidden text-[11px] font-semibold uppercase tracking-wide text-[#87918b] md:table-cell">Tên sách</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wide text-[#87918b]">Hạn trả</TableHead>
              <TableHead className="pr-5 text-[11px] font-semibold uppercase tracking-wide text-[#87918b]">Trạng thái</TableHead>
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
                <TableCell colSpan={5} className="py-8 text-center text-sm text-[#bb6759]">
                  Không tải được lượt mượn gần đây.
                </TableCell>
              </TableRow>
            )}
            {lichSu.isSuccess && recent.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-[#758078]">
                  Chưa có lượt mượn nào.
                </TableCell>
              </TableRow>
            )}
            {recent.map((loan) => {
              const status = loanStatus(loan, today)
              return (
                <TableRow key={`${loan.ma_phieu}-${loan.ma_ban_sach}`} className="border-[#eef0ec]">
                  <TableCell className="pl-5 text-xs font-semibold">
                    <Link href={`/phieu-muon/${loan.ma_phieu}`} className="text-[#43534a] hover:text-[#147d64] hover:underline">
                      {loan.ma_phieu}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-[#59675f]">{loan.ho_ten}</TableCell>
                  <TableCell className="hidden max-w-[260px] truncate text-xs text-[#758078] md:table-cell">{loan.ten_sach}</TableCell>
                  <TableCell className={`text-xs ${status.label === "Quá hạn" ? "font-medium text-[#bb6759]" : "text-[#758078]"}`}>
                    {status.label === "Quá hạn" ? `Quá hạn ${loan.so_ngay_qua_han} ngày` : formatDate(loan.han_tra)}
                  </TableCell>
                  <TableCell className="pr-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ${status.tone}`}>
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
      <div className="flex items-center justify-between border-t border-[#e7e9e4] pt-4 text-[11px] text-[#8a948e]">
        <span>Thư viện số · Bảng điều khiển</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-[#668f7c]" /> Số liệu đọc trực tiếp từ cơ sở dữ liệu</span>
      </div>
    </>
  )
}
