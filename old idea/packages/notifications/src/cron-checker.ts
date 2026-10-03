export interface ExpirationItem {
  id: string;
  module: 'LEGAL' | 'ENGINEERING' | 'INSURANCE' | 'CTS' | 'COMMERCIAL';
  entityId: string;
  title: string;
  expiryDate: string; // YYYY-MM-DD
  daysRemaining: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  assignedUserName?: string;
}

export class ExpirationEngine {
  /**
   * Calculates days remaining and determines if an alert must be triggered
   * Default alert intervals: 60, 30, 15, 7, 1 days
   */
  public static evaluateDeadline(expiryDateString: string): { daysRemaining: number; severity: 'CRITICAL' | 'WARNING' | 'INFO'; isTriggered: boolean } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDateString);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let severity: 'CRITICAL' | 'WARNING' | 'INFO' = 'INFO';
    if (daysRemaining <= 7) {
      severity = 'CRITICAL';
    } else if (daysRemaining <= 30) {
      severity = 'WARNING';
    }

    const alertDays = [60, 30, 15, 7, 1];
    const isTriggered = alertDays.includes(daysRemaining) || daysRemaining <= 3;

    return { daysRemaining, severity, isTriggered };
  }
}
