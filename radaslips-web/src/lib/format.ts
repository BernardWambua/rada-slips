export function formatKes(value: string | number): string {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('254')) {
    return `+${digits.slice(0, 12)}`;
  }

  if (digits.startsWith('0')) {
    return `+254${digits.slice(1, 10)}`;
  }

  if (digits.startsWith('7') || digits.startsWith('1')) {
    return `+254${digits.slice(0, 9)}`;
  }

  return value.startsWith('+') ? value : `+${digits}`;
}
