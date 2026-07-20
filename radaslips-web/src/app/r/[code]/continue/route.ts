import { notFound, redirect } from 'next/navigation';
import {
  serverRecordClick,
  serverResolveTargetUrl,
} from '@/lib/server-api';

export async function POST(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const targetUrl = await serverResolveTargetUrl(code);

  if (!targetUrl) {
    notFound();
  }

  await serverRecordClick(code);
  redirect(targetUrl);
}
