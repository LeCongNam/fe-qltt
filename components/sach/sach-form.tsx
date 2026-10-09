"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { NGON_NGU } from "@/components/sach/sach-meta"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Combobox } from "@/components/ui/combobox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { nhaXuatBanApi, tacGiaApi, theLoaiApi } from "@/features/danh-muc/api"
import { danhMucQueries } from "@/features/danh-muc/queries"
import { sachApi } from "@/features/sach/api"
import { sachKeys } from "@/features/sach/queries"
import { getApiErrorMessage, type Schemas } from "@/lib/api"
import { boDau } from "@/lib/format"
import { TextField } from "@/components/form/text-field"

export type SachChiTiet = Schemas["SachChiTietDto"]

const schema = z.object({
  maSach: z.string().trim().min(1, "Vui lòng nhập mã sách.").max(20, "Mã sách tối đa 20 ký tự."),
  isbn: z.string().trim().max(20, "ISBN tối đa 20 ký tự."),
  tenSach: z.string().trim().min(1, "Vui lòng nhập tên sách.").max(255, "Tên sách tối đa 255 ký tự."),
  maTheLoai: z.string().min(1, "Vui lòng chọn thể loại."),
  maNxb: z.string().min(1, "Vui lòng chọn nhà xuất bản."),
  namXuatBan: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{1,4}$/.test(v), "Năm xuất bản phải là số nguyên từ 0 đến 9999."),
  ngonNgu: z.enum(NGON_NGU),
  giaBia: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d+(\.\d+)?$/.test(v), "Giá bìa phải là số không âm."),
  moTa: z.string().trim(),
  maTacGias: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

function toFormValues(sach?: SachChiTiet): FormValues {
  if (!sach) {
    return {
      maSach: "",
      isbn: "",
      tenSach: "",
      maTheLoai: "",
      maNxb: "",
      namXuatBan: "",
      ngonNgu: "Tiếng Việt",
      giaBia: "",
      moTa: "",
      maTacGias: [],
    }
  }
  return {
    maSach: sach.maSach,
    isbn: sach.isbn ?? "",
    tenSach: sach.tenSach,
    maTheLoai: sach.theLoai.maTheLoai,
    maNxb: sach.nhaXuatBan.maNxb,
    namXuatBan: sach.namXuatBan == null ? "" : String(sach.namXuatBan),
    ngonNgu: (NGON_NGU as readonly string[]).includes(sach.ngonNgu) ? (sach.ngonNgu as FormValues["ngonNgu"]) : "Khác",
    giaBia: sach.giaBia == null ? "" : String(Number(sach.giaBia)),
    moTa: sach.moTa ?? "",
    maTacGias: sach.sachTacGias.map((x) => x.tacGia.maTacGia),
  }
}

/**
 * Ô tùy chọn trống: thêm mới thì bỏ trường, sửa (`clearEmpty`) thì gửi `null` để xóa giá trị cũ.
 * `maTacGias` luôn gửi (thay toàn bộ danh sách tác giả).
 */
function toPayload(v: FormValues, clearEmpty: boolean) {
  const optional = <T,>(value: T | "" ): T | null | undefined => (value !== "" ? value : clearEmpty ? null : undefined)
  return {
    maSach: v.maSach,
    tenSach: v.tenSach,
    maTheLoai: v.maTheLoai,
    maNxb: v.maNxb,
    ngonNgu: v.ngonNgu,
    maTacGias: v.maTacGias,
    isbn: optional(v.isbn),
    namXuatBan: optional(v.namXuatBan === "" ? "" : Number(v.namXuatBan)),
    giaBia: optional(v.giaBia === "" ? "" : Number(v.giaBia)),
    moTa: optional(v.moTa),
  }
}

const inputClass = "h-10 rounded-md border-input bg-white text-sm"

export function SachForm({
  sach,
  onSaved,
  onCancel,
}: {
  /** Có `sach` = sửa, không có = thêm mới. */
  sach?: SachChiTiet
  onSaved: (id: string) => void
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const theLoais = useQuery(danhMucQueries.options("the-loai", theLoaiApi))
  const nxbs = useQuery(danhMucQueries.options("nha-xuat-ban", nhaXuatBanApi))
  const tacGias = useQuery(danhMucQueries.options("tac-gia", tacGiaApi))
  const theLoaiOptions = useMemo(
    () => (theLoais.data ?? []).map((t) => ({ value: t.maTheLoai, label: t.tenTheLoai })),
    [theLoais.data]
  )
  const [locTacGia, setLocTacGia] = useState("")
  const tacGiaHienThi = useMemo(() => {
    const q = boDau(locTacGia.trim())
    return (tacGias.data ?? []).filter((t) => boDau(`${t.tenTacGia} ${t.maTacGia}`).includes(q))
  }, [tacGias.data, locTacGia])
  const nxbOptions = useMemo(() => (nxbs.data ?? []).map((n) => ({ value: n.maNxb, label: n.tenNxb })), [nxbs.data])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(sach),
    mode: "onBlur",
  })

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      if (sach) {
        await sachApi.update(sach.id, toPayload(values, true))
        return sach.id
      }
      return (await sachApi.create(toPayload(values, false) as Schemas["CreateSachDto"])).id
    },
    onSuccess: (id, values) => {
      toast.add({
        type: "success",
        title: sach ? "Đã cập nhật sách" : "Đã thêm sách",
        description: values.tenSach,
      })
      queryClient.invalidateQueries({ queryKey: sachKeys.all })
      onSaved(id)
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: sach ? "Không thể cập nhật sách" : "Không thể thêm sách",
        description: getApiErrorMessage(error),
      })
    },
  })

  return (
    <form className="space-y-7" onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate>
      <FieldSet className="border-b border-border pb-7">
        <FieldDescription>Các trường có dấu * là bắt buộc.</FieldDescription>
        <FieldGroup className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="maSach"
            label="Mã sách"
            required
            maxLength={20}
            placeholder="Ví dụ: S016"
          />
          <TextField
            control={form.control}
            name="isbn"
            label="ISBN"
            maxLength={20}
            placeholder="Ví dụ: 978-604-1-12345-6"
          />
          <Controller
            name="tenSach"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="sm:col-span-2">
                <FieldLabel htmlFor={field.name}>
                  Tên sách <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} maxLength={255} placeholder="Nhập tên sách" className={inputClass} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="maTheLoai"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Thể loại <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLabel>
                <Combobox
                  id={field.name}
                  name={field.name}
                  value={field.value || null}
                  onValueChange={(v) => field.onChange(v ?? "")}
                  options={theLoaiOptions}
                  invalid={fieldState.invalid}
                  placeholder={theLoais.isPending ? "Đang tải..." : "Chọn thể loại"}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="maNxb"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Nhà xuất bản <span aria-hidden="true" className="text-destructive">*</span>
                </FieldLabel>
                <Combobox
                  id={field.name}
                  name={field.name}
                  value={field.value || null}
                  onValueChange={(v) => field.onChange(v ?? "")}
                  options={nxbOptions}
                  invalid={fieldState.invalid}
                  placeholder={nxbs.isPending ? "Đang tải..." : "Chọn nhà xuất bản"}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="namXuatBan"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Năm xuất bản</FieldLabel>
                <Input {...field} id={field.name} inputMode="numeric" maxLength={4} aria-invalid={fieldState.invalid} placeholder="Ví dụ: 2024" className={inputClass} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="ngonNgu"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Ngôn ngữ</FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                  <SelectTrigger id={field.name} className="h-10 w-full rounded-md border-input bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NGON_NGU.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <TextField
            control={form.control}
            name="giaBia"
            label="Giá bìa (VND)"
            inputMode="decimal"
            placeholder="Ví dụ: 85000"
          />
          <Controller
            name="moTa"
            control={form.control}
            render={({ field }) => (
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor={field.name}>Mô tả</FieldLabel>
                <Textarea {...field} id={field.name} rows={3} placeholder="Tóm tắt nội dung sách" className="rounded-md border-input bg-white text-sm" />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>

      <FieldSet>
        <FieldLabel>Tác giả</FieldLabel>
        <FieldDescription>Chọn một hoặc nhiều tác giả (tối đa 20).</FieldDescription>
        <Controller
          name="maTacGias"
          control={form.control}
          render={({ field }) => (
            <>
            <Input
              value={locTacGia}
              onChange={(e) => setLocTacGia(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
              aria-label="Lọc danh sách tác giả"
              placeholder="Lọc tác giả theo tên hoặc mã"
              className={inputClass}
            />
            <div className="grid max-h-56 grid-cols-1 gap-x-5 gap-y-2 overflow-y-auto rounded-md border border-input bg-white p-3 sm:grid-cols-2">
              {tacGias.isPending && <p role="status" className="text-sm text-muted-foreground">Đang tải...</p>}
              {tacGias.isError && <p role="alert" className="text-sm text-destructive">Không tải được danh sách tác giả.</p>}
              {tacGiaHienThi.length === 0 && tacGias.data && (
                <p role="status" className="text-sm text-muted-foreground">Không có tác giả phù hợp.</p>
              )}
              {tacGiaHienThi.map((t) => {
                const checked = field.value.includes(t.maTacGia)
                return (
                  <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        field.onChange(next ? [...field.value, t.maTacGia] : field.value.filter((m) => m !== t.maTacGia))
                      }
                    />
                    {t.tenTacGia} <span className="text-xs text-faint">({t.maTacGia})</span>
                  </label>
                )
              })}
            </div>
            </>
          )}
        />
      </FieldSet>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={save.isPending} onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {sach ? "Lưu thay đổi" : "Thêm sách"}
        </Button>
      </div>
    </form>
  )
}
