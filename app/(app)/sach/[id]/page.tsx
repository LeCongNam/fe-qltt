"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react"

import { BanSachPanel } from "@/components/sach/ban-sach-panel"
import { SachForm, type SachChiTiet } from "@/components/sach/sach-form"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { apiClient, getApiErrorMessage } from "@/lib/api"
import { formatVnd } from "@/lib/format"

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-[#738078]">{label}</dt>
      <dd className="mt-1 text-sm text-[#1c2c26]">{children || "—"}</dd>
    </div>
  )
}

export default function SachDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isStaff } = useAuth()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const query = useQuery({
    queryKey: ["/sach", "detail", id],
    queryFn: async () => (await apiClient.get<SachChiTiet>(`/sach/${id}`)).data,
    retry: false,
  })

  const remove = useMutation({
    mutationFn: () => apiClient.delete(`/sach/${id}`),
    onSuccess: () => {
      toast.add({ type: "success", title: "Đã xóa sách", description: query.data?.tenSach })
      queryClient.invalidateQueries({ queryKey: ["/sach"] })
      router.replace("/sach")
    },
    onError: (error) => {
      toast.add({ type: "error", title: "Không thể xóa sách", description: getApiErrorMessage(error) })
      setConfirmDelete(false)
    },
  })

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (query.isError) {
    const notFound = axios.isAxiosError(query.error) && query.error.response?.status === 404
    return (
      <div className="mx-auto w-full max-w-4xl space-y-3 text-sm">
        <p className="text-[#bb6759]">{notFound ? "Không tìm thấy sách." : getApiErrorMessage(query.error, "Không tải được sách.")}</p>
        <Link href="/sach" className="text-[#147d64] hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const s = query.data

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#e4e8e2] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/sach" className="inline-flex items-center gap-1 text-xs font-medium text-[#738078] hover:text-[#147d64]">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Sách
          </Link>
          <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">{s.tenSach}</h2>
          <p className="mt-1.5 text-sm text-[#758078]">Mã sách {s.maSach}</p>
        </div>
        {isStaff && !editing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil aria-hidden="true" />
              Sửa
            </Button>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" />
              Xóa
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <SachForm sach={s} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-[#e4e8e2] bg-white p-5 sm:grid-cols-2">
          <Info label="ISBN">{s.isbn}</Info>
          <Info label="Thể loại">{s.theLoai.tenTheLoai}</Info>
          <Info label="Nhà xuất bản">{s.nhaXuatBan.tenNxb}</Info>
          <Info label="Năm xuất bản">{s.namXuatBan}</Info>
          <Info label="Ngôn ngữ">{s.ngonNgu}</Info>
          <Info label="Giá bìa">{formatVnd(s.giaBia)}</Info>
          <div className="sm:col-span-2">
            <Info label="Tác giả">{s.sachTacGias.map((x) => x.tacGia.tenTacGia).join(", ")}</Info>
          </div>
          <div className="sm:col-span-2">
            <Info label="Mô tả">{s.moTa}</Info>
          </div>
        </dl>
      )}

      {isStaff && !editing && <BanSachPanel sachId={s.id} />}

      <AlertDialog open={confirmDelete} onOpenChange={(open) => !open && !remove.isPending && setConfirmDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sách?</AlertDialogTitle>
            <AlertDialogDescription>
              “{s.tenSach}” sẽ bị xóa vĩnh viễn. Sách đã có bản sách hoặc phiếu mượn tham chiếu sẽ bị hệ thống từ chối.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Hủy</AlertDialogCancel>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
