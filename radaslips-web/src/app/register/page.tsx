'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, register } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { formatPhoneInput } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('+254');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register({
        phoneNumber: formatPhoneInput(phoneNumber),
        password,
        displayName: displayName || undefined,
      });
      setToken(response.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card title="Create tipster account" className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone number"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(formatPhoneInput(event.target.value))}
            placeholder="+2547XXXXXXXX"
            required
          />
          <Input
            label="Display name (optional)"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Kamau"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint="Minimum 8 characters"
            minLength={8}
            required
          />

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
