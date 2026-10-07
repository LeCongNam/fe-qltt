"use client"

import { useState } from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Search } from "lucide-react"

import { type Column, ReportTable } from "@/components/report-table"
import { LOAI_PHAT, TINH_TRANG_TRA, TRANG_THAI_DAT_TRUOC } from "@/components/luu-thong/luu-thong-meta"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type DanhMucSachDong,
  type DatTruocDong,
  type LichSuMuonDong,
  type MuonQuaHanDong,
  type NguoiDungViPhamDong,
  type SachDangMuonDong,
  type ThongKeTienPhatDong,
  type TopSachMuonNhieuDong,
  useBaoCao,
} from "@/lib/bao-cao"
import { formatDate, formatVnd } from "@/lib/format"

const phieuLink = (maPhieu: string) => (
  <Link href={`/phieu-muon/${maPhieu}`} className="font-medium text-[#147d64] hover:underline">
    {maPhieu}
  </Link>
)

const nguoiDung = (r: { ma_nguoi_dung: string; ho_ten: string }) => `${r.ho_ten} (${r.ma_nguoi_dung})`

const quaHan = (days: number) => (days > 0 ? <span className="font-medium text-[#a35143]">{days} ngày</span> : "—")

function thangLabel(thang: string) {
  const [y, m] = thang.split("-")
  return `${m}/${y}`
}

/** Ô lọc theo mã người dùng, gửi khi bấm Lọc (không gọi API mỗi lần gõ). */
function MaNguoiDungFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState(value)
  return (
    <form
      role="search"
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        onChange(input.trim())
      }}
    >
      <label className="relative w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8b9690]" aria-hidden="true" />
        <Input
          aria-label="Lọc theo mã người dùng"
          placeholder="Mã người dùng, ví dụ SV001"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={20}
          className="h-9 rounded-md border-[#dfe5df] bg-white pl-9 text-sm"
        />
      </label>
      <Button type="submit" variant="outline" size="sm" className="h-9">
        Lọc
      </Button>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => {
            setInput("")
            onChange("")
          }}
        >
          Xóa lọc
        </Button>
      )}
    </form>
  )
}

export function DanhMucSachPanel() {
  const query = useBaoCao<DanhMucSachDong>("danh-muc-sach")
  const columns: Column<DanhMucSachDong>[] = [
    { header: "Mã sách", value: (r) => r.ma_sach, className: "w-24" },
    { header: "Tên sách", title: true, value: (r) => r.ten_sach, className: "whitespace-normal" },
    { header: "Thể loại", value: (r) => r.ten_the_loai },
    { header: "Nhà xuất bản", value: (r) => r.ten_nxb, className: "whitespace-normal" },
    { header: "Năm XB", value: (r) => r.nam_xuat_ban, align: "right", className: "w-20" },
    { header: "Tổng bản", value: (r) => r.tong_so_ban, align: "right", className: "w-24" },
    {
      header: "Sẵn sàng",
      value: (r) => r.so_ban_san_sang,
      align: "right",
      className: "w-24",
      cell: (r) => (
        <span className={r.so_ban_san_sang === 0 ? "font-medium text-[#a35143]" : ""}>{r.so_ban_san_sang}</span>
      ),
    },
  ]
  return <ReportTable query={query} columns={columns} rowKey={(r) => r.ma_sach} unit="đầu sách" filename="danh-muc-sach" />
}

export function SachDangMuonPanel() {
  const query = useBaoCao<SachDangMuonDong>("sach-dang-muon")
  const columns: Column<SachDangMuonDong>[] = [
    { header: "Phiếu", value: (r) => r.ma_phieu, cell: (r) => phieuLink(r.ma_phieu), className: "w-28" },
    { header: "Người mượn", value: nguoiDung, className: "whitespace-normal" },
    { header: "Sách", value: (r) => `${r.ten_sach} (${r.ma_ban_sach})`, className: "whitespace-normal" },
    { header: "Ngày mượn", value: (r) => formatDate(r.ngay_muon), className: "w-28" },
    { header: "Hạn trả", value: (r) => formatDate(r.han_tra), className: "w-28" },
    { header: "Quá hạn", value: (r) => r.so_ngay_qua_han, cell: (r) => quaHan(r.so_ngay_qua_han), align: "right", className: "w-24" },
  ]
  return (
    <ReportTable
      query={query}
      columns={columns}
      rowKey={(r) => `${r.ma_phieu}-${r.ma_ban_sach}`}
      unit="lượt đang mượn"
      filename="sach-dang-muon"
      emptyText="Hiện không có sách nào đang được mượn."
    />
  )
}

export function MuonQuaHanPanel() {
  const query = useBaoCao<MuonQuaHanDong>("muon-qua-han")
  const columns: Column<MuonQuaHanDong>[] = [
    { header: "Phiếu", value: (r) => r.ma_phieu, cell: (r) => phieuLink(r.ma_phieu), className: "w-28" },
    { header: "Người mượn", value: nguoiDung, className: "whitespace-normal" },
    { header: "Sách", value: (r) => r.ten_sach, className: "whitespace-normal" },
    { header: "Hạn trả", value: (r) => formatDate(r.han_tra), className: "w-28" },
    { header: "Quá hạn", value: (r) => r.so_ngay_qua_han, cell: (r) => quaHan(r.so_ngay_qua_han), align: "right", className: "w-24" },
    { header: "Phạt tạm tính", value: (r) => r.tien_phat_tam_tinh, cell: (r) => formatVnd(r.tien_phat_tam_tinh), align: "right", className: "w-36" },
  ]
  return (
    <ReportTable
      query={query}
      columns={columns}
      rowKey={(r) => r.ma_phieu}
      unit="phiếu quá hạn"
      filename="muon-qua-han"
      emptyText="Không có phiếu nào quá hạn."
    />
  )
}

export function NguoiDungViPhamPanel() {
  const query = useBaoCao<NguoiDungViPhamDong>("nguoi-dung-vi-pham")
  const columns: Column<NguoiDungViPhamDong>[] = [
    { header: "Người dùng", value: nguoiDung, className: "whitespace-normal" },
    { header: "Số lần phạt", value: (r) => r.so_lan_phat, align: "right", className: "w-28" },
    { header: "Tổng tiền phạt", value: (r) => r.tong_tien_phat, cell: (r) => formatVnd(r.tong_tien_phat), align: "right", className: "w-36" },
    {
      header: "Còn nợ",
      value: (r) => r.con_no,
      cell: (r) => <span className={r.con_no > 0 ? "font-medium text-[#a35143]" : ""}>{formatVnd(r.con_no)}</span>,
      align: "right",
      className: "w-32",
    },
    { header: "Sách quá hạn", value: (r) => r.so_sach_dang_qua_han, align: "right", className: "w-28" },
    { header: "Phạt tạm tính", value: (r) => r.tien_phat_tam_tinh, cell: (r) => formatVnd(r.tien_phat_tam_tinh), align: "right", className: "w-32" },
  ]
  return (
    <ReportTable
      query={query}
      columns={columns}
      rowKey={(r) => r.ma_nguoi_dung}
      unit="người dùng"
      filename="nguoi-dung-vi-pham"
      emptyText="Chưa có người dùng vi phạm."
    />
  )
}

const topChartConfig = { so_luot_muon: { label: "Lượt mượn", color: "#147d64" } } satisfies ChartConfig
const LIMITS = [5, 10, 20, 50].map((n) => ({ value: String(n), label: `Top ${n}` }))

export function TopSachPanel() {
  const [limit, setLimit] = useState("10")
  const query = useBaoCao<TopSachMuonNhieuDong>("top-sach-muon-nhieu", { limit: Number(limit) })
  const columns: Column<TopSachMuonNhieuDong>[] = [
    { header: "Hạng", value: (r) => (query.data?.indexOf(r) ?? 0) + 1, className: "w-16" },
    { header: "Mã sách", value: (r) => r.ma_sach, className: "w-24" },
    { header: "Tên sách", title: true, value: (r) => r.ten_sach, className: "whitespace-normal" },
    { header: "Lượt mượn", value: (r) => r.so_luot_muon, align: "right", className: "w-28" },
  ]
  const chartData = (query.data ?? []).slice(0, 10)
  return (
    <div className="grid gap-4">
      {chartData.length > 0 && (
        <div className="rounded-lg border border-[#e4e8e2] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#293a32]">Sách được mượn nhiều nhất</h3>
          <ChartContainer config={topChartConfig} className="mt-3 w-full" style={{ height: 36 * chartData.length + 24 }} aria-label="Biểu đồ lượt mượn theo sách">
            <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#edf0eb" />
              <YAxis dataKey="ten_sach" type="category" width={170} axisLine={false} tickLine={false} tick={{ fill: "#58665e", fontSize: 11 }} />
              <XAxis type="number" allowDecimals={false} domain={[0, (max: number) => Math.max(max, 1)]} axisLine={false} tickLine={false} tick={{ fill: "#87918b", fontSize: 11 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="so_luot_muon" fill="var(--color-so_luot_muon)" radius={3} barSize={18} />
            </BarChart>
          </ChartContainer>
        </div>
      )}
      <ReportTable
        query={query}
        columns={columns}
        rowKey={(r) => r.ma_sach}
        unit="đầu sách"
        filename="top-sach-muon-nhieu"
        emptyText="Chưa có lượt mượn nào."
        toolbar={
          <Select value={limit} items={LIMITS} onValueChange={(v) => v && setLimit(v)}>
            <SelectTrigger aria-label="Số sách hiển thị" className="h-9 w-32 border-[#dfe5df] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMITS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  )
}

const phatChartConfig = {
  da_thanh_toan: { label: "Đã thu", color: "#147d64" },
  chua_thanh_toan: { label: "Chưa thu", color: "#e99a68" },
} satisfies ChartConfig

export function ThongKeTienPhatPanel() {
  const query = useBaoCao<ThongKeTienPhatDong>("thong-ke-tien-phat")
  const columns: Column<ThongKeTienPhatDong>[] = [
    { header: "Tháng", value: (r) => thangLabel(r.thang), className: "w-24" },
    { header: "Loại phạt", value: (r) => LOAI_PHAT.find((l) => l.value === r.loai_phat)?.label ?? r.loai_phat },
    { header: "Số phiếu", value: (r) => r.so_phieu, align: "right", className: "w-24" },
    { header: "Tổng tiền", value: (r) => r.tong_tien, cell: (r) => formatVnd(r.tong_tien), align: "right", className: "w-32" },
    { header: "Đã thu", value: (r) => r.da_thanh_toan, cell: (r) => formatVnd(r.da_thanh_toan), align: "right", className: "w-32" },
    { header: "Chưa thu", value: (r) => r.chua_thanh_toan, cell: (r) => formatVnd(r.chua_thanh_toan), align: "right", className: "w-32" },
    { header: "Phiếu hủy", value: (r) => r.so_phieu_huy, align: "right", className: "w-24" },
  ]

  // Gộp các loại phạt trong cùng tháng, tháng cũ → mới.
  const byMonth = new Map<string, { thang: string; da_thanh_toan: number; chua_thanh_toan: number }>()
  for (const r of query.data ?? []) {
    const m = byMonth.get(r.thang) ?? { thang: r.thang, da_thanh_toan: 0, chua_thanh_toan: 0 }
    m.da_thanh_toan += r.da_thanh_toan
    m.chua_thanh_toan += r.chua_thanh_toan
    byMonth.set(r.thang, m)
  }
  const chartData = [...byMonth.values()].sort((a, b) => a.thang.localeCompare(b.thang)).map((m) => ({ ...m, label: thangLabel(m.thang) }))

  return (
    <div className="grid gap-4">
      {chartData.length > 0 && (
        <div className="rounded-lg border border-[#e4e8e2] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#293a32]">Tiền phạt theo tháng</h3>
          <ChartContainer config={phatChartConfig} className="mt-3 h-[220px] w-full" aria-label="Biểu đồ tiền phạt theo tháng">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#edf0eb" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tickMargin={8} tick={{ fill: "#87918b", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} width={64} tick={{ fill: "#87918b", fontSize: 11 }} tickFormatter={(v: number) => new Intl.NumberFormat("vi-VN").format(v)} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="da_thanh_toan" stackId="phat" fill="var(--color-da_thanh_toan)" />
              <Bar dataKey="chua_thanh_toan" stackId="phat" fill="var(--color-chua_thanh_toan)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="mt-2 flex items-center justify-center gap-5 text-xs text-[#5f6b64]">
            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#147d64]" />Đã thu</span>
            <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[#e99a68]" />Chưa thu</span>
          </div>
        </div>
      )}
      <ReportTable
        query={query}
        columns={columns}
        rowKey={(r) => `${r.thang}-${r.loai_phat}`}
        unit="dòng thống kê"
        filename="thong-ke-tien-phat"
        emptyText="Chưa có phiếu phạt nào."
      />
    </div>
  )
}

export function LichSuMuonPanel() {
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const query = useBaoCao<LichSuMuonDong>("lich-su-muon", { maNguoiDung })
  const columns: Column<LichSuMuonDong>[] = [
    { header: "Phiếu", value: (r) => r.ma_phieu, cell: (r) => phieuLink(r.ma_phieu), className: "w-28" },
    { header: "Người mượn", value: nguoiDung, className: "whitespace-normal" },
    { header: "Sách", value: (r) => `${r.ten_sach} (${r.ma_ban_sach})`, className: "whitespace-normal" },
    { header: "Ngày mượn", value: (r) => formatDate(r.ngay_muon), className: "w-28" },
    { header: "Hạn trả", value: (r) => formatDate(r.han_tra), className: "w-28" },
    { header: "Ngày trả", value: (r) => formatDate(r.ngay_tra), className: "w-28" },
    { header: "Gia hạn", value: (r) => r.so_lan_gia_han, align: "right", className: "w-20" },
    {
      header: "Tình trạng",
      value: (r) => (r.ngay_tra === null ? "Đang mượn" : (TINH_TRANG_TRA.find((t) => t.value === r.tinh_trang_tra)?.label ?? "")),
      cell: (r) =>
        r.ngay_tra === null ? (
          <span className="rounded-full bg-[#fff3df] px-2 py-0.5 text-xs font-medium text-[#9a6412]">Đang mượn</span>
        ) : (
          <StatusPill list={TINH_TRANG_TRA} value={r.tinh_trang_tra ?? "BINH_THUONG"} />
        ),
      className: "w-32",
    },
    { header: "Quá hạn", value: (r) => r.so_ngay_qua_han, cell: (r) => quaHan(r.so_ngay_qua_han), align: "right", className: "w-24" },
  ]
  return (
    <ReportTable
      query={query}
      columns={columns}
      rowKey={(r) => `${r.ma_phieu}-${r.ma_ban_sach}`}
      unit="lượt mượn"
      filename="lich-su-muon"
      emptyText={maNguoiDung ? "Người dùng này chưa mượn sách." : "Chưa có lượt mượn nào."}
      toolbar={<MaNguoiDungFilter value={maNguoiDung} onChange={setMaNguoiDung} />}
    />
  )
}

const ALL = "ALL"
const DAT_TRUOC_FILTER = [{ value: ALL, label: "Mọi trạng thái" }, ...TRANG_THAI_DAT_TRUOC]

export function DatTruocPanel() {
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const [trangThai, setTrangThai] = useState(ALL)
  const query = useBaoCao<DatTruocDong>("dat-truoc", { maNguoiDung, trangThai: trangThai === ALL ? undefined : trangThai })
  const columns: Column<DatTruocDong>[] = [
    { header: "Người đặt", value: nguoiDung, className: "whitespace-normal" },
    { header: "Sách", value: (r) => `${r.ten_sach} (${r.ma_sach})`, className: "whitespace-normal" },
    { header: "Ngày đặt", value: (r) => formatDate(r.ngay_dat), className: "w-28" },
    {
      header: "Trạng thái",
      value: (r) => TRANG_THAI_DAT_TRUOC.find((t) => t.value === r.trang_thai)?.label ?? r.trang_thai,
      cell: (r) => <StatusPill list={TRANG_THAI_DAT_TRUOC} value={r.trang_thai} />,
      className: "w-36",
    },
    { header: "Bản được giữ", value: (r) => r.ma_ban_sach, className: "w-28" },
    { header: "Giữ đến", value: (r) => formatDate(r.han_giu), className: "w-28" },
    { header: "Thứ tự chờ", value: (r) => r.thu_tu_cho, align: "right", className: "w-24" },
  ]
  return (
    <ReportTable
      query={query}
      columns={columns}
      rowKey={(r, i) => `${r.ma_nguoi_dung}-${r.ma_sach}-${r.ngay_dat}-${i}`}
      unit="lượt đặt trước"
      filename="dat-truoc"
      emptyText="Không có lượt đặt trước khớp bộ lọc."
      toolbar={
        <>
          <MaNguoiDungFilter value={maNguoiDung} onChange={setMaNguoiDung} />
          <Select value={trangThai} items={DAT_TRUOC_FILTER} onValueChange={(v) => v && setTrangThai(v)}>
            <SelectTrigger aria-label="Lọc theo trạng thái" className="h-9 w-44 border-[#dfe5df] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAT_TRUOC_FILTER.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      }
    />
  )
}
