"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { TRANG_THAI_NGUOI_DUNG, labelOf, type TrangThaiNguoiDung, type NguoiDungChiTiet } from "@/components/nguoi-dung/nguoi-dung-meta"
import { StatusPill } from "@/components/status-pill"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { nguoiDungApi } from "@/features/nguoi-dung/api"
import { nguoiDungKeys } from "@/features/nguoi-dung/queries"
import { getApiErrorMessage } from "@/lib/api"
import { ConfirmDialog } from "@/components/confirm-dialog"

export function TrangThaiCard({ nguoiDung: u, isAdmin }: { nguoiDung: NguoiDungChiTiet; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<TrangThaiNguoiDung | null>(null)
  // Cán bộ chỉ ADMIN đổi được (BE trả 403 cho THU_THU).
  const locked = u.loaiNguoiDung === "CAN_BO" && !isAdmin

  const doi = useMutation({
    mutationFn: (trangThai: TrangThaiNguoiDung) => nguoiDungApi.doiTrangThai(u.id, { trangThai }),
    onSuccess: (data) => {
      toast.add({
        type: "success",
        title: "Đã đổi trạng thái",
        description: `${data.hoTen} → ${labelOf(TRANG_THAI_NGUOI_DUNG, data.trangThai)}`,
      })
      setTarget(null)
      queryClient.invalidateQueries({ queryKey: nguoiDungKeys.all })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể đổi trạng thái", description: getApiErrorMessage(error) })
      setTarget(null)
    },
  })

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Trạng thái người dùng</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {locked
              ? "Chỉ quản trị được đổi trạng thái của cán bộ."
              : "Rời trạng thái hoạt động sẽ tự khóa tài khoản đăng nhập."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill list={TRANG_THAI_NGUOI_DUNG} value={u.trangThai} />
          <Select
            value={u.trangThai}
            items={TRANG_THAI_NGUOI_DUNG}
            disabled={locked || doi.isPending}
            onValueChange={(v) => v && v !== u.trangThai && setTarget(v)}
          >
            <SelectTrigger size="sm" aria-label="Đổi trạng thái người dùng" className="w-40 border-input bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANG_THAI_NGUOI_DUNG.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        title={
          <>
            Đổi trạng thái sang “{target ? labelOf(TRANG_THAI_NGUOI_DUNG, target) : ""}”?
          </>
        }
        description={
          <>
            {target !== null && target !== "HOAT_DONG"
                            ? "Người dùng sẽ không thể mượn hoặc đặt sách và tài khoản đăng nhập (nếu có) sẽ bị khóa tự động. "
                            : ""}
                          {target === "HOAT_DONG" && u.taiKhoan?.trangThai === "KHOA"
                            ? "Tài khoản đăng nhập vẫn đang khóa; quản trị cần mở lại riêng ở mục Tài khoản. "
                            : ""}
                          Thao tác này được ghi nhật ký.
          </>
        }
        confirmLabel="Xác nhận"
        pending={doi.isPending}
        onConfirm={() => target && doi.mutate(target)}
      />
    </div>
  )
}
