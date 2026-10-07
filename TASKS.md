# TASKS — Cải thiện UI/UX và cấu trúc code FE (qltv_nhom8)

Nguồn: phân tích FE ngày 2026-10-07 (đọc code, chạy tsc/eslint, xem giao diện thật bằng ADMIN trên desktop và mobile).
Bản phân tích tổng hợp đầy đủ cũng nằm trong agent memory: `mem_muxwwjwr_c4ef046b635b` (bản tổng hợp mới nhất; thay các bản cũ).

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
| U2 | Bảng nhiều cột trên mobile (chế độ thẻ) | P1 | Đã hoàn thành (còn vài bảng nhỏ chưa áp dụng) |
| U3 | Quy tắc sắp xếp và sort theo cột | P2 | Chưa thực hiện |
| U4 | Biểu đồ "Lưu thông 14 ngày" bị nội suy cong | P2 | Chưa thực hiện |
| U5 | Lập phiếu mượn: tra cứu và xác nhận người mượn/bản sách | P2 | Chưa thực hiện |
| U6 | Thông báo động cho trình đọc màn hình (`aria-live`) | P3 | Chưa thực hiện |
| U7 | Kiểm tra lại bố cục sau đổi font ở các trang chưa xem | P1 | Đã hoàn thành |
| C1 | Phân quyền tập trung (`RoleGate`) | P1 | Đã hoàn thành |
| C2 | Phiên đăng nhập: hạn token, quay lại trang cũ sau 401 | P2 | Chưa thực hiện |
| C3 | Đưa màu hex cứng vào theme token | P2 | Chưa thực hiện |
| C4 | Tách component dùng chung (lặp code) | P2 | Chưa thực hiện |
| C5 | Tầng API có kiểu: `openapi-fetch`, key factory, `.gitattributes` | P2 | Chưa thực hiện |
| C6 | Tách các trang quá lớn | P3 | Chưa thực hiện |
| C7 | Select giới hạn 100 dòng: combobox tìm phía server | P3 | Chưa thực hiện |
| C8 | Đổi route `/add-doc-gia` thành `/nguoi-dung/moi` | P3 | Chưa thực hiện |
| C9 | Metadata/`<title>` theo từng trang | P3 | Chưa thực hiện |
| C10 | Test, CI, formatter, lockfile | P3 | Chưa thực hiện |
| C11 | Form sửa chưa xóa trắng được trường tùy chọn | P3 | Chưa thực hiện |
| C12 | Báo cáo chưa link được sang người dùng | P3 | Chưa thực hiện |
| Q1 | Kiểm thử còn thiếu (THU_THU, 401, mobile…) | P1 | Đã hoàn thành (còn dialog Gia hạn) |

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
- Chưa áp dụng (bảng ít cột, chưa gặp lỗi): `components/sach/ban-sach-panel.tsx` (4 cột), `components/danh-muc/danh-muc-page.tsx`, bảng chi tiết trong `phieu-muon/[maPhieu]`, `dashboard-overview.tsx` (đã ẩn cột bằng `hidden md:table-cell`), `demo-table.tsx` (bảng dữ liệu thô, giữ cuộn ngang). Chưa thử bấm thật các nút trong thẻ (Thu tiền/Hủy ở `/phat`, Gia hạn ở `/me`), chưa xem `/me` ở mobile.

### U3 — Quy tắc sắp xếp (P2)
- **Trạng thái:** Chưa thực hiện
- Danh sách sách và báo cáo đang xếp theo tên trong khi cột đầu là mã (S007, S003, S014…), chưa có sort theo cột. Cần quy tắc mặc định rõ (ví dụ theo mã) và sort theo cột nếu BE hỗ trợ (kiểm tra `docs/swagger-cho-fe.md` trước).

### U4 — Biểu đồ "Lưu thông 14 ngày" (P2)
- **Trạng thái:** Chưa thực hiện
- `components/dashboard/dashboard-overview.tsx` và `components/bao-cao/bao-cao-panels.tsx`: dữ liệu thưa (0–1 lượt/ngày) bị nội suy cong thành các gò, dễ hiểu nhầm là có xu hướng. Đổi sang biểu đồ cột hoặc đường gấp khúc, thêm nhãn trục rõ hơn.

### U5 — Lập phiếu mượn (P2)
- **Trạng thái:** Chưa thực hiện
- `app/(app)/phieu-muon/moi/page.tsx`: phải gõ tay mã người mượn và mã bản sách, không có gợi ý, không hiện tên người mượn để xác nhận. Giữ luồng "nhập mã rồi Enter" (hợp máy quét mã vạch), thêm tra cứu người mượn (hiện họ tên, loại, trạng thái) và hiện tên sách của từng bản đã thêm.

### U6 — Thông báo động cho trình đọc màn hình (P3)
- **Trạng thái:** Chưa thực hiện
- Mới có 3 chỗ dùng `aria-live`/`role`. Kiểm tra toast, kết quả tìm kiếm, trạng thái tải/lỗi bảng.

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
- **Trạng thái:** Chưa thực hiện
- 559 chỗ hex cứng ngoài `components/ui`, class nút xanh `bg-[#147d64] text-white hover:bg-[#106a55]` lặp 19 lần ở 13 file; `app/globals.css` vẫn là theme neutral mặc định của shadcn, token không được dùng, dark mode không dùng được.
- Việc cần làm: định nghĩa token (`--primary`, `--muted-foreground`, `--destructive`, `--warning`, nền trang, viền…) bằng các màu đã kiểm chứng ở T03, rồi thay dần. Cân nhắc biến thể `Button` cho nút xanh chính. Kiểm tra lại tương phản sau khi thay.

### C4 — Component dùng chung (P2)
- **Trạng thái:** Chưa thực hiện
- Đang lặp: `Info()` ở 3 file (`sach/[id]`, `nguoi-dung/[id]`, `phieu-muon/[maPhieu]`); `initials()` ở 2 file (`library-sidebar`, `library-dashboard`); `PAGE_SIZE = 20` ở 6 nơi; phân trang viết tay ở `sach/page.tsx`, `nguoi-dung/page.tsx`, `danh-muc-page.tsx` trong khi `components/pager.tsx` đã có (dùng ở `phat`, `dat-truoc`, `phieu-muon`, `report-table`); khối `Controller` + `Field` + `FieldError` (sach-form 10, nguoi-dung-form 6…); header trang, ô tìm kiếm, dialog xác nhận xóa.
- Việc cần làm: tách `PageHeader`, `SearchBar`, `ConfirmDialog`, `InfoItem`, `TextField`, `Avatar/initials`; dùng `Pager` thống nhất; gom hằng `PAGE_SIZE`.

### C5 — Tầng API có kiểu (P2)
- **Trạng thái:** Chưa thực hiện
- `lib/api-types.ts` (~6000 dòng) chỉ `import type` nên không ảnh hưởng bundle; việc commit file này là đúng (FE và BE là hai repo riêng). Vấn đề thật: 30/40 lời gọi `apiClient.*` dùng generic viết tay, 10 lời gọi không có generic; **body request không được kiểm theo spec** (các DTO `Create*/Update*` không được tham chiếu). 66% file là `operations` mà FE không dùng.
- Việc cần làm:
  1. Thêm `.gitattributes` với `lib/api-types.ts linguist-generated=true`.
  2. Dùng đúng thứ đã sinh: thêm `openapi-fetch` (gọi API có kiểm tra path, params, body, response theo spec) và đưa lời gọi vào `features/<domain>/{api,queries,schemas}` với key factory cho query. Hoặc, nếu không dùng, cắt `paths`/`operations` khỏi file sinh (còn ~1000 dòng; chỉ gọn hơn, không an toàn hơn).
  3. Chuẩn hóa query key (hiện: `["/sach","list",page,tuKhoa]`, `[endpoint,page]`, `["/me",path]`…).
- Làm dần theo module; bắt đầu từ một module nhỏ (ví dụ danh mục) để chốt mẫu.

### C6 — Tách trang quá lớn (P3)
- **Trạng thái:** Chưa thực hiện
- `app/(app)/nguoi-dung/[id]/page.tsx` 424 dòng (chứa `TrangThaiCard`, `TaiKhoanCard`), `dat-truoc/page.tsx` 351, `phat/page.tsx` 321. Tách card/dialog sang `components/<domain>/`.

### C7 — Select giới hạn 100 dòng (P3)
- **Trạng thái:** Chưa thực hiện
- `sach-form.tsx` (`useOptions`: thể loại, NXB, tác giả) và `dat-truoc` (chọn sách) lấy `limit: 100`; vượt 100 sẽ bị cắt mà không báo. Cần combobox tìm kiếm phía server hoặc phân trang trong ô chọn.

### C8 — Đổi route `/add-doc-gia` (P3)
- **Trạng thái:** Chưa thực hiện
- Route tiếng Anh lệch với các route khác; `PATH_ALIASES` trong `lib/navigation.ts` đang vá. Đổi thành `/nguoi-dung/moi`, xóa alias, cập nhật link và `CLAUDE.md`.

### C9 — Metadata theo trang (P3)
- **Trạng thái:** Chưa thực hiện
- Chỉ `app/layout.tsx` có `metadata`, nên mọi trang cùng `<title>`. 50 file `"use client"`. Cân nhắc `document.title` theo `findNavLabel` hoặc tách phần server để dùng `generateMetadata`.

### C10 — Test, CI, formatter, lockfile (P3)
- **Trạng thái:** Chưa thực hiện
- Chưa có test runner, CI, formatter. Đề xuất: vitest cho `getApiErrorMessage`, `buildSchema` (danh-muc), `canSee`, `isActivePath`; GitHub Actions chạy lint, tsc, build. Có cả `package-lock.json` (lockfile chính) và `yarn.lock` (untracked, không commit): thống nhất một lockfile.

### C11 — Form sửa chưa xóa trắng trường tùy chọn (P3)
- **Trạng thái:** Chưa thực hiện
- `DanhMucPage` và `SachForm` bỏ chuỗi rỗng khỏi payload nên không xóa được giá trị tùy chọn khi sửa (riêng form người dùng đã gửi chuỗi rỗng). Cần đối chiếu với BE để biết cách xóa đúng (chuỗi rỗng hay `null`).

### C12 — Báo cáo chưa link sang người dùng (P3)
- **Trạng thái:** Chưa thực hiện
- `/nguoi-dung/[id]` dùng `id` số, báo cáo chỉ có `ma_nguoi_dung`. Cần endpoint tra theo mã, hoặc route theo mã.

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

---

## Ghi chú kỹ thuật cần nhớ

- Base UI: `Select` cần prop `items` để `SelectValue` hiện nhãn; `Checkbox` render `span role=checkbox`; `DropdownMenuLabel` phải nằm trong `Group`.
- Khi dùng browser pane: chờ ~2s sau thao tác rồi mới chụp; `get_page_text` không đọc dialog (portal); JS `.click()` không đổi tab Base UI, phải click thật; sau khi thử mobile nhớ `resize_window` về `desktop`.
- zsh: `echo "=====X"` lỗi expansion (dùng `echo "--- X"`); biến chứa danh sách file không tự tách từ, dùng `xargs`.
- Kiểm tra tương phản: tính theo công thức WCAG, cần ≥4,5:1 cho chữ thường trên cả nền trắng và `#f6f7f4`, và trên nền pill màu đi kèm.
- API: id là chuỗi, nghiệp vụ gọi bằng mã; danh sách `{data,total,page,limit}`, `limit ≤ 100`; lỗi 401/403/409/422 xử lý như `getApiErrorMessage` (xem `lib/api.ts` và `../BE/docs/swagger-cho-fe.md`).
