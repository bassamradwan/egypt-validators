import { toWesternDigits } from './digits';

/**
 * The network a number was first issued by, read from its prefix.
 * Egypt has mobile number portability, so a number can move to another network later:
 * treat this as a hint (for example to pick an icon), not as a fact.
 */
export type Carrier = 'vodafone' | 'etisalat' | 'orange' | 'we';

const CARRIERS: Record<string, Carrier> = {
  '10': 'vodafone',
  '11': 'etisalat',
  '12': 'orange',
  '15': 'we',
};

// Characters people type between digits: spaces, dashes, dots and brackets.
const SEPARATORS = /[\s\-.()]/g;

// Optional country code (+20, 0020 or 20), optional local leading 0,
// then the 10-digit national number: 1, then 0/1/2/5, then 8 digits.
const EGYPTIAN_MOBILE = /^(?:\+20|0020|20)?0?(1[0125]\d{8})$/;

/**
 * Returns the number in the local format `01XXXXXXXXX`, or `null` if it is not
 * a valid Egyptian mobile number.
 *
 * Accepts `01012345678`, `+201012345678`, `00201012345678`, `201012345678`,
 * `1012345678`, with spaces, dashes, dots or brackets, in Western or Arabic digits.
 *
 * @example normalizePhone('+20 10 1234 5678') // '01012345678'
 * @example normalizePhone('٠١٠١٢٣٤٥٦٧٨')      // '01012345678'
 * @example normalizePhone('0101234')          // null
 */
export function normalizePhone(input: string): string | null {
  if (typeof input !== 'string') return null;

  const cleaned = toWesternDigits(input).replace(SEPARATORS, '');
  const match = EGYPTIAN_MOBILE.exec(cleaned);
  return match ? `0${match[1]}` : null;
}

/** `true` if `normalizePhone` accepts the number. */
export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

/**
 * The network the number was first issued by (see {@link Carrier} for why it is only a hint),
 * or `null` for an invalid number.
 *
 * @example getCarrier('01212345678') // 'orange'
 */
export function getCarrier(input: string): Carrier | null {
  const phone = normalizePhone(input);
  if (!phone) return null;
  // '01X...' -> the two digits after the leading 0 decide the network.
  return CARRIERS[phone.slice(1, 3)] ?? null;
}

/**
 * The number in the international E.164 format (`+201XXXXXXXXX`) that SMS and
 * WhatsApp APIs expect, or `null` for an invalid number.
 *
 * @example toE164('010 1234 5678') // '+201012345678'
 */
export function toE164(input: string): string | null {
  const phone = normalizePhone(input);
  return phone ? `+20${phone.slice(1)}` : null;
}
