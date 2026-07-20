'use client';

import { useState } from 'react';
import type { Slip } from '@/lib/types';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SlipList({ slips }: { slips: Slip[] }) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  async function copyLink(slip: Slip) {
    await navigator.clipboard.writeText(slip.shareUrl);
    setCopiedSlug(slip.slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  if (slips.length === 0) {
    return (
      <Card title="Your slips">
        <p className="text-sm text-zinc-400">
          No slips yet. Create your first share link above.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Your slips">
      <div className="space-y-3">
        {slips.map((slip) => (
          <article
            key={slip.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-zinc-100">
                  {slip.bookmaker.name}{' '}
                  <span className="text-zinc-500">· {slip.type.replace('_', ' ')}</span>
                </p>
                <p className="mt-1 font-mono text-sm text-emerald-300">{slip.slug}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(slip.createdAt)}</p>
              </div>
              <div className="text-right text-sm text-zinc-300">
                <p>{slip._count.clicks} clicks</p>
                <p>{slip._count.conversions} conversions</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => copyLink(slip)}
              >
                {copiedSlug === slip.slug ? 'Copied!' : 'Copy link'}
              </Button>
              <a
                href={slip.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500"
              >
                Preview gateway
              </a>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
