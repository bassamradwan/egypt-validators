// Optional Zod helpers, imported from 'egypt-validators/zod'.
// They live in their own entry point so people who don't use Zod never load it.
import { z } from 'zod';
import { parseNationalId, type NationalIdError } from './national-id';
import { normalizePhone, toE164 } from './phone';

export interface EgyptianPhoneOptions {
  /** The error message. Default: 'Invalid Egyptian mobile number'. */
  message?: string;
  /** `'local'` → `01XXXXXXXXX` (default), `'e164'` → `+201XXXXXXXXX`. */
  format?: 'local' | 'e164';
}

/**
 * A Zod schema that accepts an Egyptian mobile number in any common format
 * and outputs it in one format.
 *
 * @example
 * const signup = z.object({ phone: egyptianPhone({ message: 'رقم الموبايل غير صحيح' }) });
 * signup.parse({ phone: '+20 10 1234 5678' }) // { phone: '01012345678' }
 */
export function egyptianPhone(options: EgyptianPhoneOptions = {}) {
  const { message = 'Invalid Egyptian mobile number', format = 'local' } = options;

  return z.string({ error: message }).transform((value, ctx) => {
    const phone = format === 'e164' ? toE164(value) : normalizePhone(value);
    if (phone === null) {
      ctx.addIssue({ code: 'custom', message });
      return z.NEVER;
    }
    return phone;
  });
}

export const DEFAULT_NATIONAL_ID_MESSAGES: Readonly<Record<NationalIdError, string>> = Object.freeze({
  invalid_format: 'National ID must be 14 digits',
  invalid_century: 'Invalid national ID',
  invalid_birth_date: 'National ID contains an invalid birth date',
  future_birth_date: 'National ID contains a birth date in the future',
  unknown_governorate: 'National ID contains an unknown governorate code',
});

export interface EgyptianNationalIdOptions {
  /** Replace any of the messages (see `DEFAULT_NATIONAL_ID_MESSAGES`); the rest keep their default. */
  messages?: Partial<Record<NationalIdError, string>>;
  /** What "today" is for the future-date check. Default: the date at the moment of parsing. */
  now?: Date;
}

/**
 * A Zod schema that checks an Egyptian national ID and outputs the cleaned 14 digits.
 * Each kind of mistake gets its own message, so a form can say exactly what is wrong.
 *
 * @example
 * egyptianNationalId({ messages: { invalid_birth_date: 'تاريخ الميلاد غير صحيح' } })
 */
export function egyptianNationalId(options: EgyptianNationalIdOptions = {}) {
  const messages = { ...DEFAULT_NATIONAL_ID_MESSAGES, ...options.messages };

  return z.string({ error: messages.invalid_format }).transform((value, ctx) => {
    // `now` is read on every parse (not once when the schema is created),
    // so a schema created at server start still knows what "today" is next week.
    const result = parseNationalId(value, options.now ? { now: options.now } : {});
    if (!result.valid) {
      ctx.addIssue({ code: 'custom', message: messages[result.error] });
      return z.NEVER;
    }
    return result.nationalId;
  });
}
