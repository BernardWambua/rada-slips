'use client';

import { useEffect, useState } from 'react';
import { ApiError, getLeaderboard } from '@/lib/api';
import type {
  LeaderboardPeriod,
  LeaderboardResponse,
  LeaderboardSortBy,
} from '@/lib/types';
import { formatKes } from '@/lib/format';
import { Card } from '@/components/ui/card';

const periods: Array<{ value: LeaderboardPeriod; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

const sortOptions: Array<{ value: LeaderboardSortBy; label: string }> = [
  { value: 'clicks', label: 'Clicks' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'earnings', label: 'Earnings' },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('30d');
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('clicks');
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard({ period, sortBy })
      .then(setData)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load leaderboard');
      })
      .finally(() => setLoading(false));
  }, [period, sortBy]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-50">Leaderboard</h1>
        <p className="mt-2 text-zinc-400">
          See how tipsters rank by slip link performance across RadaSlips.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <FilterGroup
          label="Period"
          value={period}
          options={periods}
          onChange={setPeriod}
        />
        <FilterGroup
          label="Rank by"
          value={sortBy}
          options={sortOptions}
          onChange={setSortBy}
        />
      </div>

      {data?.viewer ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          Your rank: <span className="font-semibold">#{data.viewer.rank}</span>
          {' · '}
          {data.viewer.entry.clickCount} clicks
          {' · '}
          {data.viewer.entry.conversionCount} conversions
          {' · '}
          {formatKes(data.viewer.entry.totalEarnings)} earned
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </p>
      ) : null}

      <Card title="Top tipsters">
        {loading ? (
          <p className="text-sm text-zinc-400">Loading leaderboard…</p>
        ) : !data || data.entries.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No ranked tipsters yet. Create slip links and drive clicks to appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Rank</th>
                  <th className="pb-3 pr-4 font-medium">Tipster</th>
                  <th className="pb-3 pr-4 font-medium">Slip links</th>
                  <th className="pb-3 pr-4 font-medium">Clicks</th>
                  <th className="pb-3 pr-4 font-medium">Conversions</th>
                  <th className="pb-3 font-medium">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((entry) => {
                  const isViewer = data.viewer?.entry.tipsterId === entry.tipsterId;
                  return (
                    <tr
                      key={entry.tipsterId}
                      className={`border-t border-zinc-800 ${
                        isViewer ? 'bg-emerald-500/5 text-emerald-50' : 'text-zinc-200'
                      }`}
                    >
                      <td className="py-3 pr-4 font-medium">{entry.rank}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <RankBadge rank={entry.rank} />
                          <span>{entry.name}</span>
                          {isViewer ? (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                              You
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{entry.slipCount}</td>
                      <td className="py-3 pr-4">{entry.clickCount}</td>
                      <td className="py-3 pr-4">{entry.conversionCount}</td>
                      <td className="py-3">{formatKes(entry.totalEarnings)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
      <span className="px-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              active
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) {
    return null;
  }

  const styles = [
    'bg-amber-400/20 text-amber-200',
    'bg-zinc-400/20 text-zinc-200',
    'bg-orange-700/20 text-orange-200',
  ];

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${styles[rank - 1]}`}
    >
      {rank}
    </span>
  );
}
