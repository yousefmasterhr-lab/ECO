/**
 * Fiscal Year Helper
 * Extracts the 4-digit fiscal year from database name (e.g. "Tarabot_Data_2026" -> 2026, "Tarabot_Data_2023" -> 2023).
 * Defaults to 2026 if no 4-digit year is matched.
 */
export function getFiscalYearFromDatabase(dbName?: string): number {
  if (!dbName) return 2026;
  const match = dbName.match(/\b(20\d\d)\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 2026;
}

export interface FiscalDateRange {
  year: number;
  startDate: string;
  endDate: string;
  asOfDate: string;
}

export function getFiscalDateRange(dbName?: string): FiscalDateRange {
  const year = getFiscalYearFromDatabase(dbName);
  return {
    year,
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    asOfDate: `${year}-12-31`,
  };
}
