"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { phatApi } from "@/features/phat/api"
import { phatKeys } from "@/features/phat/queries"
import { getApiErrorMessage, type Schemas } from "@/lib/api"
import { formatVnd } from "@/lib/format"

type Phat = Schemas["PhieuPhatChiTietDto"]

export function HuyPhatDialog({ row, onClose }: { row: Phat | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [lyDo, setLyDo] = useState("")

  const huy = useMutation({
    mutationFn: () => phatApi.huy(row!.id, { lyDo: lyDo.trim() }),
    onSuccess: () => {
      toast.add({ type: "success", title: "Đã hủy phiếu phạt", description: row ? formatVnd(row.soTien) : undefined })
      queryClient.invalidateQueries({ queryKey: phatKeys.all })
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
            <Input id="phat-ly-do" value={lyDo} onChange={(e) => setLyDo(e.target.value)} maxLength={200} placeholder="Nhập lý do hủy phiếu phạt" className="h-10 rounded-md border-input bg-white text-sm" />
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

