# TASKS — Cải thiện UI/UX và cấu trúc code FE (qltv_nhom8)

Nguồn: phân tích FE ngày 2026-10-07 (đọc code, chạy tsc/eslint, xem giao diện thật bằng ADMIN trên desktop và mobile).
Bản phân tích tổng hợp đầy đủ cũng nằm trong agent memory: `mem_muxvkef3_23b6830071dc` (chưa ghi các việc font/tương phản bên dưới).

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
| U1 | Bỏ/làm thật ô tìm kiếm và chuông ở header | P1 | Chưa thực hiện |
| U2 | Bảng nhiều cột trên mobile (chế độ thẻ) | P1 | Chưa thực hiện |
| U3 | Quy tắc sắp xếp và sort theo cột | P2 | Chưa thực hiện |
| U4 | Biểu đồ "Lưu thông 14 ngày" bị nội suy cong | P2 | Chưa thực hiện |
| U5 | Lập phiếu mượn: tra cứu và xác nhận người mượn/bản sách | P2 | Chưa thực hiện |
| U6 | Thông báo động cho trình đọc màn hình (`aria-live`) | P3 | Chưa thực hiện |
| U7 | Kiểm tra lại bố cục sau đổi font ở các trang chưa xem | P1 | Chưa thực hiện |
| C1 | Phân quyền tập trung (`RoleGate`) | P1 | Chưa thực hiện |
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
| Q1 | Kiểm thử còn thiếu (THU_THU, 401, mobile…) | P1 | Chưa thực hiện |

---

## Đã hoàn thành

### T01 — Lỗi lint `use-mobile`
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit.
- `hooks/use-mobile.ts` viết lại bằng `useSyncExternalStore` + `matchMedia("(max-width: 767px)")`, server snapshot `false`. Lỗi `react-hooks/set-state-in-effect` hết; sidebar mobile mở đúng ở 375px.

### T02 — Font
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit.
- Nguyên nhân: `app/layout.tsx` gắn class biến font vào `<body>` trong khi theme Tailwind đọc ở `<html>`, nên `font-family` rơi về Times.
- Sửa: chuyển `className={geistSans.variable} ${geistMono.variable}` sang `<html>`. Đã kiểm chứng `body`/`h2` là `Geist` và face tiếng Việt (`U+1EA0–1EF9`) đã tải.

### T03 — Độ tương phản và cỡ chữ
- **Trạng thái:** Đã hoàn thành (2026-10-07), chưa commit (37 file, chỉ đổi class màu/cỡ chữ).
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
- **Trạng thái:** Chưa thực hiện
- `components/dashboard/library-dashboard.tsx`: ô "Tìm kiếm..." không có chức năng (trang Sách có ô tìm riêng), nút chuông có chấm đỏ giả báo có thông báo.
- Việc cần làm: bỏ cả hai (khuyến nghị), hoặc làm thật (ô tìm toàn cục, thông báo thật). Nếu bỏ, kiểm tra header vẫn cân đối ở desktop và mobile.

### U2 — Bảng nhiều cột trên mobile (P1)
- **Trạng thái:** Chưa thực hiện
- `/sach` ở 375px có 7 cột, chữ xuống dòng từng từ và cột cuối bị cắt. Tương tự các bảng ở `/nguoi-dung`, `/phieu-muon`, `/dat-truoc`, `/phat`, `/bao-cao` (`components/report-table.tsx`).
- Việc cần làm: chế độ thẻ (card list) dưới `md`, hoặc ẩn bớt cột phụ. Nên làm thành một component bảng dùng chung rồi áp dụng dần.

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
- **Trạng thái:** Chưa thực hiện
- Đã xem: `/`, `/sach`, `/nguoi-dung` (desktop) và `/`, `/phat`, `/bao-cao` (mobile, không tràn ngang). **Chưa xem:** `/phieu-muon` (+`moi`, `[maPhieu]`), `/dat-truoc`, `/demo` (SQL và bảng), `/me`, `/nguoi-dung/[id]`, `/sach/[id]`, `/tac-gia`, `/the-loai`, `/nha-xuat-ban`, dialog thêm/sửa, `/login`.
- Chữ nhỏ hơn và Geist rộng hơn có thể làm cột/nút xuống dòng. Kiểm tra cả desktop (~1000px và 1280px) và mobile 375px, kể cả tràn ngang.

## Chưa thực hiện — Cấu trúc code

### C1 — Phân quyền tập trung (P1)
- **Trạng thái:** Chưa thực hiện
- Hiện mỗi trang tự `if (ready && !isStaff) return <p>…</p>`: `demo`, `nguoi-dung`, `nguoi-dung/[id]`, `phat`, `bao-cao`, `phieu-muon`, `phieu-muon/moi`, `dashboard-overview`. `sach/moi` và `add-doc-gia` dùng `if (!isStaff)` mà không kiểm `ready`. Menu ẩn theo `roles` nhưng URL không bị chặn ở layout.
- Việc cần làm: `RoleGate`/guard tập trung đọc quyền từ `lib/navigation.ts` (hoặc cấu hình route), dùng thống nhất, xử lý `ready`. Thực thi thật vẫn ở BE (403).

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
- **Trạng thái:** Chưa thực hiện
- Vai `THU_THU` trên mọi trang (kể cả `/demo`, ẩn nút xóa danh mục, đổi trạng thái cán bộ bị 403).
- 401 giữa phiên (khóa tài khoản khi đang đăng nhập) trên browser.
- Nút "Hủy đặt trước" ở `/me` (cần user có lượt `CHO_XU_LY`/`SAN_SANG_NHAN`, ví dụ SV002; **backup DB trước** vì thao tác ghi dữ liệu).
- Giao diện mobile của các trang chưa xem (xem U7).
- Vai `BAN_DOC` ở các route staff (đã thấy bị chặn bằng thông báo ở `/bao-cao` và `/`; kiểm tra lại sau C1).

---

## Ghi chú kỹ thuật cần nhớ

- Base UI: `Select` cần prop `items` để `SelectValue` hiện nhãn; `Checkbox` render `span role=checkbox`; `DropdownMenuLabel` phải nằm trong `Group`.
- Khi dùng browser pane: chờ ~2s sau thao tác rồi mới chụp; `get_page_text` không đọc dialog (portal); JS `.click()` không đổi tab Base UI, phải click thật; sau khi thử mobile nhớ `resize_window` về `desktop`.
- zsh: `echo "=====X"` lỗi expansion (dùng `echo "--- X"`); biến chứa danh sách file không tự tách từ, dùng `xargs`.
- Kiểm tra tương phản: tính theo công thức WCAG, cần ≥4,5:1 cho chữ thường trên cả nền trắng và `#f6f7f4`, và trên nền pill màu đi kèm.
- API: id là chuỗi, nghiệp vụ gọi bằng mã; danh sách `{data,total,page,limit}`, `limit ≤ 100`; lỗi 401/403/409/422 xử lý như `getApiErrorMessage` (xem `lib/api.ts` và `../BE/docs/swagger-cho-fe.md`).
