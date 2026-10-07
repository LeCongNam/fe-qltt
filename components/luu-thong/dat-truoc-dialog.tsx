"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { datTruocApi } from "@/features/dat-truoc/api"
import { datTruocKeys } from "@/features/dat-truoc/queries"
import { sachQueries } from "@/features/sach/queries"
import { getApiErrorMessage } from "@/lib/api"

export function DatTruocDialog({ open, isStaff, onClose }: { open: boolean; isStaff: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [maSach, setMaSach] = useState<string | null>(null)
  const [maNguoiDung, setMaNguoiDung] = useState("")

  // Chọn từ danh sách sách (BE giới hạn 100 dòng mỗi trang).
  const sachs = useQuery({
    ...sachQueries.list({ page: 1, limit: 100 }),
    select: (res) => res.data,
    enabled: open,
  })

  const dat = useMutation({
    mutationFn: () =>
      datTruocApi.create({ maSach: maSach!, ...(isStaff && { maNguoiDung: maNguoiDung.trim() }) }),
    onSuccess: (d) => {
      toast.add({ type: "success", title: "Đã đặt trước", description: d?.sach.tenSach })
      queryClient.invalidateQueries({ queryKey: datTruocKeys.all })
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

