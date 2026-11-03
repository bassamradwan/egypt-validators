# egypt-validators

[![CI](https://github.com/bassamradwan/egypt-validators/actions/workflows/ci.yml/badge.svg)](https://github.com/bassamradwan/egypt-validators/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/egypt-validators)](https://www.npmjs.com/package/egypt-validators)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Validate and normalize Egyptian data in JavaScript and TypeScript: **mobile numbers**, **national IDs (الرقم القومي)** and **Arabic digits**.

- Accepts what real users type: `+20`, `0020`, spaces, dashes, and Arabic digits like `٠١٠١٢٣٤٥٦٧٨`
- Reads the birth date, governorate and gender from a national ID, and says exactly what is wrong when it is invalid
- Zero dependencies. Optional [Zod](https://zod.dev) schemas for forms and APIs
- TypeScript types included. ESM and CommonJS. Works in Node.js (18+), browsers and React Native

**[بالعربي ↓](#بالعربي)**

## Why

Egyptian users type the same phone number in many shapes: `01012345678`, `+20 10…`, `0020…`, with spaces and dashes, or in Arabic digits from an Arabic keyboard. A strict regex rejects most of them, and a loose one stores the same person under several numbers. I first wrote this logic for a booking app for Egyptian users; this package is that logic, extracted, tested and documented so any Egyptian app can reuse it.

## Install

```bash
npm install egypt-validators

# only if you want the Zod schemas
npm install zod
```

## Mobile numbers

```ts
import { normalizePhone, isValidPhone, getCarrier, toE164 } from 'egypt-validators';

normalizePhone('+20 10 1234 5678'); // '01012345678'
normalizePhone('٠١٠١٢٣٤٥٦٧٨');      // '01012345678'
normalizePhone('0101234');          // null

isValidPhone('010-1234-5678');      // true
getCarrier('01212345678');          // 'orange'
toE164('010 1234 5678');            // '+201012345678'  (the format SMS and WhatsApp APIs expect)
```

`normalizePhone` always returns the same format (`01XXXXXXXXX`), so the same person can't sign up twice by typing their number differently.

| Accepted | Example |
|---|---|
| Local | `01012345678` |
| With country code | `+201012345678`, `00201012345678`, `201012345678` |
| Country code + local 0 | `+2001012345678` |
| Without the leading 0 | `1012345678` (forms with a separate `+20` field) |
| Separators | spaces, `-`, `.`, `(` `)` |
| Digits | Western `0-9`, Arabic `٠-٩`, Eastern Arabic `۰-۹` |

Valid prefixes: `010` Vodafone, `011` Etisalat (e&), `012` Orange, `015` WE.

## National ID (الرقم القومي)

```ts
import { parseNationalId, isValidNationalId } from 'egypt-validators';

parseNationalId('29801010112335');
// {
//   valid: true,
//   nationalId: '29801010112335',
//   birthDate: '1998-01-01',
//   governorate: { code: '01', nameAr: 'القاهرة', nameEn: 'Cairo' },
//   gender: 'male',
// }

parseNationalId('29802300112335');
// { valid: false, error: 'invalid_birth_date' }   (30 February does not exist)

isValidNationalId('٢٩٨٠١٠١٠١١٢٣٣٥'); // true  (Arabic digits, spaces and dashes are accepted)
```

How the 14 digits are read:

```
2  980101  01  1233  5
│    │     │     │   └─ check digit (not verified, see "Limits")
│    │     │     └───── serial number: its last digit (the 13th) is odd for male, even for female
│    │     └─────────── governorate code (01 Cairo, 02 Alexandria, 21 Giza, 88 born abroad...)
│    └───────────────── birth date YYMMDD
└────────────────────── century: 2 = 1900s, 3 = 2000s
```

When the ID is invalid, `error` says why, so a form can show a precise message:

| `error` | Meaning |
|---|---|
| `invalid_format` | not exactly 14 digits |
| `invalid_century` | the first digit is not 2 or 3 |
| `invalid_birth_date` | the date does not exist (month 13, 30 February, 29 February in a non-leap year) |
| `future_birth_date` | the date is after today |
| `unknown_governorate` | digits 8-9 are not a governorate code |

`birthDate` is a `YYYY-MM-DD` string, not a `Date`, so a time zone can never move it to the day before.

To check the future-date rule against a fixed day (in tests, for example), pass `now`: `parseNationalId(id, { now: new Date(2026, 0, 1) })`.

## Arabic digits

```ts
import { toWesternDigits } from 'egypt-validators';

toWesternDigits('٢٠٢٦');         // '2026'
toWesternDigits('رقم ٣ من ۱۰');  // 'رقم 3 من 10'
```

Useful on its own for any numeric input: amounts, codes, OTPs.

## Governorates

The list of governorate codes, with Arabic and English names, for a dropdown or a lookup:

```ts
import { GOVERNORATES, findGovernorate } from 'egypt-validators';

GOVERNORATES.length;   // 28 (27 governorates + 88 "born abroad")
findGovernorate('21'); // { code: '21', nameAr: 'الجيزة', nameEn: 'Giza' }
```

## Zod

Ready-made schemas, from a separate entry point (`egypt-validators/zod`) so apps that don't use Zod never load it. They validate **and** output the clean value.

```ts
import { z } from 'zod';
import { egyptianPhone, egyptianNationalId } from 'egypt-validators/zod';

const signupSchema = z.object({
  name: z.string().min(2),
  phone: egyptianPhone({ message: 'رقم الموبايل غير صحيح' }),
  nationalId: egyptianNationalId({
    messages: {
      invalid_format: 'الرقم القومي يجب أن يكون 14 رقمًا',
      invalid_birth_date: 'تاريخ الميلاد في الرقم القومي غير صحيح',
    },
  }),
});

signupSchema.parse({ name: 'منى', phone: '+20 10 1234 5678', nationalId: '29801010112345' });
// { name: 'منى', phone: '01012345678', nationalId: '29801010112345' }
```

- `egyptianPhone({ message?, format? })`: `format: 'e164'` outputs `+201012345678` instead of `01012345678`.
- `egyptianNationalId({ messages?, now? })`: replace any of the messages; the others keep their English default (`DEFAULT_NATIONAL_ID_MESSAGES`).

The same schema works in the browser (for example with React Hook Form) and on the server, so both check the data with the same rules.

## API

| Function | Returns |
|---|---|
| `normalizePhone(input)` | `'01XXXXXXXXX'` or `null` |
| `isValidPhone(input)` | `boolean` |
| `getCarrier(input)` | `'vodafone' \| 'etisalat' \| 'orange' \| 'we'` or `null` |
| `toE164(input)` | `'+201XXXXXXXXX'` or `null` |
| `parseNationalId(input, { now? })` | `{ valid: true, nationalId, birthDate, governorate, gender }` or `{ valid: false, error }` |
| `isValidNationalId(input, { now? })` | `boolean` |
| `toWesternDigits(input)` | `string` |
| `GOVERNORATES` | `{ code, nameAr, nameEn }[]` |
| `findGovernorate(code)` | `{ code, nameAr, nameEn }` or `undefined` |
| `egyptianPhone(options)` *(from `/zod`)* | Zod schema → `string` |
| `egyptianNationalId(options)` *(from `/zod`)* | Zod schema → `string` |

Invalid input never throws: the functions return `null`, `false` or `{ valid: false }`, even for `undefined` or a number.

## Limits

Being clear about what this package does **not** check:

- **The national ID check digit (the 14th) is not verified.** The way it is calculated is not officially published, so this package checks the structure, the date and the governorate only. A mistyped last digit will pass.
- **The carrier is the original network.** Egypt has mobile number portability, so a `010` number may have moved to another network. Use `getCarrier` as a hint (an icon, a default), not as a fact.
- **Mobile numbers only.** Landlines (`02…`, `03…`) are rejected.
- **"Today" is the date on the device or server running the code**, unless you pass `now`.

## Development

```bash
npm install
npm test               # unit tests (Vitest)
npm run typecheck      # TypeScript
npm run build          # ESM + CommonJS + types into dist/ (tsup)
npm run check:package  # checks the published package works for every module setup (publint, attw)
npm run smoke          # runs the built package with import and require
```

CI runs all of the above on every push, then installs the packed package in an empty project and runs it on Node 18, 20, 22 and 24.

## بالعربي

مكتبة للتحقق من البيانات المصرية وتوحيد شكلها:

- **أرقام الموبايل:** تقبل أي صيغة يكتبها المستخدم (`+20` أو `0020` أو مسافات أو أرقام عربية) وترجعها بصيغة واحدة `01XXXXXXXXX`.
- **الرقم القومي:** تتحقق منه وتستخرج تاريخ الميلاد والمحافظة والنوع، وتحدد سبب الخطأ بالضبط إن وُجد.
- **الأرقام العربية:** تحويل `٠١٢٣` إلى `0123`.
- **Zod:** schemas جاهزة برسائل خطأ عربية يمكن تخصيصها.

```ts
normalizePhone('٠١٠ ١٢٣٤ ٥٦٧٨'); // '01012345678'

const result = parseNationalId('29801010112335');
if (result.valid) {
  result.governorate.nameAr; // 'القاهرة'
} else {
  result.error;              // سبب الخطأ، مثل 'invalid_birth_date'
}
```

**ملاحظة:** رقم التحقق الأخير في الرقم القومي لا يُفحص، لأن طريقة حسابه غير منشورة رسميًا.

## License

[MIT](LICENSE)
