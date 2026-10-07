"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Banknote, Loader2, Search } from "lucide-react"

import { LOAI_PHAT, TRANG_THAI_PHAT } from "@/components/luu-thong/luu-thong-meta"
import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Paged, type Schemas } from "@/lib/api"
import { formatDate, formatVnd } from "@/lib/format"

type Phat = Schemas["PhieuPhatChiTietDto"]

const PAGE_SIZE = 20
const ALL = "ALL"
const TRANG_THAI_FILTER = [{ value: ALL, label: "Mọi trạng thái" }, ...TRANG_THAI_PHAT]

export default function PhatPage() {
  const { isStaff, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const [trangThai, setTrangThai] = useState(ALL)
  const [thanhToan, setThanhToan] = useState<Phat | null>(null)
  const [huyRow, setHuyRow] = useState<Phat | null>(null)

  const list = useQuery({
    queryKey: ["/phat", "list", page, maNguoiDung, trangThai],
    queryFn: async () => {
      const { data } = await apiClient.get<Paged<Phat>>("/phat", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(maNguoiDung && { maNguoiDung }),
          ...(trangThai !== ALL && { trangThai }),
        },
      })
      return data
    },
    placeholderData: keepPreviousData,
    enabled: isStaff,
  })

  const pay = useMutation({
    mutationFn: async (row: Phat) => (await apiClient.post(`/phat/${row.id}/thanh-toan`)).data,
    onSuccess: (_, row) => {
      toast.add({ type: "success", title: "Đã thanh toán phiếu phạt", description: `${row.ctPhieuMuon.phieuMuon.nguoiDung.hoTen} — ${formatVnd(row.soTien)}` })
      setThanhToan(null)
      queryClient.invalidateQueries({ queryKey: ["/phat"] })
      queryClient.invalidateQueries({ queryKey: ["/phieu-muon"] })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể thanh toán", description: getApiErrorMessage(error) })
      setThanhToan(null)
    },
  })

  const rows = list.data?.data ?? []
  const total = list.data?.total ?? 0
  const filtering = maNguoiDung !== "" || trangThai !== ALL

  const columns: DataColumn<Phat>[] = [
    {
      header: "Người bị phạt",
      title: true,
      className: "whitespace-normal",
      cell: (f) => {
        const nd = f.ctPhieuMuon.phieuMuon.nguoiDung
        return (
          <>
            {nd.hoTen} <span className="text-muted-foreground">({nd.maNguoiDung})</span>
          </>
        )
      },
    },
    {
      header: "Sách",
      className: "whitespace-normal",
      cell: (f) => (
        <>
          {f.ctPhieuMuon.banSach.sach.tenSach} <span className="text-muted-foreground">({f.ctPhieuMuon.banSach.maBanSach})</span>
          <div className="mt-0.5 text-xs">
            <Link href={`/phieu-muon/${f.ctPhieuMuon.phieuMuon.maPhieu}`} className="text-primary hover:underline">
              {f.ctPhieuMuon.phieuMuon.maPhieu}
            </Link>
          </div>
        </>
      ),
    },
    { header: "Loại phạt", className: "w-28", cell: (f) => LOAI_PHAT.find((l) => l.value === f.loaiPhat)?.label },
    { header: "Số tiền", align: "right", className: "w-28 font-medium", cell: (f) => formatVnd(f.soTien) },
    { header: "Ngày tạo", className: "w-28 text-muted-foreground", cell: (f) => formatDate(f.ngayTao) },
    { header: "Trạng thái", className: "w-36", cell: (f) => <StatusPill list={TRANG_THAI_PHAT} value={f.trangThai} /> },
    {
      header: "Thao tác",
      actions: true,
      align: "right",
      className: "w-40",
      cell: (f) =>
        f.trangThai === "CHUA_THANH_TOAN" && (
          <div className="flex justify-end gap-1">
            <Button size="sm" onClick={() => setThanhToan(f)}>
              <Banknote aria-hidden="true" />
              Thu tiền
            </Button>
            {isAdmin && (
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setHuyRow(f)}>
                <Ban aria-hidden="true" />
                Hủy
              </Button>
            )}
          </div>
        ),
    },
  ]

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 border-b border-border pb-5">
        <p className="text-xs font-medium text-muted-foreground">Lưu thông</p>
        <h2 className="mt-1.5 text-xl font-semibold text-foreground">Tiền phạt</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Phiếu phạt do hệ thống tự lập khi trả sách quá hạn, hư hỏng hoặc mất.</p>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <form
          role="search"
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            setMaNguoiDung(input.trim())
          }}
        >
          <label className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-icon" aria-hidden="true" />
            <Input
              aria-label="Lọc theo mã người bị phạt"
              placeholder="Mã người bị phạt, ví dụ SV001"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={20}
              className="h-9 rounded-md border-input bg-white pl-9 text-sm"
            />
          </label>
          <Button type="submit" variant="outline">
            Lọc
          </Button>
        </form>
        <div className="flex gap-2">
          <Select
            value={trangThai}
            items={TRANG_THAI_FILTER}
            onValueChange={(v) => {
              if (!v) return
              setTrangThai(v)
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái" className="h-9 w-44 border-input bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANG_THAI_FILTER.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtering && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setInput("")
                setMaNguoiDung("")
                setTrangThai(ALL)
                setPage(1)
              }}
            >
              Xóa lọc
            </Button>
          )}
        </div>
      </div>

      <DataTable
        query={list}
        rows={rows}
        columns={columns}
        rowKey={(f) => f.id}
        errorText="Không tải được danh sách phiếu phạt."
        emptyText={filtering ? "Không có phiếu phạt khớp bộ lọc." : "Chưa có phiếu phạt nào."}
      />

      <Pager page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} unit="phiếu phạt" order="mới nhất trước" onPage={setPage} />

      <AlertDialog open={thanhToan !== null} onOpenChange={(open) => !open && !pay.isPending && setThanhToan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đã thu tiền phạt?</AlertDialogTitle>
            <AlertDialogDescription>
              {thanhToan
                ? `${thanhToan.ctPhieuMuon.phieuMuon.nguoiDung.hoTen} nộp ${formatVnd(thanhToan.soTien)} (${LOAI_PHAT.find((l) => l.value === thanhToan.loaiPhat)?.label}).`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pay.isPending}>Chưa</AlertDialogCancel>
            <Button disabled={pay.isPending} onClick={() => thanhToan && pay.mutate(thanhToan)}>
              {pay.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Đã thu
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <HuyPhatDialog key={huyRow?.id ?? "closed"} row={huyRow} onClose={() => setHuyRow(null)} />
    </section>
  )
}

function HuyPhatDialog({ row, onClose }: { row: Phat | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [lyDo, setLyDo] = useState("")

  const huy = useMutation({
    mutationFn: async () => apiClient.post(`/phat/${row!.id}/huy`, { lyDo: lyDo.trim() }),
    onSuccess: () => {
      toast.add({ type: "success", title: "Đã hủy phiếu phạt", description: row ? formatVnd(row.soTien) : undefined })
      queryClient.invalidateQueries({ queryKey: ["/phat"] })
      onClose()
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể hủy phiếu phạt", description: getApiErrorMessage(error) })
    },
  })

  return (
    <Dialog open={row !== null} onOpenChange={(o) => !o && !huy.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hủy phiếu phạt</DialogTitle>
          <DialogDescription>
            {row ? `${row.ctPhieuMuon.phieuMuon.nguoiDung.hoTen} — ${formatVnd(row.soTien)}. ` : ""}Bắt buộc ghi lý do; chỉ quản trị được hủy.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (lyDo.trim()) huy.mutate()
          }}
        >
          <Field>
            <FieldLabel htmlFor="phat-ly-do">
              Lý do <span aria-hidden="true" className="text-destructive">*</span>
            </FieldLabel>
            <Input id="phat-ly-do" value={lyDo} onChange={(e) => setLyDo(e.target.value)} maxLength={200} className="h-10 rounded-md border-input bg-white text-sm" />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={huy.isPending} onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" variant="destructive" disabled={huy.isPending || !lyDo.trim()}>
              {huy.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Hủy phiếu phạt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
