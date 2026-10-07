import type { Paged } from "@/lib/api"

/** BE giới hạn `limit ≤ 100`; đây là cỡ trang lớn nhất khi cần gom toàn bộ danh sách. */
export const MAX_PAGE_SIZE = 100

/** Gom mọi trang của một danh sách phân trang phía BE (dùng cho ô chọn, nơi không được cắt bớt dòng). */
export async function fetchAllPages<T>(fetchPage: (page: number, limit: number) => Promise<Paged<T>>) {
  const rows: T[] = []
  for (let page = 1; ; page++) {
    const res = await fetchPage(page, MAX_PAGE_SIZE)
    rows.push(...res.data)
    if (rows.length >= res.total || res.data.length === 0) return rows
  }
}
