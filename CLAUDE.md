# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Overview

Admin dashboard front end ("Thư viện số | Quản trị", Vietnamese UI, `<html lang="vi">`) for a library-management course project. Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (`base-nova` style, built on `@base-ui/react`, not Radix), react-hook-form + zod, axios, recharts. The backend is a separate service (not in this repo).

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

- **Backend proxy**: `next.config.ts` rewrites `/backend/:path*` → `${API_BASE_URL}/:path*`. Set `API_BASE_URL=http://localhost:3000` in `.env.local` (gitignored); FE dev runs on **3001** because the BE owns 3000. `lib/api.ts` exports `apiClient` (axios, `baseURL: "/backend"`, auto `Authorization: Bearer`), `getApiErrorMessage(error)` (BE errors are `{ statusCode, message }`; 400 → message array, 422 → DB business message to show verbatim) and the `Paged<T>` type. A 401 (not from `/auth/login`) clears the session. API types live in `lib/api-types.ts` (generated, don't edit; use `Schemas["XxxDto"]` from `lib/api`).
- **Auth**: `lib/auth-store.ts` keeps `{ accessToken, user }` in localStorage (`qltt.session`) behind a `useSyncExternalStore` store; `hooks/use-auth.ts` exposes `login()`, `logout()`, `useAuth()` (`ready`, `user`, `isStaff`, `isAdmin`, `hasRole`). Roles: `ADMIN`, `THU_THU`, `BAN_DOC`. BE ids are strings; business calls use codes (`maSach`, `maNguoiDung`, …).
- **Layout**: `app/layout.tsx` only holds `<Providers>` (React Query + Tooltip + Toaster). Route groups: `app/(auth)/login` (no shell) and `app/(app)/*` (wrapped by `AuthGuard` + `LibraryDashboard` sidebar/header). New authenticated pages go under `app/(app)/` and render only their content area.
- **Navigation is route-based**: `lib/navigation.ts` is the single source (`navigationGroups`, per-item `roles`, `ready: false` = page not built yet, shown disabled). When adding a page, add/flip its entry there; the sidebar active item and header breadcrumb derive from `usePathname()`.
- **Dashboard overview** (`app/(app)/page.tsx` → `components/dashboard/dashboard-overview.tsx`) still uses hard-coded mock data until it is wired to `/bao-cao/*`.
- **Forms**: follow `app/(app)/add-doc-gia/page.tsx` / `app/(auth)/login/page.tsx` — zod schema + `useForm` with `zodResolver`, `Controller` fields composed from `components/ui/field.tsx`, feedback via the global `toast.add({ type, title, description })` from `components/ui/toast.tsx`. Field names are the backend's Vietnamese camelCase with enum values like `SINH_VIEN`; empty optional strings are converted to `undefined` before sending.
- **UI primitives**: `components/ui/*` are shadcn-generated (see `components.json`; aliases `@/components`, `@/lib/utils`, `@/hooks`). Add more with `npx shadcn add <component>`. Domain components live in `components/dashboard/`. Path alias `@/*` maps to the repo root.
- **Styling**: pages use hard-coded hex colors (green `#147d64` primary, off-white `#f6f7f4` background, `#e4e8e2` borders) via Tailwind arbitrary values rather than theme tokens; match that when editing existing dashboard pages.

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
