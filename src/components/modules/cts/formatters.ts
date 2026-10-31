// ====================================================================
// ECO ERP - Project Correspondence Management System (PCMS / CTS)
// Standard Formatters & Visual Helpers
// ====================================================================

import { DocType, Direction, DocStatus, Priority } from './types';

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} (${hours}:${mins})`;
  } catch {
    return dateString;
  }
}

export function getDocTypeLabel(type: DocType): string {
  switch (type) {
    case 'LTR':
      return 'خطاب رسمي (LTR)';
    case 'SUB':
      return 'اعتماد فني (SUB)';
    case 'RFI':
      return 'استفسار فني (RFI)';
    case 'IPC':
      return 'مستخلص جاري (IPC)';
    case 'MOM':
      return 'محضر اجتماع (MOM)';
    case 'TRANS':
      return 'مذكرة إرسال (TRANS)';
    case 'SITE':
      return 'ملاحظة موقعية (SITE)';
    case 'NCR':
      return 'عدم مطابقة (NCR)';
    case 'VAR':
      return 'أمر تغيير (VAR)';
    default:
      return type;
  }
}

export function getDirectionLabel(dir: Direction): { ar: string; en: string } {
  return dir === 'Incoming'
    ? { ar: 'وارد', en: 'Inbound' }
    : { ar: 'صادر', en: 'Outbound' };
}

export function getStatusBadge(status: DocStatus, isDraft?: boolean): { label: string; bg: string; text: string; border: string; classes: string } {
  if (isDraft || status === 'Draft') {
    return {
      label: 'مسودة قيد المراجعة',
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/30',
      classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30'
    };
  }
  switch (status) {
    case 'Approved':
      return {
        label: 'معتمد رسمياً',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
      };
    case 'Replied':
      return {
        label: 'تم الرد رسمياً',
        bg: 'bg-sky-500/10 dark:bg-sky-500/15',
        text: 'text-sky-700 dark:text-sky-400',
        border: 'border-sky-500/30',
        classes: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30'
      };
    case 'Pending':
      return {
        label: 'قيد المتابعة / وارد',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/30',
        classes: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30'
      };
    case 'Rejected':
      return {
        label: 'مُعاد للمراجعة',
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/30',
        classes: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
      };
    case 'Closed':
      return {
        label: 'معاملة مكتملة',
        bg: 'bg-stone-500/10 dark:bg-stone-500/15',
        text: 'text-stone-700 dark:text-stone-300',
        border: 'border-stone-500/30',
        classes: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border border-stone-500/30'
      };
    default:
      return {
        label: status,
        bg: 'bg-stone-100 dark:bg-stone-800',
        text: 'text-stone-700 dark:text-stone-300',
        border: 'border-stone-300 dark:border-stone-700',
        classes: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700'
      };
  }
}

export function getPriorityBadge(priority: Priority): { label: string; color: string; classes: string } {
  switch (priority) {
    case 'Critical':
    case 'Immediate':
      return {
        label: 'حرج جداً',
        color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
        classes: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30'
      };
    case 'Urgent':
      return {
        label: 'عاجل',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30',
        classes: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30'
      };
    default:
      return {
        label: 'عادي',
        color: 'text-slate-600 dark:text-stone-400 bg-slate-500/10 border-slate-500/20',
        classes: 'text-slate-600 dark:text-stone-400 bg-slate-500/10 border border-slate-500/20'
      };
  }
}

