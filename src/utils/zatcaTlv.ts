/**
 * ZATCA Phase 1 E-Invoicing TLV (Tag-Length-Value) QR Code Engine
 * Migrated and modernized from legacy Apps_Application_2017.zatca.einvoicing.TLVCls
 * Strictly compliant with Saudi ZATCA (FATOORA Phase 1) regulations.
 */

import QRCode from 'qrcode';

export interface ZatcaInvoiceParams {
  sellerName: string;
  vatRegistrationNumber: string; // 15 digits: starts with '3' and ends with '3' (VAT code '03')
  invoiceTimestamp: string;      // ISO 8601: YYYY-MM-DDTHH:mm:ssZ or with timezone offset
  invoiceTotalWithVat: number | string;
  vatTotal: number | string;
}

export interface ZatcaValidationResult {
  isValid: boolean;
  status: 'VALID' | 'INVALID';
  errors: string[];
  warnings: string[];
  parsed?: {
    sellerName: string;
    vatNumber: string;
    timestamp: string;
    totalWithVat: number;
    vatTotal: number;
    taxableAmount: number;
  };
}

/**
 * Normalizes and formats an ISO 8601 timestamp with full seconds and UTC/offset
 * ZATCA Phase 1 validator strictly requires full seconds (HH:mm:ss)
 */
export function formatZatcaTimestamp(dateInput?: string | Date): string {
  if (!dateInput) {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  if (dateInput instanceof Date) {
    return dateInput.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  const str = String(dateInput).trim();
  // If already standard ISO with seconds
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
    return str.includes('Z') || /[+-]\d{2}:\d{2}$/.test(str) ? str : `${str}Z`;
  }

  // If date-only YYYY-MM-DD
  const dateMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (dateMatch) {
    const [, y, m, d] = dateMatch;
    const pad = (v: string) => v.padStart(2, '0');
    return `${y}-${pad(m)}-${pad(d)}T12:00:00Z`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  return `${str}T12:00:00Z`;
}

/**
 * Validates a Saudi 15-digit VAT number according to ZATCA standards:
 * - Exactly 15 digits
 * - Starts with '3'
 * - Ends with '3' (denoting VAT category code '03')
 */
export function validateZatcaVatNumber(vatNo: string): { isValid: boolean; error?: string } {
  const cleaned = (vatNo || '').replace(/\D/g, '');

  if (cleaned.length !== 15) {
    return {
      isValid: false,
      error: `الرقم الضريبي يجب أن يتكون من 15 رقماً تماماً (المدخل: ${cleaned.length} رقم).`,
    };
  }

  if (!cleaned.startsWith('3')) {
    return {
      isValid: false,
      error: 'الرقم الضريبي للمنشأة في السعودية يجب أن يبدأ بالرقم 3 (كود المملكة).',
    };
  }

  if (!cleaned.endsWith('3')) {
    return {
      isValid: false,
      error: 'الرقم الضريبي للمنشأة يجب أن ينتهي بالرقم 3 (حيث الخانتان 14 و 15 تمثلان كود الضريبة 03).',
    };
  }

  return { isValid: true };
}

/**
 * Encodes a single TLV tag:
 * Tag (1 byte) + Length (1 byte, UTF-8 byte length) + Value (UTF-8 bytes)
 */
function encodeTlvTag(tagNumber: number, valueStr: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(valueStr.trim());
  const tagLength = valueBytes.length;

  const result = new Uint8Array(2 + tagLength);
  result[0] = tagNumber;
  result[1] = tagLength;
  result.set(valueBytes, 2);

  return result;
}

/**
 * Generates the concatenated TLV byte array for the 5 mandatory ZATCA Phase 1 tags:
 * 1. Seller's Registered Name
 * 2. 15-digit VAT Registration Number (starts & ends with 3)
 * 3. Invoice Timestamp (ISO 8601 with seconds)
 * 4. Invoice Total with Tax (formatted to 2 decimal places)
 * 5. VAT Tax Total (formatted to 2 decimal places)
 */
export function generateZatcaTlvBytes(params: ZatcaInvoiceParams): Uint8Array {
  const totalNum =
    typeof params.invoiceTotalWithVat === 'number'
      ? params.invoiceTotalWithVat
      : parseFloat(params.invoiceTotalWithVat || '0');

  const vatNum =
    typeof params.vatTotal === 'number'
      ? params.vatTotal
      : parseFloat(params.vatTotal || '0');

  const totalFormatted = totalNum.toFixed(2);
  const vatFormatted = vatNum.toFixed(2);
  const timestampFormatted = formatZatcaTimestamp(params.invoiceTimestamp);

  const tag1 = encodeTlvTag(1, params.sellerName);
  const tag2 = encodeTlvTag(2, params.vatRegistrationNumber);
  const tag3 = encodeTlvTag(3, timestampFormatted);
  const tag4 = encodeTlvTag(4, totalFormatted);
  const tag5 = encodeTlvTag(5, vatFormatted);

  const totalLength =
    tag1.length + tag2.length + tag3.length + tag4.length + tag5.length;
  const combined = new Uint8Array(totalLength);

  let offset = 0;
  for (const tag of [tag1, tag2, tag3, tag4, tag5]) {
    combined.set(tag, offset);
    offset += tag.length;
  }

  return combined;
}

/**
 * Encodes the ZATCA TLV bytes into a standard Base64 string
 */
export function generateZatcaTlvBase64(params: ZatcaInvoiceParams): string {
  const bytes = generateZatcaTlvBytes(params);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generates a high-resolution QR Code Data URL from ZATCA TLV parameters
 */
export async function generateZatcaQrDataUrl(
  params: ZatcaInvoiceParams,
  width = 256
): Promise<string> {
  const base64String = generateZatcaTlvBase64(params);
  try {
    return await QRCode.toDataURL(base64String, {
      width,
      margin: 1,
      color: {
        dark: '#141E16',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('[ZATCA] QR Code generation error:', err);
    return '';
  }
}

/**
 * Decodes and validates a ZATCA Base64 TLV string, verifying all 5 tags and checking
 * compliance with official ZATCA Phase 1 scanner rules.
 */
export function validateZatcaTlvBase64(base64String: string): ZatcaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const binary = atob(base64String);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const decoder = new TextDecoder('utf-8');
    const tags: Record<number, string> = {};
    let offset = 0;

    while (offset < bytes.length) {
      if (offset + 2 > bytes.length) {
        errors.push('تنسيق TLV تالف: نهاية البيانات غير متناسقة.');
        break;
      }
      const tag = bytes[offset];
      const length = bytes[offset + 1];
      offset += 2;

      if (offset + length > bytes.length) {
        errors.push(`تنسيق TLV تالف: طول الحقل ${tag} يتجاوز حجم الحزمة.`);
        break;
      }

      const valueBytes = bytes.subarray(offset, offset + length);
      tags[tag] = decoder.decode(valueBytes);
      offset += length;
    }

    // Verify Tag 1: Seller Name
    const sellerName = tags[1] || '';
    if (!sellerName.trim()) {
      errors.push('Tag 1 (اسم المورد): مفقود أو فارغ.');
    }

    // Verify Tag 2: VAT Registration Number
    const vatNumber = tags[2] || '';
    const vatCheck = validateZatcaVatNumber(vatNumber);
    if (!vatCheck.isValid) {
      errors.push(`Tag 2 (الرقم الضريبي للمورد): ${vatCheck.error}`);
    }

    // Verify Tag 3: Timestamp
    const timestamp = tags[3] || '';
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(timestamp)) {
      errors.push(`Tag 3 (الوقت والتاريخ): يجب أن يتبع معيار ISO 8601 الكامل بالثواني (المدخل: "${timestamp}").`);
    }

    // Verify Tag 4: Total With VAT
    const totalWithVat = parseFloat(tags[4] || 'NaN');
    if (isNaN(totalWithVat) || totalWithVat <= 0) {
      errors.push(`Tag 4 (إجمالي الفاتورة مع الضريبة): قيمة غير صالحة (${tags[4]}).`);
    }

    // Verify Tag 5: VAT Total
    const vatTotal = parseFloat(tags[5] || 'NaN');
    if (isNaN(vatTotal) || vatTotal < 0) {
      errors.push(`Tag 5 (إجمالي ضريبة القيمة المضافة): قيمة غير صالحة (${tags[5]}).`);
    }

    // Mathematical Invariant Check
    if (!isNaN(totalWithVat) && !isNaN(vatTotal)) {
      if (vatTotal > totalWithVat) {
        errors.push('قيمة الضريبة تتجاوز إجمالي الفاتورة!');
      }
    }

    const taxableAmount = !isNaN(totalWithVat) && !isNaN(vatTotal)
      ? Math.round((totalWithVat - vatTotal) * 100) / 100
      : 0;

    const isValid = errors.length === 0;

    return {
      isValid,
      status: isValid ? 'VALID' : 'INVALID',
      errors,
      warnings,
      parsed: {
        sellerName,
        vatNumber,
        timestamp,
        totalWithVat,
        vatTotal,
        taxableAmount,
      },
    };
  } catch (err: any) {
    return {
      isValid: false,
      status: 'INVALID',
      errors: [`فشل فك تشفير Base64 TLV: ${err.message}`],
      warnings: [],
    };
  }
}
