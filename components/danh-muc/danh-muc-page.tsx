"use client"

import { useMemo, useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import { z } from "zod"

import { DataTable, type DataColumn } from "@/components/data-table"
import { Pager } from "@/components/pager"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { danhMucKeys, danhMucQueries, type DanhMucApi, type DanhMucKind } from "@/features/danh-muc/queries"
import { getApiErrorMessage } from "@/lib/api"
import { PAGE_SIZE } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"

export type DanhMucField<K extends string = string> = {
  /** Tên trường theo DTO tạo mới của BE. */
  name: K
  label: string
  required?: boolean
  maxLength?: number
  placeholder?: string
  /** "text" (mặc định), "email" hoặc "number" (số nguyên 0–9999, dùng cho năm). */
  kind?: "text" | "email" | "number"
  fullWidth?: boolean
}

export type DanhMucColumn<T> = DataColumn<T>

export type DanhMucConfig<T extends { id: string }, TCreate> = {
  /** Danh mục nào (khóa truy vấn) và hàm gọi BE tương ứng. */
  kind: DanhMucKind
  api: DanhMucApi<T, TCreate>
  /** Tên hiển thị của một bản ghi, ví dụ "thể loại". */
  singular: string
  title: string
  description: string
  fields: DanhMucField<Extract<keyof TCreate, string>>[]
  columns: DanhMucColumn<T>[]
  /** Tên trường dùng làm nhãn khi xác nhận xóa. */
  labelOf: (row: T) => string
  toFormValues: (row: T) => Record<string, string>
}

function buildSchema(fields: DanhMucField[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const f of fields) {
    let s = z.string().trim()
    if (f.kind === "number") {
      shape[f.name] = s.refine(
        (v) => v === "" || (/^\d{1,4}$/.test(v) && Number(v) <= 9999),
        `${f.label} phải là số nguyên từ 0 đến 9999.`
      )
      continue
    }
    if (f.required) s = s.min(1, `Vui lòng nhập ${f.label.toLowerCase()}.`)
    if (f.maxLength) s = s.max(f.maxLength, `${f.label} tối đa ${f.maxLength} ký tự.`)
    shape[f.name] =
      f.kind === "email"
        ? s.refine((v) => v === "" || z.string().email().safeParse(v).success, "Email không đúng định dạng.")
        : s
  }
  return z.object(shape)
}

/** Chuỗi rỗng bị bỏ khỏi payload (BE không nhận chuỗi rỗng cho trường tùy chọn như email). */
function toPayload(fields: DanhMucField[], values: Record<string, string>) {
  const payload: Record<string, string | number> = {}
  for (const f of fields) {
    const v = values[f.name]?.trim() ?? ""
    if (v === "") continue
    payload[f.name] = f.kind === "number" ? Number(v) : v
  }
  return payload
}

function emptyValues(fields: DanhMucField[]) {
  return Object.fromEntries(fields.map((f) => [f.name, ""]))
}

export function DanhMucPage<T extends { id: string }, TCreate>({ config }: { config: DanhMucConfig<T, TCreate> }) {
  const { kind, api, singular } = config
  const { isStaff, isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<T | "new" | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)

  const list = useQuery({
    ...danhMucQueries.list(kind, api, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  })

  const remove = useMutation({
    mutationFn: (row: T) => api.remove(row.id),
    onSuccess: (_, row) => {
      toast.add({ type: "success", title: `Đã xóa ${singular}`, description: config.labelOf(row) })
      setDeleting(null)
      // Xóa bản ghi cuối của trang cuối thì lùi một trang.
      if (list.data && list.data.data.length === 1 && page > 1) setPage(page - 1)
      queryClient.invalidateQueries({ queryKey: danhMucKeys.all(kind) })
    },
    onError: (error) => {
      toast.add({ type: "error", title: `Không thể xóa ${singular}`, description: getApiErrorMessage(error) })
      setDeleting(null)
    },
  })

  const rows = list.data?.data ?? []
  const total = list.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const columns: DataColumn<T>[] = [
    ...config.columns,
    ...(isStaff
      ? [
          {
            header: "Thao tác",
            actions: true,
            align: "right" as const,
            className: "w-24",
            cell: (row: T) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${config.labelOf(row)}`} onClick={() => setEditing(row)}>
                  <Pencil aria-hidden="true" />
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    aria-label={`Xóa ${config.labelOf(row)}`}
                    onClick={() => setDeleting(row)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ]

  return (
    <section className="mx-auto w-full max-w-6xl">
      <PageHeader
        eyebrow="Danh mục"
        title={config.title}
        description={config.description}
        action={
          isStaff && (
            <Button onClick={() => setEditing("new")}>
              <Plus aria-hidden="true" />
              Thêm {singular}
            </Button>
          )
        }
      />

      <DataTable
        query={list}
        rows={rows}
        rowKey={(row) => row.id}
        errorText={`Không tải được danh sách ${singular}.`}
        emptyText={`Chưa có ${singular} nào.`}
        columns={columns}
      />

      <Pager page={page} pageCount={pageCount} total={total} unit="bản ghi" order="tên A–Z" onPage={setPage} />

      {/* key để form khởi tạo lại giá trị mỗi lần mở */}
      <DanhMucFormDialog
        key={editing === null ? "closed" : editing === "new" ? "new" : editing.id}
        config={config}
        editing={editing}
        onClose={() => setEditing(null)}
        onSaved={() => queryClient.invalidateQueries({ queryKey: danhMucKeys.all(kind) })}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={
          <>
            Xóa {singular}?
          </>
        }
        description={
          <>
            {deleting ? `“${config.labelOf(deleting)}” sẽ bị xóa vĩnh viễn.` : ""} Nếu còn sách tham chiếu, hệ thống sẽ từ chối.
          </>
        }
        confirmLabel="Xóa"
        destructive
        pending={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </section>
  )
}

function DanhMucFormDialog<T extends { id: string }, TCreate>({
  config,
  editing,
  onClose,
  onSaved,
}: {
  config: DanhMucConfig<T, TCreate>
  editing: T | "new" | null
  onClose: () => void
  onSaved: () => void
}) {
  const { api, singular, fields } = config
  const schema = useMemo(() => buildSchema(fields), [fields])
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    defaultValues: editing && editing !== "new" ? config.toFormValues(editing) : emptyValues(fields),
    mode: "onBlur",
  })

  const save = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const payload = toPayload(fields, values) as Partial<TCreate>
      if (editing && editing !== "new") {
        await api.update(editing.id, payload)
      } else {
        await api.create(payload)
      }
    },
    onSuccess: () => {
      toast.add({
        type: "success",
        title: editing === "new" ? `Đã thêm ${singular}` : `Đã cập nhật ${singular}`,
      })
      onSaved()
      onClose()
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: editing === "new" ? `Không thể thêm ${singular}` : `Không thể cập nhật ${singular}`,
        description: getApiErrorMessage(error),
      })
    },
  })

  return (
    <Dialog open={editing !== null} onOpenChange={(open) => !open && !save.isPending && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing === "new" ? `Thêm ${singular}` : `Sửa ${singular}`}</DialogTitle>
          <DialogDescription>Các trường có dấu * là bắt buộc.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-4">
          <FieldGroup className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            {fields.map((f) => (
              <Controller
                key={f.name}
                name={f.name}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className={f.fullWidth ? "sm:col-span-2" : undefined}>
                    <FieldLabel htmlFor={`dm-${f.name}`}>
                      {f.label}
                      {f.required && (
                        <>
                          {" "}
                          <span aria-hidden="true" className="text-destructive">*</span>
                        </>
                      )}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`dm-${f.name}`}
                      type={f.kind === "email" ? "email" : "text"}
                      inputMode={f.kind === "number" ? "numeric" : undefined}
                      aria-invalid={fieldState.invalid}
                      maxLength={f.kind === "number" ? 4 : f.maxLength}
                      placeholder={f.placeholder}
                      className="h-10 rounded-md border-input bg-white text-sm"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            ))}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={save.isPending} onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
