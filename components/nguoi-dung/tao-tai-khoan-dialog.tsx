"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { VAI_TRO, labelOf, type LoaiNguoiDung, type VaiTroTaiKhoan, type NguoiDungChiTiet } from "@/components/nguoi-dung/nguoi-dung-meta"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { nguoiDungApi } from "@/features/nguoi-dung/api"
import { nguoiDungKeys } from "@/features/nguoi-dung/queries"
import { getApiErrorMessage } from "@/lib/api"

const taiKhoanSchema = z.object({
  tenDangNhap: z.string().trim().max(80, "Tên đăng nhập tối đa 80 ký tự."),
  matKhau: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự.").max(72, "Mật khẩu tối đa 72 ký tự."),
  vaiTro: z.enum(["ADMIN", "THU_THU", "BAN_DOC"]),
})
type TaiKhoanValues = z.infer<typeof taiKhoanSchema>

/** DB bắt buộc vai trò khớp loại người dùng: cán bộ → thủ thư/quản trị, còn lại → bạn đọc. */
function vaiTroChoPhep(loai: LoaiNguoiDung): VaiTroTaiKhoan[] {
  return loai === "CAN_BO" ? ["THU_THU", "ADMIN"] : ["BAN_DOC"]
}

export function TaoTaiKhoanDialog({ nguoiDung: u, open, onClose }: { nguoiDung: NguoiDungChiTiet; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const choPhep = vaiTroChoPhep(u.loaiNguoiDung)
  const items = VAI_TRO.filter((v) => choPhep.includes(v.value))
  const macDinh = u.maNguoiDung.toLowerCase()
  const form = useForm<TaiKhoanValues>({
    resolver: zodResolver(taiKhoanSchema),
    defaultValues: { tenDangNhap: "", matKhau: "", vaiTro: choPhep[0] },
    mode: "onBlur",
  })

  const tao = useMutation({
    mutationFn: (v: TaiKhoanValues) =>
      nguoiDungApi.taoTaiKhoan(u.id, {
        ...(v.tenDangNhap && { tenDangNhap: v.tenDangNhap }),
        matKhau: v.matKhau,
        vaiTro: v.vaiTro,
      }),
    onSuccess: (tk) => {
      toast.add({ type: "success", title: "Đã tạo tài khoản", description: `${tk.tenDangNhap} (${labelOf(VAI_TRO, tk.vaiTro)})` })
      queryClient.invalidateQueries({ queryKey: nguoiDungKeys.all })
      onClose()
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể tạo tài khoản", description: getApiErrorMessage(error) })
    },
  })

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !tao.isPending && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo tài khoản cho {u.hoTen}</DialogTitle>
          <DialogDescription>Tài khoản mới ở trạng thái hoạt động.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => tao.mutate(v))} noValidate className="grid gap-4">
          <FieldGroup className="grid gap-3">
            <Controller
              name="tenDangNhap"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tk-tenDangNhap">Tên đăng nhập</FieldLabel>
                  <Input {...field} id="tk-tenDangNhap" maxLength={80} autoComplete="off" aria-invalid={fieldState.invalid} placeholder={macDinh} className="h-10 rounded-md border-input bg-white text-sm" />
                  <FieldDescription>Bỏ trống để dùng “{macDinh}”.</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="matKhau"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tk-matKhau">
                    Mật khẩu <span aria-hidden="true" className="text-destructive">*</span>
                  </FieldLabel>
                  <Input {...field} id="tk-matKhau" type="password" maxLength={72} autoComplete="new-password" aria-invalid={fieldState.invalid} placeholder="Tối thiểu 8 ký tự" className="h-10 rounded-md border-input bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="vaiTro"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="tk-vaiTro">Vai trò</FieldLabel>
                  <Select value={field.value} items={items} onValueChange={(v) => v && field.onChange(v)} disabled={items.length === 1}>
                    <SelectTrigger id="tk-vaiTro" className="h-10 w-full rounded-md border-input bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((v) => (
                        <SelectItem key={v.value} value={v.value}>
                          {v.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={tao.isPending} onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={tao.isPending}>
              {tao.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
