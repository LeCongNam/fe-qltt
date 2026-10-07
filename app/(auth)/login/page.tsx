"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen } from "lucide-react"
import { z } from "zod"

import { FullPageSpinner } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { login, useAuth } from "@/hooks/use-auth"
import { getApiErrorMessage } from "@/lib/api"
import type { VaiTro } from "@/lib/auth-store"

const loginSchema = z.object({
  tenDangNhap: z.string().trim().min(1, "Vui lòng nhập tên đăng nhập.").max(80, "Tối đa 80 ký tự."),
  matKhau: z.string().min(1, "Vui lòng nhập mật khẩu.").max(72, "Tối đa 72 ký tự."),
})

type LoginValues = z.infer<typeof loginSchema>

function homeFor(vaiTro: VaiTro) {
  return vaiTro === "BAN_DOC" ? "/me" : "/"
}

export default function LoginPage() {
  const router = useRouter()
  const { ready, user } = useAuth()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { tenDangNhap: "", matKhau: "" },
  })

  useEffect(() => {
    if (ready && user) router.replace(homeFor(user.vaiTro))
  }, [ready, user, router])

  async function onSubmit(values: LoginValues) {
    try {
      const loggedIn = await login(values)
      router.replace(homeFor(loggedIn.vaiTro))
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

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            <Controller
              name="tenDangNhap"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Tên đăng nhập</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete="username" autoFocus maxLength={80} className="h-10 rounded-md border-input bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="matKhau"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Mật khẩu</FieldLabel>
                  <Input {...field} id={field.name} type="password" aria-invalid={fieldState.invalid} autoComplete="current-password" maxLength={72} className="h-10 rounded-md border-input bg-white text-sm" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
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
