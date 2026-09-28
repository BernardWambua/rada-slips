'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticated();
    setAuthed(authenticated);
    setReady(true);

    if (!authenticated) {
      router.replace('/login');
    }
  }, [router]);

  if (!ready || !authed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-400">
        Checking session…
      </div>
    );
  }

  return children;
}
