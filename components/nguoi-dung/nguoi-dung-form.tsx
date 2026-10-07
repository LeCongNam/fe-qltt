"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { LOAI_NGUOI_DUNG, type LoaiNguoiDung } from "@/components/nguoi-dung/nguoi-dung-meta"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { nguoiDungApi } from "@/features/nguoi-dung/api"
import { nguoiDungKeys } from "@/features/nguoi-dung/queries"
import { getApiErrorMessage, type Schemas } from "@/lib/api"
import { TextField } from "@/components/form/text-field"

const schema = z.object({
  maNguoiDung: z.string().trim().min(1, "Vui lòng nhập mã người dùng.").max(20, "Mã người dùng tối đa 20 ký tự."),
  hoTen: z.string().trim().min(1, "Vui lòng nhập họ và tên.").max(160, "Họ và tên tối đa 160 ký tự."),
  loaiNguoiDung: z.enum(["SINH_VIEN", "GIANG_VIEN", "CAN_BO"], { message: "Vui lòng chọn loại người dùng." }),
  email: z
    .string()
    .trim()
    .max(120, "Email tối đa 120 ký tự.")
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Email không đúng định dạng."),
  sdt: z.string().trim().max(20, "Số điện thoại tối đa 20 ký tự."),
  khoaDonVi: z.string().trim().max(160, "Khoa / đơn vị tối đa 160 ký tự."),
})

type FormValues = z.infer<typeof schema>
export type NguoiDung = Schemas["NguoiDungDto"]

const inputClass = "h-10 rounded-md border-input bg-white text-sm"

/** Form thêm (nguoiDung = undefined) hoặc sửa thông tin người dùng. Trạng thái không đổi ở đây. */
export function NguoiDungForm({
  nguoiDung,
  onSaved,
  onCancel,
}: {
  nguoiDung?: NguoiDung
  onSaved: (saved: NguoiDung) => void
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      maNguoiDung: nguoiDung?.maNguoiDung ?? "",
      hoTen: nguoiDung?.hoTen ?? "",
      loaiNguoiDung: nguoiDung?.loaiNguoiDung ?? (undefined as unknown as LoaiNguoiDung),
      email: nguoiDung?.email ?? "",
      sdt: nguoiDung?.sdt ?? "",
      khoaDonVi: nguoiDung?.khoaDonVi ?? "",
    },
    mode: "onBlur",
  })

  const save = useMutation({
    mutationFn: async (v: FormValues) => {
      // Thêm: bỏ trường tùy chọn rỗng. Sửa: gửi chuỗi rỗng để xóa giá trị cũ.
      const payload = nguoiDung
        ? v
        : { ...v, email: v.email || undefined, sdt: v.sdt || undefined, khoaDonVi: v.khoaDonVi || undefined }
      return nguoiDung ? nguoiDungApi.update(nguoiDung.id, payload) : nguoiDungApi.create(payload)
    },
    onSuccess: (saved) => {
      toast.add({
        type: "success",
        title: nguoiDung ? "Đã cập nhật người dùng" : "Đã thêm người dùng",
        description: `${saved.hoTen} (${saved.maNguoiDung})`,
      })
      queryClient.invalidateQueries({ queryKey: nguoiDungKeys.all })
      onSaved(saved)
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: nguoiDung ? "Không thể cập nhật người dùng" : "Không thể thêm người dùng",
        description: getApiErrorMessage(error),
      })
    },
  })

  return (
    <form className="space-y-7" onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
      <FieldSet className="border-b border-border pb-7">
        <FieldLegend variant="label" className="text-ink">Thông tin người dùng</FieldLegend>
        <FieldDescription>Các trường có dấu * là bắt buộc.</FieldDescription>
        <FieldGroup className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="maNguoiDung"
            label="Mã người dùng"
            required
            id="nd-maNguoiDung"
            maxLength={20}
            placeholder="Ví dụ: SV2026001"
          />
          <TextField
            control={form.control}
            name="hoTen"
            label="Họ và tên"
            required
            id="nd-hoTen"
            maxLength={160}
            autoComplete="name"
            placeholder="Nhập họ và tên"
          />
          <Controller
            name="loaiNguoiDung"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="nd-loaiNguoiDung">
                  Loại người dùng <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={field.value ?? null}
                  onValueChange={field.onChange}
                  items={LOAI_NGUOI_DUNG}
                >
                  <SelectTrigger id="nd-loaiNguoiDung" aria-invalid={fieldState.invalid} className="h-10 w-full rounded-md border-input bg-white">
                    <SelectValue placeholder="Chọn loại người dùng" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOAI_NGUOI_DUNG.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="nd-email">Email</FieldLabel>
                <Input {...field} id="nd-email" type="email" aria-invalid={fieldState.invalid} maxLength={120} autoComplete="email" placeholder="ten@example.com" className={inputClass} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <TextField
            control={form.control}
            name="sdt"
            label="Số điện thoại"
            id="nd-sdt"
            type="tel"
            maxLength={20}
            autoComplete="tel"
            placeholder="Nhập số điện thoại"
          />
          <TextField
            control={form.control}
            name="khoaDonVi"
            label="Khoa / đơn vị"
            id="nd-khoaDonVi"
            maxLength={160}
            placeholder="Ví dụ: Khoa Công nghệ thông tin"
          />
        </FieldGroup>
      </FieldSet>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={save.isPending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {nguoiDung ? "Lưu thay đổi" : "Lưu người dùng"}
        </Button>
      </div>
    </form>
  )
}
