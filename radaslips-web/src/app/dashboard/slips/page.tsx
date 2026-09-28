'use client';

import { useEffect, useState } from 'react';
import { ApiError, listSlips } from '@/lib/api';
import type { Slip } from '@/lib/types';
import { CreateSlipForm } from '@/components/create-slip-form';
import { SlipList } from '@/components/slip-list';

export default function SlipsPage() {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [error, setError] = useState('');

  function loadSlips() {
    listSlips()
      .then(setSlips)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Failed to load slips');
      });
  }

  useEffect(() => {
    loadSlips();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-50">Slip links</h1>
        <p className="mt-2 text-zinc-400">
          Turn booking codes into trackable slip links for WhatsApp and Telegram.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <CreateSlipForm
          onCreated={(slip) => {
            setSlips((current) => [slip, ...current]);
          }}
        />
        <SlipList slips={slips} />
      </div>
    </div>
  );
}
