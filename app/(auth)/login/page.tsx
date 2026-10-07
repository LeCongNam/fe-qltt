"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen, InfoIcon } from "lucide-react"
import { z } from "zod"

import { FullPageSpinner } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { login, useAuth } from "@/hooks/use-auth"
import { getApiErrorMessage } from "@/lib/api"
import { clearSessionEndReason, type VaiTro } from "@/lib/auth-store"
import { canSee, getRouteRoles } from "@/lib/navigation"
import { safeNextPath } from "@/lib/safe-redirect"
import { TextField } from "@/components/form/text-field"

const loginSchema = z.object({
  tenDangNhap: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập.").max(80, "Tối đa 80 ký tự."),
  matKhau: z.string().min(1, "Vui lòng nhập mật khẩu.").max(72, "Tối đa 72 ký tự."),
})

type LoginValues = z.infer<typeof loginSchema>

function homeFor(vaiTro: VaiTro) {
  return vaiTro === "BAN_DOC" ? "/me" : "/"
}

/** Đích sau đăng nhập: trang cũ (`next`) nếu hợp lệ và vai trò được vào, nếu không thì trang chủ theo vai trò. */
function destinationFor(vaiTro: VaiTro, next: string | null) {
  const path = safeNextPath(next)
  return path && canSee(getRouteRoles(path.split(/[?#]/)[0]), vaiTro) ? path : homeFor(vaiTro)
}

const REASON_MESSAGES: Record<string, string> = {
  expired: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.",
  unauthorized: "Phiên đăng nhập không còn hiệu lực (hết hạn hoặc tài khoản bị khóa). Vui lòng đăng nhập lại.",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <LoginView />
    </Suspense>
  )
}

function LoginView() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next")
  const notice = REASON_MESSAGES[params.get("reason") ?? ""]
  const { ready, user } = useAuth()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenDangNhap: "", matKhau: "" },
  })

  // Lý do đã nằm trong URL; xóa ở store để lần vào /login sau không báo lại.
  useEffect(() => {
    clearSessionEndReason()
  }, [])

  useEffect(() => {
    if (ready && user) router.replace(destinationFor(user.vaiTro, next))
  }, [ready, user, router, next])

  async function onSubmit(values: LoginValues) {
    try {
      const loggedIn = await login(values)
      router.replace(destinationFor(loggedIn.vaiTro, next))
    } catch (error) {
      toast.add({
        type: "error",
        title: "Không thể đăng nhập",
        description: getApiErrorMessage(error, "Đăng nhập thất bại. Vui lòng thử lại."),
      })
    }
  }

  if (!ready || user) return <FullPageSpinner />

  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <BookOpen className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">Quản lý thư viện</h1>
            <p className="text-xs text-muted-foreground">Đăng nhập để tiếp tục</p>
          </div>
        </div>

        {notice && (
          <p
            role="status"
            className="mb-4 flex items-start gap-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2.5 text-sm text-warning"
          >
            <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {notice}
          </p>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            <TextField
              control={form.control}
              name="tenDangNhap"
              label="Tên đăng nhập"
              autoComplete="username"
              autoFocus
              maxLength={80}
            />
            <TextField
              control={form.control}
              name="matKhau"
              label="Mật khẩu"
              type="password"
              autoComplete="current-password"
              maxLength={72}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="h-10 w-full">
              {form.formState.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </main>
  )
}
