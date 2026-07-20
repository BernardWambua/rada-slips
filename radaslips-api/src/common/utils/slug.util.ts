import { randomBytes } from 'crypto';

export function generateSlug(prefix?: string): string {
  const suffix = randomBytes(4).toString('hex');
  if (!prefix) return suffix;
  const sanitized = prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);
  return sanitized ? `${sanitized}-${suffix}` : suffix;
}
