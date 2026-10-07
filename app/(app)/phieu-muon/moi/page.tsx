"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BanSachPicker } from "@/components/phieu-muon/ban-sach-picker"
import { type NguoiMuon, NguoiMuonPicker } from "@/components/phieu-muon/nguoi-muon-picker"
import { toast } from "@/components/ui/toast"
import { apiClient, getApiErrorMessage, type Schemas } from "@/lib/api"

export default function LapPhieuMuonPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [nguoiMuon, setNguoiMuon] = useState<NguoiMuon | null>(null)
  const [danhSach, setDanhSach] = useState<string[]>([])

  const lap = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<Schemas["PhieuMuonChiTietDto"]>("/phieu-muon", {
          maNguoiDung: nguoiMuon!.maNguoiDung,
          maBanSachs: danhSach,
        })
      ).data,
    onSuccess: (phieu) => {
      toast.add({ type: "success", title: "Đã lập phiếu mượn", description: `${phieu.maPhieu} — ${phieu.nguoiDung.hoTen}` })
      queryClient.invalidateQueries({ queryKey: ["/phieu-muon"] })
      queryClient.invalidateQueries({ queryKey: ["/sach"] })
      queryClient.invalidateQueries({ queryKey: ["/dat-truoc"] })
      router.replace(`/phieu-muon/${phieu.maPhieu}`)
    },
    // 422: một cuốn bị từ chối thì không có phiếu nào được tạo; BE nêu rõ lý do.
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể lập phiếu mượn", description: getApiErrorMessage(error) })
    },
  })

  const hopLe = nguoiMuon?.trangThai === "HOAT_DONG" && danhSach.length > 0

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-7 border-b border-[#e4e8e2] pb-5">
        <p className="text-xs font-medium text-[#5f6b64]">Mượn - trả</p>
        <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Lập phiếu mượn</h2>
        <p className="mt-1.5 text-sm text-[#5f6b64]">
          Hệ thống kiểm tra điều kiện mượn (số sách tối đa, nợ phạt, quá hạn...) khi lập phiếu; một cuốn bị từ chối thì cả phiếu không được tạo.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (hopLe) lap.mutate()
        }}
      >
        <NguoiMuonPicker value={nguoiMuon} onChange={setNguoiMuon} />

        <BanSachPicker value={danhSach} onChange={setDanhSach} />

        <div className="flex flex-col-reverse gap-2 border-t border-[#e4e8e2] pt-5 sm:flex-row sm:justify-end">
          <Link href="/phieu-muon" className="inline-flex h-9 items-center justify-center rounded-md border border-[#dfe5df] bg-white px-4 text-xs font-medium text-[#526159] transition-colors hover:bg-[#f8f9f7]">
            Hủy
          </Link>
          <Button type="submit" disabled={!hopLe || lap.isPending} className="bg-[#147d64] text-white hover:bg-[#106a55]">
            {lap.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            Lập phiếu ({danhSach.length} cuốn)
          </Button>
        </div>
      </form>
    </section>
  )
}
