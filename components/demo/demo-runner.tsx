"use client"

import { useId, useState, type ReactNode } from "react"
import { CheckCircle2, Loader2, Play, XCircle } from "lucide-react"

import { DemoTable, DemoTableSkeleton } from "@/components/demo/demo-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounced } from "@/hooks/use-debounced"
import { getApiErrorMessage } from "@/lib/api"
import {
  useDemoBang,
  useDemoChay,
  useDemoChiTiet,
  type DemoBang,
  type DemoChiTiet,
  type DemoKetQua,
  type DemoMuc,
} from "@/features/demo/queries"

/** Câu lệnh để xem trước (bước 4): thay `:tham_so` bằng giá trị đang nhập. Chỉ để hiển thị, BE mới là nơi bind khi chạy. */
function xemTruocLenh(lenh: string, thamSo: DemoChiTiet["thamSo"], values: Record<string, string>) {
  return lenh.replace(/:([a-z_]+)\b/g, (_, ten: string) => {
    const p = thamSo.find((x) => x.ten === ten)
    const v = (values[ten] ?? "").trim()
    if (!p || v === "") return "NULL"
    return p.kieu === "number" && Number.isFinite(Number(v)) ? v : `'${v.replace(/'/g, "''")}'`
  })
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="grid size-6 place-items-center rounded-full bg-primary text-xs text-white">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  )
}

function SqlBlock({ children }: { children: string }) {
  return (
    <pre className="max-h-96 overflow-auto rounded-md bg-foreground p-3 font-mono text-xs leading-relaxed whitespace-pre text-primary-soft">
      {children}
    </pre>
  )
}

function ThamSoForm({
  chiTiet,
  values,
  onChange,
}: {
  chiTiet: DemoChiTiet
  values: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  const uid = useId()
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
      {chiTiet.tinhHuong.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Tình huống mẫu:</span>
          {chiTiet.tinhHuong.map((t) => (
            <Button key={t.nhan} type="button" variant="outline" size="sm" onClick={() => onChange({ ...t.thamSo })}>
              {t.nhan}
            </Button>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {chiTiet.thamSo.map((p) => {
          const id = `${uid}-${p.ten}`
          return (
            <div key={p.ten} className="grid gap-1.5">
              <Label htmlFor={id} className="text-xs text-muted-foreground">
                {p.nhan}
                <span className="ml-1 font-mono text-faint">:{p.ten}</span>
              </Label>
              <Input
                id={id}
                type={p.kieu === "date" ? "date" : "text"}
                inputMode={p.kieu === "number" ? "numeric" : undefined}
                list={p.goiY.length > 0 ? `${id}-goi-y` : undefined}
                value={values[p.ten] ?? ""}
                onChange={(e) => onChange({ ...values, [p.ten]: e.target.value })}
                autoComplete="off"
                className="h-10 rounded-md border-input bg-white text-sm"
              />
              {p.goiY.length > 0 && (
                <datalist id={`${id}-goi-y`}>
                  {p.goiY.map((g) => (
                    <option key={g.giaTri} value={g.giaTri}>
                      {g.moTa}
                    </option>
                  ))}
                </datalist>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KetQuaPanel({ ketQua, truoc }: { ketQua: DemoKetQua; truoc: DemoBang[] }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <div
        role={ketQua.thanhCong ? "status" : "alert"}
        className={`flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm ${
          ketQua.thanhCong ? "border-[#bfe0d2] bg-primary-soft text-primary-strong" : "border-[#efc9c2] bg-destructive-soft text-destructive"
        }`}
      >
        {ketQua.thanhCong ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
        <div className="min-w-0">
          <p className="font-medium">
            {ketQua.thanhCong ? "Thực thi thành công" : "CSDL từ chối (SIGNAL của procedure/trigger)"}
            {ketQua.soDongAnhHuong !== null && ` — ${ketQua.soDongAnhHuong} dòng bị ảnh hưởng`}
          </p>
          {ketQua.loi && <p className="mt-0.5 break-words">{ketQua.loi}</p>}
          <p className="mt-0.5 text-xs opacity-80">
            {ketQua.daHoanTac
              ? ketQua.thanhCong
                ? "Đã hoàn tác (ROLLBACK): dữ liệu thật không đổi, bảng bên dưới là trạng thái ngay sau khi chạy."
                : "Lệnh bị từ chối nên không có thay đổi nào được ghi."
              : "Đã ghi thật vào CSDL (COMMIT)."}
          </p>
        </div>
      </div>

      <pre className="overflow-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap text-ink">{ketQua.lenh}</pre>

      {ketQua.ketQua && <DemoTable bang={{ ...ketQua.ketQua, nhan: "Output (kết quả trả về)" }} />}

      {ketQua.bangSau.map((b) => (
        <DemoTable key={b.nhan} bang={b} truoc={truoc.find((t) => t.nhan === b.nhan)} />
      ))}
    </div>
  )
}

/** Năm bước demo của đề cho một mục: bài toán, câu SQL, bảng liên quan, nút thực thi, xem lại bảng/output. */
export function DemoRunner({ muc }: { muc: DemoMuc }) {
  const chiTietQuery = useDemoChiTiet(muc.id)
  const chiTiet = chiTietQuery.data
  const [values, setValues] = useState<Record<string, string> | null>(null)
  const [hoanTac, setHoanTac] = useState(true)
  const [lanChay, setLanChay] = useState<{ ketQua: DemoKetQua; truoc: DemoBang[] } | null>(null)

  const form = values ?? Object.fromEntries((chiTiet?.thamSo ?? []).map((p) => [p.ten, p.macDinh ?? ""]))
  const debounced = useDebounced(form, 350)
  const bangQuery = useDemoBang(muc.id, debounced)
  const chay = useDemoChay(muc.id)

  if (chiTietQuery.isError) {
    return <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(chiTietQuery.error, "Không tải được mục demo.")}</p>
  }
  if (!chiTiet) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const caNhieuDinhNghia = chiTiet.dinhNghia.length > 1

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <Step n={1} title="Bài toán">
        <p className="text-sm font-medium text-foreground">{chiTiet.tieuDe}</p>
        <p className="mt-1 text-sm text-muted-foreground">{chiTiet.baiToan}</p>
      </Step>

      <Step n={2} title="Câu truy vấn SQL">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
          {chiTiet.dinhNghia.map((d) => (
            <div key={d.ten}>
              {caNhieuDinhNghia && <p className="mb-1 font-mono text-xs font-semibold text-ink">{d.ten}</p>}
              {d.sql ? <SqlBlock>{d.sql}</SqlBlock> : <p className="text-sm text-destructive">Không đọc được định nghĩa {d.ten}.</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {d.nguon === "CSDL" ? "Đọc trực tiếp từ CSDL (SHOW CREATE)." : "Đoạn CREATE trong sql/*.sql đã nạp vào CSDL (tài khoản kết nối không có quyền đọc định nghĩa)."}
              </p>
            </div>
          ))}
        </div>
      </Step>

      <Step n={3} title="Tham số và các bảng liên quan (trước khi chạy)">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
          {chiTiet.thamSo.length > 0 && <ThamSoForm chiTiet={chiTiet} values={form} onChange={setValues} />}
          {bangQuery.isError ? (
            <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(bangQuery.error, "Không tải được bảng liên quan.")}</p>
          ) : !bangQuery.data ? (
            <DemoTableSkeleton count={chiTiet.bang.length} />
          ) : (
            bangQuery.data.map((b) => <DemoTable key={b.nhan} bang={b} loading={bangQuery.isFetching} />)
          )}
        </div>
      </Step>

      <Step n={4} title="Thực thi">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
          <SqlBlock>{xemTruocLenh(chiTiet.lenh, chiTiet.thamSo, form)}</SqlBlock>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="button"
              disabled={chay.isPending || !bangQuery.data}
              onClick={() =>
                chay.mutate(
                  { thamSo: form, hoanTac },
                  { onSuccess: (ketQua) => setLanChay({ ketQua, truoc: bangQuery.data ?? [] }) }
                )
              }
            >
              {chay.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Play aria-hidden="true" />}
              Thực thi
            </Button>
            {chiTiet.loai !== "FUNCTION" && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={hoanTac} onChange={(e) => setHoanTac(e.target.checked)} className="size-4 accent-primary" />
                Hoàn tác sau khi chạy (demo lặp lại được, dữ liệu không đổi)
              </label>
            )}
          </div>
          {chay.isError && <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(chay.error, "Không thực thi được.")}</p>}
        </div>
      </Step>

      <Step n={5} title="Kết quả và các bảng sau khi chạy">
        {lanChay ? (
          <KetQuaPanel ketQua={lanChay.ketQua} truoc={lanChay.truoc} />
        ) : (
          <p className="text-sm text-muted-foreground">Bấm “Thực thi” ở bước 4 để xem output và trạng thái các bảng sau khi chạy.</p>
        )}
      </Step>
    </div>
  )
}
