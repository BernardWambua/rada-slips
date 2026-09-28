'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiError, getMe, getOverview } from '@/lib/api';
import type { AnalyticsOverview, Tipster } from '@/lib/types';
import { formatDate, formatKes } from '@/lib/format';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const [tipster, setTipster] = useState<Tipster | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMe(), getOverview()])
      .then(([profile, stats]) => {
        setTipster(profile);
        setOverview(stats);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load dashboard');
      });
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
        {error}
      </p>
    );
  }

  if (!tipster || !overview) {
    return <p className="text-zinc-400">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-50">
          Welcome{tipster.displayName ? `, ${tipster.displayName}` : ''}
        </h1>
        <p className="mt-2 text-zinc-400">
          Track clicks, conversions, and earnings from your shared slips.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active slip links" value={String(overview.slipCount)} />
        <StatCard label="Total clicks" value={String(overview.clickCount)} />
        <StatCard label="Conversions" value={String(overview.conversionCount)} />
        <StatCard
          label="Wallet balance"
          value={formatKes(overview.wallet?.availableFunds ?? '0')}
        />
      </div>

      <Card title="Recent slip links">
        {overview.recentSlips.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No slips yet.{' '}
            <Link href="/dashboard/slips" className="text-emerald-400 hover:underline">
              Create your first slip link
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Slug</th>
                  <th className="pb-3 pr-4 font-medium">Bookmaker</th>
                  <th className="pb-3 pr-4 font-medium">Clicks</th>
                  <th className="pb-3 pr-4 font-medium">Conversions</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentSlips.map((slip) => (
                  <tr key={slip.id} className="border-t border-zinc-800 text-zinc-200">
                    <td className="py-3 pr-4 font-mono text-emerald-300">{slip.slug}</td>
                    <td className="py-3 pr-4">{slip.bookmaker.name}</td>
                    <td className="py-3 pr-4">{slip.clicks}</td>
                    <td className="py-3 pr-4">{slip.conversions}</td>
                    <td className="py-3">{formatDate(slip.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-50">{value}</p>
    </div>
  );
}
