// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Immutable Audit Trail & Compliance Hub (Tab 6)
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { AuditLogItem } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { formatDateTime } from './formatters';
import { 
  ShieldCheck, 
  Search, 
  FileText, 
  User, 
  Clock, 
  ArrowRight, 
  RotateCcw,
  Stamp,
  Inbox,
  Send,
  Trash2
} from 'lucide-react';

export const CTSAuditTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionType, setSelectedActionType] = useState('ALL');

  const loadData = async () => {
    const data = await ctsStorage.getAuditLogs();
    setLogs(data);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-cts-updated', handleUpdate);
    return () => window.removeEventListener('eco-cts-updated', handleUpdate);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      if (selectedActionType !== 'ALL' && item.action_type !== selectedActionType) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDoc = item.target_doc?.toLowerCase().includes(q);
        const matchesUser = item.user_name?.toLowerCase().includes(q);
        const matchesDetails = item.details?.toLowerCase().includes(q);
        return matchesDoc || matchesUser || matchesDetails;
      }
      return true;
    });
  }, [logs, selectedActionType, searchQuery]);

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'OUTBOUND_APPROVED_ATOMIC':
        return {
          label: 'اعتماد رسمي وتوليد رقم ذري',
          classes: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
          icon: <Stamp className="w-3.5 h-3.5" />
        };
      case 'INBOUND_REGISTERED':
        return {
          label: 'قيد واستلام مكاتبة واردة',
          classes: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
          icon: <Inbox className="w-3.5 h-3.5" />
        };
      case 'OUTBOUND_DRAFT_CREATED':
        return {
          label: 'إنشاء مسودة صادرة جديدة',
          classes: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
          icon: <Send className="w-3.5 h-3.5" />
        };
      case 'RETURNED_FOR_REVISION':
        return {
          label: 'إرجاع للتدقيق والملاحظات',
          classes: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
          icon: <RotateCcw className="w-3.5 h-3.5" />
        };
      case 'DOC_UPDATED':
        return {
          label: 'تحديث بيانات المعاملة',
          classes: 'bg-stone-500/15 text-stone-600 dark:text-stone-400 border border-stone-500/30',
          icon: <FileText className="w-3.5 h-3.5" />
        };
      case 'DOC_DELETED':
        return {
          label: 'حذف معاملة من السجل',
          classes: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30',
          icon: <Trash2 className="w-3.5 h-3.5" />
        };
      default:
        return {
          label: type,
          classes: 'bg-stone-500/15 text-stone-600 dark:text-stone-400 border border-stone-500/30',
          icon: <Clock className="w-3.5 h-3.5" />
        };
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner & Security Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs mb-1">
            <span className="font-bold">إجمالي سجلات التدقيق</span>
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">{logs.length}</p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs mb-1">
            <span className="font-bold">عمليات الاعتماد الذري</span>
            <Stamp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {logs.filter(l => l.action_type === 'OUTBOUND_APPROVED_ATOMIC').length}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 text-xs mb-1">
            <span className="font-bold">سلامة السجلات والامتثال</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">100% موثق</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                سجل التدقيق والامتثال الأمني غير القابل للتعديل (Immutable Audit Trail)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تتبع كامل لكافة الحركات، التعديلات، توليد الأرقام الرسمية، وملاحظات المراجعة
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute right-3.5 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم المعاملة، اسم المستخدم، أو تفاصيل الحركة..."
              className="w-full pr-10 pl-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
            >
              <option value="ALL">كافة أنواع العمليات</option>
              <option value="OUTBOUND_APPROVED_ATOMIC">اعتماد رسمي وتوليد رقم ذري</option>
              <option value="INBOUND_REGISTERED">قيد واستلام مكاتبة واردة</option>
              <option value="OUTBOUND_DRAFT_CREATED">إنشاء مسودة صادرة جديدة</option>
              <option value="RETURNED_FOR_REVISION">إرجاع للتدقيق والملاحظات</option>
              <option value="DOC_UPDATED">تحديث بيانات المعاملة</option>
              <option value="DOC_DELETED">حذف معاملة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="p-5 rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 text-[11px]">
                <th className="py-2.5 px-3">التوقيت والتاريخ</th>
                <th className="py-2.5 px-3">المستخدم المسؤول</th>
                <th className="py-2.5 px-3">نوع العملية</th>
                <th className="py-2.5 px-3">المعاملة المستهدفة</th>
                <th className="py-2.5 px-3">تفاصيل الحركة والبيان</th>
                <th className="py-2.5 px-3">القيمة السابقة / الجديدة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-stone-400">
                    لا توجد سجلات تدقيق تطابق معايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action_type);

                  return (
                    <tr key={log.id} className="hover:bg-stone-50 dark:hover:bg-stone-900/50 transition">
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-800 dark:text-stone-200 whitespace-nowrap flex items-center gap-1.5 mt-2">
                        <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{log.user_name}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold ${badge.classes}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                        {log.target_doc}
                      </td>
                      <td className="py-3 px-3 text-stone-700 dark:text-stone-300 max-w-sm truncate">
                        {log.details}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {log.previous_value && log.new_value ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-stone-400 line-through">{log.previous_value}</span>
                            <ArrowRight className="w-3 h-3 text-emerald-500 rotate-180" />
                            <span className="text-emerald-500 font-bold">{log.new_value}</span>
                          </div>
                        ) : (
                          log.new_value || log.previous_value || '—'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
