/**
 * Universal ERP Formatting Utilities
 * Enforces Western Arabic (0-9) numerals globally across all financial records,
 * balances, dates, ratios, and IBANs to guarantee rapid operational legibility.
 */

const EASTERN_TO_WESTERN_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '٫': '.',
  '٬': ',',
};

/**
 * Converts any Eastern Arabic digits (٠-٩) in a string to Western Arabic digits (0-9).
 */
export const toWesternDigits = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return str.replace(/[٠-٩٫٬]/g, d => EASTERN_TO_WESTERN_MAP[d] ?? d);
};

export const formatCurrency = (amount: number | null | undefined, showCurrency = true, currency = 'ج.م'): string => {
  const numericVal = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const isNegative = numericVal < 0;
  const absVal = Math.abs(numericVal);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absVal);

  const signed = isNegative ? `-${formatted}` : formatted;
  return showCurrency ? `${signed} ${currency}` : signed;
};

/**
 * Formats a currency amount paired with an optional percentage in standard format:
 * [Amount] ج.م ([Percentage]%)
 */
export const formatAmountWithPercent = (
  amount: number | null | undefined,
  percentage: number | string | null | undefined,
  currency = 'ج.م'
): string => {
  const formattedAmount = formatCurrency(amount, true, currency);
  if (percentage === null || percentage === undefined) return formattedAmount;
  return `${formattedAmount} (${percentage}%)`;
};

/**
 * Formats an integer or float with comma grouping using standard Western numerals (en-US).
 */
export const formatNumber = (val: number | null | undefined, decimals = 0): string => {
  const numericVal = typeof val === 'number' && !isNaN(val) ? val : 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericVal);
};

/**
 * Formats a percentage ratio cleanly in Western digits.
 */
export const formatPercent = (val: number | null | undefined): string => {
  const numericVal = typeof val === 'number' && !isNaN(val) ? val : 0;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(numericVal)}%`;
};

/**
 * Formats an IBAN or bank account number with readable 4-digit grouping.
 */
export const formatIban = (iban: string | null | undefined): string => {
  if (!iban) return '';
  const clean = toWesternDigits(iban).replace(/\s+/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Formats dates strictly in Western numerals (YYYY-MM-DD or readable format).
 */
export const formatDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '-';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export { Modal } from '../components/common/Modal';
export type { ModalProps } from '../components/common/Modal';

