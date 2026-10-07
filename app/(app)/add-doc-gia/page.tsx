"use client"

import { useRouter } from "next/navigation"

import { NguoiDungForm } from "@/components/nguoi-dung/nguoi-dung-form"

export default function ThemNguoiDungPage() {
  const router = useRouter()

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-7 border-b border-border pb-5">
        <p className="text-xs font-medium text-muted-foreground">Người dùng</p>
        <h2 className="mt-1.5 text-xl font-semibold text-foreground">Thêm người dùng</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Người mới luôn ở trạng thái hoạt động. Tài khoản đăng nhập do quản trị tạo riêng ở trang chi tiết.
        </p>
      </div>
      <NguoiDungForm onSaved={(nd) => router.replace(`/nguoi-dung/${nd.id}`)} onCancel={() => router.push("/nguoi-dung")} />
    </section>
  )
}
