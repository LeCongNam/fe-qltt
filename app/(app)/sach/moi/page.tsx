"use client"

import { useRouter } from "next/navigation"

import { SachForm } from "@/components/sach/sach-form"
import { PageHeader } from "@/components/page-header"

export default function ThemSachPage() {
  const router = useRouter()

  return (
    <section className="mx-auto w-full max-w-4xl">
      <PageHeader
        eyebrow="Sách"
        title="Thêm sách"
        description="Nhập thông tin đầu sách mới. Bản sách nhập sau khi tạo."
      />
      <SachForm onSaved={(id) => router.replace(`/sach/${id}`)} onCancel={() => router.push("/sach")} />
    </section>
  )
}
