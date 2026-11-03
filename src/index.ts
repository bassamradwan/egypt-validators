// The core: no dependencies. Zod helpers are a separate entry point: 'egypt-validators/zod'.
export { toWesternDigits } from './digits';
export { findGovernorate, GOVERNORATES, type Governorate } from './governorates';
export {
  isValidNationalId,
  parseNationalId,
  type Gender,
  type NationalIdError,
  type NationalIdInfo,
  type NationalIdOptions,
  type NationalIdResult,
} from './national-id';
export { getCarrier, isValidPhone, normalizePhone, toE164, type Carrier } from './phone';
