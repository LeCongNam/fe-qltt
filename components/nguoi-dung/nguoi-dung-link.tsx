import Link from "next/link"

/** Họ tên kèm mã, bấm vào sang `/nguoi-dung/<mã>` (trang chi tiết nhận cả mã lẫn id). Chỉ dùng ở chỗ nhân viên thấy. */
export function NguoiDungLink({ maNguoiDung, hoTen }: { maNguoiDung: string; hoTen: string }) {
  return (
    <Link href={`/nguoi-dung/${encodeURIComponent(maNguoiDung)}`} className="text-primary hover:underline">
      {hoTen} <span className="text-muted-foreground">({maNguoiDung})</span>
    </Link>
  )
}
