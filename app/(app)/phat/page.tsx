"use client"

import { useState } from "react"
import Link from "next/link"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Banknote } from "lucide-react"

import { LOAI_PHAT, TRANG_THAI_PHAT, type TrangThaiPhat } from "@/components/luu-thong/luu-thong-meta"
import { HuyPhatDialog } from "@/components/luu-thong/huy-phat-dialog"
import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { phatApi } from "@/features/phat/api"
import { phatKeys, phatQueries } from "@/features/phat/queries"
import { phieuMuonKeys } from "@/features/phieu-muon/queries"
import { getApiErrorMessage, type Schemas } from "@/lib/api"
import { formatDate, formatVnd } from "@/lib/format"
import { PAGE_SIZE } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { SearchForm } from "@/components/search-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { NguoiDungLink } from "@/components/nguoi-dung/nguoi-dung-link"

type Phat = Schemas["PhieuPhatChiTietDto"]

const ALL = "ALL"
const TRANG_THAI_FILTER = [{ value: ALL, label: "Mọi trạng thái" }, ...TRANG_THAI_PHAT]

export default function PhatPage() {
  const { isStaff, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const [trangThai, setTrangThai] = useState<TrangThaiPhat | typeof ALL>(ALL)
  const [thanhToan, setThanhToan] = useState<Phat | null>(null)
  const [huyRow, setHuyRow] = useState<Phat | null>(null)

  const list = useQuery({
    ...phatQueries.list({
      page,
      limit: PAGE_SIZE,
      ...(maNguoiDung && { maNguoiDung }),
      ...(trangThai !== ALL && { trangThai }),
    }),
    placeholderData: keepPreviousData,
    enabled: isStaff,
  })

  const pay = useMutation({
    mutationFn: (row: Phat) => phatApi.thanhToan(row.id),
    onSuccess: (_, row) => {
      toast.add({ type: "success", title: "Đã thanh toán phiếu phạt", description: `${row.ctPhieuMuon.phieuMuon.nguoiDung.hoTen} — ${formatVnd(row.soTien)}` })
      setThanhToan(null)
      queryClient.invalidateQueries({ queryKey: phatKeys.all })
      queryClient.invalidateQueries({ queryKey: phieuMuonKeys.all })
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
        return <NguoiDungLink maNguoiDung={nd.maNguoiDung} hoTen={nd.hoTen} />
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
      <PageHeader
        eyebrow="Lưu thông"
        title="Tiền phạt"
        description="Phiếu phạt do hệ thống tự lập khi trả sách quá hạn, hư hỏng hoặc mất."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <SearchForm
          value={input}
          onChange={setInput}
          onSubmit={() => {
            setPage(1)
            setMaNguoiDung(input.trim())
          }}
          label="Lọc theo mã người bị phạt"
          placeholder="Mã người bị phạt, ví dụ SV001"
          maxLength={20}
          submitLabel="Lọc"
          className="flex flex-1 gap-2"
          fieldClassName="max-w-sm"
        />
        <div className="flex gap-2">
          <Select
            value={trangThai}
            items={TRANG_THAI_FILTER}
            onValueChange={(v) => {
              if (!v) return
              setTrangThai(v as TrangThaiPhat | typeof ALL)
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

      <Pager page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} unit="phiếu phạt" order="chưa thu trước, rồi mới nhất" onPage={setPage} />

      <ConfirmDialog
        open={thanhToan !== null}
        onClose={() => setThanhToan(null)}
        title="Xác nhận đã thu tiền phạt?"
        description={
          <>
            {thanhToan
                            ? `${thanhToan.ctPhieuMuon.phieuMuon.nguoiDung.hoTen} nộp ${formatVnd(thanhToan.soTien)} (${LOAI_PHAT.find((l) => l.value === thanhToan.loaiPhat)?.label}).`
                            : ""}
          </>
        }
        confirmLabel="Đã thu"
        cancelLabel="Chưa"
        pending={pay.isPending}
        onConfirm={() => thanhToan && pay.mutate(thanhToan)}
      />

      <HuyPhatDialog key={huyRow?.id ?? "closed"} row={huyRow} onClose={() => setHuyRow(null)} />
    </section>
  )
}
