import { toWesternDigits } from './digits';
import { findGovernorate, GOVERNORATES, type Governorate } from './governorates';

export { GOVERNORATES, type Governorate };

export type Gender = 'male' | 'female';

/** Why a national ID was rejected. Each one can be shown as its own message in a form. */
export type NationalIdError =
  | 'invalid_format' //       not exactly 14 digits
  | 'invalid_century' //      first digit is not 2 (1900s) or 3 (2000s)
  | 'invalid_birth_date' //   the date does not exist, e.g. 30 February
  | 'future_birth_date' //    the date is after today
  | 'unknown_governorate'; // digits 8-9 are not a governorate code

export interface NationalIdInfo {
  valid: true;
  /** The 14 digits, cleaned (Western digits, no spaces). */
  nationalId: string;
  /** `YYYY-MM-DD`. A string, not a `Date`, so time zones can never shift it by a day. */
  birthDate: string;
  governorate: Governorate;
  gender: Gender;
}

export type NationalIdResult = NationalIdInfo | { valid: false; error: NationalIdError };

export interface NationalIdOptions {
  /** What "today" is, for the future-date check. Defaults to the current date (useful in tests). */
  now?: Date;
}

const CENTURIES: Record<string, number> = { '2': 1900, '3': 2000 };

// Spaces and dashes people type to group the digits.
const SEPARATORS = /[\s-]/g;

/**
 * Checks an Egyptian national ID (الرقم القومي) and reads the information inside it.
 *
 * Layout of the 14 digits: `C YYMMDD GG SSSS K`
 * - `C`      century: 2 = 1900s, 3 = 2000s
 * - `YYMMDD` birth date
 * - `GG`     governorate code (88 = born abroad)
 * - `SSSS`   serial number; its last digit (the 13th) is odd for males, even for females
 * - `K`      check digit. The way it is calculated is not officially published, so it is
 *            NOT verified: a number with a wrong check digit can still pass.
 *
 * @example
 * parseNationalId('29801010112335')
 * // { valid: true, nationalId: '29801010112335', birthDate: '1998-01-01',
 * //   governorate: { code: '01', nameAr: 'القاهرة', nameEn: 'Cairo' }, gender: 'male' }
 */
export function parseNationalId(input: string, options: NationalIdOptions = {}): NationalIdResult {
  if (typeof input !== 'string') return invalid('invalid_format');

  const id = toWesternDigits(input).replace(SEPARATORS, '');
  if (!/^\d{14}$/.test(id)) return invalid('invalid_format');

  const century = CENTURIES[id[0]!];
  if (century === undefined) return invalid('invalid_century');

  const year = century + Number(id.slice(1, 3));
  const month = Number(id.slice(3, 5));
  const day = Number(id.slice(5, 7));
  if (!isRealDate(year, month, day)) return invalid('invalid_birth_date');

  const now = options.now ?? new Date();
  if (isAfterToday(year, month, day, now)) return invalid('future_birth_date');

  const governorate = findGovernorate(id.slice(7, 9));
  if (!governorate) return invalid('unknown_governorate');

  const genderDigit = Number(id[12]);

  return {
    valid: true,
    nationalId: id,
    birthDate: `${year}-${pad(month)}-${pad(day)}`,
    governorate,
    gender: genderDigit % 2 === 1 ? 'male' : 'female',
  };
}

/** `true` if `parseNationalId` accepts the number. */
export function isValidNationalId(input: string, options: NationalIdOptions = {}): boolean {
  return parseNationalId(input, options).valid;
}

function invalid(error: NationalIdError): NationalIdResult {
  return { valid: false, error };
}

// Builds the date and checks it did not "roll over": new Date(1999, 1, 29) silently
// becomes 1 March, so if the parts we get back differ, the date does not exist.
function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

// Compares calendar days only (no hours), so someone born today is not "in the future".
function isAfterToday(year: number, month: number, day: number, now: Date): boolean {
  const birth = Date.UTC(year, month - 1, day);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return birth > today;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
