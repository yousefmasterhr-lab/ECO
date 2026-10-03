export type Language = 'ar' | 'en';
export type ThemePresetId = 'royal-olive' | 'nordic-teal' | 'royal-indigo' | 'imperial-bordeaux';
export type Theme = ThemePresetId | 'dark' | 'light';

export interface Company {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  badgeAr: string;
  badgeEn: string;
  logoColor: string;
  jurisdiction?: 'KSA' | 'EGYPT';
  taxNo?: string;
  commercialReg?: string;
  addressAr?: string;
  currency?: 'SAR' | 'EGP';
  currencySymbol?: 'ر.س' | 'ج.م';
}

export interface UserProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  clearanceLevel: 1 | 2 | 3 | 4;
  clearanceNameAr: string;
  clearanceNameEn: string;
  avatarUrl?: string;
}

export interface NavSubItem {
  id: string;
  titleAr: string;
  titleEn: string;
  badge?: string;
  children?: NavSubItem[];
}

export interface DepartmentNavCategory {
  id: string;
  iconName: string;
  titleAr: string;
  titleEn: string;
  colorVar: string;
  badgeAr?: string;
  badgeEn?: string;
  subItems: NavSubItem[];
}
