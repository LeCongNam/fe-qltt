import { useEffect } from "react"

export const APP_NAME = "Quản lý thư viện"

const fullTitle = (title: string) => `${title} · ${APP_NAME}`

let desired: string | null = null
let observer: MutationObserver | undefined

function apply() {
  if (desired !== null && document.title !== desired) document.title = desired
}

/**
 * Đặt `document.title`. Các trang là client component nên không dùng được `metadata`/`generateMetadata`.
 * Khi tải thẳng vào một trang, Next đẩy `<title>` của metadata gốc vào `<head>` sau khi hydrate và đè lên giá trị
 * vừa đặt, nên giữ tiêu đề mong muốn và đặt lại mỗi khi `<head>` đổi cho tới khi `clearDocumentTitle`.
 */
export function setDocumentTitle(title: string) {
  desired = fullTitle(title)
  apply()
  if (!observer) {
    observer = new MutationObserver(apply)
    observer.observe(document.head, { childList: true, subtree: true, characterData: true })
  }
}

/** Thôi giữ tiêu đề (rời khu vực đã đăng nhập), để trang khác tự đặt tiêu đề. */
export function clearDocumentTitle() {
  desired = null
}

/** Tên bản ghi ở trang chi tiết (tên sách, họ tên) sau khi tải xong; ghi đè tiêu đề mặc định theo đường dẫn. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) setDocumentTitle(title)
  }, [title])
}
