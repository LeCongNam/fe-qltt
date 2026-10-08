# Thư viện số | Quản trị — Front end

Giao diện web cho hệ thống **Quản lý thư viện** (đồ án môn Quản lý thông tin, nhóm 8, UIT). Ứng dụng phục vụ ba nhóm người dùng — quản trị viên, thủ thư và bạn đọc — để quản lý danh mục sách, người dùng, mượn trả, đặt trước, tiền phạt và xem báo cáo. Toàn bộ dữ liệu và nghiệp vụ nằm ở cơ sở dữ liệu MySQL; front end chỉ gọi API của back end (`../BE`).

## Mục lục

- [Chức năng](#chức-năng)
- [Phân quyền](#phân-quyền)
- [Công nghệ](#công-nghệ)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Scripts](#scripts)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Kiến trúc](#kiến-trúc)
- [Kiểm thử và CI](#kiểm-thử-và-ci)
- [Triển khai](#triển-khai)
- [Quy ước làm việc](#quy-ước-làm-việc)

## Chức năng

| Nhóm | Trang | Mô tả |
|---|---|---|
| Tổng quan | `/` | Chỉ số nhanh (lượt mượn đang hoạt động, phiếu đến hạn hôm nay, đặt trước chờ xử lý, bản sách sẵn sàng), biểu đồ lượt mượn/trả 14 ngày gần nhất (cột hoặc vùng) và các phiếu mượn mới nhất. |
| Danh mục | `/sach`, `/tac-gia`, `/the-loai`, `/nha-xuat-ban` | Tra cứu, thêm, sửa, xóa đầu sách, tác giả, thể loại, nhà xuất bản. Trang chi tiết sách (`/sach/[id]`) quản lý từng bản sách: nhập thêm bản, đổi tình trạng. |
| Người dùng & tài khoản | `/nguoi-dung` | Hồ sơ bạn đọc (sinh viên, giảng viên) và cán bộ; thêm mới, sửa, đổi trạng thái; quản trị tạo hoặc khóa tài khoản đăng nhập ở trang chi tiết. |
| Mượn - trả | `/phieu-muon` | Lập phiếu mượn (DB kiểm tra số sách tối đa, nợ phạt, quá hạn; một cuốn bị từ chối thì cả phiếu không được tạo), gia hạn, nhận trả sách, hủy phiếu. |
| Đặt trước | `/dat-truoc` | Thủ thư xem lượt đặt trước của mọi bạn đọc; bạn đọc xem và hủy lượt đặt của mình. |
| Tiền phạt | `/phat` | Phiếu phạt do hệ thống tự lập khi trả sách quá hạn, hư hỏng hoặc mất; thu tiền, hủy phiếu phạt (ADMIN). |
| Của tôi | `/me` | Khu vực bạn đọc: sách đang mượn (gia hạn), đặt trước, tiền phạt và lịch sử mượn của riêng mình. |
| Báo cáo | `/bao-cao` | 8 báo cáo đọc trực tiếp từ các view của CSDL: danh mục sách, đang mượn, quá hạn, vi phạm, top sách mượn nhiều, tiền phạt theo tháng, lịch sử mượn, đặt trước. Sắp xếp theo cột, xuất CSV. |
| Demo | `/demo` | Trình diễn Stored Procedure, Trigger, Function, Cursor của CSDL theo 5 bước: bài toán, câu SQL, bảng liên quan, thực thi, xem lại kết quả. Mặc định chạy ở chế độ rollback nên có thể lặp lại mà không đổi dữ liệu. |

Tính năng chung:

- **Tìm kiếm toàn cục** trên thanh header (`Ctrl/⌘ + K`): sách, người dùng, phiếu mượn. Chỉ tìm khi nhấn Enter, vì mỗi lượt tra cứu sách được CSDL ghi vào nhật ký hành vi.
- **Bảng dữ liệu** phân trang và sắp xếp phía server (`sapXep`), tiêu đề cố định, bảng tự cuộn trong khung vừa khít màn hình.
- **Ô chọn dài** (thể loại, nhà xuất bản, sách, người mượn) dùng combobox lọc không dấu.
- **Phiên đăng nhập**: JWT lưu trên trình duyệt, tự đăng xuất khi hết hạn hoặc khi API trả 401, quay lại đúng trang đang xem sau khi đăng nhập lại.
- Giao diện tiếng Việt, responsive từ điện thoại đến máy tính để bàn.

## Phân quyền

| Vai trò | Quyền chính |
|---|---|
| `ADMIN` | Toàn quyền: quản lý người dùng, tạo/khóa tài khoản, xóa thể loại / nhà xuất bản / tác giả, hủy phiếu phạt, xem báo cáo. |
| `THU_THU` | Quản lý sách và bản sách, người dùng, lập phiếu mượn, trả sách, thu tiền phạt, xem báo cáo. Không xóa danh mục, không hủy phạt, không tạo/khóa tài khoản. |
| `BAN_DOC` | Tra cứu sách, xem danh mục, đặt trước, gia hạn, xem khu vực `/me`. Sau khi đăng nhập được chuyển thẳng tới `/me`. |

Menu, truy cập theo URL (`RoleGate`) và các nút thao tác đều lấy quyền từ `lib/navigation.ts`; back end vẫn kiểm tra lại và trả 403 khi vượt quyền.

## Công nghệ

- [Next.js](https://nextjs.org) 16 (App Router) và React 19, TypeScript chế độ strict
- Tailwind CSS v4, shadcn/ui (style `base-nova`, dựa trên `@base-ui/react`), lucide-react
- TanStack Query để cache và đồng bộ dữ liệu server
- react-hook-form và zod cho biểu mẫu
- openapi-fetch và openapi-typescript: client API có kiểu, sinh từ `../BE/docs/openapi.json`
- recharts cho biểu đồ
- Vitest, ESLint, Prettier

## Bắt đầu nhanh

Yêu cầu: Node.js 22 và npm (dự án chỉ dùng `package-lock.json`, không dùng yarn).

1. Chạy back end ở cổng 3000. Xem hướng dẫn trong `../BE/README.md`.

2. Cài thư viện:

   ```bash
   npm ci
   ```

3. Tạo `.env.local` (đã được gitignore):

   ```bash
   echo "API_BASE_URL=http://localhost:3000" > .env.local
   ```

4. Chạy máy chủ phát triển:

   ```bash
   npm run dev
   ```

Mở [http://localhost:3001](http://localhost:3001) và đăng nhập. FE chạy cổng **3001** vì back end dùng cổng 3000.

### Tài khoản dùng thử

Dữ liệu seed của back end (`BE/sql/02_seed.sql`) có sẵn tài khoản demo. Mật khẩu theo quy tắc `<MÃ NGƯỜI DÙNG VIẾT HOA>@Nhom8`. Các tài khoản này chỉ dùng để trình diễn và phát triển.

| Tên đăng nhập | Vai trò | Ghi chú |
|---|---|---|
| `ad001` | `ADMIN` | Quản trị hệ thống |
| `cb001` | `THU_THU` | Thủ thư |
| `sv001` | `BAN_DOC` | Sinh viên |
| `sv007` | `BAN_DOC` | Tài khoản bị khóa, đăng nhập trả 401 (dùng để thử trường hợp lỗi) |

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `API_BASE_URL` | Có | Địa chỉ gốc của back end, ví dụ `http://localhost:3000`. Mặc định `http://localhost:3000` nếu bỏ trống. |

`next.config.ts` chuyển tiếp mọi yêu cầu `/backend/*` tới `${API_BASE_URL}/*`, nên trình duyệt chỉ gọi cùng origin và không cần cấu hình CORS. Biến này được đọc **lúc build**, nên đổi giá trị trên máy chủ triển khai thì phải build lại.

## Scripts

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy máy chủ phát triển ở cổng 3001 |
| `npm run build` | Build bản production |
| `npm start` | Chạy bản đã build ở cổng 3001 |
| `npm run lint` | ESLint (next core-web-vitals và typescript) |
| `npm run typecheck` | Kiểm tra kiểu TypeScript (`tsc --noEmit`) |
| `npm test` | Chạy unit test (Vitest) |
| `npm run format -- <tệp>` | Prettier cho các tệp được chỉ định |
| `npm run format:check -- <tệp>` | Kiểm tra định dạng, không ghi |
| `npm run api:types` | Sinh lại `lib/api-types.ts` từ `../BE/docs/openapi.json`; chạy khi back end đổi API |

## Cấu trúc thư mục

```text
app/
  (auth)/login/        Trang đăng nhập (không có khung điều hướng)
  (app)/               Các trang sau đăng nhập, bọc bởi AuthGuard + RoleGate + sidebar/header
    sach/ tac-gia/ the-loai/ nha-xuat-ban/   Danh mục
    nguoi-dung/ phieu-muon/ dat-truoc/ phat/ Người dùng và lưu thông
    me/ bao-cao/ demo/                       Khu bạn đọc, báo cáo, demo CSDL
components/
  ui/                  Thành phần shadcn/ui (sinh bằng CLI)
  dashboard/           Khung ứng dụng, sidebar, tìm kiếm toàn cục, trang tổng quan
  data-table.tsx, pager.tsx, page-header.tsx, ...   Thành phần dùng chung
  sach/ nguoi-dung/ luu-thong/ phieu-muon/ me/ bao-cao/ demo/   Thành phần theo nghiệp vụ
features/<module>/     api.ts (gọi API có kiểu) và queries.ts (query key + queryOptions)
hooks/                 useAuth, useServerSort, useDebounced, useDocumentTitle, ...
lib/                   api client, auth store, JWT, điều hướng và phân quyền, định dạng, phân trang
public/                Ảnh tĩnh (nền trang đăng nhập)
```

## Kiến trúc

- **Lớp API**: component không gọi `api` trực tiếp. Mỗi module có `features/<module>/api.ts` và `queries.ts`; sau khi ghi dữ liệu thì `invalidateQueries` theo key của module. Lỗi từ back end được chuẩn hóa bởi `ApiError` và `getApiErrorMessage` (lỗi nghiệp vụ 422 hiển thị nguyên văn thông báo của CSDL).
- **Kiểu API**: `lib/api-types.ts` được sinh tự động, không sửa tay. Nếu spec sai thì sửa ở back end rồi chạy lại `npm run api:types`.
- **Xác thực**: `lib/auth-store.ts` giữ `{ accessToken, user }` trong `localStorage` (`qltt.session`) qua `useSyncExternalStore`; `AuthGuard` chuyển hướng về `/login?next=…`.
- **Điều hướng và quyền**: `lib/navigation.ts` là nguồn duy nhất cho menu, breadcrumb, tiêu đề tab và quyền theo route. Thêm trang mới thì khai báo ở đây.
- **Biểu mẫu**: zod schema với `zodResolver`; trường tùy chọn để trống được bỏ qua khi tạo và gửi `null` khi sửa để xóa giá trị.
- **Màu sắc**: dùng token trong `app/globals.css` (`bg-primary`, `text-muted-foreground`, ...), không gõ mã hex trực tiếp trong component.

Chi tiết hướng dẫn cho người đóng góp nằm ở [`CLAUDE.md`](CLAUDE.md); danh sách việc đã làm và còn lại ở [`TASKS.md`](TASKS.md).

## Kiểm thử và CI

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) chạy với mỗi pull request và mỗi lần push vào `main`: `npm ci`, `lint`, `typecheck`, `test`, `build` (Node 22). Chạy cùng các bước này trước khi mở pull request:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Unit test đặt cạnh mã nguồn trong thư mục `__tests__/` (API client, phiên đăng nhập, JWT, điều hướng, chuyển hướng an toàn, tiện ích biểu mẫu).

## Triển khai

Bản demo chạy hoàn toàn trên gói miễn phí:

| Thành phần | Dịch vụ | Lưu ý |
|---|---|---|
| Cơ sở dữ liệu | Aiven MySQL | Chuỗi kết nối cần `ssl-mode=REQUIRED`; dịch vụ có thể tự tắt khi rảnh. |
| Back end | Render (Node) | Ngủ sau khoảng 15 phút không dùng, lần gọi đầu mất hơn 50 giây. |
| Front end | Vercel | Đặt Production Branch là `trongminh`. |

Các bước triển khai front end lên Vercel:

1. Import repository, framework tự nhận là Next.js.
2. Thêm biến môi trường `API_BASE_URL` trỏ tới URL của back end (không có dấu `/` cuối).
3. Deploy. Khi đổi `API_BASE_URL`, chọn Redeploy để build lại.

Trước buổi demo, mở back end và cơ sở dữ liệu trước vài phút để tránh khởi động nguội. Xem thêm `../BE/docs/trien-khai-production.md`.

## Quy ước làm việc

- Mỗi người làm trên nhánh riêng tách từ `main`, đặt tên theo tác giả (ví dụ `trongminh`).
- Thông điệp commit ngắn gọn, mô tả đúng việc đã làm.
- Không commit `.env.local` hay bất kỳ khóa, mật khẩu, chuỗi kết nối nào.
- Thêm trang mới: tạo route trong `app/(app)/`, khai báo menu, quyền và tiêu đề trong `lib/navigation.ts`, đặt lời gọi API trong `features/<module>/`.
