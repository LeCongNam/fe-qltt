import { useState } from "react"

import type { DataColumn } from "@/components/data-table"

type Dir = "asc" | "desc"
type Sort<F extends string> = { field: F; dir: Dir }

/**
 * Sắp xếp phía BE cho danh sách phân trang (`sapXep=<field>:<asc|desc>`).
 * `fields` ánh xạ tiêu đề cột → field BE cho phép; cột không có trong đó không sắp xếp được.
 * `defaultOrder` là thứ tự BE trả khi không gửi `sapXep`, chỉ để vẽ mũi tên mờ trên tiêu đề; bỏ trống nếu
 * thứ tự mặc định không phải một cột (vd. nhóm cần xử lý lên trước).
 * Bấm lần lượt: tăng dần → giảm dần → về thứ tự mặc định.
 */
export function useServerSort<F extends string>(
  fields: Record<string, F>,
  { defaultOrder, onChange }: { defaultOrder?: Sort<F>; onChange?: () => void } = {},
) {
  const [sort, setSort] = useState<Sort<F> | null>(null)
  const labelOf = (field: F) => Object.keys(fields).find((h) => fields[h] === field) ?? field

  function update(next: Sort<F> | null) {
    setSort(next)
    onChange?.()
  }

  function toggle(field: F) {
    update(sort?.field !== field ? { field, dir: "asc" } : sort.dir === "asc" ? { field, dir: "desc" } : null)
  }

  return {
    /** Giá trị gửi cho query, `undefined` khi dùng thứ tự mặc định. */
    sapXep: sort ? `${sort.field}:${sort.dir}` : undefined,
    /** Gắn nút sắp xếp vào tiêu đề các cột có trong `fields`. */
    columns<T>(columns: DataColumn<T>[]): DataColumn<T>[] {
      return columns.map((c) => {
        const field = fields[c.header]
        if (!field) return c
        const isDefault = !sort && defaultOrder?.field === field
        return {
          ...c,
          sort: { dir: sort?.field === field ? sort.dir : isDefault ? defaultOrder!.dir : null, isDefault, onToggle: () => toggle(field) },
        }
      })
    },
    /** Dòng "Xếp theo …" ở chân bảng: cột đang chọn, hoặc `fallback` (quy tắc mặc định của BE). */
    orderText: (fallback: string) => (sort ? `${labelOf(sort.field).toLowerCase()} ${sort.dir === "asc" ? "tăng dần" : "giảm dần"}` : fallback),
    /** Props cho `SortSelect` (mobile). */
    selectProps: {
      options: Object.entries(fields).map(([label, value]) => ({ value, label })),
      value: sort?.field ?? null,
      dir: sort?.dir ?? ("asc" as Dir),
      onValueChange: (value: string | null) => update(value ? { field: value as F, dir: "asc" } : null),
      onToggleDir: () => sort && update({ field: sort.field, dir: sort.dir === "asc" ? "desc" : "asc" }),
    },
  }
}
