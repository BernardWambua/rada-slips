const KENYAN_PHONE_REGEX = /^\+254[17]\d{8}$/;

export function isValidKenyanPhone(phoneNumber: string): boolean {
  return KENYAN_PHONE_REGEX.test(phoneNumber);
}
