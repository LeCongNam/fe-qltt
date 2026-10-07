import { AuthGuard } from "@/components/auth/auth-guard"
import { RoleGate } from "@/components/auth/role-gate"
import { LibraryDashboard } from "@/components/dashboard/library-dashboard"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <LibraryDashboard>
        <RoleGate>{children}</RoleGate>
      </LibraryDashboard>
    </AuthGuard>
  )
}
