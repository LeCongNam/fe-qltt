import { AuthGuard } from "@/components/auth/auth-guard"
import { LibraryDashboard } from "@/components/dashboard/library-dashboard"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <LibraryDashboard>{children}</LibraryDashboard>
    </AuthGuard>
  )
}
