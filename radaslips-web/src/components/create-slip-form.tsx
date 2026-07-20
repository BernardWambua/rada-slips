'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError, createSlip, listBookmakers } from '@/lib/api';
import type { Bookmaker, Slip, SlipType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function CreateSlipForm({ onCreated }: { onCreated: (slip: Slip) => void }) {
  const [bookmakers, setBookmakers] = useState<Bookmaker[]>([]);
  const [bookmakerId, setBookmakerId] = useState('');
  const [type, setType] = useState<SlipType>('SPORTS_SLIP');
  const [bookingCode, setBookingCode] = useState('');
  const [signalNotes, setSignalNotes] = useState('');
  const [slugPrefix, setSlugPrefix] = useState('');
  const [totalOdds, setTotalOdds] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        type,
        bookingCode: type === 'SPORTS_SLIP' ? bookingCode : undefined,
        signalNotes: type === 'CRASH_SIGNAL' ? signalNotes : undefined,
        slugPrefix: slugPrefix || undefined,
        totalOdds: totalOdds ? Number(totalOdds) : undefined,
      });

      setBookingCode('');
      setSignalNotes('');
      setSlugPrefix('');
      setTotalOdds('');
      onCreated(slip);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create slip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Create slip">
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

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-zinc-200">Slip type</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as SlipType)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500"
          >
            <option value="SPORTS_SLIP">Sports slip (booking code)</option>
            <option value="CRASH_SIGNAL">Crash signal</option>
          </select>
        </label>

        {type === 'SPORTS_SLIP' ? (
          <Input
            label="Booking code"
            value={bookingCode}
            onChange={(event) => setBookingCode(event.target.value)}
            placeholder="e.g. ABC123"
            required
          />
        ) : (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-zinc-200">Signal notes</span>
            <textarea
              value={signalNotes}
              onChange={(event) => setSignalNotes(event.target.value)}
              required
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500"
              placeholder="Cash out at 2.5x..."
            />
          </label>
        )}

        <Input
          label="Custom slug prefix (optional)"
          value={slugPrefix}
          onChange={(event) => setSlugPrefix(event.target.value)}
          placeholder="fly-kamau"
          hint="Creates links like /r/fly-kamau-a1b2c3d4"
        />

        {type === 'SPORTS_SLIP' ? (
          <Input
            label="Total odds (optional)"
            type="number"
            step="0.01"
            min="1"
            value={totalOdds}
            onChange={(event) => setTotalOdds(event.target.value)}
          />
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading || !bookmakerId} className="w-full">
          {loading ? 'Creating…' : 'Generate share link'}
        </Button>
      </form>
    </Card>
  );
}
