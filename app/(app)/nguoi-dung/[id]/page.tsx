"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { ArrowLeft, KeyRound, Loader2, LockKeyhole, LockKeyholeOpen, Pencil } from "lucide-react"
import { z } from "zod"

import { NguoiDungForm } from "@/components/nguoi-dung/nguoi-dung-form"
import {
  LOAI_NGUOI_DUNG,
  TRANG_THAI_NGUOI_DUNG,
  TRANG_THAI_TAI_KHOAN,
  VAI_TRO,
  labelOf,
  type LoaiNguoiDung,
  type TrangThaiNguoiDung,
  type VaiTroTaiKhoan,
} from "@/components/nguoi-dung/nguoi-dung-meta"
import { StatusPill } from "@/components/status-pill"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Schemas } from "@/lib/api"
import { formatDate } from "@/lib/format"

type ChiTiet = Schemas["NguoiDungChiTietDto"]
type TaiKhoan = Schemas["TaiKhoanCongKhaiDto"]

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[#5f6b64]">{label}</dt>
      <dd className="mt-1 text-sm text-[#1c2c26]">{children || "—"}</dd>
    </div>
  )
}

export default function NguoiDungDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isStaff, isAdmin, ready } = useAuth()
  const [editing, setEditing] = useState(false)

  const query = useQuery({
    queryKey: ["/docgia", "detail", id],
    queryFn: async () => (await apiClient.get<ChiTiet>(`/docgia/${id}`)).data,
    retry: false,
    enabled: isStaff,
  })

  if (ready && !isStaff) {
    return <p className="text-sm text-[#a35143]">Bạn không có quyền xem người dùng.</p>
  }

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (query.isError) {
    const notFound = axios.isAxiosError(query.error) && query.error.response?.status === 404
    return (
      <div className="mx-auto w-full max-w-4xl space-y-3 text-sm">
        <p className="text-[#a35143]">
          {notFound ? "Không tìm thấy người dùng." : getApiErrorMessage(query.error, "Không tải được người dùng.")}
        </p>
        <Link href="/nguoi-dung" className="text-[#147d64] hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const u = query.data

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#e4e8e2] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/nguoi-dung" className="inline-flex items-center gap-1 text-xs font-medium text-[#5f6b64] hover:text-[#147d64]">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Người dùng
          </Link>
          <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">{u.hoTen}</h2>
          <p className="mt-1.5 text-sm text-[#5f6b64]">Mã người dùng {u.maNguoiDung}</p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil aria-hidden="true" />
            Sửa thông tin
          </Button>
        )}
      </div>

      {editing ? (
        <NguoiDungForm nguoiDung={u} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-[#e4e8e2] bg-white p-5 sm:grid-cols-2">
          <Info label="Loại người dùng">{labelOf(LOAI_NGUOI_DUNG, u.loaiNguoiDung)}</Info>
          <Info label="Ngày tạo">{formatDate(u.createdAt)}</Info>
          <Info label="Email">{u.email}</Info>
          <Info label="Số điện thoại">{u.sdt}</Info>
          <div className="sm:col-span-2">
            <Info label="Khoa / đơn vị">{u.khoaDonVi}</Info>
          </div>
        </dl>
      )}

      {!editing && (
        <>
          <TrangThaiCard nguoiDung={u} isAdmin={isAdmin} />
          <TaiKhoanCard nguoiDung={u} isAdmin={isAdmin} />
        </>
      )}
    </section>
  )
}

function TrangThaiCard({ nguoiDung: u, isAdmin }: { nguoiDung: ChiTiet; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [target, setTarget] = useState<TrangThaiNguoiDung | null>(null)
  // Cán bộ chỉ ADMIN đổi được (BE trả 403 cho THU_THU).
  const locked = u.loaiNguoiDung === "CAN_BO" && !isAdmin

  const doi = useMutation({
    mutationFn: async (trangThai: TrangThaiNguoiDung) =>
      (await apiClient.patch<ChiTiet>(`/docgia/${u.id}/trang-thai`, { trangThai })).data,
    onSuccess: (data) => {
      toast.add({
        type: "success",
        title: "Đã đổi trạng thái",
        description: `${data.hoTen} → ${labelOf(TRANG_THAI_NGUOI_DUNG, data.trangThai)}`,
      })
      setTarget(null)
      queryClient.invalidateQueries({ queryKey: ["/docgia"] })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể đổi trạng thái", description: getApiErrorMessage(error) })
      setTarget(null)
    },
  })

  return (
    <div className="rounded-lg border border-[#e4e8e2] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#1c2c26]">Trạng thái người dùng</h3>
          <p className="mt-1 text-xs text-[#5f6b64]">
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
            <SelectTrigger size="sm" aria-label="Đổi trạng thái người dùng" className="w-40 border-[#dfe5df] bg-white">
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

      <AlertDialog open={target !== null} onOpenChange={(open) => !open && !doi.isPending && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Đổi trạng thái sang “{target ? labelOf(TRANG_THAI_NGUOI_DUNG, target) : ""}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {target !== null && target !== "HOAT_DONG"
                ? "Người dùng sẽ không thể mượn hoặc đặt sách và tài khoản đăng nhập (nếu có) sẽ bị khóa tự động. "
                : ""}
              {target === "HOAT_DONG" && u.taiKhoan?.trangThai === "KHOA"
                ? "Tài khoản đăng nhập vẫn đang khóa; quản trị cần mở lại riêng ở mục Tài khoản. "
                : ""}
              Thao tác này được ghi nhật ký.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={doi.isPending}>Hủy</AlertDialogCancel>
            <Button disabled={doi.isPending} onClick={() => target && doi.mutate(target)} className="bg-[#147d64] text-white hover:bg-[#106a55]">
              {doi.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Xác nhận
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function TaiKhoanCard({ nguoiDung: u, isAdmin }: { nguoiDung: ChiTiet; isAdmin: boolean }) {
  const queryClient = useQueryClient()
  const [creating, setCreating] = useState(false)
  const tk = u.taiKhoan

  const doi = useMutation({
    mutationFn: async (trangThai: TaiKhoan["trangThai"]) =>
      (await apiClient.patch<TaiKhoan>(`/docgia/${u.id}/tai-khoan/trang-thai`, { trangThai })).data,
    onSuccess: (data) => {
      toast.add({
        type: "success",
        title: data.trangThai === "KHOA" ? "Đã khóa tài khoản" : "Đã mở tài khoản",
        description: data.tenDangNhap,
      })
      queryClient.invalidateQueries({ queryKey: ["/docgia"] })
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể đổi trạng thái tài khoản", description: getApiErrorMessage(error) })
    },
  })

  const moBiChan = tk?.trangThai === "KHOA" && u.trangThai !== "HOAT_DONG"

  return (
    <div className="rounded-lg border border-[#e4e8e2] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#1c2c26]">Tài khoản đăng nhập</h3>
          {!isAdmin && <p className="mt-1 text-xs text-[#5f6b64]">Chỉ quản trị được tạo hoặc khóa/mở tài khoản.</p>}
        </div>
        {isAdmin && !tk && (
          <Button size="sm" className="bg-[#147d64] text-white hover:bg-[#106a55]" onClick={() => setCreating(true)}>
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
            <Info label="Tên đăng nhập">{tk.tenDangNhap}</Info>
            <Info label="Vai trò">{labelOf(VAI_TRO, tk.vaiTro)}</Info>
            <Info label="Trạng thái">
              <StatusPill list={TRANG_THAI_TAI_KHOAN} value={tk.trangThai} />
            </Info>
          </dl>
          {moBiChan && (
            <p className="mt-3 text-xs text-[#9a6412]">
              Chưa thể mở tài khoản: người dùng chưa ở trạng thái hoạt động. Hãy đổi trạng thái người dùng trước.
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-[#5f6b64]">Người dùng này chưa có tài khoản đăng nhập.</p>
      )}

      <TaoTaiKhoanDialog key={creating ? "open" : "closed"} nguoiDung={u} open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}

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

function TaoTaiKhoanDialog({ nguoiDung: u, open, onClose }: { nguoiDung: ChiTiet; open: boolean; onClose: () => void }) {
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
    mutationFn: async (v: TaiKhoanValues) =>
      (
        await apiClient.post<TaiKhoan>(`/docgia/${u.id}/tai-khoan`, {
          ...(v.tenDangNhap && { tenDangNhap: v.tenDangNhap }),
          matKhau: v.matKhau,
          vaiTro: v.vaiTro,
        })
      ).data,
    onSuccess: (tk) => {
      toast.add({ type: "success", title: "Đã tạo tài khoản", description: `${tk.tenDangNhap} (${labelOf(VAI_TRO, tk.vaiTro)})` })
      queryClient.invalidateQueries({ queryKey: ["/docgia"] })
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
                  <Input {...field} id="tk-tenDangNhap" maxLength={80} autoComplete="off" aria-invalid={fieldState.invalid} placeholder={macDinh} className="h-10 rounded-md border-[#dfe5df] bg-white text-sm" />
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
                    Mật khẩu <span aria-hidden="true" className="text-[#a35143]">*</span>
                  </FieldLabel>
                  <Input {...field} id="tk-matKhau" type="password" maxLength={72} autoComplete="new-password" aria-invalid={fieldState.invalid} placeholder="Tối thiểu 8 ký tự" className="h-10 rounded-md border-[#dfe5df] bg-white text-sm" />
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
                    <SelectTrigger id="tk-vaiTro" className="h-10 w-full rounded-md border-[#dfe5df] bg-white">
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
            <Button type="submit" disabled={tao.isPending} className="bg-[#147d64] text-white hover:bg-[#106a55]">
              {tao.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
