import { describe, expect, it } from 'vitest';
import { toWesternDigits } from '../src/digits';

describe('toWesternDigits', () => {
  it('converts Arabic-Indic digits (٠-٩) to 0-9', () => {
    expect(toWesternDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });

  it('converts Eastern Arabic (Persian/Urdu keyboard) digits (۰-۹) to 0-9', () => {
    expect(toWesternDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789');
  });

  it('leaves Western digits and other characters unchanged', () => {
    expect(toWesternDigits('رقم 2026 - abc')).toBe('رقم 2026 - abc');
  });

  it('handles mixed input', () => {
    expect(toWesternDigits('+٢٠ 10 ۱۲۳٤')).toBe('+20 10 1234');
  });

  it('returns an empty string for an empty string', () => {
    expect(toWesternDigits('')).toBe('');
  });
});
