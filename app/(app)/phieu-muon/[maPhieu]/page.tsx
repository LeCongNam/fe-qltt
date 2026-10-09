"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarPlus, RotateCcw, XCircle } from "lucide-react"

import { DataTable, type DataColumn } from "@/components/data-table"
import { GiaHanDialog } from "@/components/luu-thong/gia-han-dialog"
import {
  LOAI_PHAT,
  TINH_TRANG_TRA,
  TRANG_THAI_PHAT,
  TRANG_THAI_PHIEU_MUON,
  isOverdue,
} from "@/components/luu-thong/luu-thong-meta"
import { TraSachDialog } from "@/components/luu-thong/tra-sach-dialog"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { phieuMuonApi } from "@/features/phieu-muon/api"
import { phieuMuonKeys, phieuMuonQueries } from "@/features/phieu-muon/queries"
import { sachKeys } from "@/features/sach/queries"
import { getApiErrorMessage, isApiError } from "@/lib/api"
import { formatDate, formatVnd } from "@/lib/format"
import { InfoItem } from "@/components/info-item"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { NguoiDungLink } from "@/components/nguoi-dung/nguoi-dung-link"

export default function PhieuMuonDetailPage() {
  const { maPhieu } = useParams<{ maPhieu: string }>()
  const queryClient = useQueryClient()
  const { isStaff } = useAuth()
  const [tra, setTra] = useState<string | null>(null)
  const [giaHan, setGiaHan] = useState<string | null>(null)
  const [confirmHuy, setConfirmHuy] = useState(false)

  const query = useQuery({ ...phieuMuonQueries.detail(maPhieu), retry: false })

  const huy = useMutation({
    mutationFn: () => phieuMuonApi.huy(maPhieu),
    onSuccess: () => {
      toast.add({ type: "success", title: "Đã hủy phiếu mượn", description: maPhieu })
      setConfirmHuy(false)
      queryClient.invalidateQueries({ queryKey: phieuMuonKeys.all })
      queryClient.invalidateQueries({ queryKey: sachKeys.all })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể hủy phiếu", description: getApiErrorMessage(error) })
      setConfirmHuy(false)
    },
  })

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (query.isError) {
    const status = isApiError(query.error) ? query.error.status : undefined
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 text-sm">
        <p role="alert" className="text-destructive">
          {status === 404
            ? "Không tìm thấy phiếu mượn."
            : status === 403
              ? "Bạn chỉ xem được phiếu mượn của mình."
              : getApiErrorMessage(query.error, "Không tải được phiếu mượn.")}
        </p>
        <Link href={isStaff ? "/phieu-muon" : "/"} className="text-primary hover:underline">
          ← Quay lại
        </Link>
      </div>
    )
  }

  const p = query.data
  const dangMuon = p.trangThai === "DANG_MUON"

  const columns: DataColumn<(typeof p.ctPhieuMuons)[number]>[] = [
    { header: "Mã bản", className: "w-24 font-medium", cell: (c) => c.banSach.maBanSach },
    { header: "Tên sách", title: true, className: "whitespace-normal", cell: (c) => c.banSach.sach.tenSach },
    {
      header: "Hạn trả",
      className: "w-28",
      cell: (c) => {
        const quaHan = isOverdue(c.hanTra, c.ngayTra)
        return (
          <span className={quaHan ? "font-medium text-destructive" : "text-muted-foreground"}>
            {formatDate(c.hanTra)}
            {quaHan && <span className="ml-1 text-xs">(quá hạn)</span>}
          </span>
        )
      },
    },
    {
      header: "Ngày trả",
      className: "w-28 text-muted-foreground",
      cell: (c) =>
        c.ngayTra ? (
          <>
            {formatDate(c.ngayTra)}
            {c.tinhTrangTra && c.tinhTrangTra !== "BINH_THUONG" && (
              <div className="mt-1">
                <StatusPill list={TINH_TRANG_TRA} value={c.tinhTrangTra} />
              </div>
            )}
          </>
        ) : (
          "Đang mượn"
        ),
    },
    { header: "Gia hạn", align: "right", className: "w-24", cell: (c) => c.soLanGiaHan },
    {
      header: "Phạt",
      className: "whitespace-normal",
      cell: (c) =>
        c.phieuPhats.length === 0
          ? "—"
          : c.phieuPhats.map((f) => (
              <div key={f.id} className="flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-xs md:justify-start">
                <span className="whitespace-nowrap">
                  {LOAI_PHAT.find((l) => l.value === f.loaiPhat)?.label} {formatVnd(f.soTien)}
                </span>
                <StatusPill list={TRANG_THAI_PHAT} value={f.trangThai} />
              </div>
            )),
    },
    {
      header: "Thao tác",
      actions: true,
      align: "right",
      className: "w-48",
      cell: (c) =>
        c.ngayTra === null &&
        dangMuon && (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="outline" onClick={() => setGiaHan(c.banSach.maBanSach)}>
              <CalendarPlus aria-hidden="true" />
              Gia hạn
            </Button>
            {isStaff && (
              <Button size="sm" onClick={() => setTra(c.banSach.maBanSach)}>
                <RotateCcw aria-hidden="true" />
                Trả
              </Button>
            )}
          </div>
        ),
    },
  ]

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <PageHeader
        back={isStaff ? { href: "/phieu-muon", label: "Mượn - trả" } : undefined}
        title={`Phiếu mượn ${p.maPhieu}`}
        description={
          isStaff ? (
            <NguoiDungLink maNguoiDung={p.nguoiDung.maNguoiDung} hoTen={p.nguoiDung.hoTen} />
          ) : (
            `${p.nguoiDung.hoTen} (${p.nguoiDung.maNguoiDung})`
          )
        }
        className="mb-0"
        action={
          isStaff &&
          dangMuon && (
            <Button variant="destructive" onClick={() => setConfirmHuy(true)}>
              <XCircle aria-hidden="true" />
              Hủy phiếu
            </Button>
          )
        }
      />

      <dl className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-border bg-white p-5 sm:grid-cols-4">
        <InfoItem label="Trạng thái">
          <StatusPill list={TRANG_THAI_PHIEU_MUON} value={p.trangThai} />
        </InfoItem>
        <InfoItem label="Ngày mượn">{formatDate(p.ngayMuon)}</InfoItem>
        <InfoItem label="Người mượn">{p.nguoiDung.hoTen}</InfoItem>
        <InfoItem label="Cán bộ lập phiếu">{p.nhanVien.hoTen}</InfoItem>
      </dl>

      <div className="rounded-lg border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Sách trong phiếu</h3>
        </div>
        <DataTable
          embedded
          rows={p.ctPhieuMuons}
          rowKey={(c) => c.id}
          errorText="Không tải được chi tiết phiếu."
          emptyText="Phiếu chưa có sách."
          columns={columns}
        />
      </div>

      <TraSachDialog key={`tra-${tra}`} open={tra !== null} maBanSach={tra ?? undefined} onClose={() => setTra(null)} />
      <GiaHanDialog key={`gh-${giaHan}`} maBanSach={giaHan} onClose={() => setGiaHan(null)} />

      <ConfirmDialog
        open={confirmHuy}
        onClose={() => setConfirmHuy(false)}
        title={
          <>
            Hủy phiếu {p.maPhieu}?
          </>
        }
        description="Chỉ hủy được phiếu chưa có sách; phiếu đã có sách hãy dùng “Trả”. Hệ thống sẽ từ chối nếu không hợp lệ."
        confirmLabel="Hủy phiếu"
        cancelLabel="Không"
        destructive
        pending={huy.isPending}
        onConfirm={() => huy.mutate()}
      />
    </section>
  )
}
