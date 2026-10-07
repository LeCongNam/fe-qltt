import { describe, expect, it } from "vitest"

import { buildSchema, emptyValues, toPayload, type DanhMucField } from "@/components/danh-muc/form-utils"

const fields: DanhMucField[] = [
  { name: "ten", label: "Tên", required: true, maxLength: 10 },
  { name: "email", label: "Email", kind: "email" },
  { name: "nam", label: "Năm sinh", kind: "number" },
  { name: "moTa", label: "Mô tả" },
]

describe("buildSchema", () => {
  const schema = buildSchema(fields)
  const ok = (values: Record<string, string>) => schema.safeParse({ ten: "A", email: "", nam: "", moTa: "", ...values })

  it("nhận biểu mẫu hợp lệ và để trống trường tùy chọn", () => {
    expect(ok({}).success).toBe(true)
  })

  it("trường bắt buộc không được để trống (sau khi cắt khoảng trắng)", () => {
    const result = ok({ ten: "   " })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("Vui lòng nhập tên.")
  })

  it("kiểm tra độ dài tối đa", () => {
    expect(ok({ ten: "x".repeat(11) }).success).toBe(false)
    expect(ok({ ten: "x".repeat(10) }).success).toBe(true)
  })

  it("email phải đúng định dạng nhưng được để trống", () => {
    expect(ok({ email: "abc" }).success).toBe(false)
    expect(ok({ email: "a@b.vn" }).success).toBe(true)
  })

  it("số nguyên 0–9999", () => {
    expect(ok({ nam: "1990" }).success).toBe(true)
    expect(ok({ nam: "10000" }).success).toBe(false)
    expect(ok({ nam: "-1" }).success).toBe(false)
    expect(ok({ nam: "19.5" }).success).toBe(false)
  })
})

describe("toPayload", () => {
  const values = { ten: " Nhà A ", email: "", nam: "1990", moTa: "" }

  it("thêm mới: bỏ trường để trống, cắt khoảng trắng, đổi số", () => {
    expect(toPayload(fields, values, false)).toEqual({ ten: "Nhà A", nam: 1990 })
  })

  it("sửa: trường tùy chọn để trống gửi null, trường bắt buộc không bao giờ null", () => {
    expect(toPayload(fields, values, true)).toEqual({ ten: "Nhà A", email: null, nam: 1990, moTa: null })
    expect(toPayload(fields, { ...values, ten: "" }, true)).not.toHaveProperty("ten")
  })
})

describe("emptyValues", () => {
  it("mỗi trường một chuỗi rỗng", () => {
    expect(emptyValues(fields)).toEqual({ ten: "", email: "", nam: "", moTa: "" })
  })
})
