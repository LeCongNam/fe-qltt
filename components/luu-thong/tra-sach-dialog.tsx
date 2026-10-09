"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { TINH_TRANG_TRA, type TinhTrangTra } from "@/components/luu-thong/luu-thong-meta"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { datTruocKeys } from "@/features/dat-truoc/queries"
import { muonTraApi } from "@/features/muon-tra/api"
import { phatKeys } from "@/features/phat/queries"
import { phieuMuonKeys } from "@/features/phieu-muon/queries"
import { sachKeys } from "@/features/sach/queries"
import { getApiErrorMessage } from "@/lib/api"
import { formatVnd } from "@/lib/format"

/** Trả sách. `maBanSach` cố định khi mở từ phiếu mượn; bỏ trống thì cho nhập (trả nhanh). */
export function TraSachDialog({ open, onClose, maBanSach }: { open: boolean; onClose: () => void; maBanSach?: string }) {
  const queryClient = useQueryClient()
  const [ma, setMa] = useState(maBanSach ?? "")
  const [tinhTrang, setTinhTrang] = useState<TinhTrangTra>("BINH_THUONG")

  const tra = useMutation({
    mutationFn: () => muonTraApi.tra({ maBanSach: ma.trim(), tinhTrang }),
    onSuccess: (data) => {
      const phat = data.phieuPhats.reduce((sum, p) => sum + Number(p.soTien), 0)
      toast.add({
        type: phat > 0 ? "warning" : "success",
        title: `Đã trả ${ma.trim()}`,
        description:
          phat > 0
            ? `Phiếu ${data.phieuMuon.maPhieu}: phát sinh ${data.phieuPhats.length} phiếu phạt, tổng ${formatVnd(phat)}.`
            : `Phiếu ${data.phieuMuon.maPhieu}.`,
      })
      queryClient.invalidateQueries({ queryKey: phieuMuonKeys.all })
      queryClient.invalidateQueries({ queryKey: phatKeys.all })
      queryClient.invalidateQueries({ queryKey: sachKeys.all })
      queryClient.invalidateQueries({ queryKey: datTruocKeys.all })
      onClose()
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể trả sách", description: getApiErrorMessage(error) })
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !tra.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trả sách{maBanSach ? ` ${maBanSach}` : ""}</DialogTitle>
          <DialogDescription>Trả quá hạn, hư hỏng hoặc mất sẽ tự lập phiếu phạt.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (ma.trim()) tra.mutate()
          }}
        >
          {!maBanSach && (
            <Field>
              <FieldLabel htmlFor="tra-ma">
                Mã bản sách <span aria-hidden="true" className="text-destructive">*</span>
              </FieldLabel>
              <Input id="tra-ma" value={ma} onChange={(e) => setMa(e.target.value)} maxLength={30} placeholder="Ví dụ: BS001" className="h-10 rounded-md border-input bg-white text-sm" />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor="tra-tinh-trang">Tình trạng sách khi trả</FieldLabel>
            <Select value={tinhTrang} items={TINH_TRANG_TRA} onValueChange={(v) => v && setTinhTrang(v)}>
              <SelectTrigger id="tra-tinh-trang" className="h-10 w-full rounded-md border-input bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TINH_TRANG_TRA.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tinhTrang !== "BINH_THUONG" && <FieldDescription>Sẽ lập phiếu phạt {tinhTrang === "MAT" ? "mất sách" : "hư hỏng"}.</FieldDescription>}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={tra.isPending} onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={tra.isPending || !ma.trim()}>
              {tra.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Xác nhận trả
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
