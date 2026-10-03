import React, { useState } from 'react';
import { useHR, EmployeeContractDoc, ContractExpiryStatus } from '../../../context/HRContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Modal } from '../../common/Modal';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search
} from 'lucide-react';

export const ContractsDocumentsView: React.FC = () => {
  const { t } = useLanguage();
  const { contracts, renewContract } = useHR();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | ContractExpiryStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Renewal Modal
  const [selectedContract, setSelectedContract] = useState<EmployeeContractDoc | null>(null);
  const [newEndDate, setNewEndDate] = useState('2027-10-31');

  const filteredContracts = contracts.filter(c => {
    const matchesSearch =
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.documentRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ContractExpiryStatus, daysLeft: number) => {
    switch (status) {
      case 'valid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2A3F30] text-[#A3CFAC] border border-[#3B5440]">
            <CheckCircle2 className="w-3 h-3" />
            <span>ساري ({daysLeft} يوم)</span>
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#D99B26]/15 text-[#EBB34D] border border-[#D99B26]/30 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>ينتهي قريباً ({daysLeft} يوم)</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#3F2A2A] text-[#EFA3A3] border border-[#5A3535]">
            <Clock className="w-3 h-3" />
            <span>منتهي الصلاحية</span>
          </span>
        );
    }
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;
    renewContract(selectedContract.id, newEndDate);
    setSelectedContract(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Expiry Warning Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Valid */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] mb-1 font-bold">
            <span>{t('عقود سارية وممتدة', 'Valid Active Contracts')}</span>
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#059669] font-mono">
            {contracts.filter(c => c.status === 'valid').length} {t('عقود', 'Contracts')}
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('مستوفاة كافة الشروط القانونية والتأمينية', 'Fully compliant with legal & labor statutes')}
          </p>
        </div>

        {/* Expiring Soon (< 45 Days) */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#D99B26]/30 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#D99B26] dark:text-[#EBB34D] mb-1 font-bold">
            <span>{t('عقود تنتهي خلال 45 يوماً', 'Expiring within 45 Days')}</span>
            <AlertTriangle className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#D99B26] dark:text-[#EBB34D] font-mono">
            {contracts.filter(c => c.status === 'expiring_soon').length} {t('تتطلب تجديداً', 'Require Action')}
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('تم إشعار الإدارة القانونية لاتخاذ إجراءات التجديد', 'Legal affairs notified for extension')}
          </p>
        </div>

        {/* Expired / Overdue */}
        <div className="p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-rose-500/30 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-500 mb-1 font-bold">
            <span>{t('عقود أو وثائق منتهية', 'Expired Documents')}</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-500 font-mono">
            {contracts.filter(c => c.status === 'expired').length} {t('عقد منتهي', 'Expired')}
          </div>
          <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] mt-1">
            {t('بحاجة لإبرام ملحق تعاقدي أو تسوية نهائية', 'Needs addendum or final clearance')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 start-3 text-[#5C665E] dark:text-[#8FA392]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('بحث باسم الموظف، المسمى أو رقم المرجع...', 'Search employee, title, document ref...')}
            className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#5C665E] dark:placeholder-[#8FA392] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {(['all', 'valid', 'expiring_soon', 'expired'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                  : 'bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392]'
              }`}
            >
              {st === 'all' ? 'الكل' : st === 'valid' ? 'سارية' : st === 'expiring_soon' ? 'تنتهي قريباً' : 'منتهية'}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E0D9CB] dark:border-[#243628] bg-[#EAE4D7]/50 dark:bg-[#121B14] text-[#5C665E] dark:text-[#8FA392]">
              <th className="p-3.5 text-start font-bold">{t('الموظف', 'Employee')}</th>
              <th className="p-3.5 text-start font-bold">{t('نوع العقد', 'Contract Type')}</th>
              <th className="p-3.5 text-start font-bold">{t('تاريخ البدء', 'Start Date')}</th>
              <th className="p-3.5 text-start font-bold">{t('نهاية العقد', 'End Date')}</th>
              <th className="p-3.5 text-start font-bold">{t('حالة العقد', 'Contract Status')}</th>
              <th className="p-3.5 text-start font-bold">{t('انتهاء الهوية / الإقامة', 'ID Expiry')}</th>
              <th className="p-3.5 text-start font-bold">{t('التأمين الطبي', 'Insurance Grade')}</th>
              <th className="p-3.5 text-start font-bold">{t('المرجع الرسمي (CTS)', 'Document Ref')}</th>
              <th className="p-3.5 text-center font-bold">{t('إجراء التجديد', 'Renewal Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]/60">
            {filteredContracts.map(c => (
              <tr key={c.id} className="hover:bg-[#EAE4D7]/40 dark:hover:bg-[#1F2E23]/60 transition-colors">
                <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                  {c.employeeName}
                  <div className="text-[10.5px] font-normal text-[#5C665E] dark:text-[#8FA392]">{c.jobTitle}</div>
                </td>
                <td className="p-3.5 font-bold text-[#5C665E] dark:text-[#8FA392]">
                  {c.contractType === 'unlimited' ? 'غير محدد المدة' : c.contractType === 'limited' ? 'محدد المدة (سنة)' : 'استشاري'}
                </td>
                <td className="p-3.5 font-mono text-[#5C665E] dark:text-[#8FA392]">{c.startDate}</td>
                <td className="p-3.5 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6]">{c.endDate}</td>
                <td className="p-3.5">{getStatusBadge(c.status, c.daysUntilContractExpiry)}</td>
                <td className="p-3.5 font-mono text-[#5C665E] dark:text-[#8FA392]">{c.nationalIdExpiry}</td>
                <td className="p-3.5 text-[#5C665E] dark:text-[#8FA392] font-semibold">{c.medicalGrade}</td>
                <td className="p-3.5 font-mono text-[#D99B26] dark:text-[#EBB34D] font-bold">{c.documentRef}</td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => {
                      setSelectedContract(c);
                      setNewEndDate('2027-10-31');
                    }}
                    className="flex items-center justify-center gap-1.5 mx-auto px-3 py-1 rounded-lg bg-[#EAE4D7] dark:bg-[#1F2E23] hover:bg-[#D99B26] hover:text-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>تجديد</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contract Renewal Modal */}
      {selectedContract && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedContract(null)}
          title={`تجديد العقد الوظيفي - ${selectedContract.employeeName}`}
          subtitle={`تمديد فترة التعاقد وإصدار ملحق العقد الرسمي المعتمد • مرجع: ${selectedContract.documentRef}`}
          icon={RefreshCw}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-1.5">
              <div className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{selectedContract.employeeName}</div>
              <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">المسمى الوظيفي: {selectedContract.jobTitle}</div>
              <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">تاريخ الانتهاء الحالي: <strong className="font-mono text-rose-500">{selectedContract.endDate}</strong></div>
            </div>

            <div>
              <label className="block text-[#5C665E] dark:text-[#8FA392] font-bold mb-1">
                {t('تاريخ الانتهاء الجديد (سنة إضافية) *', 'New End Date *')}
              </label>
              <input
                type="date"
                required
                value={newEndDate}
                onChange={e => setNewEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono font-bold"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#2A3F30]/40 border border-[#3B5440] text-[11px] text-[#A3CFAC]">
              سيتم تحديث حالة العقد في ملف الموظف فوراً إلى (ساري) وإخطار الشؤون القانونية بالملحق الجديد.
            </div>

            <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 rounded-xl bg-[#EAE4D7] dark:bg-[#1F2E23] text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] text-xs font-bold shadow-md cursor-pointer"
              >
                تأكيد التجديد وتحديث السجل
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
