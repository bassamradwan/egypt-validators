# Changelog

This project follows [Semantic Versioning](https://semver.org): breaking changes bump the major version (after 1.0.0).

## 0.1.0

First release.

- Mobile numbers: `normalizePhone`, `isValidPhone`, `getCarrier`, `toE164`
- National ID: `parseNationalId`, `isValidNationalId`, with a reason for every rejection
- `toWesternDigits` for Arabic-Indic and Eastern Arabic digits
- `GOVERNORATES` and `findGovernorate`
- Zod schemas (`egypt-validators/zod`): `egyptianPhone`, `egyptianNationalId`
