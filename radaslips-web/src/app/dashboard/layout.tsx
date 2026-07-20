import { AuthGuard } from '@/components/auth-guard';
import { DashboardNav } from '@/components/dashboard-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-950">
        <DashboardNav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
