export interface Governorate {
  /** The two digits used in the national ID (digits 8 and 9). */
  code: string;
  nameAr: string;
  nameEn: string;
}

/**
 * The governorate codes used in Egyptian national IDs: the 27 governorates,
 * plus 88 for people born outside Egypt.
 */
export const GOVERNORATES: readonly Governorate[] = Object.freeze([
  { code: '01', nameAr: 'القاهرة', nameEn: 'Cairo' },
  { code: '02', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
  { code: '03', nameAr: 'بورسعيد', nameEn: 'Port Said' },
  { code: '04', nameAr: 'السويس', nameEn: 'Suez' },
  { code: '11', nameAr: 'دمياط', nameEn: 'Damietta' },
  { code: '12', nameAr: 'الدقهلية', nameEn: 'Dakahlia' },
  { code: '13', nameAr: 'الشرقية', nameEn: 'Sharqia' },
  { code: '14', nameAr: 'القليوبية', nameEn: 'Qalyubia' },
  { code: '15', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
  { code: '16', nameAr: 'الغربية', nameEn: 'Gharbia' },
  { code: '17', nameAr: 'المنوفية', nameEn: 'Monufia' },
  { code: '18', nameAr: 'البحيرة', nameEn: 'Beheira' },
  { code: '19', nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
  { code: '21', nameAr: 'الجيزة', nameEn: 'Giza' },
  { code: '22', nameAr: 'بني سويف', nameEn: 'Beni Suef' },
  { code: '23', nameAr: 'الفيوم', nameEn: 'Fayoum' },
  { code: '24', nameAr: 'المنيا', nameEn: 'Minya' },
  { code: '25', nameAr: 'أسيوط', nameEn: 'Assiut' },
  { code: '26', nameAr: 'سوهاج', nameEn: 'Sohag' },
  { code: '27', nameAr: 'قنا', nameEn: 'Qena' },
  { code: '28', nameAr: 'أسوان', nameEn: 'Aswan' },
  { code: '29', nameAr: 'الأقصر', nameEn: 'Luxor' },
  { code: '31', nameAr: 'البحر الأحمر', nameEn: 'Red Sea' },
  { code: '32', nameAr: 'الوادي الجديد', nameEn: 'New Valley' },
  { code: '33', nameAr: 'مطروح', nameEn: 'Matrouh' },
  { code: '34', nameAr: 'شمال سيناء', nameEn: 'North Sinai' },
  { code: '35', nameAr: 'جنوب سيناء', nameEn: 'South Sinai' },
  { code: '88', nameAr: 'خارج الجمهورية', nameEn: 'Born abroad' },
].map((g) => Object.freeze(g)));

/** The governorate for a two-digit code, or `undefined` if the code is not used. */
export function findGovernorate(code: string): Governorate | undefined {
  return GOVERNORATES.find((g) => g.code === code);
}
