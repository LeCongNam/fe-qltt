"use client"

import { useSyncExternalStore } from "react"

import { authApi } from "@/features/auth/api"
import type { Schemas } from "@/lib/api"
import {
  clearSession,
  getServerSnapshot,
  getSnapshot,
  saveSession,
  subscribe,
  type VaiTro,
} from "@/lib/auth-store"

export async function login(body: Schemas["LoginDto"]) {
  const data = await authApi.login(body)
  saveSession({ accessToken: data.accessToken, user: data.user })
  return data.user
}

export function logout() {
  clearSession("logout")
}

export function useAuth() {
  const { ready, session } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const user = session?.user ?? null

  return {
    ready,
    user,
    isStaff: user?.vaiTro === "ADMIN" || user?.vaiTro === "THU_THU",
    isAdmin: user?.vaiTro === "ADMIN",
    hasRole: (...roles: VaiTro[]) => (user ? roles.includes(user.vaiTro) : false),
  }
}
