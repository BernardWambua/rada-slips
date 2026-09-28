'use client';

import type { Slip } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { ShareLinkPanel } from '@/components/share-link-panel';

export function SlipList({ slips }: { slips: Slip[] }) {
  if (slips.length === 0) {
    return (
      <Card title="Your slip links">
        <p className="text-sm text-zinc-400">
          No slip links yet. Create one on the left and it will appear here
          ready to share again anytime.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Your slip links">
      <div className="space-y-4">
        {slips.map((slip) => (
          <article
            key={slip.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <ShareLinkPanel shareUrl={slip.shareUrl} compact />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="text-zinc-300">
                <p className="font-medium text-zinc-100">{slip.bookmaker.name}</p>
                <p className="mt-1 font-mono text-xs text-emerald-300">
                  {slip.bookingCode ?? 'No booking code'}
                  {slip.totalOdds ? ` · ${slip.totalOdds}x` : ''}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(slip.createdAt)}</p>
              </div>
              <div className="text-right text-zinc-400">
                <p>{slip._count?.clicks ?? 0} clicks</p>
                <p>{slip._count?.conversions ?? 0} conversions</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
