"use client"

import { useRouter } from "next/navigation"

import { SachForm } from "@/components/sach/sach-form"

export default function ThemSachPage() {
  const router = useRouter()

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-7 border-b border-border pb-5">
        <p className="text-xs font-medium text-muted-foreground">Sách</p>
        <h2 className="mt-1.5 text-xl font-semibold text-foreground">Thêm sách</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Nhập thông tin đầu sách mới. Bản sách nhập sau khi tạo.</p>
      </div>
      <SachForm onSaved={(id) => router.replace(`/sach/${id}`)} onCancel={() => router.push("/sach")} />
    </section>
  )
}
