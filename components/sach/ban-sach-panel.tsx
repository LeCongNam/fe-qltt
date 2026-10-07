"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { z } from "zod"

import { TINH_TRANG_BAN_SACH, type TinhTrangBanSach } from "@/components/sach/sach-meta"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { apiClient, getApiErrorMessage, type Schemas } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { TextField } from "@/components/form/text-field"

type BanSach = Schemas["BanSachDto"]

const nhapSchema = z.object({
  soBan: z
    .string()
    .trim()
    .refine((v) => /^\d{1,3}$/.test(v) && Number(v) >= 1 && Number(v) <= 100, "Số bản phải từ 1 đến 100."),
  viTriKe: z.string().trim().min(1, "Vui lòng nhập vị trí kệ.").max(50, "Vị trí kệ tối đa 50 ký tự."),
})
type NhapValues = z.infer<typeof nhapSchema>

/** Bản sách của một đầu sách (chỉ nhân viên): nhập thêm bản và đổi tình trạng. */
export function BanSachPanel({ sachId }: { sachId: string }) {
  const queryClient = useQueryClient()
  const [nhapOpen, setNhapOpen] = useState(false)
  const [pendingMa, setPendingMa] = useState<string | null>(null)

  const list = useQuery({
    queryKey: ["/sach", sachId, "ban-sach"],
    queryFn: async () => (await apiClient.get<BanSach[]>(`/sach/${sachId}/ban-sach`)).data,
  })

  const doiTinhTrang = useMutation({
    mutationFn: ({ ma, tinhTrang }: { ma: string; tinhTrang: TinhTrangBanSach }) =>
      apiClient.patch(`/ban-sach/${ma}/tinh-trang`, { tinhTrang }),
    onMutate: ({ ma }) => setPendingMa(ma),
    onSuccess: (_, { ma, tinhTrang }) => {
      const label = TINH_TRANG_BAN_SACH.find((t) => t.value === tinhTrang)?.label
      toast.add({ type: "success", title: "Đã đổi tình trạng", description: `${ma} → ${label}` })
    },
    onError: (error, { ma }) => {
      toast.add({ type: "error", title: `Không thể đổi tình trạng ${ma}`, description: getApiErrorMessage(error) })
    },
    onSettled: () => {
      setPendingMa(null)
      // Tải lại cả khi lỗi để ô chọn quay về giá trị thật trong DB.
      queryClient.invalidateQueries({ queryKey: ["/sach"] })
    },
  })

  const rows = list.data ?? []

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Bản sách</h3>
          <p className="text-xs text-muted-foreground">{list.isSuccess ? `${rows.length} bản` : "Các bản vật lý của đầu sách này."}</p>
        </div>
        <Button size="sm" onClick={() => setNhapOpen(true)}>
          <Plus aria-hidden="true" />
          Nhập bản sách
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Mã bản</TableHead>
            <TableHead>Vị trí kệ</TableHead>
            <TableHead>Ngày nhập</TableHead>
            <TableHead className="w-52">Tình trạng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.isPending && (
            <TableRow>
              <TableCell colSpan={4}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            </TableRow>
          )}
          {list.isError && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-destructive">
                <span role="alert">{getApiErrorMessage(list.error, "Không tải được bản sách.")}</span>{" "}
                <button type="button" className="underline" onClick={() => list.refetch()}>
                  Thử lại
                </button>
              </TableCell>
            </TableRow>
          )}
          {list.isSuccess && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                Chưa có bản sách nào.
              </TableCell>
            </TableRow>
          )}
          {rows.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">{b.maBanSach}</TableCell>
              <TableCell>{b.viTriKe}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(b.ngayNhap)}</TableCell>
              <TableCell>
                <Select
                  value={b.tinhTrang}
                  disabled={pendingMa === b.maBanSach}
                  onValueChange={(v) => v && v !== b.tinhTrang && doiTinhTrang.mutate({ ma: b.maBanSach, tinhTrang: v })}
                  items={TINH_TRANG_BAN_SACH.map((t) => ({ value: t.value, label: t.label }))}
                >
                  <SelectTrigger size="sm" aria-label={`Tình trạng ${b.maBanSach}`} className="w-44 border-input bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TINH_TRANG_BAN_SACH.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <NhapBanSachDialog key={nhapOpen ? "open" : "closed"} sachId={sachId} open={nhapOpen} onClose={() => setNhapOpen(false)} />
    </div>
  )
}

function NhapBanSachDialog({ sachId, open, onClose }: { sachId: string; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const form = useForm<NhapValues>({
    resolver: zodResolver(nhapSchema),
    defaultValues: { soBan: "1", viTriKe: "" },
    mode: "onBlur",
  })

  const nhap = useMutation({
    mutationFn: async (v: NhapValues) => {
      const { data } = await apiClient.post<Schemas["BanSachMoiDto"][]>(`/sach/${sachId}/ban-sach`, {
        soBan: Number(v.soBan),
        viTriKe: v.viTriKe,
      })
      return data
    },
    onSuccess: (moi) => {
      const giu = moi.filter((b) => b.tinh_trang === "DANG_GIU").length
      toast.add({
        type: "success",
        title: `Đã nhập ${moi.length} bản sách`,
        description:
          moi.map((b) => b.ma_ban_sach).join(", ") + (giu ? ` (${giu} bản được giữ cho người đặt trước)` : ""),
      })
      queryClient.invalidateQueries({ queryKey: ["/sach"] })
      onClose()
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể nhập bản sách", description: getApiErrorMessage(error) })
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !nhap.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập bản sách</DialogTitle>
          <DialogDescription>Mã bản (BSnnn) do hệ thống tự sinh.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => nhap.mutate(v))} noValidate className="grid gap-4">
          <FieldGroup className="grid gap-3">
            <TextField
              control={form.control}
              name="soBan"
              label="Số bản nhập"
              id="bs-soBan"
              inputMode="numeric"
              maxLength={3}
            />
            <TextField
              control={form.control}
              name="viTriKe"
              label="Vị trí kệ"
              required
              id="bs-viTriKe"
              maxLength={50}
              placeholder="Ví dụ: A1-03"
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={nhap.isPending} onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={nhap.isPending}>
              {nhap.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Nhập
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
