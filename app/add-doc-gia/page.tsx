"use client"

import Link from "next/link"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import axios from "axios"
import { apiClient } from "@/lib/api"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const readerFormSchema = z.object({
  maNguoiDung: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã độc giả.")
    .max(20, "Mã độc giả tối đa 20 ký tự."),
  hoTen: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên.")
    .max(160, "Họ và tên tối đa 160 ký tự."),
  loaiNguoiDung: z.enum(["SINH_VIEN", "GIANG_VIEN", "CAN_BO"], {
    required_error: "Vui lòng chọn loại độc giả.",
  }),
  trangThai: z.enum(["HOAT_DONG", "TAM_KHOA", "NGUNG"]),
  email: z
    .string()
    .trim()
    .max(120, "Email tối đa 120 ký tự.")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Email không đúng định dạng."
    ),
  sdt: z.string().trim().max(20, "Số điện thoại tối đa 20 ký tự."),
  khoaDonVi: z.string().trim().max(160, "Khoa / đơn vị tối đa 160 ký tự."),
})

type ReaderFormValues = z.infer<typeof readerFormSchema>

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message

    if (Array.isArray(message)) return message.join(" ")
    if (typeof message === "string") return message
    if (!error.response) return "Không thể kết nối đến máy chủ. Vui lòng thử lại."
  }

  return "Đã xảy ra lỗi khi tạo độc giả. Vui lòng thử lại."
}

export default function AddReaderPage() {
  const form = useForm<ReaderFormValues>({
    resolver: zodResolver(readerFormSchema),
    defaultValues: {
      maNguoiDung: "",
      hoTen: "",
      loaiNguoiDung: undefined,
      trangThai: "HOAT_DONG",
      email: "",
      sdt: "",
      khoaDonVi: "",
    },
    mode: "onBlur",
  })

  async function onSubmit(values: ReaderFormValues) {
    const payload = {
      ...values,
      email: values.email || undefined,
      sdt: values.sdt || undefined,
      khoaDonVi: values.khoaDonVi || undefined,
    }

    try {
      const { data } = await apiClient.post<unknown>("/docgia", payload)

      if (typeof data === "string") {
        toast.add({
          type: "warning",
          title: "Backend chưa lưu dữ liệu",
          description: "API đã nhận yêu cầu nhưng service hiện vẫn là stub.",
        })
        return
      }

      toast.add({
        type: "success",
        title: "Đã tạo độc giả",
        description: `${values.hoTen} đã được thêm vào hệ thống.`,
      })
      form.reset()
    } catch (error) {
      toast.add({
        type: "error",
        title: "Không thể tạo độc giả",
        description: getApiErrorMessage(error),
      })
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-7 border-b border-[#e4e8e2] pb-5">
        <p className="text-xs font-medium text-[#738078]">Độc giả</p>
        <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Thêm độc giả</h2>
        <p className="mt-1.5 text-sm text-[#758078]">Nhập thông tin hồ sơ độc giả mới.</p>
      </div>

      <form className="space-y-7" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldSet className="border-b border-[#e4e8e2] pb-7">
          <FieldLegend variant="label" className="text-[#34463d]">Thông tin độc giả</FieldLegend>
          <FieldDescription>Các trường có dấu * là bắt buộc.</FieldDescription>
          <FieldGroup className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <Controller
              name="maNguoiDung"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mã độc giả <span aria-hidden="true" className="text-[#bb6759]">*</span></FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} maxLength={20} placeholder="Ví dụ: SV2026001" className="h-10 rounded-md border-[#dfe5df] bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="hoTen"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Họ và tên <span aria-hidden="true" className="text-[#bb6759]">*</span></FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} maxLength={160} autoComplete="name" placeholder="Nhập họ và tên" className="h-10 rounded-md border-[#dfe5df] bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="loaiNguoiDung"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Loại độc giả <span aria-hidden="true" className="text-[#bb6759]">*</span></FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="h-10 w-full rounded-md border-[#dfe5df] bg-white">
                      <SelectValue placeholder="Chọn loại độc giả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINH_VIEN">Sinh viên</SelectItem>
                      <SelectItem value="GIANG_VIEN">Giảng viên</SelectItem>
                      <SelectItem value="CAN_BO">Cán bộ</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="trangThai"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Trạng thái</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid} className="h-10 w-full rounded-md border-[#dfe5df] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOAT_DONG">Hoạt động</SelectItem>
                      <SelectItem value="TAM_KHOA">Tạm khóa</SelectItem>
                      <SelectItem value="NGUNG">Ngừng</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend variant="label" className="text-[#34463d]">Thông tin liên hệ</FieldLegend>
          <FieldGroup className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} maxLength={120} autoComplete="email" placeholder="ten@truong.edu.vn" className="h-10 rounded-md border-[#dfe5df] bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="sdt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Số điện thoại</FieldLabel>
                  <Input {...field} id={field.name} type="tel" aria-invalid={fieldState.invalid} maxLength={20} autoComplete="tel" placeholder="Nhập số điện thoại" className="h-10 rounded-md border-[#dfe5df] bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="khoaDonVi"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                  <FieldLabel htmlFor={field.name}>Khoa / đơn vị</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} maxLength={160} placeholder="Ví dụ: Khoa Công nghệ thông tin" className="h-10 rounded-md border-[#dfe5df] bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <div className="flex flex-col-reverse gap-2 border-t border-[#e4e8e2] pt-5 sm:flex-row sm:justify-end">
          <Link href="/" className="inline-flex h-9 items-center justify-center rounded-md border border-[#dfe5df] bg-white px-4 text-xs font-medium text-[#526159] transition-colors hover:bg-[#f8f9f7]">
            Hủy
          </Link>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Đặt lại
          </Button>
          <Button type="submit" className="bg-[#147d64] text-white hover:bg-[#106a55]">
            Lưu độc giả
          </Button>
        </div>
      </form>
    </section>
  )
}