import { useQuery } from "@tanstack/react-query"

import { sachApi } from "@/features/sach/api"
import { sachKeys } from "@/features/sach/queries"
import type { Schemas } from "@/lib/api"
import { fetchAllPages } from "@/lib/paging"

type SachRow = Schemas["TraCuuSachDto"]
type BanSach = Schemas["BanSachDto"]

export type BanSachInfo = {
  ban: BanSach
  tenSach: string
  maSach: string
  tacGia: string | null
}

const BATCH = 8

/**
 * BE chưa có endpoint tra bản sách theo mã (`GET /ban-sach/{ma}`), nên ghép từ danh mục (`/sach` không `tuKhoa`,
 * không ghi nhật ký tra cứu) và `/sach/{id}/ban-sach` của từng đầu sách. Chỉ dùng cho trang lập phiếu (nhân viên).
 * Khóa nằm dưới `sachKeys.all` để bị làm mới cùng danh mục khi lập phiếu / đổi tình trạng bản.
 */
export function useBanSachIndex(enabled = true) {
  return useQuery({
    queryKey: sachKeys.banSachIndex(),
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const sachs: SachRow[] = await fetchAllPages((page, limit) => sachApi.list({ page, limit }))
      const index = new Map<string, BanSachInfo>()
      for (let i = 0; i < sachs.length; i += BATCH) {
        const chunk = sachs.slice(i, i + BATCH)
        const lists = await Promise.all(chunk.map((s) => sachApi.banSach(s.id)))
        lists.forEach((bans, j) => {
          const s = chunk[j]
          for (const ban of bans) {
            index.set(ban.maBanSach.toUpperCase(), { ban, tenSach: s.ten_sach, maSach: s.ma_sach, tacGia: s.ds_tac_gia })
          }
        })
      }
      return index
    },
  })
}
