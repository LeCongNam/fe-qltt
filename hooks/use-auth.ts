"use client"

import { useSyncExternalStore } from "react"

import { apiClient, type Schemas } from "@/lib/api"
import {
  clearSession,
  getServerSnapshot,
  getSnapshot,
  saveSession,
  subscribe,
  type VaiTro,
} from "@/lib/auth-store"

export async function login(body: Schemas["LoginDto"]) {
  const { data } = await apiClient.post<Schemas["LoginResponseDto"]>("/auth/login", body)
  saveSession({ accessToken: data.accessToken, user: data.user })
  return data.user
}

export function logout() {
  clearSession()
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
