# TASKS — Cải thiện UI/UX và cấu trúc code FE (qltv_nhom8)

Nguồn: phân tích FE ngày 2026-10-07 (đọc code, chạy tsc/eslint, xem giao diện thật bằng ADMIN trên desktop và mobile).
Tóm tắt trạng thái và quy trình làm việc nằm trong agent memory (project `qltv_nhom8-fe`): `mem_muxyw9zn_1438417243a3` (trạng thái sau C4, 2026-10-07) và `mem_muxywa4r_5bb5a013aa87` (quy trình, quy tắc git). Bản cũ `mem_muxxlkqc_9e79ed7ac087` không còn trong kho.

## Cách dùng file này (cho session mới)

1. Đọc file này, chọn việc **Chưa thực hiện** theo thứ tự ưu tiên (nhóm P1 → P2 → P3).
2. Làm xong thì đổi `Trạng thái` của việc đó sang **Đã hoàn thành**, ghi ngày và một dòng kết quả kiểm chứng.
3. Trước khi làm: đọc `CLAUDE.md` và `AGENTS.md`. Next.js bản này có thay đổi so với kiến thức cũ, đọc `node_modules/next/dist/docs/` trước khi dùng API Next (việc này chưa được làm trong phân tích).
4. Sau mỗi đợt: chạy `npx tsc --noEmit` và `npx eslint` (hiện cả hai sạch), xem lại giao diện ở desktop và mobile 375px, rồi báo cáo và dừng chờ duyệt.
5. Quy tắc git (bắt buộc): **không** tự `git commit`/`git push`/stage; chỉ commit khi người dùng bảo trong tin nhắn hiện tại; nhánh `trongminh`; message ngắn tiếng Việt, **không** `Co-Authored-By` hay dấu hiệu AI; `yarn.lock` untracked không commit.
6. Môi trường: FE `npm run dev` cổng 3001, BE cổng 3000. Tài khoản demo xem `../user.md` (ADMIN `ad001`, THU_THU `cb001`, BAN_DOC `sv001`, tài khoản khóa `sv007`). Không chạy `npm run test:e2e` của BE trên DB làm việc.

## Tổng quan trạng thái

| ID | Việc | Ưu tiên | Trạng thái |
|---|---|---|---|
| T01 | Sửa lỗi lint `hooks/use-mobile.ts` | — | Đã hoàn thành |
| T02 | Sửa font (đang render Times thay vì Geist) | — | Đã hoàn thành |
| T03 | Độ tương phản chữ + cỡ chữ tối thiểu | — | Đã hoàn thành |
| U1 | Bỏ/làm thật ô tìm kiếm và chuông ở header | P1 | Một phần: tìm kiếm xong, chuông giữ nguyên |
| U2 | Bảng nhiều cột trên mobile (chế độ thẻ) | P1 | Đã hoàn thành (trừ `dashboard-overview` và `demo-table`, giữ có chủ ý) |
| U3 | Quy tắc sắp xếp và sort theo cột | P2 | Đã hoàn thành (sort theo cột chỉ cho bảng có đủ dữ liệu ở FE) |
| U4 | Biểu đồ "Lưu thông 14 ngày" bị nội suy cong | P2 | Đã hoàn thành |
| U5 | Lập phiếu mượn: tra cứu và xác nhận người mượn/bản sách | P2 | Đã hoàn thành |
| U6 | Thông báo động cho trình đọc màn hình (`aria-live`) | P3 | Đã hoàn thành |
| U7 | Kiểm tra lại bố cục sau đổi font ở các trang chưa xem | P1 | Đã hoàn thành |
| C1 | Phân quyền tập trung (`RoleGate`) | P1 | Đã hoàn thành |
| C2 | Phiên đăng nhập: hạn token, quay lại trang cũ sau 401 | P2 | Chưa thực hiện |
| C3 | Đưa màu hex cứng vào theme token | P2 | Đã hoàn thành |
| C4 | Tách component dùng chung (lặp code) | P2 | Đã hoàn thành (trừ `Avatar`) |
| C5 | Tầng API có kiểu: `openapi-fetch`, key factory, `.gitattributes` | P2 | Đã hoàn thành (chưa dọn `api-types.ts`) |
| C6 | Tách các trang quá lớn | P3 | Đã hoàn thành |
| C7 | Select giới hạn 100 dòng: combobox có lọc, gom mọi trang | P3 | Đã hoàn thành |
| C8 | Đổi route `/add-doc-gia` thành `/nguoi-dung/moi` | P3 | Đã hoàn thành |
| C9 | Metadata/`<title>` theo từng trang | P3 | Đã hoàn thành |
| C10 | Test, CI, formatter, lockfile | P3 | Chưa thực hiện |
| C11 | Form sửa chưa xóa trắng được trường tùy chọn | P3 | Đã hoàn thành |
| C12 | Báo cáo chưa link được sang người dùng | P3 | Đã hoàn thành |
| Q1 | Kiểm thử còn thiếu (THU_THU, 401, mobile…) | P1 | Đã hoàn thành (còn dialog Gia hạn) |
| B1 | Đề xuất sort mặc định phía BE (gửi người phụ trách BE) | P2 | Đã phân tích, chờ BE |
| B2 | Spec sai body `POST /dat-truoc` (trùng tên class `DatTruocDto`) | P3 | Chờ BE |

---

## Đã hoàn thành

### T01 — Lỗi lint `use-mobile`
- **Trạng thái:** Đã hoàn thành (2026-10-07), commit `78da42e`.
- `hooks/use-mobile.ts` viết lại bằng `useSyncExternalStore` + `matchMedia("(max-width: 767px)")`, server snapshot `false`. Lỗi `react-hooks/set-state-in-effect` hết; sidebar mobile mở đúng ở 375px.

### T02 — Font
- **Trạng thái:** Đã hoàn thành (2026-10-07), commit `de116f0`.
- Nguyên nhân: `app/layout.tsx` gắn class biến font vào `<body>` trong khi theme Tailwind đọc ở `<html>`, nên `font-family` rơi về Times.
- Sửa: chuyển `className={geistSans.variable} ${geistMono.variable}` sang `<html>`. Đã kiểm chứng `body`/`h2` là `Geist` và face tiếng Việt (`U+1EA0–1EF9`) đã tải.

### T03 — Độ tương phản và cỡ chữ
- **Trạng thái:** Đã hoàn thành (2026-10-07), commit `9a34554` (37 file, chỉ đổi class màu/cỡ chữ).
- Mục tiêu AA 4,5:1. Bảng thay màu (chỉ đổi màu chữ, giữ nguyên icon trang trí vì chuẩn chỉ cần 3:1):
  - chữ phụ `#758078/#738078/#78847d/#68756e` → `#5f6b64`
  - chữ nhạt `#87918b/#8a948e/#9aa59e/#9ca69f` (và nhãn nhóm sidebar, mã tác giả) → `#66736c`
  - chữ lỗi và dấu `*` `#bb6759/#a95245` → `#a35143`
  - cam cảnh báo `#bd713c/#a66739` → `#975e34`
  - pill xanh lá `#147d64` trên `#e6f3ee`/`#e6f3ed` → `#0f6a52`; pill xanh dương `#537687` → `#456a7c`
  - cỡ chữ `text-[10px]` → `text-[11px]`, `text-[11px]` → `text-xs`
- Dấu `/` breadcrumb thêm `aria-hidden`. Header: `Thư viện` có `whitespace-nowrap`, tên người dùng có `max-w-40 truncate` (Geist rộng hơn Times nên trước đó bị xuống dòng).
- Khi làm C3, **dùng lại các màu trên làm giá trị token** để không mất độ tương phản.
- Chưa kiểm: còn vài icon trang trí dưới 3:1 trên nền `#f6f7f4` (ví dụ `#8b9690`, `#89938d`), hợp lệ nhưng có thể tăng nếu muốn.

---

## Chưa thực hiện — UI/UX

### U1 — Ô tìm kiếm và chuông giả ở header (P1)
- **Trạng thái:** Một phần (2026-10-07), commit `bc4c915`. Tìm kiếm đã làm thật; chuông **giữ nguyên theo ý người dùng** (chấm đỏ vẫn là giả, sẽ làm sau).
- `components/dashboard/global-search.tsx`: ô tìm kiếm mở hộp tìm nhanh (nút ở header, `Ctrl/⌘ + K`; dưới `md` là nút kính lúp). Chỉ FE, dùng endpoint có sẵn: `GET /sach?tuKhoa` (ai cũng tìm được), `GET /docgia?tuKhoa&limit=6` (chỉ staff), `GET /phieu-muon/{ma}` khi gõ đúng dạng `PM…` (staff). Mũi tên chọn, Enter mở, mỗi nhóm hiện tối đa 6 kết quả kèm link sang trang danh sách.
- **Chỉ tìm khi bấm Enter, không tìm theo từng phím:** `sp_tra_cuu_sach` ghi mỗi lượt tra cứu sách vào `nhat_ky_hanh_vi` (`TRA_CUU`), tìm khi đang gõ sẽ ghi cả từ khóa dở dang. Khi đang sửa từ khóa, kết quả cũ bị làm mờ và hiện gợi ý "Nhấn Enter để tìm".
- `hooks/use-debounced.ts` tách từ `demo-runner.tsx` (còn dùng ở đó).
- Lưu ý BE: tìm sách khá rộng (LIKE + FULLTEXT), từ khóa vô nghĩa như `javaminh` vẫn ra 7 sách; không phải việc của FE.
- Chuông (`library-dashboard.tsx`): nếu làm thật thì xem phương án trong lịch sử trao đổi: suy ra từ `/me/*` và `/bao-cao/*` (chỉ FE) hoặc bảng `thong_bao` ở CSDL (cần BE).

### U2 — Bảng nhiều cột trên mobile (P1)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- `components/data-table.tsx`: `DataTable<T>` dùng chung, nhận `query`, `rows`, `columns: DataColumn<T>[]`, `rowKey`, `errorText`, `emptyText`. Từ `md` là bảng như cũ (cùng class); dưới `md` mỗi dòng thành thẻ: cột `title` (mặc định cột đầu) làm tiêu đề, các cột còn lại là cặp nhãn/giá trị, cột `actions` nằm cuối thẻ (ẩn nếu rỗng). Gồm trạng thái tải/lỗi/rỗng cho cả hai chế độ. Hai chế độ render bằng CSS (`hidden md:block` / `md:hidden`), không dùng `useIsMobile` nên không nháy khi hydrate.
- Đã áp dụng: `/sach`, `/nguoi-dung`, `/phieu-muon`, `/dat-truoc` (cột "Người đặt" chỉ staff), `/phat`, và `components/report-table.tsx` (nên `/bao-cao` và `/me` cũng có thẻ). `Column` của `ReportTable` có thêm `title`/`actions`; đã đánh dấu `title` ở cột "Sách"/"Tên sách" và `actions` ở hai cột "Thao tác" của `/me`.
- Kiểm chứng: `tsc` + `eslint` sạch; ở 375px `/sach`, `/phat`, `/phieu-muon`, `/dat-truoc`, `/nguoi-dung`, `/bao-cao` không tràn ngang (`scrollWidth` = `clientWidth`), bảng ẩn, thẻ hiện; `/dat-truoc` có nút Hủy trong thẻ; ở desktop vẫn là bảng, danh sách thẻ ẩn.
- **Đồng bộ đợt 2 (2026-10-07, chưa commit):** áp dụng `DataTable` cho các bảng còn lại: `components/danh-muc/danh-muc-page.tsx` (thể loại, tác giả, NXB; `DanhMucColumn` nay là `DataColumn`, cột tên đánh dấu `title`, cột "Thao tác" là `actions`), `components/sach/ban-sach-panel.tsx` (ô Tình trạng là `Select` trong cột) và bảng "Sách trong phiếu" ở `phieu-muon/[maPhieu]` (tên sách làm tiêu đề thẻ, nút Gia hạn/Trả ở cuối thẻ). `DataTable` có thêm: `query` **tùy chọn** (dữ liệu đã có sẵn thì bỏ, coi như đã tải xong) và `embedded` (bảng nằm trong khung có viền riêng, bỏ viền kép ở desktop, thẻ mobile có đệm).
- Giữ nguyên có chủ ý: `dashboard-overview.tsx` (bảng nhỏ kiểu riêng, đã ẩn cột `Tên sách` dưới `md`, 4 cột còn lại vừa 375px) và `demo-table.tsx` (bảng dữ liệu thô, cần cuộn ngang).
- Kiểm chứng đợt 2: `tsc` + `eslint` sạch. THU_THU: desktop `/the-loai` như cũ; 375px `/the-loai` ra thẻ (tên làm tiêu đề, Mã/Mô tả, nút Sửa), `/sach/7` thẻ bản sách có ô Tình trạng, `/phieu-muon/PM000015` (có phạt) và `PM000007` (đang mượn, có nút Gia hạn/Trả) đều không tràn ngang. Chưa bấm thật nút Gia hạn/Trả/Đổi tình trạng/Xóa trong thẻ, chưa xem ADMIN (nút Xóa) và `/tac-gia`, `/nha-xuat-ban` ở mobile.
- Lưu ý: `DataTable` render cả bảng lẫn thẻ nên ô `Select` ở `ban-sach-panel` có hai bản trong DOM (một bản `display:none`).

### U3 — Quy tắc sắp xếp (P2)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- **Kiểm tra BE:** không endpoint nào có tham số sắp xếp (`openapi.json` chỉ có `page`, `limit`, lọc), thứ tự là `ORDER BY` cố định trong BE. `/sach` xếp theo `ten_sach`, danh mục theo tên, `/docgia` theo mã, `/phieu-muon`, `/phat`, `/dat-truoc` theo `id` giảm dần (mới nhất trước); `/bao-cao/nguoi-dung-vi-pham` **không có** `ORDER BY`.
- **Bảng phân trang phía BE** (`/sach`, `/nguoi-dung`, `/phieu-muon`, `/dat-truoc`, `/phat`, danh mục): **không** làm sort theo cột, vì chỉ sắp xếp được trong 1 trang thì gây hiểu nhầm. Thay vào đó nêu rõ quy tắc ở chân bảng qua `Pager` (`order`): "Xếp theo tên sách A–Z", "mã người dùng", "mới nhất trước", "tên A–Z". Ở `/sach` đã đưa cột "Tên sách" lên đầu (trước đó cột đầu là Mã trong khi dữ liệu xếp theo tên nên nhìn như lộn xộn). Chân bảng `/sach`, `/nguoi-dung`, danh mục đổi sang dùng `Pager` chung.
- **Bảng có đủ dữ liệu ở FE** (`components/report-table.tsx`: `/bao-cao` và `/me`): sort theo cột phía FE. Bấm tiêu đề cột: tăng dần → giảm dần → về thứ tự mặc định của BE. `Column` có thêm `sortBy` (khóa sắp xếp khi khác `value`, bắt buộc cho cột ngày vì `value` là chuỗi dd/MM/yyyy; dùng ISO) và `sortable: false`; cột `actions` không sắp xếp. So sánh dùng `Intl.Collator("vi", { numeric: true })` (S2 < S10, tiếng Việt đúng dấu), ô trống luôn xếp cuối ở cả hai chiều. `defaultOrder` khai báo thứ tự BE đang trả để hiện mũi tên mờ trên cột tương ứng (và `aria-sort`): Danh mục sách = Tên sách ↑, Đang mượn = Hạn trả ↑, Quá hạn = Quá hạn ↓, Top sách = Lượt mượn ↓, Thống kê phạt = Tháng ↓, Lịch sử mượn = Ngày mượn ↓; `/me`: Đang mượn = Hạn trả ↑, Tiền phạt = Ngày tạo ↓, Lịch sử = Ngày mượn ↓. Báo cáo "Người dùng vi phạm" và "Đặt trước" không khai báo vì BE không nêu rõ thứ tự. Xuất CSV theo thứ tự đang hiển thị. Cột "Hạng" của Top sách giữ hạng gốc khi sắp xếp lại.
- **Mobile:** tiêu đề cột nằm trong bảng bị ẩn nên có ô chọn "Sắp xếp theo" (Thứ tự mặc định + các cột) kèm nút đổi chiều, ngay trong thanh công cụ của `ReportTable` (chỉ hiện dưới `md`). `DataTable` có thêm `DataColumn.sort` để vẽ tiêu đề dạng nút.
- **Kiểm chứng:** `tsc` + `eslint` sạch. Trên trình duyệt: Danh mục sách mặc định Tên sách ↑ (`aria-sort`), bấm Mã sách → S001…S015, giảm dần → S015…S001, bấm lần ba về thứ tự mặc định đúng như cũ; Lịch sử mượn sort theo Ngày trả đúng thứ tự thời gian cả hai chiều, các ô "—" luôn ở cuối; mobile: chọn "Mã sách" ra S001, S002… và có nút đổi chiều.
- **Phía BE:** phân tích thứ tự mặc định nên đổi ở từng endpoint nằm ở mục **B1** bên dưới.

### U4 — Biểu đồ "Lưu thông 14 ngày" (P2)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- `components/dashboard/dashboard-overview.tsx`: đổi `AreaChart` (nội suy `monotone`) sang `BarChart` cột nhóm (mượn/trả mỗi ngày một cặp cột, `maxBarSize` 14, bo góc trên), bỏ gradient. Trục Y tối thiểu 0–2 để dữ liệu thưa (0–1) không bị kéo giãn, nhãn trục X/Y đổi `#87918b` → `#66736c` (đúng T03), tooltip dạng chấm, chú giải dùng ô vuông bo nhẹ thay chấm tròn.
- **Thêm (theo yêu cầu người dùng):** nút chuyển loại biểu đồ "Cột" / "Vùng" ở góc phải tiêu đề thẻ (`Tabs` + `ChartColumn`/`ChartArea`), mặc định **Cột**; "Vùng" là `AreaChart` cũ (nội suy `monotone`). Trạng thái chọn chỉ nằm trong state, không nhớ giữa các lần tải trang. Đã bấm thử trên trình duyệt: Cột ⇄ Vùng đổi đúng.
- `bao-cao-panels.tsx` vốn đã là biểu đồ cột (Top sách, Thống kê phạt), không cần sửa.
- Kiểm chứng: `tsc` + `eslint` sạch; desktop 1024px hiện cột đúng ngày; mobile 375px không tràn ngang (`scrollWidth` = `clientWidth`), biểu đồ cao 230px. Ở mobile nhãn trục X được thưa bớt (`equidistantPreserveStart`), xem ngày chính xác qua tooltip.

### U5 — Lập phiếu mượn (P2)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- `app/(app)/phieu-muon/moi/page.tsx` chỉ còn giữ mutation và nút lập phiếu; hai ô nhập tách ra:
  - `components/phieu-muon/nguoi-muon-picker.tsx`: gõ ≥ 2 ký tự (debounce 300ms) gọi `GET /docgia?tuKhoa&limit=6` (mã, họ tên, email), chọn từ danh sách hoặc Enter khi mã khớp đúng / chỉ còn 1 kết quả. Sau khi chọn hiện thẻ xác nhận (họ tên, mã, loại, khoa/đơn vị, trạng thái) và nút "Đổi". Người dùng không `HOAT_DONG` có cảnh báo `role="alert"` và nút Lập phiếu bị khóa.
  - `components/phieu-muon/ban-sach-picker.tsx`: giữ luồng "nhập mã rồi Enter" (máy quét), thêm gợi ý khi gõ mã hoặc tên sách (không phân biệt dấu, tối đa 8, chỉ bản `SAN_SANG`/`DANG_GIU`, bỏ bản đã chọn). Mỗi bản đã thêm hiện tên sách, mã, kệ, tác giả. Mã không tồn tại, hoặc bản đang mượn/hư hỏng/mất/ngừng phục vụ, bị chặn ngay bằng toast; bản `DANG_GIU` vẫn cho thêm vì có thể giữ cho đúng người mượn (BE quyết định). Nếu chưa tải được danh sách bản sách thì vẫn nhập mã được, BE kiểm tra khi lập phiếu.
  - `lib/ban-sach-index.ts` (`useBanSachIndex`): BE **không có** endpoint tra bản sách theo mã, nên FE ghép `GET /sach` (không `tuKhoa`, không ghi nhật ký TRA_CUU) + `GET /sach/{id}/ban-sach` từng đầu sách (8 yêu cầu song song), cache 30s, khóa `["/sach","ban-sach-index"]` nên bị làm mới sau khi lập phiếu. Với 15 đầu sách là 16 yêu cầu; dữ liệu lớn sẽ chậm.
- **Đề xuất BE:** thêm `GET /ban-sach/{maBanSach}` (kèm tên sách) hoặc `GET /ban-sach?tuKhoa&tinhTrang`; khi có thì FE bỏ `useBanSachIndex` và tra theo từng mã.
- **Kiểm chứng:** `tsc` + `eslint` sạch. Trên trình duyệt (ADMIN): gõ `sv00` ra 6 người; `SV007` + Enter hiện thẻ "Tạm khóa" kèm cảnh báo, nút Lập phiếu bị khóa; `SV001` + Enter chọn được; gõ `lap trinh` (không dấu) gợi ý BS007, BS020 "Lập trình Python"; chọn BS020 thêm vào danh sách kèm kệ A2-03 và tác giả; `bs999` + Enter báo "Không tìm thấy bản sách"; 375px không tràn ngang. **Chưa bấm "Lập phiếu" thật** (ghi dữ liệu) và chưa thử bản đang mượn.

### U6 — Thông báo động cho trình đọc màn hình (P3)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- **Khảo sát:** toast của Base UI đã có sẵn `role="region" aria-live="polite"` ở viewport nên thông báo thường vốn đọc được; thiếu nằm ở chỗ khác.
- **Toast** (`components/ui/toast.tsx`): `toast.add` bọc lại để toast `type: "error"` mặc định `priority: "high"` (`alertdialog`, đọc ngay thay vì xếp hàng); nhãn nút đóng đổi "Close toast" → "Đóng thông báo".
- **`DataTable`:** thêm một vùng `sr-only` (`role="status"`, đổi sang `role="alert"` khi lỗi) dùng chung cho bảng và thẻ: "Đang tải dữ liệu" / thông báo lỗi / emptyText / "N dòng"; `aria-busy` khi đang tải. Bỏ `role="alert"` ở đoạn lỗi riêng của chế độ thẻ để không đọc trùng.
- **`Pager`:** "Trang x / y" có `aria-live="polite"`, nên đổi trang được đọc (số dòng giữa các trang giống nhau thì vùng của `DataTable` không đổi chữ).
- **`ReportTable`:** vùng `role="status"` đọc "Đang sắp xếp theo <cột>, tăng dần/giảm dần" hoặc "Thứ tự mặc định" khi đổi sắp xếp.
- **Thêm `role="alert"`/`status`:** lỗi tải biểu đồ và bảng ở `dashboard-overview` (skeleton biểu đồ có `role="status"`, nhãn "Đang tải biểu đồ"), lỗi ở `sach/[id]`, `nguoi-dung/[id]`, `phieu-muon/[maPhieu]`, `demo` (danh sách, chi tiết, bảng, chạy; kết quả demo thất bại là `alert`, thành công là `status`), `sach-form` (tải tác giả), `ban-sach-panel` và `danh-muc-page` (đặt `role="alert"` trên `span` bên trong ô, không đặt trên `td` để khỏi phá ngữ nghĩa bảng), `AuthGuard` spinner (`role="status"`).
- **Lập phiếu mượn (U5):** `NguoiMuonPicker` đọc "N người phù hợp"/"không tìm thấy" và "Đã chọn người mượn …"; `BanSachPicker` đọc số gợi ý, "Đã thêm BSxxx, <tên sách>. Phiếu có N cuốn" và "Đã bỏ …".
- **Kiểm chứng:** `tsc` + `eslint` sạch. Trên trình duyệt: `/sach` có vùng `role="status"` "15 dòng" và `aria-busy="false"`; `/phieu-muon/moi` thêm `bs999` hiện toast cảnh báo, nút đóng "Đóng thông báo", vùng status "Không có gợi ý".
- **Chưa kiểm:** chưa nghe bằng trình đọc màn hình thật (VoiceOver/NVDA), chưa tạo lỗi thật để xem toast lỗi `priority: "high"` có đọc ngay, và chưa soát các dialog xác nhận khác ngoài những chỗ trên.

### U7 — Kiểm tra bố cục sau đổi font (P1)
- **Trạng thái:** Đã hoàn thành (2026-10-07), commit `bcbe6ff`.
- Đã xem bằng ADMIN ở 1000px, 1280px và 375px: `/phieu-muon` (+`moi`, `PM000015`), `/dat-truoc`, `/demo` (đủ 5 bước, SQL, bảng), `/me`, `/nguoi-dung/13`, `/sach/7`, `/sach/moi`, `/add-doc-gia`, `/tac-gia`, `/the-loai`, `/nha-xuat-ban`, dialog thêm tác giả và đặt trước hộ (mobile), `/login` (mobile). Không trang nào tràn ngang (`scrollWidth` = `clientWidth`).
- Lỗi tìm thấy và đã sửa: ở `/phieu-muon/[maPhieu]` ô "Phạt" bị bóp, số tiền "Trả quá hạn 15.000 đ" xuống 5 dòng ở 1000px. Sửa: số tiền `whitespace-nowrap`, hàng phạt `flex-wrap`.
- Còn lại, không phải lỗi bố cục mới: bảng ở mobile cuộn ngang trong khung (đúng việc U2); tab ở `/demo` và `/me` cuộn ngang trên mobile, tab cuối bị cắt không có gợi ý; tên người mượn xuống 2 dòng ở `/phieu-muon`, `/dat-truoc` ở 1000px (chấp nhận được).
- Chưa xem: dialog "Trả sách nhanh"/"Gia hạn" và các dialog sửa ở desktop, `/login` ở desktop.

## Chưa thực hiện — Cấu trúc code

### C1 — Phân quyền tập trung (P1)
- **Trạng thái:** Đã hoàn thành (2026-10-07), commit `3a6b90c`.
- `lib/navigation.ts`: thêm `getRouteRoles(pathname)`, quyền lấy từ `roles` của mục menu (khớp tiền tố dài nhất, có tính `PATH_ALIASES`) cộng `ROUTE_ROLES_EXTRA` cho trang con hẹp quyền hơn trang cha (hiện chỉ `/sach/moi`).
- `components/auth/role-gate.tsx`: `RoleGate` bọc `children` trong `app/(app)/layout.tsx`; không đủ quyền thì hiện thông báo `role="alert"` kèm link về `/me`. Đã xóa 10 khối `if (…!isStaff) return <p>` ở các trang và `dashboard-overview`.
- Khi thêm route mới: khai báo `roles` ở mục menu, hoặc thêm vào `ROUTE_ROLES_EXTRA` nếu route không có mục menu.
- Kiểm chứng: `tsc` + `eslint` sạch; BAN_DOC bị chặn ở `/`, `/nguoi-dung`, `/nguoi-dung/1`, `/add-doc-gia`, `/phieu-muon`, `/phieu-muon/moi`, `/phat`, `/bao-cao`, `/demo`, `/sach/moi`, vẫn vào được `/sach`, `/dat-truoc`, `/me`; THU_THU vào được `/`, `/demo`, `/sach/moi`, `/add-doc-gia`.
- Giới hạn: thao tác ghi vẫn dựa vào BE (403); `isStaff`/`isAdmin` trong trang chỉ còn để ẩn/hiện nút và bật `enabled` của query.

### C2 — Phiên đăng nhập (P2)
- **Trạng thái:** Chưa thực hiện
- Token ở localStorage (key `qltt.session`), guard chỉ ở client, chưa kiểm tra hạn token, 401 giữa phiên đá về `/login` mà không nhớ trang cũ. Cân nhắc: kiểm hạn token, tham số quay lại trang cũ, ghi rõ rủi ro lưu localStorage trong tài liệu. Cần test 401 giữa phiên (đăng nhập, khóa tài khoản từ ADMIN, thao tác tiếp).

### C3 — Theme token màu (P2)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt). Hex trong `app`/`components`/`lib` giảm từ 559 xuống 19.
- `app/globals.css`: `:root` đổi từ theme neutral của shadcn sang bảng màu của app, dùng đúng các giá trị đã kiểm tương phản ở T03. Token shadcn: `primary` `#147d64` (+ `ring`, `chart-1`, `sidebar-primary`), `foreground` `#1c2c26`, `muted-foreground` `#5f6b64`, `border` `#e4e8e2`, `input` `#dfe5df`, `destructive` `#a35143`, `muted`/`secondary`/`accent` `#f2f4f1`, `chart-1..5`. Token riêng (có class Tailwind): nền `canvas` `#f6f7f4`, `surface`, `surface-hover`, `line`, `neutral-soft`; chữ `heading`, `ink`, `faint` `#66736c`, `icon` `#8b9690` (chỉ icon trang trí); trạng thái `primary-hover`/`primary-strong`/`primary-soft`, `destructive-soft`, `warning`/`warning-soft`, `clay`/`clay-soft`, `info`/`info-soft`. Khối `.dark` giữ nguyên mặc định shadcn (app chưa có chế độ tối).
- **Thay thế bằng script** (`bg|text|border*|ring|divide|outline|fill|stroke|from|via|to…-[#hex]` → token, giữ nguyên hậu tố độ trong suốt): 544 chỗ ở 44 file. Các hex gần nhau được gộp (ví dụ 5 màu viền `#e4e8e2/#e7e9e4/…` → `border`, 4 nền nhạt → `surface`, 3 chữ đậm → `ink`; chênh lệch ≤ vài đơn vị RGB và chỉ gộp về màu đậm hơn hoặc bằng khi là chữ).
- **Button:** biến thể `default` giờ là `bg-primary text-primary-foreground hover:bg-primary-hover` nên bỏ lớp `bg-… text-white hover:bg-…` lặp ở 19 nút. Vòng focus (`ring`) của mọi input/nút chuyển từ xám sang xanh lá.
- **Biểu đồ:** màu cột/đường dùng `var(--chart-1)` (xanh) và `var(--chart-2)` (cam `#e99a68`), lưới `var(--line)`, nhãn trục `var(--faint)`; tiện thể sửa nhãn trục `#87918b` (dưới 4,5:1) ở `/bao-cao` lên `#66736c`.
- **Hex lẻ cuối cùng (2026-10-07, chưa commit):** đã hết hex trong class (chỉ còn selector recharts của shadcn trong `components/ui/chart.tsx`, không phải màu). Token mới ở `globals.css`: `hold`/`hold-soft` (`#3a5fb0`/`#e8eefb`, "Đang giữ" và "Chờ xử lý"), `lost`/`lost-soft` (`#8c3b3b`/`#f1e6e6`, "Mất"), `sand`/`sand-soft` (`#845c35`/`#f3e8d8`, avatar), `primary-border` (`#bfe0d2`) và `destructive-border` (`#efc9c2`) cho hộp kết quả demo. Tương phản chữ/nền mới: hold 5,24:1, lost 6,14:1, sand 4,87:1. Các chỗ gộp vào token có sẵn (có đổi nhẹ màu): dấu `/` breadcrumb `#b2bab5` → `text-icon`; chấm đỏ chuông `#d16b53` → `bg-destructive`; chữ pill "Đã trả" `#35755f` → `text-primary-strong` (đậm hơn); icon khiên `#668f7c` → `text-primary/60`; hover link `#0e634f` → `text-primary-hover`.
- **Kiểm chứng:** `tsc` + `eslint` sạch; xem trên trình duyệt `/`, `/phat`, `/bao-cao`, dialog đặt trước: bố cục và màu giữ như cũ, vòng focus ô nhập đổi sang xanh. Chưa xem lại toàn bộ trang (login, `/me`, `/demo`, mobile) và chưa đo lại tương phản bằng công cụ sau khi gộp màu.

### C4 — Component dùng chung (P2)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt). Ghi chú cũ về phân trang viết tay đã lỗi thời: `Pager` đã dùng thống nhất từ U3.
- **Component mới:**
  - `components/page-header.tsx` `PageHeader({ eyebrow | back, title, description, action, className })`: thay khối tiêu đề trang lặp ở 15 nơi (12 trang/`DanhMucPage` và 3 trang chi tiết dùng `back` + `className="mb-0"`; `mb-7` ở 3 trang form thống nhất thành `mb-6`).
  - `components/info-item.tsx` `InfoItem`: thay `Info()` ở 3 trang chi tiết.
  - `components/search-form.tsx` `SearchForm({ value, onChange, onSubmit, label, placeholder, maxLength, submitLabel, className, fieldClassName, children })`: ô tìm/lọc + nút gửi (không gọi API mỗi lần gõ), dùng ở `/sach`, `/nguoi-dung`, `/phat`, `/dat-truoc`, `/phieu-muon`. `MaNguoiDungFilter` trong `bao-cao-panels.tsx` giữ riêng (nút cỡ `sm`, ô `w-64`).
  - `components/confirm-dialog.tsx` `ConfirmDialog({ open, onClose, title, description, confirmLabel, cancelLabel, destructive, pending, onConfirm })`: thay 7 `AlertDialog` (xóa sách, danh mục, hủy phiếu/đặt trước, thu tiền, đổi trạng thái người dùng, hủy đặt trước ở `/me`). Không đóng được khi `pending`.
  - `components/form/text-field.tsx` `TextField({ control, name, label, required, id, ...inputProps })`: `Controller` + `Field` + `FieldLabel` + `Input` + `FieldError` cho ô nhập một dòng; dùng ở `nguoi-dung-form` (5), `sach-form` (4), `ban-sach-panel` (2), `nguoi-dung/[id]` (1), `login` (2). Select, Textarea, Checkbox và các ô có `FieldDescription` vẫn viết `Controller` trực tiếp.
- **Hằng/hàm:** `lib/constants.ts` `PAGE_SIZE = 20` (thay 6 bản khai báo; `report-table.tsx` giữ `PAGE_SIZE = 15` riêng vì phân trang phía FE); `initials()` chuyển sang `lib/format.ts` (thay 2 bản).
- **Chưa làm:** `Avatar` (chỉ còn là `<div>` chữ cái đầu ở sidebar và header, tách `initials` là đủ); `TextareaField`/`SelectField` (mỗi loại chỉ 1–3 chỗ).
- **Kiểm chứng:** `tsc` + `eslint` sạch. Trên trình duyệt (THU_THU): `/nguoi-dung`, `/phieu-muon` (tiêu đề + 2 nút + ô lọc), `/sach/7` (nút quay lại, hộp xác nhận xóa, form sửa với `TextField`) hiển thị đúng. Chưa bấm xác nhận thật ở các hộp thoại, chưa thử lỗi validate của `TextField`, `/login`, `/dat-truoc`, `/phat` và mobile.

### C5 — Tầng API có kiểu (P2)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt). Gỡ `axios`, thêm `openapi-fetch` (`^0.17`).
- **Lõi** (`lib/api.ts`): `api = createClient<paths>({ baseUrl: "/backend" })` kiểm đường dẫn, tham số, body và kiểu trả về theo `lib/api-types.ts`. Middleware gắn `Authorization` và xóa phiên khi 401 (trừ `/auth/login`). `unwrap(result)` lấy `data` hoặc ném `ApiError { status, message }` (400 nối mảng thông báo, 422 giữ nguyên thông báo DB); `isApiError(error, status?)` thay `axios.isAxiosError`; `getApiErrorMessage` nhận `ApiError`, lỗi mạng (`TypeError` của fetch) cho thông báo "Không thể kết nối". `QueryOf<"/đường-dẫn">` lấy kiểu tham số query từ spec.
- **Cấu trúc:** `features/<module>/api.ts` (hàm gọi BE có kiểu) và `features/<module>/queries.ts` (key factory + `queryOptions`). Module: `auth`, `sach` (kèm bản sách và `ban-sach-index.ts`), `nguoi-dung`, `danh-muc` (thể loại, NXB, tác giả), `phieu-muon`, `muon-tra`, `dat-truoc`, `phat`, `me`, `bao-cao`, `demo`. Đã chuyển `lib/me.ts`, `lib/bao-cao.ts`, `lib/demo.ts`, `lib/ban-sach-index.ts` vào đây. Thiếu thư mục `schemas`: schema zod của form vẫn nằm cạnh form.
- **Key factory:** mỗi module có khóa gốc (`sachKeys.all = ["sach"]`, `phieuMuonKeys.all`, `datTruocKeys.all`, `phatKeys.all`, `nguoiDungKeys.all`, `meKeys.all`, `baoCaoKeys.all`, `danhMucKeys.all(kind)`, `demoKeys.all`). Làm mới sau mutation dùng `queryClient.invalidateQueries({ queryKey: xxxKeys.all })`. Khóa của sách bao cả bản sách và chỉ mục bản sách. **Tìm kiếm toàn cục dùng khóa riêng `["search", …]`** để làm mới sách không tra cứu lại từ khóa cũ (mỗi lượt tra cứu `/sach?tuKhoa` bị BE ghi `TRA_CUU`).
- **Danh mục:** `DanhMucConfig<T, TCreate>` nhận `kind` và `api` thay cho `endpoint`; tên trường trong `fields` phải là khóa của DTO tạo mới. Nội dung gửi là `Partial<TCreate>` (form đã bắt buộc các trường bắt buộc) nên có một chỗ ép kiểu ở `features/danh-muc/api.ts`.
- **Bắt được nhờ kiểu:** lọc theo trạng thái ở `/nguoi-dung`, `/phieu-muon`, `/dat-truoc`, `/phat`, báo cáo "Đặt trước" trước đây là `string` tự do, nay là `Enum | "ALL"` (ép kiểu một chỗ ở `onValueChange`, vì giá trị lấy từ mảng hằng có kiểu).
- **Ngoại lệ có chủ ý:** `datTruocApi.create` ép body qua `unknown` vì spec sinh sai (xem **B2**).
- **`.gitattributes`:** `lib/api-types.ts linguist-generated=true`.
- **Chưa làm:** chưa cắt `paths`/`operations` thừa khỏi `api-types.ts` (vẫn ~6000 dòng, chỉ `import type` nên không vào bundle; `openapi-fetch` cần `paths` nên chỉ cắt được `operations`). Chưa viết test.
- **Kiểm chứng:** `tsc` + `eslint` sạch. Trên trình duyệt (THU_THU `cb001`): danh sách `/sach`, `/nguoi-dung`, `/phieu-muon`, `/phat`, `/dat-truoc`, `/the-loai`, chi tiết `/sach/7`, `/nguoi-dung/12`, `/nguoi-dung/13`, `/phieu-muon/PM000015`, `/bao-cao` (tab Top có `?limit=10`), `/demo`, `/me`, `/sach/moi` (ba danh sách chọn) đều tải đúng; 404 ở `/sach/99999`, `/nguoi-dung/9999`, `/phieu-muon/PM999999` hiện "Không tìm thấy…" (qua `isApiError`); thêm thể loại trùng mã `TL01` trả 409 và hiện toast lỗi; đặt trước hộ mã `ZZ999` trả 422 với thông báo BE nguyên văn (xác nhận body đặt trước được BE chấp nhận). Không ghi dữ liệu thật.
- **Chưa kiểm:** các mutation ghi thành công (lập phiếu, trả sách, gia hạn, thu/hủy phạt, đổi trạng thái/tạo tài khoản, nhập bản sách, sửa/xóa sách và danh mục, đổi tình trạng bản), tìm kiếm toàn cục (mỗi lần thử sẽ ghi `TRA_CUU`), đăng nhập/đăng xuất và 401 giữa phiên sau khi đổi middleware, chạy `npm run build`.

### C6 — Tách trang quá lớn (P3)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt). Chỉ di chuyển code, không đổi hành vi.
- `app/(app)/nguoi-dung/[id]/page.tsx` 401 → 92 dòng; tách thành `components/nguoi-dung/trang-thai-card.tsx`, `tai-khoan-card.tsx`, `tao-tai-khoan-dialog.tsx`. Kiểu `NguoiDungChiTiet`, `TaiKhoanCongKhai` đưa vào `nguoi-dung-meta.ts`.
- `app/(app)/dat-truoc/page.tsx` 313 → 213 dòng; hộp "Đặt trước" ra `components/luu-thong/dat-truoc-dialog.tsx`.
- `app/(app)/phat/page.tsx` 276 → 218 dòng; hộp hủy phạt ra `components/luu-thong/huy-phat-dialog.tsx`.
- Kiểm chứng: `tsc` + `eslint` sạch; `/nguoi-dung/12` hiển thị đủ thẻ trạng thái và tài khoản, hộp "Đặt trước hộ" mở và tải danh sách sách. Chưa mở hộp "Tạo tài khoản" và "Hủy phiếu phạt" (chỉ ADMIN).

### C7 — Select giới hạn 100 dòng (P3)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- **Khảo sát BE:** `/the-loai`, `/nha-xuat-ban`, `/tac-gia` chỉ có `page`/`limit`, **không có `tuKhoa`** nên không tìm phía server được; `/sach?tuKhoa` có nhưng mỗi lượt bị ghi `TRA_CUU` (xem U1). Vì vậy chọn cách: gom mọi trang rồi lọc ở FE, hết bị cắt ở 100 dòng.
- `lib/paging.ts` `fetchAllPages(fetchPage)`: gọi từng trang `limit=100` đến khi đủ `total`. Đã dùng lại ở `useBanSachIndex` (thay vòng lặp riêng).
- `danhMucQueries.options` (thể loại, NXB, tác giả) và `sachQueries.options()` (khóa mới `sachKeys.options`, dưới `sachKeys.all` nên làm mới cùng sách) đều gom mọi trang.
- `components/ui/combobox.tsx` `Combobox({ id, name, options, value, onValueChange, placeholder, emptyText, invalid, clearable })`: dựng trên `@base-ui/react/combobox`, giá trị là chuỗi `value`, lọc không phân biệt hoa thường và dấu (`locale="vi"`), là ô nhập thật nên `<label htmlFor>` hoạt động. Dùng ở `sach-form` (thể loại, NXB) và `dat-truoc-dialog` (chọn sách, nhãn kèm "còn N bản / hết bản").
- Tác giả ở `sach-form` là danh sách checkbox (chọn nhiều, tối đa 20): thêm ô lọc theo tên/mã (không dấu); tác giả đã chọn nhưng bị ẩn bởi bộ lọc vẫn giữ trong form.
- `boDau()` chuyển sang `lib/format.ts` (trước là `bo_dau` trong `ban-sach-picker.tsx`).
- **Giới hạn:** tải trọn danh sách mỗi lần mở form/hộp thoại (cache 60s danh mục, 30s sách); hàng nghìn dòng sẽ chậm. Khi đó cần BE thêm `tuKhoa` cho ba danh mục và tìm sách không ghi nhật ký, rồi đổi `Combobox` sang `onInputValueChange` gọi API.
- **Kiểm chứng:** `tsc` + `eslint` sạch. `fetchAllPages` với 0/1/100/101/250 dòng giả ra đủ. Trên trình duyệt (THU_THU): `/sach/moi` gõ `cong nghe` ra "Công nghệ thông tin", chọn xong ô hiện nhãn và giá trị gửi là `TL01`; `/sach/7` mở sửa hiện đúng thể loại/NXB hiện có; lọc tác giả gõ `nguyen` còn 2 người; hộp "Đặt trước hộ" gõ `lap trinh` ra 2 sách, chọn được, hộp thoại không đóng; 375px `/sach/moi` không tràn ngang. Chưa bấm "Thêm sách"/"Đặt trước" thật (ghi dữ liệu), chưa thử bàn phím/trình đọc màn hình, chưa thử >100 dòng thật.

### C8 — Đổi route `/add-doc-gia` (P3)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- `app/(app)/add-doc-gia` đổi thành `app/(app)/nguoi-dung/moi` (tệp được di chuyển, chưa stage). Nút "Thêm người dùng" ở `/nguoi-dung` trỏ `/nguoi-dung/moi`. Đã xóa `PATH_ALIASES` khỏi `lib/navigation.ts`: route mới nằm dưới tiền tố `/nguoi-dung` nên sidebar, breadcrumb và quyền (`STAFF`) tự khớp. `CLAUDE.md` đã cập nhật.
- Không để redirect từ `/add-doc-gia` (đường dẫn cũ giờ là 404).
- **Kiểm chứng:** `tsc` + `eslint` sạch (phải xóa `.next/types` cũ vì còn tham chiếu route cũ). Trên trình duyệt (THU_THU): bấm "Thêm người dùng" sang `/nguoi-dung/moi`, form hiện đủ, sidebar sáng mục "Người dùng & tài khoản". Chưa thử BAN_DOC vào `/nguoi-dung/moi` (kỳ vọng bị `RoleGate` chặn như `/nguoi-dung`).

### C9 — Metadata theo trang (P3)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- Các trang là `"use client"` nên không dùng được `metadata`/`generateMetadata`. `components/document-title.tsx` (`<DocumentTitle />`, gắn trong `app/(app)/layout.tsx`) đặt `document.title = "<tiêu đề> · Quản lý thư viện"` theo `getPageTitle(pathname)` (`lib/navigation.ts`): mục menu, cộng bảng `SUB_PAGE_TITLES` cho trang con (Thêm sách, Chi tiết sách, Thêm người dùng, Chi tiết người dùng, Lập phiếu mượn, "Phiếu mượn PM…"). Trang đăng nhập có `app/(auth)/login/layout.tsx` (server) với `metadata`.
- `hooks/use-document-title.ts`: `useDocumentTitle(ten)` cho trang chi tiết ghi đè bằng tên bản ghi sau khi tải xong (đã dùng ở `sach/[id]` và `nguoi-dung/[id]`). `DocumentTitle` dùng `useLayoutEffect` nên luôn chạy trước `useEffect` của trang con.
- **Phát hiện:** tải thẳng vào một trang (không phải điều hướng mềm), Next đẩy `<title>` của metadata gốc vào `<head>` sau khi hydrate và đè mất tiêu đề vừa đặt (reload thì không bị). Vì vậy `setDocumentTitle` giữ tiêu đề mong muốn bằng `MutationObserver` trên `<head>` và đặt lại khi bị đè; `DocumentTitle` gọi `clearDocumentTitle` khi rời khu vực đã đăng nhập để không đè tiêu đề trang login.
- Kiểm chứng: `tsc` + `eslint` sạch. Trên trình duyệt (THU_THU), tải thẳng `/phat` → "Tiền phạt · Quản lý thư viện", `/tac-gia` → "Tác giả · …", `/sach/7` → "An toàn thông tin · …" (tên sách), `/nguoi-dung/SV001` → tên người dùng; điều hướng mềm (bấm link) cũng đúng. Chưa kiểm `/login` sau đăng xuất và chưa chạy `npm run build`.

### C10 — Test, CI, formatter, lockfile (P3)
- **Trạng thái:** Chưa thực hiện
- Chưa có test runner, CI, formatter. Đề xuất: vitest cho `getApiErrorMessage`, `buildSchema` (danh-muc), `canSee`, `isActivePath`; GitHub Actions chạy lint, tsc, build. Có cả `package-lock.json` (lockfile chính) và `yarn.lock` (untracked, không commit): thống nhất một lockfile.

### C11 — Form sửa xóa trắng trường tùy chọn (P3)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- **Đối chiếu BE:** thử trên bản ghi tạm (đã xóa): `PATCH` với chuỗi rỗng bị DB từ chối (400 "vi pham rang buoc CHECK"), còn **`null` xóa được** (`@IsOptional` bỏ qua cả `null`, Prisma ghi NULL), áp dụng cho `quocTich`, `namSinh` (tác giả) và `isbn`, `namXuatBan`, `giaBia`, `moTa` (sách); NXB `diaChi`/`email`/`sdt` và thể loại `moTa` cùng kiểu DTO nên tương tự (chưa thử riêng).
- FE: khi **sửa**, ô tùy chọn để trống gửi `null`; khi **thêm mới** vẫn bỏ trường. `DanhMucPage` (`toPayload(fields, values, clearEmpty)`, trường `required` không bao giờ gửi `null`) và `SachForm` (`toPayload(values, clearEmpty)`); form người dùng vốn đã gửi chuỗi rỗng, không đụng.
- Kiểu: `Clearable<T>` ở `lib/api.ts`; `update` của `danh-muc` và `sach` nhận `Clearable<…>` rồi ép một lần sang kiểu spec, vì spec chưa khai `nullable` (xem **B3**).
- Kiểm chứng: `tsc` + `eslint` sạch. Trên trình duyệt (THU_THU): sách tạm `ZZS01` xóa trắng ISBN, năm xuất bản, giá bìa, mô tả rồi Lưu → BE trả cả bốn `null`; tác giả tạm `ZZTMP2` xóa quốc tịch và năm sinh → cả hai `null`. Đã xóa hai bản ghi tạm. Chưa thử form NXB, thể loại và việc xóa `diaChi`/`email`/`sdt`.

### C12 — Báo cáo link sang người dùng (P3)
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (chờ người dùng duyệt).
- `components/nguoi-dung/nguoi-dung-link.tsx` `NguoiDungLink({ maNguoiDung, hoTen })`: "Họ tên (MÃ)" dẫn tới `/nguoi-dung/<mã>`. Dùng ở 5 báo cáo (`bao-cao-panels.tsx`: quá hạn, người dùng vi phạm, lịch sử mượn, đặt trước, sách đang mượn), danh sách `/phieu-muon`, `/dat-truoc` (cột chỉ staff), `/phat`, và dòng mô tả ở `phieu-muon/[maPhieu]` (chỉ staff). Cột báo cáo giữ `value` là chuỗi để CSV và sắp xếp không đổi, thêm `cell`.
- Không cần BE: `/nguoi-dung/[id]` nhận **id hoặc mã**. `nguoiDungApi.byMa` gọi `GET /docgia?tuKhoa=<mã>&limit=100` rồi lấy dòng trùng mã (không phân biệt hoa thường), không thấy thì `ApiError 404` → "Không tìm thấy người dùng". Khi vào bằng mã, trang `router.replace` sang `/nguoi-dung/<id>` để mọi thao tác sau dùng một khóa cache.
- Đề xuất BE nếu muốn bỏ vòng tra cứu: thêm `GET /docgia/ma/{maNguoiDung}` hoặc cho `NguoiDungTomTatDto` có `id`.
- Kiểm chứng: `tsc` + `eslint` sạch. Trên trình duyệt (THU_THU): `/phieu-muon` có link `/nguoi-dung/SV00x` ở mọi dòng, bấm sang `/nguoi-dung/1` với đúng người; vào thẳng `/nguoi-dung/SV001` tự chuyển sang `/nguoi-dung/1`; `/nguoi-dung/ZZ999` hiện "Không tìm thấy người dùng.". Chưa xem từng tab báo cáo, mobile và `/dat-truoc`, `/phat`.

## Chưa thực hiện — Kiểm thử còn thiếu

### Q1 — Kiểm thử thủ công còn thiếu (P1)
- **Trạng thái:** Đã hoàn thành (2026-10-07), không sửa code; chưa commit phần ghi chú này.
- **THU_THU (`cb001`):**
  - API: đọc `/demo`, `/bao-cao/*`, `/docgia`, `/phat` được (200). `DELETE /the-loai|/nha-xuat-ban|/tac-gia`, `POST /phat/{id}/huy`, `POST /docgia/{id}/tai-khoan`, `PATCH /docgia/{id}/tai-khoan/trang-thai` đều 403 (thử trên id không tồn tại). Đổi trạng thái cán bộ `CB002` trả 403 "Chi quan tri doi trang thai can bo", trạng thái không đổi. Sửa/thu tiền phạt không bị chặn (404/422 vì id giả).
  - Giao diện: vào được `/`, `/demo` (4 tab), `/sach/moi`, `/add-doc-gia`, `/phieu-muon/moi`, `/bao-cao` (8 tab), `/nguoi-dung`, `/tac-gia`, `/the-loai`, `/phat`, `/me`, không có thông báo chặn. `/the-loai`, `/tac-gia` chỉ có nút "Sửa", không có "Xóa". `/phat` chỉ có "Thu tiền", không có "Hủy". `/nguoi-dung/12` (cán bộ) có ghi chú "Chỉ quản trị…", không có nút tạo/khóa tài khoản.
- **BAN_DOC (`sv002`):** `/bao-cao`, `/demo`, `/nguoi-dung/1` hiện `role="alert"` "Bạn không có quyền truy cập trang này" kèm link về `/me`; sidebar chỉ còn Sách, Tác giả, Thể loại, NXB, Đặt trước, Của tôi.
- **Hủy đặt trước ở `/me`:** đã backup dữ liệu 15 bảng trước khi làm. Hủy lượt `CHO_XU_LY` của SV002 (sách S006): hộp xác nhận đúng, toast "Đã hủy đặt trước", dòng đổi sang "Đã hủy", thẻ tổng hợp "Đặt trước đang hoạt động" về 0, nút Hủy biến mất, DB `dat_truoc` id 2 = `HUY`. Đã khôi phục `trang_thai = CHO_XU_LY` (khớp backup); các dòng `nhat_ky_hanh_vi` sinh ra khi hủy vẫn còn.
- **401 giữa phiên:** đăng nhập SV002, ADMIN khóa tài khoản qua API, rồi bấm tab "Tiền phạt" ở `/me`: FE xóa `qltt.session` và chuyển về `/login` (đúng). Hạn chế (thuộc C2): trang login không có thông báo "phiên hết hạn/tài khoản bị khóa" và không nhớ trang cũ. Đã mở khóa lại SV002 (đăng nhập lại 200).
- **Mobile 375px:** `/me` (không tràn ngang, thẻ tổng hợp xếp dọc), dialog "Trả sách nhanh" hiển thị tốt. Còn thấy: dải tab của `/me` bị cắt ở "Lịch s…" không có gợi ý cuộn (đã ghi ở U7).
- **Chưa kiểm:** dialog "Gia hạn" (cần đăng nhập SV có sách đang mượn), thao tác "Thu tiền" thật ở `/phat` (ghi dữ liệu).
- **Phát hiện phụ:** lỗi 403 của BE là tiếng Việt không dấu ("Khong du quyen thuc hien thao tac nay"), FE hiện nguyên văn nên sẽ lệch với phần UI còn lại (việc của BE, hoặc FE ánh xạ 403 sang câu có dấu). `DataTable` render cả bảng lẫn thẻ nên `find`/test E2E sẽ thấy nút trùng (một bản `display:none`, trình đọc màn hình không đọc).

## Đề xuất cho BE

### B1 — Sort mặc định phía BE (P2)
- **Trạng thái:** Đã phân tích (2026-10-07), chờ người phụ trách BE. FE chưa phải sửa gì cho tới khi BE đổi; sau đó chỉ cần cập nhật dòng quy tắc ở chân bảng (`<Pager order="…" />`).
- **Nguồn:** đọc `BE/src/*/*.service.ts`, `bao-cao.controller.ts`, `ban-doc.controller.ts`, `sql/07_reports.sql`, index và dữ liệu thật trong DB `qltv_nhom8`.
- **Phát hiện:**
  1. `/phieu-muon`, `/dat-truoc`, `/phat` đang `ORDER BY id DESC` nhưng `id` không phản ánh ngày nghiệp vụ khi dữ liệu nhập bù hoặc seed. Thực tế: `/phieu-muon` đặt PM000015 (mượn 13/08) lên đầu còn PM000007 (04/10, mới nhất) đứng thứ 9; `/dat-truoc` đặt lượt id 10 (06/07, cũ nhất) lên đầu trong khi lượt mới nhất là 06/10.
  2. `/phat`: hai phiếu `CHUA_THANH_TOAN` (id 3, 6), là việc cần thao tác "Thu tiền", lại là phiếu cũ nên với `id desc` chúng nằm cuối và sẽ rơi sang trang sau khi dữ liệu lớn.
  3. `/me/dat-truoc` đã xếp `trang_thai IN ('CHO_XU_LY','SAN_SANG_NHAN') DESC, ngay_dat DESC` (đang chờ lên trước) nhưng `/dat-truoc` cho staff thì không; hai chỗ nên giống nhau.
  4. Thiếu khóa phụ nên phân trang có thể lệch: `/sach` xếp `ten_sach` (không unique), tác giả có thể trùng tên.
  5. `/bao-cao/top-sach-muon-nhieu`: view có `ORDER BY so_luot_muon DESC, ma_sach` nhưng controller (`bao-cao.controller.ts`) xếp lại chỉ `so_luot_muon DESC LIMIT n`, mất khóa phụ. Hiện 3 sách cùng 2 lượt và 12 sách cùng 1 lượt, nên "Top n" lấy sách nào trong nhóm hòa là ngẫu nhiên.
  6. `vw_nguoi_dung_vi_pham` không có `ORDER BY` (thứ tự do engine quyết định).
- **Đề xuất thứ tự mặc định:**

| Endpoint | Hiện tại | Đề xuất |
|---|---|---|
| `GET /phieu-muon` | `id desc` | `ngay_muon desc, id desc` |
| `GET /dat-truoc` | `id desc` | đang chờ (`CHO_XU_LY`, `SAN_SANG_NHAN`) trước, rồi `ngay_dat desc, id desc` (giống `/me/dat-truoc`) |
| `GET /phat` | `id desc` | `CHUA_THANH_TOAN` trước, rồi `ngay_tao desc, id desc` (tối thiểu: `ngay_tao desc, id desc`) |
| `GET /sach` | `ten_sach` | giữ `ten_sach`, thêm `id` làm khóa phụ |
| `GET /docgia` | `ma_nguoi_dung` | giữ nguyên (mã unique, có index) |
| `GET /the-loai`, `/nha-xuat-ban`, `/tac-gia` | tên | giữ tên, thêm `id` làm khóa phụ |
| `GET /sach/{id}/ban-sach` | `ma_ban_sach` | giữ nguyên |
| `GET /bao-cao/nguoi-dung-vi-pham` | không có | `con_no desc, tien_phat_tam_tinh desc, ma_nguoi_dung` |
| `GET /bao-cao/top-sach-muon-nhieu` | `so_luot_muon desc` | `so_luot_muon desc, ma_sach` |
| `GET /bao-cao/muon-qua-han` | `so_ngay_qua_han desc` | thêm `, ma_phieu` |
| `GET /bao-cao/sach-dang-muon` | `han_tra` | thêm `, ma_phieu, ma_ban_sach` |
| Báo cáo còn lại (lịch sử mượn, thống kê phạt, đặt trước) | hợp lý | giữ nguyên |

- **Nhỏ:** khi `GET /sach` có `tuKhoa`, nên xếp theo độ liên quan (FULLTEXT) rồi mới đến tên (hiện từ khóa vô nghĩa vẫn ra đủ 7 sách theo A–Z); danh sách lồng `ctPhieuMuons` trong phiếu mượn chưa có `orderBy`, thêm `id asc`.
- **Index khi dữ liệu lớn (hiện 10–15 dòng nên chưa cần):** `phieu_muon(ngay_muon, id)`, `phieu_phat(trang_thai, ngay_tao)`, `dat_truoc(ngay_dat)`; `idx_dt_hang_doi(sach_id, trang_thai, ngay_dat)` không dùng được cho sort này vì `ngay_dat` đứng sau.
- **Tham số sắp xếp (nếu muốn FE sort theo cột ở danh sách phân trang):** thêm `sapXep=<field>:<asc|desc>` với whitelist field cố định cho từng endpoint (các view dùng raw SQL nên không nối chuỗi từ client). Gợi ý: `/sach` (`ten_sach`, `ma_sach`, `nam_xuat_ban`, `so_ban_san_sang`), `/docgia` (`maNguoiDung`, `hoTen`), `/phieu-muon` (`ngayMuon`, `maPhieu`), `/phat` (`ngayTao`, `soTien`), `/dat-truoc` (`ngayDat`, `hanGiu`); không truyền thì dùng mặc định ở bảng trên. Khi có tham số này FE bật sort theo cột cho 5 trang phân trang (hiện chỉ có ở `/bao-cao` và `/me`).
- **Việc FE sau khi BE đổi:** đổi `order` của `Pager` ở `phieu-muon` ("ngày mượn, mới nhất trước"), `dat-truoc` ("đang chờ trước, rồi mới nhất"), `phat` ("chưa thu trước, rồi mới nhất"); khai báo `defaultOrder` cho báo cáo "Người dùng vi phạm" (Còn nợ ↓).

---

### B3 — Spec chưa khai `nullable` ở DTO sửa (P3)
- **Trạng thái:** Chờ người phụ trách BE. Liên quan C11.
- `Update*Dto` (`PartialType` của DTO tạo) khai trường tùy chọn là `string`/`number`, nhưng BE chấp nhận `null` để xóa giá trị. Đề xuất thêm `@ApiPropertyOptional({ nullable: true })` ở các trường tùy chọn (`isbn`, `namXuatBan`, `giaBia`, `moTa`, `diaChi`, `email`, `sdt`, `quocTich`, `namSinh`) rồi chạy lại `npm run api:types`; khi đó bỏ `Clearable` và chỗ ép kiểu ở `features/danh-muc/api.ts`, `features/sach/api.ts`.

### B2 — Spec sai body `POST /dat-truoc` (P3)
- **Trạng thái:** Chờ người phụ trách BE.
- BE có hai class cùng tên `DatTruocDto` (`dat-truoc.dto.ts` là body `{ maSach, maNguoiDung? }`, `dat-truoc.response.dto.ts` là kết quả). `openapi.json` dùng kết quả làm body của `POST /dat-truoc`, nên `lib/api-types.ts` đòi mọi trường (`id`, `sach`, …). FE đang ép kiểu ở `features/dat-truoc/api.ts`. Đề xuất đổi tên class body thành `TaoDatTruocDto` rồi chạy lại `npm run api:types`, sau đó bỏ phần ép kiểu.

## Ghi chú kỹ thuật cần nhớ

- Base UI: `Select` cần prop `items` để `SelectValue` hiện nhãn; `Checkbox` render `span role=checkbox`; `DropdownMenuLabel` phải nằm trong `Group`.
- Khi dùng browser pane: chờ ~2s sau thao tác rồi mới chụp; `get_page_text` không đọc dialog (portal); JS `.click()` không đổi tab Base UI, phải click thật; sau khi thử mobile nhớ `resize_window` về `desktop`.
- zsh: `echo "=====X"` lỗi expansion (dùng `echo "--- X"`); biến chứa danh sách file không tự tách từ, dùng `xargs`.
- Kiểm tra tương phản: tính theo công thức WCAG, cần ≥4,5:1 cho chữ thường trên cả nền trắng và `#f6f7f4`, và trên nền pill màu đi kèm.
- API: id là chuỗi, nghiệp vụ gọi bằng mã; danh sách `{data,total,page,limit}`, `limit ≤ 100`; lỗi 401/403/409/422 xử lý như `getApiErrorMessage` (xem `lib/api.ts` và `../BE/docs/swagger-cho-fe.md`).
