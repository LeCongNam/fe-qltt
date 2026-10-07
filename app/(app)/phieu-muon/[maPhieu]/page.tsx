"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { ArrowLeft, CalendarPlus, Loader2, RotateCcw, XCircle } from "lucide-react"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Schemas } from "@/lib/api"
import { formatDate, formatVnd } from "@/lib/format"

type Phieu = Schemas["PhieuMuonChiTietDto"]

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{children || "—"}</dd>
    </div>
  )
}

export default function PhieuMuonDetailPage() {
  const { maPhieu } = useParams<{ maPhieu: string }>()
  const queryClient = useQueryClient()
  const { isStaff } = useAuth()
  const [tra, setTra] = useState<string | null>(null)
  const [giaHan, setGiaHan] = useState<string | null>(null)
  const [confirmHuy, setConfirmHuy] = useState(false)

  const query = useQuery({
    queryKey: ["/phieu-muon", "detail", maPhieu],
    queryFn: async () => (await apiClient.get<Phieu>(`/phieu-muon/${maPhieu}`)).data,
    retry: false,
  })

  const huy = useMutation({
    mutationFn: async () => (await apiClient.post<Phieu>(`/phieu-muon/${maPhieu}/huy`)).data,
    onSuccess: () => {
      toast.add({ type: "success", title: "Đã hủy phiếu mượn", description: maPhieu })
      setConfirmHuy(false)
      queryClient.invalidateQueries({ queryKey: ["/phieu-muon"] })
      queryClient.invalidateQueries({ queryKey: ["/sach"] })
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
    const status = axios.isAxiosError(query.error) ? query.error.response?.status : undefined
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

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {isStaff && (
            <Link href="/phieu-muon" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              Mượn - trả
            </Link>
          )}
          <h2 className="mt-1.5 text-xl font-semibold text-foreground">Phiếu mượn {p.maPhieu}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {p.nguoiDung.hoTen} ({p.nguoiDung.maNguoiDung})
          </p>
        </div>
        {isStaff && dangMuon && (
          <Button variant="destructive" onClick={() => setConfirmHuy(true)}>
            <XCircle aria-hidden="true" />
            Hủy phiếu
          </Button>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-border bg-white p-5 sm:grid-cols-4">
        <Info label="Trạng thái">
          <StatusPill list={TRANG_THAI_PHIEU_MUON} value={p.trangThai} />
        </Info>
        <Info label="Ngày mượn">{formatDate(p.ngayMuon)}</Info>
        <Info label="Người mượn">{p.nguoiDung.hoTen}</Info>
        <Info label="Cán bộ lập phiếu">{p.nhanVien.hoTen}</Info>
      </dl>

      <div className="rounded-lg border border-border bg-white">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Sách trong phiếu</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Mã bản</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead className="w-28">Hạn trả</TableHead>
              <TableHead className="w-28">Ngày trả</TableHead>
              <TableHead className="w-24 text-right">Gia hạn</TableHead>
              <TableHead>Phạt</TableHead>
              <TableHead className="w-48 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {p.ctPhieuMuons.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  Phiếu chưa có sách.
                </TableCell>
              </TableRow>
            )}
            {p.ctPhieuMuons.map((c) => {
              const dangMo = c.ngayTra === null && dangMuon
              const quaHan = isOverdue(c.hanTra, c.ngayTra)
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.banSach.maBanSach}</TableCell>
                  <TableCell className="whitespace-normal">{c.banSach.sach.tenSach}</TableCell>
                  <TableCell className={quaHan ? "font-medium text-destructive" : "text-muted-foreground"}>
                    {formatDate(c.hanTra)}
                    {quaHan && <span className="ml-1 text-xs">(quá hạn)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.ngayTra ? (
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
                    )}
                  </TableCell>
                  <TableCell className="text-right">{c.soLanGiaHan}</TableCell>
                  <TableCell className="whitespace-normal">
                    {c.phieuPhats.length === 0
                      ? "—"
                      : c.phieuPhats.map((f) => (
                          <div key={f.id} className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                            <span className="whitespace-nowrap">
                              {LOAI_PHAT.find((l) => l.value === f.loaiPhat)?.label} {formatVnd(f.soTien)}
                            </span>
                            <StatusPill list={TRANG_THAI_PHAT} value={f.trangThai} />
                          </div>
                        ))}
                  </TableCell>
                  <TableCell className="text-right">
                    {dangMo && (
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
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <TraSachDialog key={`tra-${tra}`} open={tra !== null} maBanSach={tra ?? undefined} onClose={() => setTra(null)} />
      <GiaHanDialog key={`gh-${giaHan}`} maBanSach={giaHan} onClose={() => setGiaHan(null)} />

      <AlertDialog open={confirmHuy} onOpenChange={(open) => !open && !huy.isPending && setConfirmHuy(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy phiếu {p.maPhieu}?</AlertDialogTitle>
            <AlertDialogDescription>
              Chỉ hủy được phiếu chưa có sách; phiếu đã có sách hãy dùng “Trả”. Hệ thống sẽ từ chối nếu không hợp lệ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={huy.isPending}>Không</AlertDialogCancel>
            <Button variant="destructive" disabled={huy.isPending} onClick={() => huy.mutate()}>
              {huy.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Hủy phiếu
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
