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
