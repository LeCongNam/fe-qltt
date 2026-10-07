import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient, type Schemas } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"

export type DemoMuc = Schemas["DemoMucDto"]
export type DemoChiTiet = Schemas["DemoChiTietDto"]
export type DemoBang = Schemas["DemoBangDto"]
export type DemoKetQua = Schemas["DemoKetQuaDto"]
export type DemoThamSo = Schemas["DemoThamSoMoTaDto"]

export type DemoLoai = "PROCEDURE" | "TRIGGER" | "FUNCTION" | "CURSOR"

/** Danh sách mục demo (chỉ ADMIN, THU_THU). */
export function useDemoList() {
  const { isStaff } = useAuth()
  return useQuery({
    queryKey: ["/demo"],
    queryFn: async () => (await apiClient.get<DemoMuc[]>("/demo")).data,
    enabled: isStaff,
  })
}

/** Chi tiết một mục: câu SQL đọc từ CSDL/tệp SQL, tham số kèm gợi ý lấy từ dữ liệu hiện có. */
export function useDemoChiTiet(id: string) {
  return useQuery({
    queryKey: ["/demo", id],
    queryFn: async () => (await apiClient.get<DemoChiTiet>(`/demo/${id}`)).data,
    staleTime: 0,
  })
}

/** Bước 3: các bảng liên quan truy vấn trực tiếp từ CSDL theo tham số hiện tại. */
export function useDemoBang(id: string, thamSo: Record<string, string>) {
  return useQuery({
    queryKey: ["/demo", id, "bang", thamSo],
    queryFn: async () => (await apiClient.post<{ bang: DemoBang[] }>(`/demo/${id}/bang`, { thamSo })).data.bang,
    staleTime: 0,
    placeholderData: keepPreviousData,
  })
}

/** Bước 4 và 5: chạy rồi nhận lại các bảng sau khi chạy. Lỗi nghiệp vụ nằm trong `loi`, không phải lỗi HTTP. */
export function useDemoChay(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { thamSo: Record<string, string>; hoanTac: boolean }) =>
      (await apiClient.post<DemoKetQua>(`/demo/${id}/chay`, body)).data,
    onSuccess: (data) => {
      // Dữ liệu thật đã đổi: các trang khác (và bảng "trước" của chính mục này) phải đọc lại.
      if (data.thanhCong && !data.daHoanTac) queryClient.invalidateQueries()
    },
  })
}
