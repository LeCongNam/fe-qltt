"use client"

import { useRouter } from "next/navigation"

import { SachForm } from "@/components/sach/sach-form"
import { useAuth } from "@/hooks/use-auth"

export default function ThemSachPage() {
  const router = useRouter()
  const { isStaff } = useAuth()

  if (!isStaff) {
    return <p className="text-sm text-[#bb6759]">Bạn không có quyền thêm sách.</p>
  }

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-7 border-b border-[#e4e8e2] pb-5">
        <p className="text-xs font-medium text-[#738078]">Sách</p>
        <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Thêm sách</h2>
        <p className="mt-1.5 text-sm text-[#758078]">Nhập thông tin đầu sách mới. Bản sách nhập sau khi tạo.</p>
      </div>
      <SachForm onSaved={(id) => router.replace(`/sach/${id}`)} onCancel={() => router.push("/sach")} />
    </section>
  )
}
