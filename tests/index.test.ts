import { describe, expect, it } from 'vitest';
import * as library from '../src/index';

describe('public entry point', () => {
  it('exports exactly the public API (and does not load Zod)', () => {
    expect(Object.keys(library).sort()).toEqual(
      [
        'GOVERNORATES',
        'findGovernorate',
        'getCarrier',
        'isValidNationalId',
        'isValidPhone',
        'normalizePhone',
        'parseNationalId',
        'toE164',
        'toWesternDigits',
      ].sort(),
    );
  });
});
