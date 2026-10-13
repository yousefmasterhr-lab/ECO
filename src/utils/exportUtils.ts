/**
 * Utility functions for exporting data to CSV/Excel and formatting numbers.
 * Supports UTF-8 BOM for perfect Arabic character rendering in Microsoft Excel.
 */

export function exportToCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]): void {
  const sanitizeCell = (cell: string | number | undefined | null): string => {
    if (cell === undefined || cell === null) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(sanitizeCell).join(',');
  const dataRows = rows.map(row => row.map(sanitizeCell).join(',')).join('\r\n');
  const csvContent = `\uFEFF${headerRow}\r\n${dataRows}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatEGP(val: number | undefined | null, showZeroDash: boolean = true): string {
  if (val === undefined || val === null || isNaN(val)) {
    return showZeroDash ? '0.00' : '';
  }
  if (Math.abs(val) < 0.005) {
    return showZeroDash ? '0.00' : '-';
  }
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Safe revenue share percentage calculation helper.
 * Eliminates division-by-zero anomalies when total revenue is 0.
 */
export const calculateRevenueShare = (amount: number, totalRevenue: number): string => {
  if (!totalRevenue || totalRevenue === 0 || isNaN(totalRevenue)) {
    return '0.0%';
  }
  const percentage = (Math.abs(amount) / Math.abs(totalRevenue)) * 100;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Universal accounting currency formatter enforcing parentheses for negative values:
 * Positive: 1,526,848.95
 * Negative: (1,526,848.95)
 */
export const formatAccountingNumber = (val: number | undefined | null, suffix = ''): string => {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  const absFormatted = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const currency = suffix ? ` ${suffix}` : '';
  if (val < 0) {
    return `(${absFormatted})${currency}`;
  }
  return `${absFormatted}${currency}`;
};
