import React, { useMemo, useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Coins,
  ShieldAlert,
  Inbox,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ApprovalRequest {
  id: string;
  type: 'leave' | 'advance' | 'custody';
  employeeName: string;
  employeeUid: string;
  jobTitle: string;
  companyName: string;
  requestTitle: string;
  details: string;
  amountOrDays: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: 'طلب إجازة سنوية اعتيادية',
  casual: 'طلب إجازة عارضة (مادة 51)',
  sick: 'طلب إجازة مرضية',
  unpaid: 'طلب إجازة بدون أجر',
  mission: 'مأمورية عمل خارجية',
};

export const HRApprovalsHubView: React.FC = () => {
  const {
    employees,
    leaveRequests,
    advances,
    custodyItems,
    updateLeaveStatus,
    toggleCustodyClearance,
    showToast,
  } = useHR();

  const [activeTab, setActiveTab] = useState<'all' | 'leave' | 'advance' | 'custody'>('all');
  const [localOverrides, setLocalOverrides] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({});

  const requests = useMemo<ApprovalRequest[]>(() => {
    const leaveApprovals: ApprovalRequest[] = leaveRequests.map((lr) => {
      const emp = employees.find((e) => e.id === lr.employeeId);
      return {
        id: lr.id,
        type: 'leave',
        employeeName: lr.employeeName,
        employeeUid: emp?.uid || lr.employeeId,
        jobTitle: lr.jobTitleAr || emp?.jobTitleAr || 'موظف',
        companyName: emp?.companyNameAr || 'الإدارة المركزية',
        requestTitle: LEAVE_TYPE_LABELS[lr.type] || 'طلب إجازة',
        details: `${lr.reason || 'بدون ملاحظات إضافية'} (من ${lr.startDate} إلى ${lr.endDate})`,
        amountOrDays: `${lr.daysCount} يوم`,
        date: lr.requestDate,
        status: lr.status,
      };
    });

    const advanceApprovals: ApprovalRequest[] = advances.map((adv) => {
      const emp = employees.find((e) => e.id === adv.employeeId);
      const baseStatus: 'pending' | 'approved' = adv.status === 'paused' ? 'pending' : 'approved';
      return {
        id: adv.id,
        type: 'advance',
        employeeName: adv.employeeName,
        employeeUid: emp?.uid || adv.employeeId,
        jobTitle: adv.jobTitle || emp?.jobTitleAr || 'موظف',
        companyName: emp?.companyNameAr || adv.companyId || 'الإدارة المركزية',
        requestTitle: `طلب سلفة نقدية (${adv.advanceCode})`,
        details: `${adv.reason || 'سلفة شخصية'} — قسط شهري ${adv.monthlyDeduction.toLocaleString('en-US')} ج.م على ${adv.installmentsTotal} شهر`,
        amountOrDays: `${adv.totalAmount.toLocaleString('en-US')} ج.م`,
        date: adv.startDate,
        status: localOverrides[adv.id] ?? baseStatus,
      };
    });

    const custodyApprovals: ApprovalRequest[] = custodyItems.map((cust) => {
      const emp = employees.find((e) => e.id === cust.employeeId);
      const baseStatus: 'pending' | 'approved' = cust.status === 'returned_cleared' ? 'approved' : 'pending';
      return {
        id: cust.id,
        type: 'custody',
        employeeName: cust.employeeName,
        employeeUid: emp?.uid || cust.employeeId,
        jobTitle: emp?.jobTitleAr || 'موظف',
        companyName: emp?.companyNameAr || 'الإدارة المركزية',
        requestTitle:
          cust.status === 'returned_cleared'
            ? `إخلاء طرف عهدة مسلّمة (${cust.custodyCode})`
            : `طلب اعتماد وتسليم عهدة (${cust.custodyCode})`,
        details: `${cust.assetNameAr} — السيريال (${cust.serialNumber}) — المشروع: ${cust.projectLinked}`,
        amountOrDays: cust.condition || 'عهدة أصل',
        date: cust.issueDate,
        status: localOverrides[cust.id] ?? baseStatus,
      };
    });

    return [...leaveApprovals, ...advanceApprovals, ...custodyApprovals];
  }, [employees, leaveRequests, advances, custodyItems, localOverrides]);

  const handleAction = (req: ApprovalRequest, decision: 'approved' | 'rejected') => {
    if (req.type === 'leave') {
      updateLeaveStatus(req.id, decision);
      return;
    }

    if (req.type === 'custody' && decision === 'approved') {
      toggleCustodyClearance(req.id);
    }

    setLocalOverrides((prev) => ({ ...prev, [req.id]: decision }));
    if (decision === 'approved') {
      showToast(`تم اعتماد الطلب (${req.requestTitle}) للموظف ${req.employeeName}`);
    } else {
      showToast(`تم رفض / إرجاع الطلب (${req.requestTitle}) مع إشعار الموظف`);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const filteredRequests = requests.filter((r) => activeTab === 'all' || r.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D]" />
            <span>مركز الاعتمادات والموافقات التنفيذي الموحد (HR Approvals Inbox)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            الاعتماد الفوري لطلبات الإجازات، السلف النقدية، وإخلاء طرف العهد الميدانية بضغطة واحدة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              pendingCount > 0
                ? 'bg-amber-500/15 border-[#D99B26]/30 dark:border-amber-600/40 text-[#D99B26] dark:text-[#EBB34D]'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {pendingCount > 0 ? `${pendingCount} طلب بانتظار المراجعة` : 'لا توجد طلبات معلّقة (صفر معلّقات)'}
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
              : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
          }`}
        >
          كافة الطلبات ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'leave'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
              : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>الإجازات والمأموريات ({requests.filter((r) => r.type === 'leave').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advance')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'advance'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
              : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>طلبات السلف المالية ({requests.filter((r) => r.type === 'advance').length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custody')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'custody'
              ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-sm font-black'
              : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>إخلاء العهد والأصول ({requests.filter((r) => r.type === 'custody').length})</span>
        </button>
      </div>

      {/* Empty State or Approvals Feed Grid */}
      {filteredRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-2xl border border-dashed border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-center space-y-3"
        >
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F3EFE6] dark:bg-[#111A13] border border-[#E0D9CB] dark:border-[#243628] flex items-center justify-center text-[#D99B26] dark:text-[#EBB34D]">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">
            صندوق الاعتمادات فارغ تماماً في هذا التصنيف
          </h4>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] max-w-md mx-auto leading-relaxed">
            سيظهر هنا تلقائياً أي طلب إجازة، طلب سلفة، أو حركة إخلاء طرف عهدة فور تسجيلها من شاشات الموظفين، لتتمكن من اعتمادها أو رفضها فورياً.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req, idx) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <motion.div
                key={`${req.type}-${req.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                  isPending
                    ? 'border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A]'
                    : isApproved
                    ? 'border-emerald-500/30 dark:border-emerald-800/40 bg-emerald-500/5 dark:bg-[#17231A]/70'
                    : 'border-rose-500/30 dark:border-rose-800/40 bg-rose-500/5 dark:bg-[#17231A]/70'
                }`}
              >
                <div>
                  {/* Card Top Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          req.type === 'leave'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                            : req.type === 'advance'
                            ? 'bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border-[#D99B26]/30'
                            : 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {req.type === 'leave' ? 'إجازة' : req.type === 'advance' ? 'سلفة مالية' : 'عهدة'}
                      </span>
                      <span className="font-mono text-[10px] text-[#5C665E] dark:text-[#8FA392]">{req.id}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                      <Clock className="w-3 h-3" />
                      <span>{req.date}</span>
                    </div>
                  </div>

                  {/* Employee Info */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-[#1A241C] dark:text-[#F3EFE6]">{req.employeeName}</h4>
                      <span className="font-mono text-[11px] font-bold text-[#D99B26] dark:text-[#EBB34D]">
                        ({req.employeeUid})
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] flex items-center gap-1.5 mt-0.5">
                      <span>{req.jobTitle}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#059669] dark:text-emerald-400 font-bold">
                        <Building2 className="w-3 h-3" />
                        {req.companyName}
                      </span>
                    </p>
                  </div>

                  {/* Request Payload Box */}
                  <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">{req.requestTitle}</span>
                      <span className="font-mono text-xs font-black text-[#D99B26] dark:text-[#EBB34D]">
                        {req.amountOrDays}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392] leading-relaxed">{req.details}</p>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 mt-4 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between gap-3">
                  {isPending ? (
                    <div className="flex items-center gap-2 w-full">
                      <button
                        type="button"
                        onClick={() => handleAction(req, 'approved')}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>موافقة واعتماد</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(req, 'rejected')}
                        className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs font-bold">
                      <span
                        className={`flex items-center gap-1.5 ${
                          isApproved ? 'text-[#059669] dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span>{isApproved ? 'تم الاعتماد النهائي وترحيل الحركة' : 'مرفوض من الإدارة'}</span>
                      </span>
                      <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392]">مغلق</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
