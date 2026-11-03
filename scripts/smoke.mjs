// Smoke test of the BUILT package (dist/), used the way people will use it:
// with `import` and with `require`, through the package name and its "exports" map.
// CI runs it on every Node version we support, including old ones where the dev tools
// (Vitest, tsup) don't run. Run `npm run build` first.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { normalizePhone, parseNationalId, toWesternDigits } from 'egypt-validators';
import { egyptianNationalId, egyptianPhone } from 'egypt-validators/zod';

const require = createRequire(import.meta.url);
const cjs = require('egypt-validators');
const cjsZod = require('egypt-validators/zod');

// ESM
assert.equal(normalizePhone('+20 10 1234 5678'), '01012345678');
assert.equal(toWesternDigits('٢٠٢٦'), '2026');
assert.equal(parseNationalId('29801010112335').valid, true);
assert.equal(egyptianPhone({ format: 'e164' }).parse('٠١٠١٢٣٤٥٦٧٨'), '+201012345678');

// CommonJS
assert.equal(cjs.normalizePhone('٠١٥١٢٣٤٥٦٧٨'), '01512345678');
assert.equal(cjsZod.egyptianNationalId().safeParse('29802300112335').success, false);
assert.equal(egyptianNationalId().safeParse('29801010112335').success, true);

console.log(`smoke test passed on Node ${process.version}`);
