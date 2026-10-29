// Global Automation & Workflow Engine Service
import { AutomationRule } from '../components/modules/ats/types';

const STORAGE_KEYS = {
  RULES: 'eco_automation_rules',
  LOGS: 'eco_automation_logs',
};

const DEFAULT_PRESET_RULES: AutomationRule[] = [
  {
    id: 'rule_stage_invite',
    name: 'إرسال دعوة المقابلة الفنية تلقائياً عند الانتقال للمرحلة',
    nameEn: 'Auto-Send Interview Invite on Technical Stage',
    description: 'إرسال بريد إلكتروني تفاعلي للمرشح مع رابط حجز الموعد عند نقله إلى مرحلة المقابلة الفنية.',
    descriptionEn: 'Send automated email with booking slot link when moved to technical assessment.',
    module: 'ats',
    trigger: 'stage_changed',
    conditions: [
      { field: 'stage', operator: 'equals', value: 'first_interview' },
    ],
    actions: [
      { type: 'send_email_template', params: { templateId: 'tmpl_interview_invite', delayHours: 0 } },
      { type: 'notify_hiring_manager', params: { customMessage: 'تمت جدولة مقابلة جديدة للمرشح' } },
    ],
    isActive: true,
    timesExecuted: 28,
    lastExecutedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'rule_offer_accepted_sync',
    name: 'تجهيز مسوغات التعيين وإشعار التأمينات عند توقيع العرض الوظيفي',
    nameEn: 'Preboarding Checklist on Offer Signed',
    description: 'تنشيط قائمة مسوغات التعيين وإرسال إشعار للمرشح وقسم الموارد البشرية والتأمينات فور التوقيع الرقمي للعرض.',
    descriptionEn: 'Trigger preboarding checklist and notify insurance team upon candidate digital signature.',
    module: 'ats',
    trigger: 'offer_accepted',
    conditions: [
      { field: 'stage', operator: 'equals', value: 'job_offer' },
    ],
    actions: [
      { type: 'send_whatsapp_sms', params: { customMessage: 'تهانينا! يرجى رفع مسوغات التعيين عبر بوابة المرشح' } },
      { type: 'notify_manager', params: { customMessage: 'قام المرشح بتوقيع العرض الوظيفي رقمياً بنجاح' } },
    ],
    isActive: true,
    timesExecuted: 14,
    lastExecutedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'rule_polite_rejection',
    name: 'رسالة اعتذار مهذبة وأرشفة المرشح في بنك الكفاءات',
    nameEn: 'Polite Rejection & Talent Pool Archival',
    description: 'إرسال بريد اعتذار احترافي بعد مرور 48 ساعة من الاستبعاد مع حفظ بيانات المرشح للمستقبل.',
    descriptionEn: 'Send courteous rejection notice after 48h and archive profile in talent pool.',
    module: 'ats',
    trigger: 'stage_changed',
    conditions: [
      { field: 'stage', operator: 'equals', value: 'rejected' },
    ],
    actions: [
      { type: 'send_email_template', params: { templateId: 'tmpl_rejection_polite', delayHours: 48 } },
      { type: 'log_audit_trail', params: { customMessage: 'أرشفة المرشح في بنك الكفاءات' } },
    ],
    isActive: true,
    timesExecuted: 42,
    lastExecutedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'rule_license_expiry_alert',
    name: 'تنبيه مبكر قبل 30 يوماً من انتهاء السجل التجاري أو رخصة العمل',
    nameEn: 'Commercial Record 30-Day Expiry Alert',
    description: 'إشعار الشؤون القانونية والمكتب الفني بضرورة تجديد السجل التجاري أو رخصة الشركة.',
    descriptionEn: 'Notify legal and executive teams 30 days before company commercial record expiry.',
    module: 'companies',
    trigger: 'commercial_license_expiring',
    conditions: [
      { field: 'match_score', operator: 'less_than', value: 30 },
    ],
    actions: [
      { type: 'notify_manager', params: { customMessage: 'تنبيه: اقتراب موعد تجديد السجل التجاري' } },
    ],
    isActive: true,
    timesExecuted: 6,
    lastExecutedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rule_insurance_s1_submission',
    name: 'إشعار فوري لمسؤول التأمينات عند إدراج استمارة س1 جديدة',
    nameEn: 'Instant Insurance S1 Form Alert',
    description: 'تنبيه مسؤول التأمينات فور تحويل موظف جديد لمركز العمليات التأمينية لاستخراج الرقم التأميني.',
    descriptionEn: 'Alert insurance officer when a new hire enters Form S1 pipeline.',
    module: 'insurance',
    trigger: 'insurance_form_submitted',
    conditions: [
      { field: 'stage', operator: 'equals', value: 'hired' },
    ],
    actions: [
      { type: 'notify_manager', params: { customMessage: 'تم إنشاء مسودة استمارة س1 لموظف جديد' } },
    ],
    isActive: true,
    timesExecuted: 19,
    lastExecutedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

class AutomationStorageService {
  private readLocal<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeLocal<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('eco-automation-updated'));
    } catch (e) {
      console.warn('[AutomationStorage] LocalStorage write failed', e);
    }
  }

  public async getRules(): Promise<AutomationRule[]> {
    const local = this.readLocal<AutomationRule[]>(STORAGE_KEYS.RULES, DEFAULT_PRESET_RULES);
    try {
      const res = await fetch('/api/automation/rules');
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote) && remote.length > 0) {
          this.writeLocal(STORAGE_KEYS.RULES, remote);
          return remote;
        }
      }
    } catch {
      // offline / local fallback
    }

    if (local.length === 0) {
      this.writeLocal(STORAGE_KEYS.RULES, DEFAULT_PRESET_RULES);
      return DEFAULT_PRESET_RULES;
    }
    return local;
  }

  public async saveRule(rule: AutomationRule): Promise<AutomationRule> {
    const all = await this.getRules();
    const idx = all.findIndex(r => r.id === rule.id);
    const updated = { ...rule };

    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.unshift(updated);
    }
    this.writeLocal(STORAGE_KEYS.RULES, all);

    try {
      await fetch('/api/automation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('[AutomationStorage] Remote saveRule failed', e);
    }

    return updated;
  }

  public async toggleRule(ruleId: string): Promise<boolean> {
    const all = await this.getRules();
    const rule = all.find(r => r.id === ruleId);
    if (!rule) return false;

    rule.isActive = !rule.isActive;
    await this.saveRule(rule);
    return rule.isActive;
  }

  public async deleteRule(ruleId: string): Promise<void> {
    const all = await this.getRules();
    const filtered = all.filter(r => r.id !== ruleId);
    this.writeLocal(STORAGE_KEYS.RULES, filtered);

    try {
      await fetch(`/api/automation/rules/${ruleId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[AutomationStorage] Remote deleteRule failed', e);
    }
  }

  public async getLogs(): Promise<any[]> {
    try {
      const res = await fetch('/api/automation/logs');
      if (res.ok) {
        const remote = await res.json();
        if (Array.isArray(remote)) return remote;
      }
    } catch {
      // fallback
    }
    return this.readLocal<any[]>(STORAGE_KEYS.LOGS, []);
  }

  public async triggerTestRun(ruleId: string, ruleName: string, triggerEvent: string, payload: any): Promise<any> {
    const logItem = {
      id: `log_${Date.now()}`,
      rule_id: ruleId,
      rule_name: ruleName,
      trigger: triggerEvent,
      event_title: `تنفيذ محاكاة الأتمتة: ${ruleName}`,
      target_id: payload?.id || 'TEST-99',
      target_title: payload?.name || payload?.title || 'عنصر تجريبي',
      status: 'success',
      details: `تم تنفيذ الإجراءات المحددة بنجاح عبر المحاكي السحابي (${payload?.stage || 'مكتمل'})`,
      execution_time_ms: Math.floor(Math.random() * 40) + 15,
      created_at: new Date().toISOString(),
    };

    const logs = this.readLocal<any[]>(STORAGE_KEYS.LOGS, []);
    logs.unshift(logItem);
    this.writeLocal(STORAGE_KEYS.LOGS, logs.slice(0, 50));

    try {
      await fetch('/api/automation/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId,
          ruleName,
          triggerEvent,
          payload,
          eventTitle: logItem.event_title,
          details: logItem.details,
        }),
      });
    } catch (e) {
      console.warn('[AutomationStorage] Remote trigger failed', e);
    }

    return logItem;
  }
}

export const automationStorage = new AutomationStorageService();

