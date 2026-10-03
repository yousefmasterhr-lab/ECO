/**
 * Arabic Financial Number-to-Words Converter (Tafqeet / التفقيط المالي)
 * Migrated and modernized from legacy Apps_Application_2017.ToWord engine.
 */

export interface CurrencyConfig {
  primaryNameSingle: string;
  primaryNamePlural: string;
  fractionNameSingle: string;
  fractionNamePlural: string;
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  EGP: {
    primaryNameSingle: 'جنيه مصري',
    primaryNamePlural: 'جنيهات مصرية',
    fractionNameSingle: 'قرش',
    fractionNamePlural: 'قروش',
  },
  SAR: {
    primaryNameSingle: 'ريال سعودي',
    primaryNamePlural: 'ريالات سعودية',
    fractionNameSingle: 'هللة',
    fractionNamePlural: 'هللات',
  },
  USD: {
    primaryNameSingle: 'دولار أمريكي',
    primaryNamePlural: 'دولارات أمريكية',
    fractionNameSingle: 'سنت',
    fractionNamePlural: 'سنتات',
  },
};

const ONES = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];

const TENS = [
  '',
  '',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون',
];

const HUNDREDS = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة',
];

function processThreeDigits(num: number): string {
  if (num === 0) return '';

  const h = Math.floor(num / 100);
  const remainder = num % 100;
  const parts: string[] = [];

  if (h > 0) {
    parts.push(HUNDREDS[h]);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(ONES[remainder]);
    } else {
      const o = remainder % 10;
      const t = Math.floor(remainder / 10);
      if (o > 0) {
        parts.push(`${ONES[o]} و${TENS[t]}`);
      } else {
        parts.push(TENS[t]);
      }
    }
  }

  return parts.join(' و');
}

export function tafqeetArabic(amount: number, currencyCode = 'EGP'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'صفر';
  }

  if (amount === 0) {
    const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.EGP;
    return `صفر ${config.primaryNameSingle} لا غير`;
  }

  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);

  const integerPart = Math.floor(absoluteAmount);
  const decimalPart = Math.round((absoluteAmount - integerPart) * 100);

  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.EGP;

  // Split integer part into 3-digit groups
  const billions = Math.floor(integerPart / 1_000_000_000);
  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1000);
  const ones = integerPart % 1000;

  const groupParts: string[] = [];

  // Billions
  if (billions > 0) {
    if (billions === 1) {
      groupParts.push('مليار');
    } else if (billions === 2) {
      groupParts.push('ملياران');
    } else if (billions >= 3 && billions <= 10) {
      groupParts.push(`${processThreeDigits(billions)} مليارات`);
    } else {
      groupParts.push(`${processThreeDigits(billions)} مليار`);
    }
  }

  // Millions
  if (millions > 0) {
    if (millions === 1) {
      groupParts.push('مليون');
    } else if (millions === 2) {
      groupParts.push('مليونان');
    } else if (millions >= 3 && millions <= 10) {
      groupParts.push(`${processThreeDigits(millions)} ملايين`);
    } else {
      groupParts.push(`${processThreeDigits(millions)} مليون`);
    }
  }

  // Thousands
  if (thousands > 0) {
    if (thousands === 1) {
      groupParts.push('ألف');
    } else if (thousands === 2) {
      groupParts.push('ألفان');
    } else if (thousands >= 3 && thousands <= 10) {
      groupParts.push(`${processThreeDigits(thousands)} آلاف`);
    } else {
      groupParts.push(`${processThreeDigits(thousands)} ألف`);
    }
  }

  // Units
  if (ones > 0) {
    groupParts.push(processThreeDigits(ones));
  }

  let result = groupParts.join(' و');

  // Currency unit for integer
  if (integerPart > 0) {
    if (integerPart >= 3 && integerPart <= 10) {
      result += ` ${config.primaryNamePlural}`;
    } else {
      result += ` ${config.primaryNameSingle}`;
    }
  }

  // Fraction
  if (decimalPart > 0) {
    const fractionText = processThreeDigits(decimalPart);
    const fractionUnit = decimalPart >= 3 && decimalPart <= 10 ? config.fractionNamePlural : config.fractionNameSingle;
    if (integerPart > 0) {
      result += ` و${fractionText} ${fractionUnit}`;
    } else {
      result = `${fractionText} ${fractionUnit}`;
    }
  }

  return `فقط ${isNegative ? 'سالب ' : ''}${result} لا غير`;
}

export const tafqeet = tafqeetArabic;
