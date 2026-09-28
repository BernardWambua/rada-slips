'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  ApiError,
  getMpesaStatus,
  listMpesaWithdrawals,
  requestMpesaWithdrawal,
} from '@/lib/api';
import type { MpesaIntegrationStatus, MpesaPayout } from '@/lib/types';
import { formatDate, formatKes } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function WithdrawalPanel({
  availableBalance,
  defaultPhoneNumber,
  onWithdrawn,
}: {
  availableBalance: string;
  defaultPhoneNumber: string;
  onWithdrawn?: () => void;
}) {
  const [status, setStatus] = useState<MpesaIntegrationStatus | null>(null);
  const [withdrawals, setWithdrawals] = useState<MpesaPayout[]>([]);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(defaultPhoneNumber);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhoneNumber(defaultPhoneNumber);
  }, [defaultPhoneNumber]);

  useEffect(() => {
    Promise.all([getMpesaStatus(), listMpesaWithdrawals()])
      .then(([integration, history]) => {
        setStatus(integration);
        setWithdrawals(history);
      })
      .catch(() => setError('Could not load M-Pesa settings'));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payout = await requestMpesaWithdrawal({
        amount: Number(amount),
        phoneNumber: phoneNumber || undefined,
      });
      setWithdrawals((current) => [payout, ...current]);
      setAmount('');
      onWithdrawn?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  }

  const minAmount = status?.withdrawalMinAmount ?? 10;
  const feeRate = status?.withdrawalFeeRate ?? 0.01;
  const parsedAmount = Number(amount) || 0;
  const estimatedFee = parsedAmount * feeRate;
  const estimatedNet = parsedAmount - estimatedFee;

  return (
    <Card title="M-Pesa withdrawals">
      <div className="mb-4 space-y-2 text-sm text-zinc-400">
        <p>
          Available balance:{' '}
          <span className="font-medium text-zinc-100">{formatKes(availableBalance)}</span>
        </p>
        {status ? (
          <p>
            Integration:{' '}
            <span className="font-medium text-amber-200">
              {status.mode === 'mock' ? 'Mock mode' : 'Live Daraja'}
            </span>
            {' · '}
            min {formatKes(String(minAmount))}, fee {(feeRate * 100).toFixed(1)}%
          </p>
        ) : null}
        {status?.mode === 'mock' ? (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-amber-100">
            {status.notes}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount (KES)"
          type="number"
          min={minAmount}
          step="1"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />

        <Input
          label="M-Pesa phone"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="+2547XXXXXXXX"
          hint="Defaults to your registered tipster number."
        />

        {parsedAmount >= minAmount ? (
          <p className="text-sm text-zinc-500">
            Estimated payout: {formatKes(String(Math.max(estimatedNet, 0).toFixed(2)))}{' '}
            after {formatKes(String(estimatedFee.toFixed(2)))} fee
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending to M-Pesa…' : 'Withdraw to M-Pesa'}
        </Button>
      </form>

      {withdrawals.length > 0 ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-zinc-200">Recent withdrawals</p>
          {withdrawals.slice(0, 5).map((payout) => (
            <div
              key={payout.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-100">{formatKes(payout.netAmount)}</span>
                <span className="text-zinc-500">{payout.status}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {formatDate(payout.createdAt)}
                {payout.mpesaReceiptNumber
                  ? ` · ${payout.mpesaReceiptNumber}`
                  : payout.resultDesc
                    ? ` · ${payout.resultDesc}`
                    : ''}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
