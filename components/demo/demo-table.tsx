import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DemoBang } from "@/lib/demo"

const rowKey = (row: Record<string, unknown>) => JSON.stringify(row)

function Cell({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-xs italic text-[#66736c]">NULL</span>
  if (typeof value === "object") return <>{JSON.stringify(value)}</>
  return <>{String(value)}</>
}

/**
 * Bảng dữ liệu lấy từ CSDL. Có `truoc` (cùng bảng ở bước 3) thì tô xanh các dòng mới hoặc đã đổi
 * để thấy ngay thay đổi sau khi chạy.
 */
export function DemoTable({
  bang,
  truoc,
  loading,
}: {
  bang: DemoBang
  truoc?: DemoBang
  loading?: boolean
}) {
  const before = truoc ? new Set(truoc.dong.map(rowKey)) : null
  const soDongDoi = before ? bang.dong.filter((r) => !before.has(rowKey(r))).length : 0
  const soDongMat = truoc ? truoc.dong.filter((r) => !new Set(bang.dong.map(rowKey)).has(rowKey(r))).length : 0

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-mono text-xs font-semibold text-[#32433b]">{bang.nhan}</h4>
        <span className="text-xs text-[#5f6b64]">
          {bang.dong.length} dòng
          {truoc && (soDongDoi > 0 || soDongMat > 0) && (
            <span className="ml-2 font-medium text-[#147d64]">
              {soDongDoi} dòng mới/đã đổi{soDongMat > 0 ? `, ${soDongMat} dòng bị mất/đổi` : ""}
            </span>
          )}
          {truoc && soDongDoi === 0 && soDongMat === 0 && <span className="ml-2">không đổi</span>}
        </span>
      </div>
      <div className={`overflow-x-auto rounded-lg border border-[#e4e8e2] bg-white ${loading ? "opacity-60" : ""}`}>
        {bang.cot.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-[#5f6b64]">Không có dòng nào.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {bang.cot.map((c) => (
                  <TableHead key={c} className="whitespace-nowrap font-mono text-xs">
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bang.dong.length === 0 && (
                <TableRow>
                  <TableCell colSpan={bang.cot.length} className="py-4 text-center text-sm text-[#5f6b64]">
                    Không có dòng nào.
                  </TableCell>
                </TableRow>
              )}
              {bang.dong.map((row, i) => (
                <TableRow key={`${rowKey(row)}-${i}`} className={before && !before.has(rowKey(row)) ? "bg-[#e8f5ef]" : undefined}>
                  {bang.cot.map((c) => (
                    <TableCell key={c} className="whitespace-nowrap text-sm">
                      <Cell value={row[c]} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

export function DemoTableSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}
