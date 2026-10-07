# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Overview

Admin dashboard front end ("Thư viện số | Quản trị", Vietnamese UI, `<html lang="vi">`) for a library-management course project. Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (`base-nova` style, built on `@base-ui/react`, not Radix), react-hook-form + zod, openapi-fetch, recharts. The backend is a separate service (not in this repo).

## Commands

```bash
npm run dev      # next dev -p 3001 (BE chiếm cổng 3000)
npm run build    # next build
npm run lint     # eslint (next core-web-vitals + typescript)
npx tsc --noEmit # type check
npm run api:types # sinh lib/api-types.ts từ ../BE/docs/openapi.json (chạy lại khi BE đổi API)
```

There is no test runner configured. Both `package-lock.json` and an untracked `yarn.lock` exist; `package-lock.json` is the committed lockfile.

## Architecture

- **Backend proxy**: `next.config.ts` rewrites `/backend/:path*` → `${API_BASE_URL}/:path*`. Set `API_BASE_URL=http://localhost:3000` in `.env.local` (gitignored); FE dev runs on **3001** because the BE owns 3000. `lib/api.ts` exports `api` (`openapi-fetch` client typed by `lib/api-types.ts`, base `/backend`, auto `Authorization: Bearer`), `unwrap` (returns `data` or throws `ApiError { status, message }`), `isApiError(error, status?)`, `getApiErrorMessage(error)` (BE errors are `{ statusCode, message }`; 400 → message array, 422 → DB business message to show verbatim; network failure → connection message), `QueryOf<"/path">`, `Paged<T>` and `Schemas`. A 401 (not from `/auth/login`) clears the session. API types live in `lib/api-types.ts` (generated, don't edit; use `Schemas["XxxDto"]` from `lib/api`).
- **API layer**: never call `api` from a component. Each module has `features/<module>/api.ts` (typed calls, `.then(unwrap)`) and `features/<module>/queries.ts` (key factory such as `sachKeys.all` + `queryOptions`). Use `useQuery({ ...sachQueries.list(params), placeholderData: keepPreviousData })`, and after a mutation `invalidateQueries({ queryKey: xxxKeys.all })`. Put new calls in the matching module; if the spec is wrong, fix it in the BE and rerun `npm run api:types` instead of casting (the only cast is `datTruocApi.create`, see TASKS B2). Global search keeps its own `["search", …]` keys on purpose (each `/sach?tuKhoa` is logged by the BE).
- **Auth**: `lib/auth-store.ts` keeps `{ accessToken, user }` in localStorage (`qltt.session`) behind a `useSyncExternalStore` store; `hooks/use-auth.ts` exposes `login()`, `logout()`, `useAuth()` (`ready`, `user`, `isStaff`, `isAdmin`, `hasRole`). Roles: `ADMIN`, `THU_THU`, `BAN_DOC`. BE ids are strings; business calls use codes (`maSach`, `maNguoiDung`, …).
- **Layout**: `app/layout.tsx` only holds `<Providers>` (React Query + Tooltip + Toaster). Route groups: `app/(auth)/login` (no shell) and `app/(app)/*` (wrapped by `AuthGuard` + `LibraryDashboard` sidebar/header). New authenticated pages go under `app/(app)/` and render only their content area.
- **Navigation is route-based**: `lib/navigation.ts` is the single source (`navigationGroups`, per-item `roles`, `ready: false` = page not built yet, shown disabled). When adding a page, add/flip its entry there; the sidebar active item and header breadcrumb derive from `usePathname()`.
- **Reports**: `features/bao-cao/queries.ts` exports `useBaoCao(name, params)` for `/bao-cao/*` (staff only, snake_case rows, `staleTime: 0`). `app/(app)/bao-cao/page.tsx` shows the 8 reports as tabs (`components/bao-cao/bao-cao-panels.tsx`, generic `report-table.tsx` with client-side paging, click-to-sort headers and CSV export; `Column.sortBy` must return an ISO value for date columns and `defaultOrder` declares the order the BE already returns). Server-paged lists (`/sach`, `/phieu-muon`…) have no column sort because the BE has no sort param; state their order with `<Pager order="…" />`. The dashboard overview (`components/dashboard/dashboard-overview.tsx`) aggregates the same reports client-side (there is no stats endpoint).
- **Reader area**: `features/me/queries.ts` exports `useMe(name)` for `/me/*` (any role, own data only, snake_case rows). `app/(app)/me/page.tsx` (BAN_DOC lands here after login) shows summary cards plus tabs from `components/me/me-panels.tsx`; it reuses the generic `components/report-table.tsx` (CSV export shows only when `filename` is passed).
- **Demo module**: `app/(app)/demo/page.tsx` (staff only) lists the exam's Procedure/Trigger/Function/Cursor items as tabs; each item is `components/demo/demo-runner.tsx` = the 5 steps the exam asks for (problem, SQL text, params + related tables, run button, tables/output after). Everything comes from `/demo/*` (`features/demo/`); nothing is hard-coded in the FE. Run defaults to rollback (checkbox), so the demo can be repeated without changing data; business errors arrive in `ketQua.loi` (HTTP 200), not as 422. `components/demo/demo-table.tsx` highlights rows that are new/changed versus the step-3 snapshot.
- **Access control**: `RoleGate` (`components/auth/role-gate.tsx`, mounted in `app/(app)/layout.tsx`) blocks a page by URL using `getRouteRoles(pathname)` from `lib/navigation.ts`: a route's roles come from the nav item's `roles`, plus `ROUTE_ROLES_EXTRA` for sub-routes narrower than their parent (e.g. `/sach/moi`); longest prefix wins. Don't add per-page `if (!isStaff) return …` checks; `isStaff`/`isAdmin` in a page only hide buttons or gate queries. When adding a route, set `roles` on its menu item (or add it to `ROUTE_ROLES_EXTRA`). The BE still enforces 403.
- **Global search**: `components/dashboard/global-search.tsx` (header, Ctrl/⌘+K) searches books (`/sach?tuKhoa`), users (`/docgia?tuKhoa`, staff) and loan slips (`/phieu-muon/{ma}` for `PM…`, staff). It only searches on Enter, never per keystroke: `sp_tra_cuu_sach` writes every book lookup to `nhat_ky_hanh_vi` (`TRA_CUU`).
- **Forms**: follow `app/(app)/nguoi-dung/moi/page.tsx` / `app/(auth)/login/page.tsx` — zod schema + `useForm` with `zodResolver`; ô nhập một dòng dùng `TextField` (`components/form/text-field.tsx`), các ô khác (Select, Textarea, Checkbox) dùng `Controller` + `components/ui/field.tsx`; feedback via the global `toast.add({ type, title, description })` from `components/ui/toast.tsx`. Field names are the backend's Vietnamese camelCase with enum values like `SINH_VIEN`; empty optional strings are converted to `undefined` before sending.
- **Long pick lists**: ô chọn có thể vượt 100 dòng (thể loại, NXB, sách) dùng `Combobox` (`components/ui/combobox.tsx`, lọc không dấu) với dữ liệu từ `danhMucQueries.options` / `sachQueries.options()`, gom mọi trang bằng `fetchAllPages` (`lib/paging.ts`). Danh sách ngắn, cố định vẫn dùng `Select`.
- **Shared page pieces**: `PageHeader`, `SearchForm`, `ConfirmDialog`, `InfoItem` (in `components/`), `Pager`, `DataTable`; `PAGE_SIZE` in `lib/constants.ts`. Reuse them instead of copying markup into a new page.
- **UI primitives**: `components/ui/*` are shadcn-generated (see `components.json`; aliases `@/components`, `@/lib/utils`, `@/hooks`). Add more with `npx shadcn add <component>`. Domain components live in `components/dashboard/`. Path alias `@/*` maps to the repo root.
- **Styling**: màu lấy từ token trong `app/globals.css` (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-canvas`, `text-faint`, `bg-primary-soft`…; xem danh sách ở đầu `:root`), không gõ hex trong component. Nút xanh chính là `<Button>` mặc định. Cần màu mới thì thêm token (kiểm tương phản ≥ 4,5:1 cho chữ) rồi mới dùng; khối `.dark` chưa được cập nhật.

## Git safety — hard rules

- **NEVER run `git commit` or `git push` unless the user asks for it in the current message.**
- Do not stage changes or open PRs automatically after finishing a task.
- Leave modified files in the working directory for the user to review.

### Branch / worktree naming

Always branch (and create any worktree) off `main` when starting a
task, This is a team project, so the branch name is
`<author>`:

Example: Trọng Minh adding a feature -> `trongminh`

### Commit messages

- Short and to the point, describing the actual task/fix/feature — no filler, no restating the diff.
- **Never** include `Co-Authored-By: Claude`, any other AI attribution, or any signature/trailer of
  any kind. Plain message only.
