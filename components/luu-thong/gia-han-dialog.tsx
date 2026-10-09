"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { meKeys } from "@/features/me/queries"
import { muonTraApi } from "@/features/muon-tra/api"
import { phieuMuonKeys } from "@/features/phieu-muon/queries"
import { getApiErrorMessage } from "@/lib/api"
import { formatDate } from "@/lib/format"

export function GiaHanDialog({ maBanSach, onClose }: { maBanSach: string | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [soNgay, setSoNgay] = useState("7")
  const n = Number(soNgay)
  const hopLe = /^\d{1,3}$/.test(soNgay) && n >= 1 && n <= 365

  const giaHan = useMutation({
    mutationFn: () => muonTraApi.giaHan({ maBanSach: maBanSach!, soNgay: n }),
    onSuccess: (data) => {
      toast.add({
        type: "success",
        title: `Đã gia hạn ${maBanSach}`,
        description: `Hạn trả mới ${formatDate(data.hanTra)} (lần ${data.soLanGiaHan}).`,
      })
      queryClient.invalidateQueries({ queryKey: phieuMuonKeys.all })
      queryClient.invalidateQueries({ queryKey: meKeys.all })
      onClose()
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể gia hạn", description: getApiErrorMessage(error) })
    },
  })

  return (
    <Dialog open={maBanSach !== null} onOpenChange={(o) => !o && !giaHan.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gia hạn {maBanSach}</DialogTitle>
          <DialogDescription>Không gia hạn được khi sách đã quá hạn, hết số lần cho phép hoặc có người đặt trước.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (hopLe) giaHan.mutate()
          }}
        >
          <Field data-invalid={!hopLe}>
            <FieldLabel htmlFor="gh-so-ngay">Số ngày gia hạn</FieldLabel>
            <Input id="gh-so-ngay" value={soNgay} onChange={(e) => setSoNgay(e.target.value)} inputMode="numeric" maxLength={3} placeholder="Ví dụ: 14" aria-invalid={!hopLe} className="h-10 rounded-md border-input bg-white text-sm" />
            {hopLe ? <FieldDescription>Từ 1 đến 365 ngày.</FieldDescription> : <FieldError>Số ngày phải từ 1 đến 365.</FieldError>}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={giaHan.isPending} onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={giaHan.isPending || !hopLe}>
              {giaHan.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Gia hạn
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
