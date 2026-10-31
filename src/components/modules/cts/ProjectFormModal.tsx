// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Engineering Project Add / Edit Modal
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, CurrencyCode } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { 
  Building2, 
  X
} from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingProject?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingProject
}) => {
  const [projectCode, setProjectCode] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [consultantName, setConsultantName] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('Active');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [totalBudget, setTotalBudget] = useState<number | ''>('');
  const [currency, setCurrency] = useState<CurrencyCode>('EGP');
  const [description, setDescription] = useState('');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');

      if (existingProject) {
        setProjectCode(existingProject.project_code || '');
        setProjectId(existingProject.project_id || '');
        setProjectName(existingProject.project_name || '');
        setClientName(existingProject.client_name || '');
        setConsultantName(existingProject.consultant_name || '');
        setContractorName(existingProject.contractor_name || '');
        setProjectStatus(existingProject.project_status || 'Active');
        setStartDate(existingProject.start_date || new Date().toISOString().split('T')[0]);
        setEndDate(existingProject.end_date || '');
        setLocation(existingProject.location || '');
        setTotalBudget(existingProject.total_budget !== undefined ? existingProject.total_budget : '');
        setCurrency(existingProject.currency || 'EGP');
        setDescription(existingProject.description || '');
        setScopeOfWork(existingProject.scope_of_work || '');
      } else {
        setProjectCode('');
        setProjectId('');
        setProjectName('');
        setClientName('وزارة الداخلية - قطاع المشروعات');
        setConsultantName('مركز استشارات العفيفي الهندسي');
        setContractorName('شركة المقاول العام للإنشاءات');
        setProjectStatus('Active');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setLocation('القاهرة الجديدة - التجمع الخامس');
        setTotalBudget('');
        setCurrency('EGP');
        setDescription('');
        setScopeOfWork('');
      }
    }
  }, [isOpen, existingProject]);

  const handleCodeChange = (val: string) => {
    const cleanCode = val.trim();
    setProjectCode(cleanCode);
    if (!existingProject) {
      setProjectId(cleanCode ? `PRJ-${cleanCode}` : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectCode.trim()) {
      setErrorMsg('يرجى تحديد كود المشروع (مثال: 1233)');
      return;
    }
    if (!projectName.trim()) {
      setErrorMsg('يرجى كتابة اسم المشروع');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const budgetNum = totalBudget !== '' ? Number(totalBudget) : undefined;
      const projectPayload: Project = {
        project_id: projectId.trim() || `PRJ-${projectCode.trim()}`,
        project_code: projectCode.trim(),
        project_name: projectName.trim(),
        client_name: clientName.trim(),
        consultant_name: consultantName.trim(),
        contractor_name: contractorName.trim(),
        project_status: projectStatus,
        start_date: startDate,
        end_date: endDate || undefined,
        location: location.trim() || undefined,
        total_budget: budgetNum,
        total_budget_sar: currency === 'SAR' ? budgetNum : undefined,
        currency,
        description: description.trim() || undefined,
        scope_of_work: scopeOfWork.trim() || undefined,
      };

      await ctsStorage.saveProject(projectPayload);
      setIsSubmitting(false);
      onSaved();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ المشروع');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl my-auto rounded-3xl bg-white dark:bg-[#0E1A11] border border-stone-200 dark:border-amber-500/20 shadow-2xl p-6 text-stone-900 dark:text-stone-100 overflow-hidden"
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {existingProject ? 'تعديل بيانات المشروع الهندسي' : 'إضافة مشروع هندسي جديد'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تعريف كود المشروع، الأطراف المعنية (المالك، الاستشاري، المقاول) والميزانية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                كود المشروع (مثال: 1233): *
              </label>
              <input
                type="text"
                required
                value={projectCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="1233"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                المعرف البرمجي للمشروع:
              </label>
              <input
                type="text"
                readOnly
                value={projectId || `PRJ-${projectCode}`}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-500 dark:text-stone-400 font-mono outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              اسم المشروع الرسمي بالكامل: *
            </label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="مثال: مشروع إنشاء وتجهيز مبنى الحراص ومبنى الخدمات التابع"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                المالك (Client):
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="جهة المالك"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                الاستشاري المشرف:
              </label>
              <input
                type="text"
                value={consultantName}
                onChange={(e) => setConsultantName(e.target.value)}
                placeholder="مركز الاستشارات الهندسية"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                المقاول العام:
              </label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="شركة المقاولات"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                حالة المشروع:
              </label>
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Active">قيد التنفيذ (Active)</option>
                <option value="OnHold">متوقف مؤقتاً (On Hold)</option>
                <option value="Completed">مكتمل ومنتهي (Completed)</option>
                <option value="Archived">مؤرشف (Archived)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                الميزانية المقدرة:
              </label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value ? Number(e.target.value) : '')}
                placeholder="35000000"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                العملة:
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                تاريخ البدء:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                تاريخ التسليم المتوقع:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              موقع المشروع الجغرافي:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: التجمع الخامس، الحي الأول، بجوار مقر الوزارة"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              نطاق الأعمال وملاحظات فنية:
            </label>
            <textarea
              rows={3}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="أعمال الهيكل الخرساني، الإلكتروميكانيك، والتشطيبات المعمارية المتكاملة..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
            >
              <Building2 className="w-4 h-4" />
              <span>{isSubmitting ? 'جارٍ الحفظ...' : (existingProject ? 'تحديث بيانات المشروع' : 'حفظ المشروع')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
