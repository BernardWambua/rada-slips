'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/slips', label: 'Slip links' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.push('/login');
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold text-emerald-400">
            RadaSlips
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Button variant="ghost" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
