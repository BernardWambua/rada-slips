export function maskPhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length < 4) {
    return '****';
  }
  return `***${digits.slice(-4)}`;
}

export function tipsterPublicName(
  displayName: string | null | undefined,
  phoneNumber: string,
): string {
  const trimmed = displayName?.trim();
  if (trimmed) {
    return trimmed;
  }
  return `Tipster ${maskPhoneNumber(phoneNumber)}`;
}
