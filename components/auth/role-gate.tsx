"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldAlertIcon } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { canSee, getRouteRoles } from "@/lib/navigation"

/**
 * Chặn nội dung trang theo quyền khai báo trong `lib/navigation.ts`, kể cả khi vào thẳng bằng URL.
 * Chỉ là lớp giao diện; BE vẫn trả 403 cho thao tác không đủ quyền.
 */
export function RoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { ready, user } = useAuth()

  if (!ready || canSee(getRouteRoles(pathname), user?.vaiTro)) return <>{children}</>

  return (
    <section role="alert" className="mx-auto flex w-full max-w-md flex-col items-center py-16 text-center">
      <ShieldAlertIcon className="size-8 text-destructive" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold text-foreground">Bạn không có quyền truy cập trang này</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">Trang này chỉ dành cho tài khoản có vai trò phù hợp. Liên hệ quản trị nếu bạn cần quyền.</p>
      <Link href="/me" className="mt-4 text-sm font-medium text-primary hover:underline">
        Về trang của tôi
      </Link>
    </section>
  )
}
