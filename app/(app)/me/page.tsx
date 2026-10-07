"use client"

import { useState } from "react"
import { BookMarked, ListFilter, WalletCards } from "lucide-react"

import { MetricCard } from "@/components/dashboard/metric-card"
import { DatTruocPanel, LichSuMuonPanel, SachDangMuonPanel, TienPhatPanel } from "@/components/me/me-panels"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { formatVnd } from "@/lib/format"
import { type DatTruocCuaToi, type SachDangMuonCuaToi, type TienPhatCuaToi, useMe } from "@/lib/me"

const SECTIONS = [
  { value: "dang-muon", label: "Đang mượn", desc: "Sách bạn đang giữ. Gia hạn được khi chưa quá hạn, chưa hết lượt và không có người đặt trước.", Panel: SachDangMuonPanel },
  { value: "dat-truoc", label: "Đặt trước", desc: "Lượt đặt trước đang hoạt động hiện trước. Sách được giữ cho bạn đến hạn giữ.", Panel: DatTruocPanel },
  { value: "tien-phat", label: "Tiền phạt", desc: "Mọi phiếu phạt của bạn. Thanh toán trực tiếp tại thủ thư.", Panel: TienPhatPanel },
  { value: "lich-su", label: "Lịch sử mượn", desc: "Mọi lượt mượn, đang mượn lẫn đã trả.", Panel: LichSuMuonPanel },
]

export default function MePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(SECTIONS[0].value)
  const dangMuon = useMe<SachDangMuonCuaToi>("sach-dang-muon")
  const tienPhat = useMe<TienPhatCuaToi>("tien-phat")
  const datTruoc = useMe<DatTruocCuaToi>("dat-truoc")

  const soQuaHan = dangMuon.data?.filter((r) => r.so_ngay_qua_han > 0).length
  const conNo = tienPhat.data?.filter((r) => r.trang_thai === "CHUA_THANH_TOAN").reduce((s, r) => s + r.so_tien, 0)
  const datHoatDong = datTruoc.data?.filter((r) => r.trang_thai === "CHO_XU_LY" || r.trang_thai === "SAN_SANG_NHAN")
  const sanSang = datHoatDong?.filter((r) => r.trang_thai === "SAN_SANG_NHAN").length

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl">
      <div className="mb-6 border-b border-[#e4e8e2] pb-5">
        <p className="text-xs font-medium text-[#5f6b64]">Cá nhân</p>
        <h2 className="mt-1.5 text-xl font-semibold text-[#1c2c26]">Của tôi</h2>
        <p className="mt-1.5 text-sm text-[#5f6b64]">
          {user ? `${user.hoTen} — ` : ""}sách đang mượn, đặt trước, tiền phạt và lịch sử của riêng bạn.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="Sách đang mượn"
          value={dangMuon.data ? String(dangMuon.data.length) : "—"}
          hint={soQuaHan ? `${soQuaHan} quá hạn` : undefined}
          icon={BookMarked}
          tone="green"
        />
        <MetricCard label="Tiền phạt chưa thanh toán" value={conNo === undefined ? "—" : formatVnd(conNo)} icon={WalletCards} tone="rose" />
        <MetricCard
          label="Đặt trước đang hoạt động"
          value={datHoatDong ? String(datHoatDong.length) : "—"}
          hint={sanSang ? `${sanSang} sẵn sàng nhận` : undefined}
          icon={ListFilter}
          tone="blue"
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => v && setTab(String(v))} className="min-w-0">
        <div className="overflow-x-auto">
          <TabsList variant="line" className="h-auto min-w-max border-b border-[#e4e8e2] pb-1">
            {SECTIONS.map((s) => (
              <TabsTrigger key={s.value} value={s.value} className="flex-none px-3 py-1.5 data-active:text-[#147d64]">
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {SECTIONS.map(({ value, desc, Panel }) => (
          <TabsContent key={value} value={value} className="pt-4">
            <p className="mb-4 text-sm text-[#5f6b64]">{desc}</p>
            <Panel />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
