import { describe, expect, it } from 'vitest';
import { getCarrier, isValidPhone, normalizePhone, toE164 } from '../src/phone';

describe('normalizePhone', () => {
  it('keeps a valid local number as it is', () => {
    expect(normalizePhone('01012345678')).toBe('01012345678');
  });

  it.each(['010', '011', '012', '015'])('accepts the %s prefix', (prefix) => {
    expect(normalizePhone(`${prefix}12345678`)).toBe(`${prefix}12345678`);
  });

  it.each([
    ['+201012345678', 'with +20'],
    ['00201012345678', 'with 0020'],
    ['201012345678', 'with 20'],
    ['+2001012345678', 'with +20 and the local leading 0'],
    ['1012345678', 'without the leading 0 (a form with a separate +20 field)'],
  ])('converts %s (%s) to the local format', (input) => {
    expect(normalizePhone(input)).toBe('01012345678');
  });

  it.each([
    '010 1234 5678',
    '010-1234-5678',
    '010.1234.5678',
    '+20 (10) 1234-5678',
    '  01012345678  ',
  ])('ignores spaces, dashes, dots and brackets: "%s"', (input) => {
    expect(normalizePhone(input)).toBe('01012345678');
  });

  it('accepts Arabic digits', () => {
    expect(normalizePhone('٠١٠١٢٣٤٥٦٧٨')).toBe('01012345678');
    expect(normalizePhone('+٢٠ ١٠ ١٢٣٤ ٥٦٧٨')).toBe('01012345678');
  });

  it.each([
    ['01312345678', 'unknown prefix 013'],
    ['01912345678', 'unknown prefix 019'],
    ['0101234567', 'one digit short'],
    ['010123456789', 'one digit too many'],
    ['0223456789', 'a Cairo landline'],
    ['+966501234567', 'a Saudi number'],
    ['010-1234-567a', 'contains a letter'],
    ['01+012345678', 'a plus sign in the middle'],
    ['', 'empty'],
    ['   ', 'only spaces'],
  ])('rejects %s (%s)', (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  it('returns null instead of throwing for non-string input (plain JavaScript callers)', () => {
    expect(normalizePhone(undefined as unknown as string)).toBeNull();
    expect(normalizePhone(1012345678 as unknown as string)).toBeNull();
  });
});

describe('isValidPhone', () => {
  it('is true for a number normalizePhone accepts', () => {
    expect(isValidPhone('+20 10 1234 5678')).toBe(true);
  });

  it('is false for a number normalizePhone rejects', () => {
    expect(isValidPhone('01312345678')).toBe(false);
  });
});

describe('getCarrier', () => {
  it.each([
    ['01012345678', 'vodafone'],
    ['01112345678', 'etisalat'],
    ['01212345678', 'orange'],
    ['01512345678', 'we'],
  ] as const)('maps %s to %s', (input, carrier) => {
    expect(getCarrier(input)).toBe(carrier);
  });

  it('works with any accepted format', () => {
    expect(getCarrier('+20 12 1234 5678')).toBe('orange');
  });

  it('returns null for an invalid number', () => {
    expect(getCarrier('01312345678')).toBeNull();
  });
});

describe('toE164', () => {
  it('converts a local number to the international E.164 format', () => {
    expect(toE164('01012345678')).toBe('+201012345678');
  });

  it('works with any accepted format', () => {
    expect(toE164('٠١٥ ١٢٣٤ ٥٦٧٨')).toBe('+201512345678');
  });

  it('returns null for an invalid number', () => {
    expect(toE164('12345')).toBeNull();
  });
});
