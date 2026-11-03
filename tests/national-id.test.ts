import { describe, expect, it } from 'vitest';
import { GOVERNORATES, isValidNationalId, parseNationalId } from '../src/national-id';

// A fixed "today" so the tests give the same result on any day they run.
const now = new Date(2026, 10, 3); // 3 November 2026 (months start at 0)

// How the 14 digits are read, using the first example:
//   2 | 980101 | 01 | 1233 | 5
//   century (2 = 1900s, 3 = 2000s) | birth date YYMMDD | governorate | serial (last digit: odd = male) | check digit

describe('parseNationalId: valid numbers', () => {
  it('reads the birth date, governorate and gender', () => {
    expect(parseNationalId('29801010112335', { now })).toEqual({
      valid: true,
      nationalId: '29801010112335',
      birthDate: '1998-01-01',
      governorate: { code: '01', nameAr: 'القاهرة', nameEn: 'Cairo' },
      gender: 'male',
    });
  });

  it('reads an even 13th digit as female', () => {
    const result = parseNationalId('29801010112345', { now });
    expect(result.valid && result.gender).toBe('female');
  });

  it('reads century digit 3 as the 2000s', () => {
    const result = parseNationalId('30105152101234', { now });
    expect(result.valid && result.birthDate).toBe('2001-05-15');
    expect(result.valid && result.governorate.nameEn).toBe('Giza');
  });

  it('accepts code 88 (born outside Egypt)', () => {
    const result = parseNationalId('29912318801234', { now });
    expect(result.valid && result.governorate).toEqual({
      code: '88',
      nameAr: 'خارج الجمهورية',
      nameEn: 'Born abroad',
    });
  });

  it('accepts 29 February in a leap year', () => {
    const result = parseNationalId('30002290112345', { now });
    expect(result.valid && result.birthDate).toBe('2000-02-29');
  });

  it('accepts someone born today', () => {
    expect(parseNationalId('32611030112335', { now }).valid).toBe(true);
  });

  it('accepts Arabic digits, spaces and dashes', () => {
    expect(parseNationalId('٢٩٨٠١٠١٠١١٢٣٣٥', { now }).valid).toBe(true);
    expect(parseNationalId('2 980101 01 1233 5', { now }).valid).toBe(true);
    expect(parseNationalId('2-980101-01-1233-5', { now }).valid).toBe(true);
  });

  it('returns the cleaned 14 digits', () => {
    const result = parseNationalId('٢ ٩٨٠١٠١ ٠١ ١٢٣٣ ٥', { now });
    expect(result.valid && result.nationalId).toBe('29801010112335');
  });
});

describe('parseNationalId: invalid numbers', () => {
  it.each([
    ['2980101011233', '13 digits'],
    ['298010101123355', '15 digits'],
    ['2980101011233a', 'a letter'],
    ['', 'empty'],
  ])('rejects %s (%s) as invalid_format', (input) => {
    expect(parseNationalId(input, { now })).toEqual({ valid: false, error: 'invalid_format' });
  });

  it('rejects non-string input as invalid_format instead of throwing', () => {
    expect(parseNationalId(undefined as unknown as string)).toEqual({
      valid: false,
      error: 'invalid_format',
    });
  });

  it.each(['19801010112335', '49801010112335'])('rejects century digit in %s', (input) => {
    expect(parseNationalId(input, { now })).toEqual({ valid: false, error: 'invalid_century' });
  });

  it.each([
    ['29813010112335', 'month 13'],
    ['29800010112335', 'month 00'],
    ['29801000112335', 'day 00'],
    ['29802300112335', '30 February'],
    ['29902290112335', '29 February 1999 (not a leap year)'],
    ['29804310112335', '31 April'],
  ])('rejects %s (%s) as invalid_birth_date', (input) => {
    expect(parseNationalId(input, { now })).toEqual({ valid: false, error: 'invalid_birth_date' });
  });

  it('rejects a birth date after today as future_birth_date', () => {
    // 2026-12-01 is after "today" (2026-11-03)
    expect(parseNationalId('32612010112335', { now })).toEqual({
      valid: false,
      error: 'future_birth_date',
    });
  });

  it.each([
    ['29801010512335', 'code 05'],
    ['29801010012335', 'code 00'],
    ['29801019912335', 'code 99'],
  ])('rejects %s (%s) as unknown_governorate', (input) => {
    expect(parseNationalId(input, { now })).toEqual({ valid: false, error: 'unknown_governorate' });
  });
});

describe('parseNationalId: default "today"', () => {
  it('uses the real current date when no `now` is given', () => {
    // Born in 1998: valid on any day this test runs.
    expect(parseNationalId('29801010112335').valid).toBe(true);
  });
});

describe('isValidNationalId', () => {
  it('is true for a valid number', () => {
    expect(isValidNationalId('29801010112335', { now })).toBe(true);
  });

  it('is false for an invalid number', () => {
    expect(isValidNationalId('29813010112335', { now })).toBe(false);
  });
});

describe('GOVERNORATES', () => {
  it('lists the 27 governorates plus "born abroad"', () => {
    expect(GOVERNORATES).toHaveLength(28);
  });

  it('has unique codes', () => {
    const codes = GOVERNORATES.map((g) => g.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('uses two-digit codes', () => {
    for (const g of GOVERNORATES) expect(g.code).toMatch(/^\d{2}$/);
  });
});
