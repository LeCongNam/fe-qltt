"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CalendarPlus, Loader2, Plus, XCircle } from "lucide-react"

import { GiaHanDialog } from "@/components/luu-thong/gia-han-dialog"
import { LOAI_PHAT, TINH_TRANG_TRA, TRANG_THAI_DAT_TRUOC, TRANG_THAI_PHAT } from "@/components/luu-thong/luu-thong-meta"
import { type Column, ReportTable } from "@/components/report-table"
import { StatusPill } from "@/components/status-pill"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { apiClient, getApiErrorMessage } from "@/lib/api"
import { formatDate, formatVnd } from "@/lib/format"
import { type DatTruocCuaToi, type LichSuMuonCuaToi, type SachDangMuonCuaToi, type TienPhatCuaToi, useMe } from "@/lib/me"

const phieuLink = (maPhieu: string) => (
  <Link href={`/phieu-muon/${maPhieu}`} className="font-medium text-primary hover:underline">
    {maPhieu}
  </Link>
)

const quaHan = (days: number) => (days > 0 ? <span className="font-medium text-destructive">{days} ngày</span> : "—")

export function SachDangMuonPanel() {
  const query = useMe<SachDangMuonCuaToi>("sach-dang-muon")
  const [giaHan, setGiaHan] = useState<string | null>(null)
  const columns: Column<SachDangMuonCuaToi>[] = [
    { header: "Phiếu", value: (r) => r.ma_phieu, cell: (r) => phieuLink(r.ma_phieu), className: "w-28" },
    { header: "Sách", title: true, value: (r) => `${r.ten_sach} (${r.ma_ban_sach})`, className: "whitespace-normal" },
    { header: "Ngày mượn", value: (r) => formatDate(r.ngay_muon), sortBy: (r) => r.ngay_muon, className: "w-28" },
    { header: "Hạn trả", value: (r) => formatDate(r.han_tra), sortBy: (r) => r.han_tra, className: "w-28" },
    { header: "Quá hạn", value: (r) => r.so_ngay_qua_han, cell: (r) => quaHan(r.so_ngay_qua_han), align: "right", className: "w-24" },
    {
      header: "Thao tác",
      actions: true,
      value: () => null,
      align: "right",
      className: "w-32",
      cell: (r) => (
        <Button size="sm" variant="outline" onClick={() => setGiaHan(r.ma_ban_sach)}>
          <CalendarPlus aria-hidden="true" />
          Gia hạn
        </Button>
      ),
    },
  ]
  return (
    <>
      <ReportTable
        query={query}
        columns={columns}
        rowKey={(r) => `${r.ma_phieu}-${r.ma_ban_sach}`}
        unit="sách đang mượn"
        defaultOrder={{ header: "Hạn trả", dir: "asc" }}
        emptyText="Bạn không có sách nào đang mượn."
      />
      <GiaHanDialog key={`gh-${giaHan}`} maBanSach={giaHan} onClose={() => setGiaHan(null)} />
    </>
  )
}

const DANG_HOAT_DONG = ["CHO_XU_LY", "SAN_SANG_NHAN"]

export function DatTruocPanel() {
  const queryClient = useQueryClient()
  const query = useMe<DatTruocCuaToi>("dat-truoc")
  const [huyRow, setHuyRow] = useState<DatTruocCuaToi | null>(null)

  const huy = useMutation({
    mutationFn: async (row: DatTruocCuaToi) => apiClient.delete(`/dat-truoc/${row.ma_sach}`),
    onSuccess: (_, row) => {
      toast.add({ type: "success", title: "Đã hủy đặt trước", description: row.ten_sach })
      queryClient.invalidateQueries({ queryKey: ["/me"] })
      queryClient.invalidateQueries({ queryKey: ["/dat-truoc"] })
      queryClient.invalidateQueries({ queryKey: ["/sach"] })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể hủy đặt trước", description: getApiErrorMessage(error) })
    },
    onSettled: () => setHuyRow(null),
  })

  const columns: Column<DatTruocCuaToi>[] = [
    { header: "Sách", title: true, value: (r) => `${r.ten_sach} (${r.ma_sach})`, className: "whitespace-normal" },
    { header: "Ngày đặt", value: (r) => formatDate(r.ngay_dat), sortBy: (r) => r.ngay_dat, className: "w-28" },
    {
      header: "Trạng thái",
      value: (r) => TRANG_THAI_DAT_TRUOC.find((t) => t.value === r.trang_thai)?.label ?? r.trang_thai,
      cell: (r) => <StatusPill list={TRANG_THAI_DAT_TRUOC} value={r.trang_thai} />,
      className: "w-36",
    },
    { header: "Bản được giữ", value: (r) => r.ma_ban_sach, className: "w-28" },
    { header: "Giữ đến", value: (r) => formatDate(r.han_giu), sortBy: (r) => r.han_giu, className: "w-28" },
    { header: "Thứ tự chờ", value: (r) => r.thu_tu_cho, align: "right", className: "w-24" },
    {
      header: "Thao tác",
      actions: true,
      value: () => null,
      align: "right",
      className: "w-24",
      cell: (r) =>
        DANG_HOAT_DONG.includes(r.trang_thai) && (
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setHuyRow(r)}>
            <XCircle aria-hidden="true" />
            Hủy
          </Button>
        ),
    },
  ]

  return (
    <>
      <ReportTable
        query={query}
        columns={columns}
        rowKey={(r, i) => `${r.ma_sach}-${r.ngay_dat}-${i}`}
        unit="lượt đặt trước"
        emptyText="Bạn chưa đặt trước sách nào."
        toolbar={
          <Link
            href="/dat-truoc"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Plus className="size-4" aria-hidden="true" />
            Đặt trước sách
          </Link>
        }
      />
      <AlertDialog open={huyRow !== null} onOpenChange={(open) => !open && !huy.isPending && setHuyRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đặt trước?</AlertDialogTitle>
            <AlertDialogDescription>{huyRow ? `${huyRow.ten_sach} — bản đang giữ (nếu có) sẽ được trả lại cho người kế tiếp.` : ""}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={huy.isPending}>Giữ lại</AlertDialogCancel>
            <Button variant="destructive" disabled={huy.isPending} onClick={() => huyRow && huy.mutate(huyRow)}>
              {huy.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Hủy đặt trước
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function TienPhatPanel() {
  const query = useMe<TienPhatCuaToi>("tien-phat")
  const columns: Column<TienPhatCuaToi>[] = [
    { header: "Mã phạt", value: (r) => r.ma_phieu_phat, className: "w-24" },
    { header: "Loại phạt", value: (r) => LOAI_PHAT.find((l) => l.value === r.loai_phat)?.label ?? r.loai_phat, className: "w-32" },
    { header: "Số tiền", value: (r) => r.so_tien, cell: (r) => formatVnd(r.so_tien), align: "right", className: "w-32" },
    { header: "Lý do", value: (r) => r.ly_do, className: "whitespace-normal" },
    { header: "Ngày tạo", value: (r) => formatDate(r.ngay_tao), sortBy: (r) => r.ngay_tao, className: "w-28" },
    {
      header: "Trạng thái",
      value: (r) => TRANG_THAI_PHAT.find((t) => t.value === r.trang_thai)?.label ?? r.trang_thai,
      cell: (r) => <StatusPill list={TRANG_THAI_PHAT} value={r.trang_thai} />,
      className: "w-40",
    },
    { header: "Ngày thanh toán", value: (r) => formatDate(r.ngay_thanh_toan), sortBy: (r) => r.ngay_thanh_toan, className: "w-32" },
  ]
  return (
    <ReportTable
      query={query}
      columns={columns}
      rowKey={(r) => r.ma_phieu_phat}
      unit="phiếu phạt"
      defaultOrder={{ header: "Ngày tạo", dir: "desc" }}
      emptyText="Bạn chưa có phiếu phạt nào."
    />
  )
}

export function LichSuMuonPanel() {
  const query = useMe<LichSuMuonCuaToi>("lich-su-muon")
  const columns: Column<LichSuMuonCuaToi>[] = [
    { header: "Phiếu", value: (r) => r.ma_phieu, cell: (r) => phieuLink(r.ma_phieu), className: "w-28" },
    { header: "Sách", title: true, value: (r) => `${r.ten_sach} (${r.ma_ban_sach})`, className: "whitespace-normal" },
    { header: "Ngày mượn", value: (r) => formatDate(r.ngay_muon), sortBy: (r) => r.ngay_muon, className: "w-28" },
    { header: "Hạn trả", value: (r) => formatDate(r.han_tra), sortBy: (r) => r.han_tra, className: "w-28" },
    { header: "Ngày trả", value: (r) => formatDate(r.ngay_tra), sortBy: (r) => r.ngay_tra, className: "w-28" },
    { header: "Gia hạn", value: (r) => r.so_lan_gia_han, align: "right", className: "w-20" },
    {
      header: "Tình trạng",
      value: (r) => (r.ngay_tra === null ? "Đang mượn" : (TINH_TRANG_TRA.find((t) => t.value === r.tinh_trang_tra)?.label ?? "")),
      cell: (r) =>
        r.ngay_tra === null ? (
          <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">Đang mượn</span>
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
      defaultOrder={{ header: "Ngày mượn", dir: "desc" }}
      emptyText="Bạn chưa mượn sách nào."
    />
  )
}
