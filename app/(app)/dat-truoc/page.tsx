"use client"

import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, XCircle } from "lucide-react"

import { TRANG_THAI_DAT_TRUOC, type TrangThaiDatTruoc } from "@/components/luu-thong/luu-thong-meta"
import { DatTruocDialog } from "@/components/luu-thong/dat-truoc-dialog"
import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { datTruocApi } from "@/features/dat-truoc/api"
import { datTruocKeys, datTruocQueries } from "@/features/dat-truoc/queries"
import { sachKeys } from "@/features/sach/queries"
import { getApiErrorMessage, type Schemas } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { PAGE_SIZE } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { SearchForm } from "@/components/search-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { NguoiDungLink } from "@/components/nguoi-dung/nguoi-dung-link"

type DatTruoc = Schemas["DatTruocDto"]

const ALL = "ALL"
const TRANG_THAI_FILTER = [{ value: ALL, label: "Mọi trạng thái" }, ...TRANG_THAI_DAT_TRUOC]
const HUY_DUOC = ["CHO_XU_LY", "SAN_SANG_NHAN"]

export default function DatTruocPage() {
  const { isStaff } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [input, setInput] = useState("")
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const [trangThai, setTrangThai] = useState<TrangThaiDatTruoc | typeof ALL>(ALL)
  const [datOpen, setDatOpen] = useState(false)
  const [huyRow, setHuyRow] = useState<DatTruoc | null>(null)

  const list = useQuery({
    ...datTruocQueries.list({
      page,
      limit: PAGE_SIZE,
      ...(isStaff && maNguoiDung && { maNguoiDung }),
      ...(trangThai !== ALL && { trangThai }),
    }),
    placeholderData: keepPreviousData,
  })

  const huy = useMutation({
    // Cán bộ hủy hộ phải nêu người đặt; bạn đọc để BE lấy từ token.
    mutationFn: (row: DatTruoc) => datTruocApi.huy(row.sach.maSach, isStaff ? row.nguoiDung.maNguoiDung : undefined),
    onSuccess: (_, row) => {
      toast.add({ type: "success", title: "Đã hủy đặt trước", description: row.sach.tenSach })
      setHuyRow(null)
      queryClient.invalidateQueries({ queryKey: datTruocKeys.all })
      queryClient.invalidateQueries({ queryKey: sachKeys.all })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể hủy đặt trước", description: getApiErrorMessage(error) })
      setHuyRow(null)
    },
  })

  const rows = list.data?.data ?? []
  const total = list.data?.total ?? 0
  const filtering = maNguoiDung !== "" || trangThai !== ALL

  const columns: DataColumn<DatTruoc>[] = [
    {
      header: "Sách",
      title: true,
      className: "whitespace-normal font-medium",
      cell: (d) => (
        <>
          {d.sach.tenSach} <span className="font-normal text-muted-foreground">({d.sach.maSach})</span>
        </>
      ),
    },
    ...(isStaff
      ? [
          {
            header: "Người đặt",
            className: "whitespace-normal",
            cell: (d: DatTruoc) => (
              <NguoiDungLink maNguoiDung={d.nguoiDung.maNguoiDung} hoTen={d.nguoiDung.hoTen} />
            ),
          },
        ]
      : []),
    { header: "Ngày đặt", className: "w-28 text-muted-foreground", cell: (d) => formatDate(d.ngayDat) },
    { header: "Hạn giữ", className: "w-28 text-muted-foreground", cell: (d) => formatDate(d.hanGiu) },
    { header: "Trạng thái", className: "w-36", cell: (d) => <StatusPill list={TRANG_THAI_DAT_TRUOC} value={d.trangThai} /> },
    {
      header: "Thao tác",
      actions: true,
      align: "right",
      className: "w-24",
      cell: (d) =>
        HUY_DUOC.includes(d.trangThai) && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setHuyRow(d)}>
            <XCircle aria-hidden="true" />
            Hủy
          </Button>
        ),
    },
  ]

  return (
    <section className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow="Lưu thông"
        title="Đặt trước"
        description={isStaff ? "Lượt đặt trước của mọi bạn đọc." : "Lượt đặt trước của bạn. Sách còn bản sẵn sàng thì không cần đặt."}
        action={
          <Button onClick={() => setDatOpen(true)}>
            <Plus aria-hidden="true" />
            {isStaff ? "Đặt trước hộ" : "Đặt trước sách"}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        {isStaff && (
          <SearchForm
            value={input}
            onChange={setInput}
            onSubmit={() => {
              setPage(1)
              setMaNguoiDung(input.trim())
            }}
            label="Lọc theo mã người đặt"
            placeholder="Mã người đặt, ví dụ SV001"
            maxLength={20}
            submitLabel="Lọc"
            className="flex flex-1 gap-2"
            fieldClassName="max-w-sm"
          />
        )}
        <div className="flex gap-2">
          <Select
            value={trangThai}
            items={TRANG_THAI_FILTER}
            onValueChange={(v) => {
              if (!v) return
              setTrangThai(v as TrangThaiDatTruoc | typeof ALL)
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
        rowKey={(d) => d.id}
        errorText="Không tải được danh sách đặt trước."
        emptyText={filtering ? "Không có lượt đặt trước khớp bộ lọc." : "Chưa có lượt đặt trước nào."}
      />

      <Pager page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} unit="lượt đặt" order="đang chờ trước, rồi mới nhất" onPage={setPage} />

      <DatTruocDialog key={datOpen ? "open" : "closed"} open={datOpen} isStaff={isStaff} onClose={() => setDatOpen(false)} />

      <ConfirmDialog
        open={huyRow !== null}
        onClose={() => setHuyRow(null)}
        title="Hủy đặt trước?"
        description={
          <>
            {huyRow ? `“${huyRow.sach.tenSach}”${isStaff ? ` của ${huyRow.nguoiDung.hoTen}` : ""} sẽ bị hủy.` : ""}
                          {huyRow?.trangThai === "SAN_SANG_NHAN" ? " Bản sách đang giữ sẽ được chuyển cho người kế tiếp hoặc trả về kệ." : ""}
          </>
        }
        confirmLabel="Hủy đặt trước"
        cancelLabel="Không"
        destructive
        pending={huy.isPending}
        onConfirm={() => huyRow && huy.mutate(huyRow)}
      />
    </section>
  )
}
