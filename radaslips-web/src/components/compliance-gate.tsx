import Link from 'next/link';
import type { ResolvedSlip } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function ComplianceGate({ slip }: { slip: ResolvedSlip }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl shadow-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          RadaSlips Gateway
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-50">
          {slip.bookmaker.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          You are about to visit a licensed betting operator via a shared slip
          link.
        </p>

        <div className="mt-6 space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">
          <p>{slip.compliance.ageRequirement}</p>
          <p>{slip.compliance.responsibleGambling}</p>
          <p>{slip.compliance.regulatoryStatus}</p>
          <p>License: {slip.compliance.licenseNumber}</p>
          <p>Support: {slip.compliance.supportPhone}</p>
        </div>

        {slip.bookingCode ? (
          <p className="mt-4 text-sm text-zinc-300">
            Booking code:{' '}
            <span className="font-mono text-emerald-300">{slip.bookingCode}</span>
          </p>
        ) : null}

        {slip.signalNotes ? (
          <p className="mt-4 rounded-lg bg-zinc-900 p-3 text-sm text-zinc-300">
            {slip.signalNotes}
          </p>
        ) : null}

        <form action={`/r/${slip.slug}/continue`} method="POST" className="mt-8">
          <Button type="submit" className="w-full">
            I am 18+ — continue to {slip.bookmaker.name}
          </Button>
        </form>

        <Link
          href="/"
          className="mt-4 block text-center text-sm text-zinc-500 hover:text-zinc-300"
        >
          Leave
        </Link>
      </div>
    </div>
  );
}
