"use client"

import { useRouter } from "next/navigation"

import { NguoiDungForm } from "@/components/nguoi-dung/nguoi-dung-form"
import { useAuth } from "@/hooks/use-auth"

export default function ThemNguoiDungPage() {
  const router = useRouter()
  const { isStaff } = useAuth()

  if (!isStaff) {
    return <p className="text-sm text-[#bb6759]">Bạn không có quyền thêm người dùng.</p>
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-7 border-b border-[#e4e8e2] pb-5">
        <p className="text-xs font-medium text-[#738078]">Người dùng</p>
        <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Thêm người dùng</h2>
        <p className="mt-1.5 text-sm text-[#758078]">
          Người mới luôn ở trạng thái hoạt động. Tài khoản đăng nhập do quản trị tạo riêng ở trang chi tiết.
        </p>
      </div>
      <NguoiDungForm onSaved={(nd) => router.replace(`/nguoi-dung/${nd.id}`)} onCancel={() => router.push("/nguoi-dung")} />
    </section>
  )
}
