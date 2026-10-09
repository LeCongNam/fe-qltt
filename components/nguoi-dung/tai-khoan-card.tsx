"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { KeyRound, Loader2, LockKeyhole, LockKeyholeOpen } from "lucide-react"

import { TRANG_THAI_TAI_KHOAN, VAI_TRO, labelOf, type NguoiDungChiTiet, type TaiKhoanCongKhai } from "@/components/nguoi-dung/nguoi-dung-meta"
import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { nguoiDungApi } from "@/features/nguoi-dung/api"
import { nguoiDungKeys } from "@/features/nguoi-dung/queries"
import { getApiErrorMessage } from "@/lib/api"
import { InfoItem } from "@/components/info-item"
import { TaoTaiKhoanDialog } from "@/components/nguoi-dung/tao-tai-khoan-dialog"

export function TaiKhoanCard({ nguoiDung: u, isAdmin }: { nguoiDung: NguoiDungChiTiet; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const tk = u.taiKhoan

  const doi = useMutation({
    mutationFn: (trangThai: TaiKhoanCongKhai["trangThai"]) => nguoiDungApi.doiTrangThaiTaiKhoan(u.id, { trangThai }),
    onSuccess: (data) => {
      toast.add({
        type: "success",
        title: data.trangThai === "KHOA" ? "Đã khóa tài khoản" : "Đã mở tài khoản",
        description: data.tenDangNhap,
      })
      queryClient.invalidateQueries({ queryKey: nguoiDungKeys.all })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể đổi trạng thái tài khoản", description: getApiErrorMessage(error) })
    },
  })

  const moBiChan = tk?.trangThai === "KHOA" && u.trangThai !== "HOAT_DONG"

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Tài khoản đăng nhập</h3>
          {!isAdmin && <p className="mt-1 text-xs text-muted-foreground">Chỉ quản trị được tạo hoặc khóa/mở tài khoản.</p>}
        </div>
        {isAdmin && !tk && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <KeyRound aria-hidden="true" />
            Tạo tài khoản
          </Button>
        )}
        {isAdmin && tk && (
          <Button
            size="sm"
            variant={tk.trangThai === "KHOA" ? "outline" : "destructive"}
            disabled={doi.isPending || moBiChan}
            onClick={() => doi.mutate(tk.trangThai === "KHOA" ? "HOAT_DONG" : "KHOA")}
          >
            {doi.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : tk.trangThai === "KHOA" ? (
              <LockKeyholeOpen aria-hidden="true" />
            ) : (
              <LockKeyhole aria-hidden="true" />
            )}
            {tk.trangThai === "KHOA" ? "Mở tài khoản" : "Khóa tài khoản"}
          </Button>
        )}
      </div>

      {tk ? (
        <>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            <InfoItem label="Tên đăng nhập">{tk.tenDangNhap}</InfoItem>
            <InfoItem label="Vai trò">{labelOf(VAI_TRO, tk.vaiTro)}</InfoItem>
            <InfoItem label="Trạng thái">
              <StatusPill list={TRANG_THAI_TAI_KHOAN} value={tk.trangThai} />
            </InfoItem>
          </dl>
          {moBiChan && (
            <p className="mt-3 text-xs text-warning">
              Chưa thể mở tài khoản: người dùng chưa ở trạng thái hoạt động. Hãy đổi trạng thái người dùng trước.
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Người dùng này chưa có tài khoản đăng nhập.</p>
      )}

      <TaoTaiKhoanDialog key={creating ? "open" : "closed"} nguoiDung={u} open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
