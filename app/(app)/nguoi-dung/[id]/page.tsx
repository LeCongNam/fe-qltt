"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Pencil } from "lucide-react"

import { NguoiDungForm } from "@/components/nguoi-dung/nguoi-dung-form"
import { TaiKhoanCard } from "@/components/nguoi-dung/tai-khoan-card"
import { TrangThaiCard } from "@/components/nguoi-dung/trang-thai-card"
import { LOAI_NGUOI_DUNG, labelOf } from "@/components/nguoi-dung/nguoi-dung-meta"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { nguoiDungQueries } from "@/features/nguoi-dung/queries"
import { useAuth } from "@/hooks/use-auth"
import { getApiErrorMessage, isApiError } from "@/lib/api"
import { formatDate } from "@/lib/format"
import { InfoItem } from "@/components/info-item"
import { PageHeader } from "@/components/page-header"

export default function NguoiDungDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isStaff, isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)

  const query = useQuery({ ...nguoiDungQueries.detail(id), retry: false, enabled: isStaff })

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
        <p role="alert" className="text-destructive">
          {notFound ? "Không tìm thấy người dùng." : getApiErrorMessage(query.error, "Không tải được người dùng.")}
        </p>
        <Link href="/nguoi-dung" className="text-primary hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    )
  }

  const u = query.data

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <PageHeader
        back={{ href: "/nguoi-dung", label: "Người dùng" }}
        title={u.hoTen}
        description={`Mã người dùng ${u.maNguoiDung}`}
        className="mb-0"
        action={
          !editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil aria-hidden="true" />
              Sửa thông tin
            </Button>
          )
        }
      />

      {editing ? (
        <NguoiDungForm nguoiDung={u} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-lg border border-border bg-white p-5 sm:grid-cols-2">
          <InfoItem label="Loại người dùng">{labelOf(LOAI_NGUOI_DUNG, u.loaiNguoiDung)}</InfoItem>
          <InfoItem label="Ngày tạo">{formatDate(u.createdAt)}</InfoItem>
          <InfoItem label="Email">{u.email}</InfoItem>
          <InfoItem label="Số điện thoại">{u.sdt}</InfoItem>
          <div className="sm:col-span-2">
            <InfoItem label="Khoa / đơn vị">{u.khoaDonVi}</InfoItem>
          </div>
        </dl>
      )}

      {!editing && (
        <>
          <TrangThaiCard nguoiDung={u} isAdmin={isAdmin} />
          <TaiKhoanCard nguoiDung={u} isAdmin={isAdmin} />
        </>
      )}
    </section>
  )
}
