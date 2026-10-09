"use client"

import { useRouter } from "next/navigation"

import { NguoiDungForm } from "@/components/nguoi-dung/nguoi-dung-form"
import { PageHeader } from "@/components/page-header"

export default function ThemNguoiDungPage() {
  const router = useRouter()

  return (
    <section className="mx-auto w-full max-w-4xl">
      <PageHeader
        eyebrow="Người dùng"
        title="Thêm người dùng"
        description="Người mới luôn ở trạng thái hoạt động. Tài khoản đăng nhập do quản trị tạo riêng ở trang chi tiết."
      />
      <NguoiDungForm onSaved={(nd) => router.replace(`/nguoi-dung/${nd.id}`)} onCancel={() => router.push("/nguoi-dung")} />
    </section>
  )
}
