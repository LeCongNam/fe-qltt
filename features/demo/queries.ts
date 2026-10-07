import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { demoApi } from "@/features/demo/api"
import { useAuth } from "@/hooks/use-auth"
import type { Schemas } from "@/lib/api"

export type DemoMuc = Schemas["DemoMucDto"]
export type DemoChiTiet = Schemas["DemoChiTietDto"]
export type DemoBang = Schemas["DemoBangDto"]
export type DemoKetQua = Schemas["DemoKetQuaDto"]
export type DemoThamSo = Schemas["DemoThamSoMoTaDto"]

export type DemoLoai = "PROCEDURE" | "TRIGGER" | "FUNCTION" | "CURSOR"

export const demoKeys = {
  all: ["demo"] as const,
  list: () => [...demoKeys.all, "list"] as const,
  detail: (id: string) => [...demoKeys.all, id] as const,
  bang: (id: string, thamSo: Record<string, string>) => [...demoKeys.all, id, "bang", thamSo] as const,
}

/** Danh sách mục demo (chỉ ADMIN, THU_THU). */
export function useDemoList() {
  const { isStaff } = useAuth()
  return useQuery({ queryKey: demoKeys.list(), queryFn: demoApi.list, enabled: isStaff })
}

/** Chi tiết một mục: câu SQL đọc từ CSDL/tệp SQL, tham số kèm gợi ý lấy từ dữ liệu hiện có. */
export function useDemoChiTiet(id: string) {
  return useQuery({ queryKey: demoKeys.detail(id), queryFn: () => demoApi.detail(id), staleTime: 0 })
}

/** Bước 3: các bảng liên quan truy vấn trực tiếp từ CSDL theo tham số hiện tại. */
export function useDemoBang(id: string, thamSo: Record<string, string>) {
  return useQuery({
    queryKey: demoKeys.bang(id, thamSo),
    queryFn: async () => (await demoApi.bang(id, { thamSo })).bang,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}

/** Bước 4 và 5: chạy rồi nhận lại các bảng sau khi chạy. Lỗi nghiệp vụ nằm trong `loi`, không phải lỗi HTTP. */
export function useDemoChay(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { thamSo: Record<string, string>; hoanTac: boolean }) => demoApi.chay(id, body),
    onSuccess: (data) => {
      // Dữ liệu thật đã đổi: các trang khác (và bảng "trước" của chính mục này) phải đọc lại.
      if (data.thanhCong && !data.daHoanTac) queryClient.invalidateQueries()
    },
  })
}
