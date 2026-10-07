"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage, type Schemas } from "@/lib/api"

const MAX_BAN = 20

export default function LapPhieuMuonPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isStaff, ready } = useAuth()
  const [maNguoiDung, setMaNguoiDung] = useState("")
  const [maBan, setMaBan] = useState("")
  const [danhSach, setDanhSach] = useState<string[]>([])

  const lap = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<Schemas["PhieuMuonChiTietDto"]>("/phieu-muon", {
          maNguoiDung: maNguoiDung.trim(),
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

  if (ready && !isStaff) {
    return <p className="text-sm text-[#a35143]">Bạn không có quyền lập phiếu mượn.</p>
  }

  function themBan() {
    const ma = maBan.trim().toUpperCase()
    if (!ma) return
    if (danhSach.includes(ma)) {
      toast.add({ type: "warning", title: "Bản sách đã có trong danh sách", description: ma })
    } else if (danhSach.length >= MAX_BAN) {
      toast.add({ type: "warning", title: `Tối đa ${MAX_BAN} bản sách mỗi phiếu` })
    } else {
      setDanhSach([...danhSach, ma])
    }
    setMaBan("")
  }

  const hopLe = maNguoiDung.trim() !== "" && danhSach.length > 0

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
        <Field>
          <FieldLabel htmlFor="pm-nguoi-dung">
            Mã người mượn <span aria-hidden="true" className="text-[#a35143]">*</span>
          </FieldLabel>
          <Input id="pm-nguoi-dung" value={maNguoiDung} onChange={(e) => setMaNguoiDung(e.target.value)} maxLength={20} placeholder="Ví dụ: SV001" className="h-10 max-w-xs rounded-md border-[#dfe5df] bg-white text-sm" />
        </Field>

        <Field>
          <FieldLabel htmlFor="pm-ban-sach">
            Bản sách <span aria-hidden="true" className="text-[#a35143]">*</span>
          </FieldLabel>
          <div className="flex max-w-xs gap-2">
            <Input
              id="pm-ban-sach"
              value={maBan}
              onChange={(e) => setMaBan(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  themBan()
                }
              }}
              maxLength={30}
              placeholder="Mã bản, ví dụ BS001"
              className="h-10 rounded-md border-[#dfe5df] bg-white text-sm"
            />
            <Button type="button" variant="outline" className="h-10" onClick={themBan}>
              <Plus aria-hidden="true" />
              Thêm
            </Button>
          </div>
          <FieldDescription>Nhập mã từng bản rồi nhấn Enter. Mã bản sách xem ở trang chi tiết của sách.</FieldDescription>
          {danhSach.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Bản sách đã chọn">
              {danhSach.map((ma) => (
                <li key={ma} className="inline-flex items-center gap-1 rounded-full bg-[#e6f3ee] py-1 pl-3 pr-1 text-xs font-medium text-[#0f6a52]">
                  {ma}
                  <button
                    type="button"
                    aria-label={`Bỏ ${ma}`}
                    className="rounded-full p-0.5 hover:bg-[#cfe6dc]"
                    onClick={() => setDanhSach(danhSach.filter((x) => x !== ma))}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

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
