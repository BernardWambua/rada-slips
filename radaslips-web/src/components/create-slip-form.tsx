'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError, createSlip, listBookmakers } from '@/lib/api';
import type { Bookmaker, Slip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ShareLinkPanel } from '@/components/share-link-panel';

export function CreateSlipForm({ onCreated }: { onCreated: (slip: Slip) => void }) {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [bookmakerId, setBookmakerId] = useState('');
  const [bookingCode, setBookingCode] = useState('');
  const [slugPrefix, setSlugPrefix] = useState('');
  const [totalOdds, setTotalOdds] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdSlip, setCreatedSlip] = useState<Slip | null>(null);

  useEffect(() => {
    listBookmakers()
      .then((items) => {
        setBookmakers(items);
        if (items[0]) setBookmakerId(items[0].id);
      })
      .catch(() => setError('Could not load bookmakers'));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const slip = await createSlip({
        bookmakerId,
        bookingCode,
        slugPrefix: slugPrefix || undefined,
        totalOdds: totalOdds ? Number(totalOdds) : undefined,
      });

      setBookingCode('');
      setSlugPrefix('');
      setTotalOdds('');
      setCreatedSlip(slip);
      onCreated(slip);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create slip link');
    } finally {
      setLoading(false);
    }
  }

  function startAnother() {
    setCreatedSlip(null);
    setError('');
  }

  if (createdSlip) {
    return (
      <Card title="Slip link ready">
        <ShareLinkPanel shareUrl={createdSlip.shareUrl} autoCopy />
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-400">
          <span>{createdSlip.bookmaker.name}</span>
          {createdSlip.bookingCode ? (
            <>
              <span>·</span>
              <span className="font-mono text-zinc-300">{createdSlip.bookingCode}</span>
            </>
          ) : null}
          {createdSlip.totalOdds ? (
            <>
              <span>·</span>
              <span>{createdSlip.totalOdds}x odds</span>
            </>
          ) : null}
        </div>
        <Button type="button" variant="secondary" className="mt-6 w-full" onClick={startAnother}>
          Create another slip link
        </Button>
      </Card>
    );
  }

  return (
    <Card title="Create slip link">
      <p className="mb-4 text-sm text-zinc-400">
        Paste a bookmaker booking code and we generate a trackable slip link you
        can drop straight into WhatsApp.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-200">Bookmaker</span>
          <select
            value={bookmakerId}
            onChange={(event) => setBookmakerId(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500"
          >
            {bookmakers.map((bookmaker) => (
              <option key={bookmaker.id} value={bookmaker.id}>
                {bookmaker.name}
              </option>
            ))}
          </select>
        </label>

        <Input
          label="Booking code"
          value={bookingCode}
          onChange={(event) => setBookingCode(event.target.value)}
          placeholder="e.g. ABC123"
          required
        />

        <Input
          label="Custom slug prefix (optional)"
          value={slugPrefix}
          onChange={(event) => setSlugPrefix(event.target.value)}
          placeholder="fly-kamau"
          hint="Creates links like /r/fly-kamau-a1b2c3d4"
        />

        <Input
          label="Total odds (optional)"
          type="number"
          step="0.01"
          min="1"
          value={totalOdds}
          onChange={(event) => setTotalOdds(event.target.value)}
          hint="Shown on the compliance gate when followers open your link."
        />

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading || !bookmakerId} className="w-full">
          {loading ? 'Generating slip link…' : 'Generate slip link'}
        </Button>
      </form>
    </Card>
  );
}
