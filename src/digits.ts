// Arabic-Indic digits ٠-٩ are U+0660..U+0669 (what an Arabic keyboard types).
// Eastern Arabic digits ۰-۹ are U+06F0..U+06F9 (Persian/Urdu keyboards; some phones use them).
const ARABIC_INDIC_ZERO = 0x0660;
const EASTERN_ARABIC_ZERO = 0x06f0;

/**
 * Converts Arabic-Indic (٠-٩) and Eastern Arabic (۰-۹) digits to Western digits (0-9).
 * Every other character is left as it is.
 *
 * @example toWesternDigits('٠١٠١٢٣٤٥٦٧٨') // '01012345678'
 */
export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const zero = code >= EASTERN_ARABIC_ZERO ? EASTERN_ARABIC_ZERO : ARABIC_INDIC_ZERO;
    return String(code - zero);
  });
}
