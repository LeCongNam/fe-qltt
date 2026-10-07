import { z } from "zod"

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

export function buildSchema(fields: DanhMucField[]) {
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

/**
 * Ô trống không gửi chuỗi rỗng (BE không nhận cho email, số…). Khi thêm mới thì bỏ trường; khi sửa (`clearEmpty`)
 * gửi `null` để xóa giá trị cũ, vì bỏ trường nghĩa là "giữ nguyên".
 */
export function toPayload(fields: DanhMucField[], values: Record<string, string>, clearEmpty: boolean) {
  const payload: Record<string, string | number | null> = {}
  for (const f of fields) {
    const v = values[f.name]?.trim() ?? ""
    if (v === "") {
      if (clearEmpty && !f.required) payload[f.name] = null
      continue
    }
    payload[f.name] = f.kind === "number" ? Number(v) : v
  }
  return payload
}

export function emptyValues(fields: DanhMucField[]) {
  return Object.fromEntries(fields.map((f) => [f.name, ""]))
}
