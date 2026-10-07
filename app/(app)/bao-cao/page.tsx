"use client"

import { useState } from "react"

import {
  DanhMucSachPanel,
  DatTruocPanel,
  LichSuMuonPanel,
  MuonQuaHanPanel,
  NguoiDungViPhamPanel,
  SachDangMuonPanel,
  ThongKeTienPhatPanel,
  TopSachPanel,
} from "@/components/bao-cao/bao-cao-panels"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const REPORTS = [
  { value: "danh-muc-sach", label: "Danh mục sách", desc: "Mọi đầu sách và số bản đang sẵn sàng cho mượn (không tính bản mất/ngừng phục vụ).", Panel: DanhMucSachPanel },
  { value: "sach-dang-muon", label: "Đang mượn", desc: "Các lượt mượn chưa trả, kèm số ngày quá hạn.", Panel: SachDangMuonPanel },
  { value: "muon-qua-han", label: "Quá hạn", desc: "Phiếu mượn đã quá hạn kèm tiền phạt tạm tính nếu trả hôm nay.", Panel: MuonQuaHanPanel },
  { value: "nguoi-dung-vi-pham", label: "Vi phạm", desc: "Người dùng có phiếu phạt hoặc đang giữ sách quá hạn.", Panel: NguoiDungViPhamPanel },
  { value: "top-sach", label: "Top mượn nhiều", desc: "Xếp hạng sách theo số lượt được mượn.", Panel: TopSachPanel },
  { value: "tien-phat", label: "Tiền phạt", desc: "Thống kê tiền phạt theo tháng và loại phạt.", Panel: ThongKeTienPhatPanel },
  { value: "lich-su-muon", label: "Lịch sử mượn", desc: "Mọi lượt mượn, đang mượn lẫn đã trả; lọc theo mã người dùng.", Panel: LichSuMuonPanel },
  { value: "dat-truoc", label: "Đặt trước", desc: "Các lượt đặt trước và thứ tự hàng chờ.", Panel: DatTruocPanel },
]

export default function BaoCaoPage() {
    const [tab, setTab] = useState(REPORTS[0].value)

  return (
    <section className="mx-auto w-full min-w-0 max-w-6xl">
      <div className="mb-6 border-b border-border pb-5">
        <p className="text-xs font-medium text-muted-foreground">Báo cáo</p>
        <h2 className="mt-1.5 text-xl font-semibold text-foreground">Báo cáo thư viện</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Số liệu đọc trực tiếp từ các view của cơ sở dữ liệu; có thể xuất từng báo cáo ra CSV.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => v && setTab(String(v))} className="min-w-0">
        <div className="overflow-x-auto">
          <TabsList variant="line" className="h-auto min-w-max border-b border-border pb-1">
            {REPORTS.map((r) => (
              <TabsTrigger key={r.value} value={r.value} className="flex-none px-3 py-1.5 data-active:text-primary">
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {REPORTS.map(({ value, desc, Panel }) => (
          <TabsContent key={value} value={value} className="pt-4">
            <p className="mb-4 text-sm text-muted-foreground">{desc}</p>
            <Panel />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
