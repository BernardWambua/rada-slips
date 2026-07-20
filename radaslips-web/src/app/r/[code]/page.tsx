import { notFound } from 'next/navigation';
import { ComplianceGate } from '@/components/compliance-gate';
import { serverResolveSlip } from '@/lib/server-api';
import type { ResolvedSlip } from '@/lib/types';

export default async function SlipGatewayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const slip = (await serverResolveSlip(code)) as ResolvedSlip | null;

  if (!slip) {
    notFound();
  }

  return <ComplianceGate slip={slip} />;
}
