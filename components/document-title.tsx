"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"

import { clearDocumentTitle, setDocumentTitle } from "@/hooks/use-document-title"
import { getPageTitle } from "@/lib/navigation"

/**
 * Tiêu đề tab mặc định theo đường dẫn. Dùng `useLayoutEffect` để chạy trước mọi `useEffect` của trang con,
 * nên `useDocumentTitle` ở trang chi tiết luôn ghi đè được dù trang con mount trước.
 */
export function DocumentTitle() {
  const pathname = usePathname()
  useLayoutEffect(() => {
    setDocumentTitle(getPageTitle(pathname))
    return clearDocumentTitle
  }, [pathname])
  return null
}
