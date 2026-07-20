'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        Checking session…
      </div>
    );
  }

  return children;
}
