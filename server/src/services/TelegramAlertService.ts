/**
 * ECO ERP - Telegram Financial Alerting Engine
 * Dispatches structured, luxury HTML notifications to Telegram on voucher creation,
 * high-value transactions, or balance integrity anomalies.
 */

export interface TelegramVoucherAlertPayload {
  databaseKey: string;
  noteNo: number;
  noteDate: string;
  totalDebit: number;
  totalCredit: number;
  description: string;
  entryName: string;
  linesCount: number;
}

export interface TelegramIntegrityAlertPayload {
  databaseKey: string;
  attemptedNoteNo?: number;
  totalDebit: string;
  totalCredit: string;
  difference: string;
  entryName?: string;
  errorMessage: string;
}

export class TelegramAlertService {
  private static instance: TelegramAlertService;
  private botToken: string | null = null;
  private chatId: string | null = null;

  private constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || null;
    this.chatId = process.env.TELEGRAM_CHAT_ID || null;
  }

  public static getInstance(): TelegramAlertService {
    if (!TelegramAlertService.instance) {
      TelegramAlertService.instance = new TelegramAlertService();
    }
    return TelegramAlertService.instance;
  }

  /**
   * Dispatches an asynchronous HTML report for a successfully committed voucher
   */
  public dispatchVoucherCommitAlert(payload: TelegramVoucherAlertPayload): void {
    Promise.resolve().then(async () => {
      try {
        const messageHtml = `
<b>🏛️ ECO ERP — قيد محاسبي جديد معتمد</b>
━━━━━━━━━━━━━━━━━━━━
<b>رقم السند:</b> <code>#${payload.noteNo}</code>
<b>قاعدة البيانات:</b> <code>${payload.databaseKey}</code>
<b>التاريخ:</b> ${payload.noteDate}
<b>إجمالي المدين:</b> <code>${payload.totalDebit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</code>
<b>إجمالي الدائن:</b> <code>${payload.totalCredit.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م</code>
<b>البيان العام:</b> <i>${payload.description}</i>
<b>عدد السطور:</b> ${payload.linesCount} سطر
<b>مدخل البيانات:</b> 👤 ${payload.entryName}
<b>الحالة:</b> ✅ متوازن ومعتمد (Balance Verified)
━━━━━━━━━━━━━━━━━━━━
<i>النظام المالي الذكي — ECO Financial Engine 2026</i>
        `.trim();

        await this.sendTelegramMessage(messageHtml);
      } catch (err: any) {
        console.warn('[TelegramAlertService] Failed to send commit notification:', err.message);
      }
    });
  }

  /**
   * Dispatches an urgent alert when a voucher balance invariant is violated
   */
  public dispatchIntegrityFailureAlert(payload: TelegramIntegrityAlertPayload): void {
    Promise.resolve().then(async () => {
      try {
        const messageHtml = `
<b>🚨 تحذير أمني مالي — قيد محاسبي غير متوازن!</b>
━━━━━━━━━━━━━━━━━━━━
<b>قاعدة البيانات:</b> <code>${payload.databaseKey}</code>
<b>رقم الحركة المرفوضة:</b> <code>${payload.attemptedNoteNo || 'N/A'}</code>
<b>المدين:</b> <code>${payload.totalDebit}</code>
<b>الدائن:</b> <code>${payload.totalCredit}</code>
<b>قيمة الفارق (خلل التوازن):</b> <code>${payload.difference}</code>
<b>مدخل البيانات:</b> ${payload.entryName || 'غير معروف'}
<b>السبب الفني:</b> ⚠️ <i>${payload.errorMessage}</i>
<b>الإجراء:</b> 🛑 تم إحباط العملية بالكامل وإلغاء القيد (Atomic Rollback)
━━━━━━━━━━━━━━━━━━━━
<i>ECO ERP Security & Financial Invariant Engine</i>
        `.trim();

        await this.sendTelegramMessage(messageHtml);
      } catch (err: any) {
        console.warn('[TelegramAlertService] Failed to send integrity alert:', err.message);
      }
    });
  }

  private async sendTelegramMessage(htmlText: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      console.log(`[TelegramAlertService - Standby Mode] Alert generated:\n${htmlText}`);
      return;
    }

    const endpoint = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: htmlText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API returned ${response.status}: ${errorText}`);
    }
  }
}
