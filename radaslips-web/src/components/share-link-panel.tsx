'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ShareLinkPanel({
  shareUrl,
  autoCopy = false,
  compact = false,
}: {
  shareUrl: string;
  autoCopy?: boolean;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!autoCopy) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    void copyToClipboard(shareUrl).then((ok) => {
      if (cancelled || !ok) return;
      setCopied(true);
      timer = setTimeout(() => setCopied(false), 3000);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [autoCopy, shareUrl]);

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  async function handleCopy() {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(shareUrl)}`;

  return (
    <div
      className={
        compact
          ? 'space-y-3'
          : 'rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4'
      }
    >
      {!compact ? (
        <div>
          <p className="text-sm font-medium text-emerald-200">Slip link</p>
          <p className="mt-1 text-xs text-emerald-100/70">
            {autoCopy && copied
              ? 'Copied to clipboard — paste it in WhatsApp or Telegram.'
              : 'Copy this link and share it in your group chat.'}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={shareUrl}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 font-mono text-sm text-emerald-300 outline-none focus:border-emerald-500"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500"
          >
            Share on WhatsApp
          </a>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500"
          >
            Preview
          </a>
        </div>
      </div>
    </div>
  );
}
