import { queryOptions } from "@tanstack/react-query"

import { sachApi } from "@/features/sach/api"
import type { QueryOf } from "@/lib/api"
import { fetchAllPages } from "@/lib/paging"

/** Khóa gốc `["sach"]` bao cả bản sách và kết quả tra bản sách: làm mới nó là làm mới mọi thứ của sách. */
export const sachKeys = {
  all: ["sach"] as const,
  list: (params: QueryOf<"/sach">) => [...sachKeys.all, "list", params] as const,
  detail: (id: string) => [...sachKeys.all, "detail", id] as const,
  banSach: (id: string) => [...sachKeys.all, id, "ban-sach"] as const,
  findBanSach: (maBanSach: string) => [...sachKeys.all, "ban-sach-ma", maBanSach] as const,
  timBanSach: (params: QueryOf<"/ban-sach">) => [...sachKeys.all, "ban-sach-tim", params] as const,
  options: () => [...sachKeys.all, "options"] as const,
}

export const sachQueries = {
  list: (params: QueryOf<"/sach">) =>
    queryOptions({ queryKey: sachKeys.list(params), queryFn: () => sachApi.list(params) }),
  /**
   * Toàn bộ đầu sách để chọn trong ô chọn (gom mọi trang). Không gửi `tuKhoa`: mỗi lượt `/sach?tuKhoa` bị BE ghi
   * nhật ký `TRA_CUU`, nên ô chọn lọc ngay trên danh sách đã tải.
   */
  options: () =>
    queryOptions({
      queryKey: sachKeys.options(),
      queryFn: () => fetchAllPages((page, limit) => sachApi.list({ page, limit })),
      staleTime: 30_000,
    }),
  detail: (id: string) => queryOptions({ queryKey: sachKeys.detail(id), queryFn: () => sachApi.detail(id) }),
  banSach: (id: string) => queryOptions({ queryKey: sachKeys.banSach(id), queryFn: () => sachApi.banSach(id) }),
  findBanSach: (maBanSach: string) =>
    queryOptions({ queryKey: sachKeys.findBanSach(maBanSach), queryFn: () => sachApi.findBanSach(maBanSach), retry: false }),
  timBanSach: (params: QueryOf<"/ban-sach">) =>
    queryOptions({ queryKey: sachKeys.timBanSach(params), queryFn: () => sachApi.timBanSach(params) }),
}
