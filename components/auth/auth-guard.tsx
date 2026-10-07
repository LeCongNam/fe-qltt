"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"

export function FullPageSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f6f7f4]">
      <Loader2Icon className="size-6 animate-spin text-[#147d64]" aria-label="Đang tải" />
    </div>
  )
}

/** Chỉ cho vào khi đã đăng nhập; không có phiên (hoặc phiên bị xóa do 401) thì về /login. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (ready && !user) router.replace("/login")
  }, [ready, user, router])

  if (!ready || !user) return <FullPageSpinner />

  return <>{children}</>
}
