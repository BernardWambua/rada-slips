const KENYAN_PHONE_REGEX = /^\+254[17]\d{8}$/;

export function isValidKenyanPhone(phoneNumber: string): boolean {
  return KENYAN_PHONE_REGEX.test(phoneNumber);
}

export function toDarajaPhone(phoneNumber: string): string {
  return phoneNumber.replace(/^\+/, '');
}

export function fromDarajaPhone(phoneNumber: string): string {
  return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
}
