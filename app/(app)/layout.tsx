import { AuthGuard } from "@/components/auth/auth-guard"
import { RoleGate } from "@/components/auth/role-gate"
import { DocumentTitle } from "@/components/document-title"
import { LibraryDashboard } from "@/components/dashboard/library-dashboard"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DocumentTitle />
      <LibraryDashboard>
        <RoleGate>{children}</RoleGate>
      </LibraryDashboard>
    </AuthGuard>
  )
}
