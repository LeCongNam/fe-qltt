"use client"

import { useEffect, useState } from "react"

/** Giá trị trễ `ms` mili giây sau lần đổi cuối; dùng để chờ người dùng gõ xong rồi mới gọi API. */
export function useDebounced<T>(value: T, ms: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}
