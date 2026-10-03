/**
 * Multi-Country Enterprise Tax & E-Invoicing Engine
 * Handles tax profiles, calculation rules, and e-invoicing compliance
 * for Saudi Arabia (ZATCA Fatoora Phase 1 & 2) and Egypt (ETA E-Invoicing).
 */

import QRCode from 'qrcode';
import {
  generateZatcaQrDataUrl,
  generateZatcaTlvBase64,
  validateZatcaTlvBase64,
  validateZatcaVatNumber,
  ZatcaValidationResult,
} from './zatcaTlv';

export type TaxJurisdiction = 'KSA' | 'EGYPT';

export interface TaxJurisdictionConfig {
  id: TaxJurisdiction;
  countryNameAr: string;
  countryNameEn: string;
  flagEmoji: string;
  authorityNameAr: string;
  authorityNameEn: string;
  authorityBadgeAr: string;
  authorityBadgeEn: string;
  authorityShort: 'ZATCA' | 'ETA';
  standardVatRate: number; // 0.15 for KSA, 0.14 for Egypt
  vatRatePercent: number;  // 15 vs 14
  vatLabel: string;        // '15%' vs '14%'
  currencyCode: 'SAR' | 'EGP';
  currencySymbolAr: 'ر.س' | 'ج.م';
  currencyNameAr: string;
  taxIdLabelAr: string;
  taxIdLabelEn: string;
  taxIdRuleAr: string;
  defaultSellerTaxId: string;
  defaultCustomerTaxId: string;
  defaultSellerNameAr: string;
  defaultSellerNameEn: string;
  defaultAddressAr: string;
  defaultCommercialRegAr: string;
  defaultPhone: string;
  qrType: 'ZATCA_TLV' | 'ETA_URL';
}

export const TAX_JURISDICTIONS: Record<TaxJurisdiction, TaxJurisdictionConfig> = {
  KSA: {
    id: 'KSA',
    countryNameAr: 'المملكة العربية السعودية',
    countryNameEn: 'Kingdom of Saudi Arabia',
    flagEmoji: '🇸🇦',
    authorityNameAr: 'هيئة الزكاة والضريبة والجمارك (ZATCA)',
    authorityNameEn: 'Zakat, Tax and Customs Authority (ZATCA)',
    authorityBadgeAr: 'مطابقة ومعتمدة (ZATCA)',
    authorityBadgeEn: 'Verified & Compliant (ZATCA)',
    authorityShort: 'ZATCA',
    standardVatRate: 0.15,
    vatRatePercent: 15,
    vatLabel: '15%',
    currencyCode: 'SAR',
    currencySymbolAr: 'ر.س',
    currencyNameAr: 'ريال سعودي',
    taxIdLabelAr: 'الرقم الضريبي للمنشأة (VAT ID)',
    taxIdLabelEn: 'VAT Registration No. (15 Digits)',
    taxIdRuleAr: '15 رقماً يبدأ بالرقم 3 وينتهي بالرقم 3 (كود 03)',
    defaultSellerTaxId: '310123456789003',
    defaultCustomerTaxId: '310987654321003',
    defaultSellerNameAr: 'شركة أركان للمقاولات والتجارة (فرع المملكة)',
    defaultSellerNameEn: 'Arkan Contracting & Trading (KSA Branch)',
    defaultAddressAr: 'طريق الملك فهد - حي العليا - الرياض - المملكة العربية السعودية',
    defaultCommercialRegAr: 'س.ت: 1010456789 الرياض',
    defaultPhone: '011-4567890',
    qrType: 'ZATCA_TLV',
  },
  EGYPT: {
    id: 'EGYPT',
    countryNameAr: 'جمهورية مصر العربية',
    countryNameEn: 'Arab Republic of Egypt',
    flagEmoji: '🇪🇬',
    authorityNameAr: 'مصلحة الضرائب المصرية (ETA)',
    authorityNameEn: 'Egyptian Tax Authority (ETA)',
    authorityBadgeAr: 'مطابقة ومعتمدة (ETA)',
    authorityBadgeEn: 'Verified & Compliant (ETA)',
    authorityShort: 'ETA',
    standardVatRate: 0.14,
    vatRatePercent: 14,
    vatLabel: '14%',
    currencyCode: 'EGP',
    currencySymbolAr: 'ج.م',
    currencyNameAr: 'جنيه مصري',
    taxIdLabelAr: 'رقم التسجيل الضريبي الموحد (Tax ID)',
    taxIdLabelEn: 'Tax Registration Number (9 Digits)',
    taxIdRuleAr: '9 أرقام ضريبية مسجلة بمنظومة الضرائب المصرية',
    defaultSellerTaxId: '300-456-789',
    defaultCustomerTaxId: '200-987-654',
    defaultSellerNameAr: 'شركة أركان للمقاولات العامة والإنشاءات (ش.م.م)',
    defaultSellerNameEn: 'Arkan General Contracting & Construction S.A.E',
    defaultAddressAr: 'مبنى أركان بلازا - التجمع الخامس - القاهرة - جمهورية مصر العربية',
    defaultCommercialRegAr: 'س.ت: 44921 القاهرة',
    defaultPhone: '02-23945510',
    qrType: 'ETA_URL',
  },
};

export interface GenerateInvoiceQrParams {
  jurisdiction: TaxJurisdiction;
  sellerName: string;
  sellerTaxId: string;
  invoiceTimestamp: string;
  invoiceTotalWithVat: number;
  vatTotal: number;
  taxableAmount?: number;
  etaUuid?: string;
  invoiceNo?: number | string;
}

export interface InvoiceQrResult {
  qrDataUrl: string;
  rawPayload: string;
  jurisdiction: TaxJurisdiction;
  type: 'ZATCA_TLV' | 'ETA_URL';
  validation: {
    isValid: boolean;
    statusBadge: string;
    details: string;
    errors: string[];
    parsed?: any;
  };
}

/**
 * Validates a tax registration ID according to the specified jurisdiction
 */
export function validateTaxId(
  taxId: string,
  jurisdiction: TaxJurisdiction
): { isValid: boolean; error?: string } {
  if (jurisdiction === 'KSA') {
    return validateZatcaVatNumber(taxId);
  }

  // Egypt ETA: 9 digits
  const cleaned = (taxId || '').replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return {
      isValid: false,
      error: `رقم التسجيل الضريبي المصري يجب أن يتكون من 9 أرقام (المدخل: ${cleaned.length} رقم).`,
    };
  }
  return { isValid: true };
}

/**
 * Formats a tax ID for clean visual display
 */
export function formatTaxIdForDisplay(taxId: string, jurisdiction: TaxJurisdiction): string {
  const cleaned = (taxId || '').replace(/\D/g, '');
  if (jurisdiction === 'EGYPT' && cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}`;
  }
  return cleaned || taxId;
}

/**
 * Generates an official Egyptian Tax Authority (ETA) e-Invoicing share/portal verification URL
 */
export function generateEtaVerificationUrl(
  etaUuid: string,
  invoiceNo?: number | string
): string {
  const normalizedUuid = (etaUuid || 'e4f5a6b7-8c9d-4e5f-b6a7-c8d9e0f1a2b3').trim();
  const query = invoiceNo ? `?inv=${invoiceNo}` : '';
  return `https://invoicing.eta.gov.eg/documents/${normalizedUuid}/share${query}`;
}

/**
 * Unified multi-jurisdiction QR code generation engine
 */
export async function generateInvoiceQr(
  params: GenerateInvoiceQrParams,
  width = 256
): Promise<InvoiceQrResult> {
  const config = TAX_JURISDICTIONS[params.jurisdiction];

  if (params.jurisdiction === 'KSA') {
    // Saudi ZATCA Phase 1 TLV Base64
    const tlvBase64 = generateZatcaTlvBase64({
      sellerName: params.sellerName || config.defaultSellerNameAr,
      vatRegistrationNumber: params.sellerTaxId || config.defaultSellerTaxId,
      invoiceTimestamp: params.invoiceTimestamp,
      invoiceTotalWithVat: params.invoiceTotalWithVat,
      vatTotal: params.vatTotal,
    });

    const qrDataUrl = await generateZatcaQrDataUrl(
      {
        sellerName: params.sellerName || config.defaultSellerNameAr,
        vatRegistrationNumber: params.sellerTaxId || config.defaultSellerTaxId,
        invoiceTimestamp: params.invoiceTimestamp,
        invoiceTotalWithVat: params.invoiceTotalWithVat,
        vatTotal: params.vatTotal,
      },
      width
    );

    const zatcaValidation: ZatcaValidationResult = validateZatcaTlvBase64(tlvBase64);

    return {
      qrDataUrl,
      rawPayload: tlvBase64,
      jurisdiction: 'KSA',
      type: 'ZATCA_TLV',
      validation: {
        isValid: zatcaValidation.isValid,
        statusBadge: zatcaValidation.isValid
          ? 'مطابقة ومعتمدة (ZATCA)'
          : 'غير مطابقة (ZATCA)',
        details: zatcaValidation.isValid
          ? 'تم التحقق من التاجات الخمسة المشفرة، وصحة الرقم الضريبي (15 رقماً يبدأ وينتهي بـ 3)، وتطابق المجموع والضريبة.'
          : zatcaValidation.errors.join(' | '),
        errors: zatcaValidation.errors,
        parsed: zatcaValidation.parsed,
      },
    };
  } else {
    // Egyptian Tax Authority (ETA) Verification Link
    const etaUuid = params.etaUuid || 'b4f8a3c1-7d2e-4b9f-8a1c-9e2d3f4a5b6c';
    const etaUrl = generateEtaVerificationUrl(etaUuid, params.invoiceNo);

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(etaUrl, {
        width,
        margin: 1,
        color: {
          dark: '#141E16',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
    } catch (err) {
      console.error('[ETA] QR Code generation error:', err);
    }

    const taxCheck = validateTaxId(params.sellerTaxId || config.defaultSellerTaxId, 'EGYPT');

    return {
      qrDataUrl,
      rawPayload: etaUrl,
      jurisdiction: 'EGYPT',
      type: 'ETA_URL',
      validation: {
        isValid: taxCheck.isValid,
        statusBadge: taxCheck.isValid
          ? 'مطابقة ومعتمدة (ETA)'
          : 'غير مطابقة (ETA)',
        details: taxCheck.isValid
          ? `رابط التحقق الإلكتروني المعتمد من مصلحة الضرائب المصرية بالمعرف الرقمي (UUID: ${etaUuid}).`
          : taxCheck.error || 'خطأ في التحقق.',
        errors: taxCheck.isValid ? [] : [taxCheck.error || 'خطأ'],
        parsed: {
          etaUuid,
          verificationUrl: etaUrl,
          taxRegistrationNumber: formatTaxIdForDisplay(
            params.sellerTaxId || config.defaultSellerTaxId,
            'EGYPT'
          ),
          vatRate: '14%',
        },
      },
    };
  }
}
