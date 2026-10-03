import { ExpirationItem } from './cron-checker';

export interface NotificationPayload {
  recipientUserId: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  actionUrl: string;
}

export class NotificationDispatcher {
  public static formatExpirationAlert(item: ExpirationItem): NotificationPayload {
    return {
      recipientUserId: 'all_assigned',
      titleEn: `[Alert] Expiration Approaching: ${item.title}`,
      titleAr: `[تنبيه هام] اقتراب موعد انتهاء: ${item.title}`,
      messageEn: `The record (${item.module}) will expire in ${item.daysRemaining} days on ${item.expiryDate}. Please take necessary action.`,
      messageAr: `المستند التابع لقسم (${item.module}) سينتهي خلال ${item.daysRemaining} يوم في تاريخ ${item.expiryDate}. يرجى اتخاذ الإجراء اللازم.`,
      severity: item.severity,
      actionUrl: `/${item.module.toLowerCase()}`
    };
  }
}
