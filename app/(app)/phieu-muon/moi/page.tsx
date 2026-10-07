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
import { datTruocKeys } from "@/features/dat-truoc/queries"
import { phieuMuonApi } from "@/features/phieu-muon/api"
import { phieuMuonKeys } from "@/features/phieu-muon/queries"
import { sachKeys } from "@/features/sach/queries"
import { getApiErrorMessage } from "@/lib/api"
import { PageHeader } from "@/components/page-header"

export default function LapPhieuMuonPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [nguoiMuon, setNguoiMuon] = useState<NguoiMuon | null>(null)
  const [danhSach, setDanhSach] = useState<string[]>([])

  const lap = useMutation({
    mutationFn: () => phieuMuonApi.create({ maNguoiDung: nguoiMuon!.maNguoiDung, maBanSachs: danhSach }),
    onSuccess: (phieu) => {
      toast.add({ type: "success", title: "Đã lập phiếu mượn", description: `${phieu.maPhieu} — ${phieu.nguoiDung.hoTen}` })
      queryClient.invalidateQueries({ queryKey: phieuMuonKeys.all })
      queryClient.invalidateQueries({ queryKey: sachKeys.all })
      queryClient.invalidateQueries({ queryKey: datTruocKeys.all })
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
      <PageHeader
        eyebrow="Mượn - trả"
        title="Lập phiếu mượn"
        description="Hệ thống kiểm tra điều kiện mượn (số sách tối đa, nợ phạt, quá hạn...) khi lập phiếu; một cuốn bị từ chối thì cả phiếu không được tạo."
      />

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault()
          if (hopLe) lap.mutate()
        }}
      >
        <NguoiMuonPicker value={nguoiMuon} onChange={setNguoiMuon} />

        <BanSachPicker value={danhSach} onChange={setDanhSach} />

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Link href="/phieu-muon" className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-white px-4 text-xs font-medium text-ink transition-colors hover:bg-surface">
            Hủy
          </Link>
          <Button type="submit" disabled={!hopLe || lap.isPending}>
            {lap.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            Lập phiếu ({danhSach.length} cuốn)
          </Button>
        </div>
      </form>
    </section>
  )
}
