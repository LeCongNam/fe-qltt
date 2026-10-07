"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { getSessionEndReason } from "@/lib/auth-store"

export function FullPageSpinner() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-svh items-center justify-center bg-canvas">
      <Loader2Icon className="size-6 animate-spin text-primary" aria-label="Đang tải" />
    </div>
  )
}

/**
 * Chỉ cho vào khi đã đăng nhập; không có phiên thì về /login. Kèm `next` (trang đang xem, để quay lại sau khi
 * đăng nhập) và, nếu phiên mất do hết hạn/401, `reason` (để trang đăng nhập báo). Tự bấm đăng xuất thì về /login trơn.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready || user) return
    const reason = getSessionEndReason()
    if (reason === "logout") {
      router.replace("/login")
      return
    }
    // Đọc từ location thay vì useSearchParams để không bắt cả layout phải bọc Suspense.
    const params = new URLSearchParams({ next: pathname + window.location.search })
    if (reason) params.set("reason", reason)
    router.replace(`/login?${params}`)
  }, [ready, user, pathname, router])

  if (!ready || !user) return <FullPageSpinner />

  return <>{children}</>
}
