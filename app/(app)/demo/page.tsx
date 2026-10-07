"use client"

import { useState } from "react"

import { DemoRunner } from "@/components/demo/demo-runner"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getApiErrorMessage } from "@/lib/api"
import { useDemoList, type DemoLoai, type DemoMuc } from "@/lib/demo"
import { PageHeader } from "@/components/page-header"

const LOAI: { value: DemoLoai; label: string; desc: string }[] = [
  { value: "PROCEDURE", label: "Stored Procedure", desc: "Procedure nghiệp vụ: gọi bằng CALL, DB tự kiểm tra và ghi nhiều bảng trong một transaction." },
  { value: "TRIGGER", label: "Trigger", desc: "Trigger chạy khi INSERT/UPDATE bảng: bấm Thực thi để chạy câu lệnh DML kích hoạt trigger." },
  { value: "FUNCTION", label: "Function", desc: "Function trả về một giá trị, gọi trong câu SELECT." },
  { value: "CURSOR", label: "Cursor", desc: "Procedure dùng cursor để duyệt từng dòng và xử lý hàng loạt." },
]

function MucList({ items }: { items: DemoMuc[] }) {
  const [chon, setChon] = useState(items[0]?.id)
  const muc = items.find((m) => m.id === chon) ?? items[0]
  if (!muc) return <p className="text-sm text-muted-foreground">Chưa có mục demo.</p>

  return (
    <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <ul className="grid content-start gap-1.5" aria-label="Danh sách mục demo">
        {items.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => setChon(m.id)}
              aria-current={m.id === muc.id}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                m.id === muc.id ? "border-primary bg-primary-soft text-primary-strong" : "border-border bg-white text-ink hover:bg-canvas"
              }`}
            >
              <span className="block font-medium">{m.tieuDe}</span>
              <span className="block truncate font-mono text-xs text-muted-foreground">{m.doiTuong[0]}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="min-w-0">
        <DemoRunner key={muc.id} muc={muc} />
      </div>
    </div>
  )
}

export default function DemoPage() {
    const list = useDemoList()
  const [tab, setTab] = useState<DemoLoai>("PROCEDURE")

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl">
      <PageHeader
        eyebrow="Demo"
        title="Demo xử lý thông tin"
        description="Mỗi mục đi qua 5 bước: bài toán, câu SQL, bảng liên quan, thực thi, xem lại bảng/output. Mọi dữ liệu đều đọc trực tiếp từ cơ sở dữ liệu."
      />

      {list.isError ? (
        <p role="alert" className="text-sm text-destructive">{getApiErrorMessage(list.error, "Không tải được danh sách demo.")}</p>
      ) : !list.data ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Tabs value={tab} onValueChange={(v) => v && setTab(v as DemoLoai)} className="min-w-0">
          <div className="overflow-x-auto">
            <TabsList variant="line" className="h-auto min-w-max border-b border-border pb-1">
              {LOAI.map((l) => (
                <TabsTrigger key={l.value} value={l.value} className="flex-none px-3 py-1.5 data-active:text-primary">
                  {l.label} ({list.data.filter((m) => m.loai === l.value).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {LOAI.map((l) => (
            <TabsContent key={l.value} value={l.value} className="pt-4">
              <p className="mb-4 text-sm text-muted-foreground">{l.desc}</p>
              <MucList items={list.data.filter((m) => m.loai === l.value)} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </section>
  )
}
