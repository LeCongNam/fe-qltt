"use client"

import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, XCircle } from "lucide-react"

import { TRANG_THAI_DAT_TRUOC } from "@/components/luu-thong/luu-thong-meta"
import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Paged, type Schemas } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { PAGE_SIZE } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { SearchForm } from "@/components/search-form"
import { ConfirmDialog } from "@/components/confirm-dialog"

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
  const [trangThai, setTrangThai] = useState(ALL)
  const [datOpen, setDatOpen] = useState(false)
  const [huyRow, setHuyRow] = useState<DatTruoc | null>(null)

  const list = useQuery({
    queryKey: ["/dat-truoc", "list", page, maNguoiDung, trangThai],
    queryFn: async () => {
      const { data } = await apiClient.get<Paged<DatTruoc>>("/dat-truoc", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(isStaff && maNguoiDung && { maNguoiDung }),
          ...(trangThai !== ALL && { trangThai }),
        },
      })
      return data
    },
    placeholderData: keepPreviousData,
  })

  const huy = useMutation({
    mutationFn: async (row: DatTruoc) =>
      apiClient.delete(`/dat-truoc/${row.sach.maSach}`, {
        // Cán bộ hủy hộ phải nêu người đặt; bạn đọc để BE lấy từ token.
        params: isStaff ? { maNguoiDung: row.nguoiDung.maNguoiDung } : undefined,
      }),
    onSuccess: (_, row) => {
      toast.add({ type: "success", title: "Đã hủy đặt trước", description: row.sach.tenSach })
      setHuyRow(null)
      queryClient.invalidateQueries({ queryKey: ["/dat-truoc"] })
      queryClient.invalidateQueries({ queryKey: ["/sach"] })
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
              <>
                {d.nguoiDung.hoTen} <span className="text-muted-foreground">({d.nguoiDung.maNguoiDung})</span>
              </>
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
        rowKey={(d) => d.id}
        errorText="Không tải được danh sách đặt trước."
        emptyText={filtering ? "Không có lượt đặt trước khớp bộ lọc." : "Chưa có lượt đặt trước nào."}
      />

      <Pager page={page} pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))} total={total} unit="lượt đặt" order="mới nhất trước" onPage={setPage} />

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

function DatTruocDialog({ open, isStaff, onClose }: { open: boolean; isStaff: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [maSach, setMaSach] = useState<string | null>(null)
  const [maNguoiDung, setMaNguoiDung] = useState("")

  // Chọn từ danh sách sách (BE giới hạn 100 dòng mỗi trang).
  const sachs = useQuery({
    queryKey: ["/sach", "chon-dat-truoc"],
    queryFn: async () => (await apiClient.get<Paged<Schemas["TraCuuSachDto"]>>("/sach", { params: { page: 1, limit: 100 } })).data.data,
    enabled: open,
  })

  const dat = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<DatTruoc>("/dat-truoc", {
          maSach,
          ...(isStaff && { maNguoiDung: maNguoiDung.trim() }),
        })
      ).data,
    onSuccess: (d) => {
      toast.add({ type: "success", title: "Đã đặt trước", description: d?.sach.tenSach })
      queryClient.invalidateQueries({ queryKey: ["/dat-truoc"] })
      onClose()
    },
    // 422: còn bản sẵn sàng, đang mượn đầu sách này, còn nợ phạt, đã đặt rồi...
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể đặt trước", description: getApiErrorMessage(error) })
    },
  })

  const items = (sachs.data ?? []).map((s) => ({
    value: s.ma_sach,
    label: `${s.ten_sach} (${s.so_ban_san_sang > 0 ? `còn ${s.so_ban_san_sang} bản` : "hết bản"})`,
  }))
  const hopLe = maSach !== null && (!isStaff || maNguoiDung.trim() !== "")

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !dat.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isStaff ? "Đặt trước hộ bạn đọc" : "Đặt trước sách"}</DialogTitle>
          <DialogDescription>Chỉ đặt được khi đầu sách hết bản sẵn sàng.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (hopLe) dat.mutate()
          }}
        >
          {isStaff && (
            <Field>
              <FieldLabel htmlFor="dt-nguoi-dung">
                Mã người đặt <span aria-hidden="true" className="text-destructive">*</span>
              </FieldLabel>
              <Input id="dt-nguoi-dung" value={maNguoiDung} onChange={(e) => setMaNguoiDung(e.target.value)} maxLength={20} placeholder="Ví dụ: SV001" className="h-10 rounded-md border-input bg-white text-sm" />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="dt-sach">
              Sách <span aria-hidden="true" className="text-destructive">*</span>
            </FieldLabel>
            <Select value={maSach} items={items} onValueChange={(v) => setMaSach(v)}>
              <SelectTrigger id="dt-sach" className="h-10 w-full rounded-md border-input bg-white">
                <SelectValue placeholder={sachs.isPending ? "Đang tải..." : "Chọn sách"} />
              </SelectTrigger>
              <SelectContent>
                {items.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sachs.isError && <FieldDescription>Không tải được danh sách sách.</FieldDescription>}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={dat.isPending} onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={!hopLe || dat.isPending}>
              {dat.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Đặt trước
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
