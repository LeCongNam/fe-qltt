"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Trash2 } from "lucide-react"

import { BanSachPanel } from "@/components/sach/ban-sach-panel"
import { SachForm } from "@/components/sach/sach-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"
import { sachApi } from "@/features/sach/api"
import { sachKeys, sachQueries } from "@/features/sach/queries"
import { getApiErrorMessage, isApiError } from "@/lib/api"
import { formatVnd } from "@/lib/format"
import { InfoItem } from "@/components/info-item"
import { PageHeader } from "@/components/page-header"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function SachDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isStaff } = useAuth()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const query = useQuery({ ...sachQueries.detail(id), retry: false })

  const remove = useMutation({
    mutationFn: () => sachApi.remove(id),
    onSuccess: () => {
      toast.add({ type: "success", title: "Đã xóa sách", description: query.data?.tenSach })
      queryClient.invalidateQueries({ queryKey: sachKeys.all })
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
    const notFound = isApiError(query.error, 404)
    return (
      <div className="mx-auto w-full max-w-4xl space-y-3 text-sm">
        <p role="alert" className="text-destructive">{notFound ? "Không tìm thấy sách." : getApiErrorMessage(query.error, "Không tải được sách.")}</p>
        <Link href="/sach" className="text-primary hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const s = query.data

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        back={{ href: "/sach", label: "Sách" }}
        title={s.tenSach}
        description={`Mã sách ${s.maSach}`}
        className="mb-0"
        action={
          isStaff &&
          !editing && (
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
          )
        }
      />

      {editing ? (
        <SachForm sach={s} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-border bg-white p-5 sm:grid-cols-2">
          <InfoItem label="ISBN">{s.isbn}</InfoItem>
          <InfoItem label="Thể loại">{s.theLoai.tenTheLoai}</InfoItem>
          <InfoItem label="Nhà xuất bản">{s.nhaXuatBan.tenNxb}</InfoItem>
          <InfoItem label="Năm xuất bản">{s.namXuatBan}</InfoItem>
          <InfoItem label="Ngôn ngữ">{s.ngonNgu}</InfoItem>
          <InfoItem label="Giá bìa">{formatVnd(s.giaBia)}</InfoItem>
          <div className="sm:col-span-2">
            <InfoItem label="Tác giả">{s.sachTacGias.map((x) => x.tacGia.tenTacGia).join(", ")}</InfoItem>
          </div>
          <div className="sm:col-span-2">
            <InfoItem label="Mô tả">{s.moTa}</InfoItem>
          </div>
        </dl>
      )}

      {isStaff && !editing && <BanSachPanel sachId={s.id} />}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Xóa sách?"
        description={
          <>
            “{s.tenSach}” sẽ bị xóa vĩnh viễn. Sách đã có bản sách hoặc phiếu mượn tham chiếu sẽ bị hệ thống từ chối.
          </>
        }
        confirmLabel="Xóa"
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </section>
  )
}
