import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { egyptianNationalId, egyptianPhone } from '../src/zod';

const now = new Date(2026, 10, 3);

function firstMessage(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe('egyptianPhone', () => {
  it('outputs the local format 01XXXXXXXXX by default', () => {
    expect(egyptianPhone().parse('+20 10 1234 5678')).toBe('01012345678');
  });

  it('outputs E.164 when asked', () => {
    expect(egyptianPhone({ format: 'e164' }).parse('٠١٠١٢٣٤٥٦٧٨')).toBe('+201012345678');
  });

  it('fails with a default English message', () => {
    expect(firstMessage(egyptianPhone().safeParse('12345'))).toBe('Invalid Egyptian mobile number');
  });

  it('fails with a custom message', () => {
    const schema = egyptianPhone({ message: 'رقم الموبايل غير صحيح' });
    expect(firstMessage(schema.safeParse('12345'))).toBe('رقم الموبايل غير صحيح');
  });

  it('uses the same message when the value is not a string', () => {
    const schema = egyptianPhone({ message: 'رقم الموبايل غير صحيح' });
    expect(firstMessage(schema.safeParse(1012345678))).toBe('رقم الموبايل غير صحيح');
  });

  it('works inside an object schema and reports the field path', () => {
    const signup = z.object({ name: z.string(), phone: egyptianPhone() });

    expect(signup.parse({ name: 'Mona', phone: '010-1234-5678' })).toEqual({
      name: 'Mona',
      phone: '01012345678',
    });

    const failed = signup.safeParse({ name: 'Mona', phone: '0101234' });
    expect(failed.success).toBe(false);
    expect(failed.error?.issues[0]?.path).toEqual(['phone']);
  });
});

describe('egyptianNationalId', () => {
  it('outputs the cleaned 14 digits', () => {
    expect(egyptianNationalId({ now }).parse('٢ ٩٨٠١٠١ ٠١ ١٢٣٣ ٥')).toBe('29801010112335');
  });

  it.each([
    ['2980101', 'National ID must be 14 digits'],
    ['19801010112335', 'Invalid national ID'],
    ['29802300112335', 'National ID contains an invalid birth date'],
    ['32612010112335', 'National ID contains a birth date in the future'],
    ['29801010512335', 'National ID contains an unknown governorate code'],
  ])('fails %s with "%s"', (input, message) => {
    expect(firstMessage(egyptianNationalId({ now }).safeParse(input))).toBe(message);
  });

  it('lets each message be replaced, keeping the defaults for the rest', () => {
    const schema = egyptianNationalId({
      now,
      messages: { invalid_birth_date: 'تاريخ الميلاد في الرقم القومي غير صحيح' },
    });
    expect(firstMessage(schema.safeParse('29802300112335'))).toBe(
      'تاريخ الميلاد في الرقم القومي غير صحيح',
    );
    expect(firstMessage(schema.safeParse('2980101'))).toBe('National ID must be 14 digits');
  });

  it('uses the invalid_format message when the value is not a string', () => {
    expect(firstMessage(egyptianNationalId().safeParse(29801010112335))).toBe(
      'National ID must be 14 digits',
    );
  });

  it('checks the future date against the real today when no `now` is given', () => {
    expect(egyptianNationalId().safeParse('29801010112335').success).toBe(true);
  });
});
