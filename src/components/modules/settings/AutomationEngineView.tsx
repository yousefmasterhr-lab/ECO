import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Activity, 
  X,
  Check
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { automationStorage } from '../../../services/automationStorage';
import { AutomationRule, TriggerType, ActionType } from '../ats/types';
import { fireConfetti } from '../../../utils/confetti';

export const AutomationEngineView: React.FC = () => {
  const { t } = useLanguage();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatedRule, setSimulatedRule] = useState<AutomationRule | null>(null);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // New Rule Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [module, setModule] = useState('ats');
  const [trigger, setTrigger] = useState<TriggerType>('stage_changed');
  const [conditionField, setConditionField] = useState('stage');
  const [conditionValue, setConditionValue] = useState('first_interview');
  const [actionType, setActionType] = useState<ActionType>('send_email_template');

  const loadData = async () => {
    try {
      setLoading(true);
      const [ruleList, logList] = await Promise.all([
        automationStorage.getRules(),
        automationStorage.getLogs(),
      ]);
      setRules(ruleList);
      setLogs(logList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('eco-automation-updated', handleUpdate);
    return () => window.removeEventListener('eco-automation-updated', handleUpdate);
  }, []);

  const handleToggleRule = async (ruleId: string) => {
    await automationStorage.toggleRule(ruleId);
    setRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف قاعدة الأتمتة هذه؟')) return;
    await automationStorage.deleteRule(ruleId);
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newRule: AutomationRule = {
      id: `rule_${Date.now()}`,
      name,
      nameEn: name,
      description: description || 'قاعدة أتمتة مخصصة وفق شروط المنظومة',
      descriptionEn: description || 'Custom automation workflow rule',
      module,
      trigger,
      conditions: [
        {
          field: conditionField as any,
          operator: 'equals',
          value: conditionValue,
        },
      ],
      actions: [
        {
          type: actionType,
          params: {
            delayHours: 0,
            customMessage: 'تم تنفيذ الأتمتة بنجاح وفق الإجراء المحدد',
          },
        },
      ],
      isActive: true,
      timesExecuted: 0,
    };

    await automationStorage.saveRule(newRule);
    setIsCreateModalOpen(false);
    setName('');
    setDescription('');
    fireConfetti();
  };

  const handleRunSimulator = async (rule: AutomationRule) => {
    setSimulatedRule(rule);
    setIsSimulatorOpen(true);
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await automationStorage.triggerTestRun(
        rule.id,
        rule.name,
        rule.trigger,
        { id: 'CAND-TEST-88', name: 'أحمد محمود القاضي', stage: 'first_interview' }
      );
      setSimulationResult(res);
      fireConfetti();
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-[#0D1C13]/70 backdrop-blur-md border border-[#E0D9CB] dark:border-[#1D3324] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-500" />
            {t('محرك الأتمتة وسير العمل الذكي (Global Automation Engine)', 'Global Automation & Workflow Engine')}
          </h2>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">
            {t('إدارة قواعد الأتمتة اللحظية، محفزات الأحداث (Triggers)، والإجراءات التلقائية المترابطة عبر قطاعات المنظومة', 'Manage workflow automation rules, event triggers, conditions, and automated actions across ERP modules')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('إضافة قاعدة أتمتة جديدة', 'Add Automation Rule')}
        </button>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C665E] dark:text-[#97A69B]">
          {t('جاري تحميل قواعد الأتمتة...', 'Loading automation rules...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                rule.isActive
                  ? 'bg-white/80 dark:bg-[#0D1C13]/80 border-[#E0D9CB] dark:border-[#1D3324] hover:border-amber-500/50'
                  : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-mono">
                    {rule.trigger}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#5C665E] dark:text-[#97A69B]">
                      {rule.timesExecuted} {t('مرة تشغيل', 'runs')}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="text-amber-500 hover:scale-105 transition-transform"
                      title={rule.isActive ? t('تعطيل القاعدة', 'Disable') : t('تفعيل القاعدة', 'Enable')}
                    >
                      {rule.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#142319] dark:text-[#E8F3EB]">{rule.name}</h3>
                <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1.5 leading-relaxed">{rule.description}</p>

                {/* Conditions & Actions Summary */}
                <div className="mt-4 p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#5C665E] dark:text-[#97A69B]">
                    <Sliders className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('الشرط:', 'Condition:')}</span>
                    <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">
                      {rule.conditions?.[0]?.field} {rule.conditions?.[0]?.operator} {String(rule.conditions?.[0]?.value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#5C665E] dark:text-[#97A69B]">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('الإجراء:', 'Action:')}</span>
                    <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">
                      {rule.actions?.[0]?.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="mt-4 pt-3 border-t border-[#E0D9CB]/60 dark:border-[#1D3324]/60 flex items-center justify-between">
                <button
                  onClick={() => handleRunSimulator(rule)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{t('محاكاة واختبار القاعدة الآن', 'Simulate & Run Test')}</span>
                </button>

                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1.5 rounded-lg text-[#5C665E] hover:text-red-500"
                  title={t('حذف القاعدة', 'Delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Logs Section */}
      <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] shadow-sm">
        <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          {t('سجل تنفيذ الأتمتة والرقابة التشغيلية (Automation Audit Log)', 'Automation Execution Logs')}
        </h3>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5C665E] dark:text-[#97A69B]">
            {t('لم يتم تسجيل عمليات تشغيل بعد', 'No execution logs recorded yet')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#E0D9CB] dark:border-[#1D3324] text-[#5C665E] dark:text-[#97A69B]">
                  <th className="py-2.5 px-3 font-bold">{t('القاعدة المنفذة', 'Rule')}</th>
                  <th className="py-2.5 px-3 font-bold">{t('المحفز', 'Trigger')}</th>
                  <th className="py-2.5 px-3 font-bold">{t('الحالة', 'Status')}</th>
                  <th className="py-2.5 px-3 font-bold">{t('الاستجابة', 'Latency')}</th>
                  <th className="py-2.5 px-3 font-bold">{t('التاريخ والوقت', 'Timestamp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D9CB]/50 dark:divide-[#1D3324]/50">
                {logs.slice(0, 8).map((log, i) => (
                  <tr key={i} className="hover:bg-[#F8F6F0] dark:hover:bg-[#122318] transition-all">
                    <td className="py-3 px-3 font-bold text-[#142319] dark:text-[#E8F3EB]">{log.rule_name || log.ruleName}</td>
                    <td className="py-3 px-3 text-[#5C665E] dark:text-[#97A69B]">{log.trigger}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        <Check className="w-3 h-3" />
                        {t('نجاح', 'Success')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-amber-500 font-mono font-bold">{log.execution_time_ms || log.durationMs || 18} ms</td>
                    <td className="py-3 px-3 text-[#5C665E] dark:text-[#97A69B]">{new Date(log.created_at || Date.now()).toLocaleTimeString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Automation Rule */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#1D3324]">
              <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                {t('بناء قاعدة أتمتة جديدة', 'Create Automation Rule')}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('اسم القاعدة *', 'Rule Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: إشعار الموظف عند اكتمال توثيق استمارة التأمينات"
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('الوصف والغرض', 'Description')}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر لدور القاعدة وسير العمل..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('القطاع المستهدف', 'Module')}
                  </label>
                  <select
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  >
                    <option value="ats">{t('استقطاب الكفاءات (ATS)', 'ATS')}</option>
                    <option value="hr">{t('الموارد البشرية (Core HR)', 'HR')}</option>
                    <option value="companies">{t('إدارة الشركات والسجلات', 'Companies')}</option>
                    <option value="insurance">{t('التأمينات الاجتماعية', 'Social Insurance')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('المحفز (Trigger) *', 'Trigger Event *')}
                  </label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as TriggerType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  >
                    <option value="stage_changed">{t('تغيير مرحلة المرشح', 'Stage Changed')}</option>
                    <option value="offer_accepted">{t('توقيع وقبول العرض الوظيفي', 'Offer Accepted')}</option>
                    <option value="candidate_applied">{t('تقديم طلب توظيف جديد', 'Candidate Applied')}</option>
                    <option value="commercial_license_expiring">{t('قرب انتهاء السجل التجاري', 'License Expiring')}</option>
                    <option value="insurance_form_submitted">{t('إدراج استمارة س1 تأمينات', 'Insurance S1 Submitted')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('حقل الشرط', 'Condition Field')}
                  </label>
                  <select
                    value={conditionField}
                    onChange={(e) => setConditionField(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  >
                    <option value="stage">{t('المرحلة (Stage)', 'Stage')}</option>
                    <option value="match_score">{t('نسبة المطابقة (Score)', 'Match Score')}</option>
                    <option value="department">{t('القسم (Department)', 'Department')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('قيمة الشرط', 'Condition Value')}
                  </label>
                  <input
                    type="text"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="مثال: first_interview أو 85"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('الإجراء التلقائي المطلوب (Action) *', 'Action Type *')}
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as ActionType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                >
                  <option value="send_email_template">{t('إرسال قالب بريد إلكتروني مؤتمت', 'Send Email Template')}</option>
                  <option value="notify_hiring_manager">{t('إشعار فوري لمدير الإدارة المعني', 'Notify Hiring Manager')}</option>
                  <option value="send_whatsapp_sms">{t('إرسال رسالة SMS / WhatsApp تفاعلية', 'Send WhatsApp / SMS')}</option>
                  <option value="log_audit_trail">{t('تسجيل قيد رقابي في سجل العمليات', 'Log Audit Trail')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E0D9CB] dark:border-[#1D3324]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-[#5C665E]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm"
                >
                  {t('حفظ وتفعيل القاعدة', 'Save & Activate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {isSimulatorOpen && simulatedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB]">{t('محاكي تشغيل واختبار الأتمتة', 'Automation Rule Simulator')}</h3>
            <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">{simulatedRule.name}</p>

            {isSimulating ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[#5C665E] dark:text-[#97A69B]">{t('جاري محاكاة الشروط وتنفيذ الإجراء...', 'Simulating rule conditions...')}</span>
              </div>
            ) : simulationResult ? (
              <div className="my-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('تم تنفيذ الاختبار بنجاح تام!', 'Simulation Succeeded!')}</span>
                </div>
                <div className="text-[11px] text-[#5C665E] dark:text-[#97A69B]">
                  زمن الاستجابة: <strong className="text-amber-500">{simulationResult.execution_time_ms || 24} ms</strong>
                </div>
                <div className="text-[11px] text-[#5C665E] dark:text-[#97A69B]">
                  رقم القيد الرقابي: <strong className="font-mono">{simulationResult.id}</strong>
                </div>
              </div>
            ) : null}

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setIsSimulatorOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm"
              >
                {t('إغلاق المحاكي', 'Close Simulator')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

