const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000';

export async function serverResolveSlip(slug: string) {
  const response = await fetch(`${API_URL}/slips/resolve/${slug}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function serverRecordClick(slug: string) {
  const response = await fetch(`${API_URL}/analytics/clicks/${slug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gatewayAccepted: true }),
  });

  return response.ok;
}

export async function serverResolveTargetUrl(slug: string): Promise<string | null> {
  const slip = await serverResolveSlip(slug);
  if (!slip || typeof slip !== 'object' || !('targetUrl' in slip)) {
    return null;
  }

  return String((slip as { targetUrl: string }).targetUrl);
}
