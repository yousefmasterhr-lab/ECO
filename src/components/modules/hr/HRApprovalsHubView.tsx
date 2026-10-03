import React, { useState } from 'react';
import { useHR } from '../../../context/HRContext';
import {
  CheckCircle2,
  XCircle,
  Check
} from 'lucide-react';

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

export const HRApprovalsHubView: React.FC = () => {
  const { showToast } = useHR();

  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: 'REQ-LIV-091',
      type: 'leave',
      employeeName: 'م. أحمد نبيل الشربيني',
      employeeUid: '0335',
      jobTitle: 'مهندس موقع أول',
      companyName: 'ترابط للمقاولات',
      requestTitle: 'إجازة اعتيادية سنوية',
      details: 'طلب إجازة 4 أيام بعد إتمام صب خرسانة اللبشة المسلحة',
      amountOrDays: '4 أيام عمل',
      date: '2026-10-02',
      status: 'pending',
    },
    {
      id: 'REQ-ADV-114',
      type: 'advance',
      employeeName: 'أ. محمود عبد الرحمن منصور',
      employeeUid: '0104',
      jobTitle: 'محاسب تكاليف ومشاريع',
      companyName: 'ماستر جروب',
      requestTitle: 'سلفة اجتماعية طارئة',
      details: 'سلفة زواج تخصم على 12 قسطاً شهرياً من الراتب',
      amountOrDays: '15,000 ج.م',
      date: '2026-10-01',
      status: 'pending',
    },
    {
      id: 'REQ-CUS-042',
      type: 'custody',
      employeeName: 'م. حسام الدين غانم',
      employeeUid: '0089',
      jobTitle: 'مدير مشروعات البنية التحتية',
      companyName: 'ترابط للمقاولات',
      requestTitle: 'صرف سيارة موقع وكارت وقود',
      details: 'طلب سيارة دفع رباعي ميتسوبيشي لمتابعة قطاع شبرا النخل',
      amountOrDays: 'أصل عيني + كارت وقود',
      date: '2026-09-30',
      status: 'pending',
    },
    {
      id: 'REQ-LIV-092',
      type: 'leave',
      employeeName: 'أ. كريم محمد فؤاد',
      employeeUid: '0214',
      jobTitle: 'مشرف تنفيذ وأعمال مدنية',
      companyName: 'ترابط للمقاولات',
      requestTitle: 'إجازة عارضة',
      details: 'ظرف عائلي طارئ ليوم واحد',
      amountOrDays: '1 يوم',
      date: '2026-10-02',
      status: 'pending',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'leave' | 'advance' | 'custody'>('all');

  const filteredRequests = requests.filter(r => {
    if (activeTab !== 'all' && r.type !== activeTab) return false;
    return true;
  });

  const handleApprove = (id: string, name: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    showToast(`تم اعتماد الطلب بنجاح للموظف (${name}) وتحديث سجله تلقائياً`);
  };

  const handleReject = (id: string, name: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    showToast(`تم رفض الطلب المقدم من (${name}) وإشعار الموظف بالسبب`);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#EBB34D]" />
            <span>مركز الطلبات والاعتمادات التنفيذية (Approvals & Workflow Hub)</span>
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
            اعتماد طلبات الإجازات والسلف وصرف العهد لجميع قطاعات وفروع المجموعة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#3D2D14] border border-amber-600/40 text-[#EBB34D] text-xs font-bold">
            طلبات قيد الاعتماد: {pendingCount} طلب
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
              : 'text-[#8FA392] hover:text-[#F3EFE6]'
          }`}
        >
          كافة الطلبات ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('leave')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'leave'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
              : 'text-[#8FA392] hover:text-[#F3EFE6]'
          }`}
        >
          الإجازات والأرصدة
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'advance'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
              : 'text-[#8FA392] hover:text-[#F3EFE6]'
          }`}
        >
          السلف المالية
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custody')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'custody'
              ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-[#0E1610]'
              : 'text-[#8FA392] hover:text-[#F3EFE6]'
          }`}
        >
          صرف العُهد والأجهزة
        </button>
      </div>

      {/* Requests Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map(req => {
          const isPending = req.status === 'pending';
          const isApproved = req.status === 'approved';
          return (
            <div
              key={req.id}
              className={`p-4 rounded-2xl border transition-all ${
                isPending
                  ? 'border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A]'
                  : isApproved
                  ? 'border-emerald-800/40 bg-[#17231A]/60'
                  : 'border-rose-800/40 bg-[#17231A]/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {req.employeeName}
                    </span>
                    <span className="text-[10px] font-mono text-[#EBB34D]">
                      ({req.employeeUid})
                    </span>
                  </div>
                  <div className="text-[10.5px] text-[#8FA392] mt-0.5">
                    {req.jobTitle} • {req.companyName}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  req.type === 'leave'
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-600/40'
                    : req.type === 'advance'
                    ? 'bg-amber-950/80 text-[#EBB34D] border border-amber-600/40'
                    : 'bg-purple-950/80 text-purple-300 border border-purple-600/40'
                }`}>
                  {req.requestTitle}
                </span>
              </div>

              <div className="py-3 space-y-2">
                <p className="text-xs text-[#1A241C] dark:text-[#F3EFE6]">
                  {req.details}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8FA392]">المقدار المطلوب:</span>
                  <span className="font-mono font-bold text-[#EBB34D]">
                    {req.amountOrDays}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8FA392]">
                  <span>تاريخ تقديم الطلب: {req.date}</span>
                  <span className="font-mono">{req.id}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-between">
                <div>
                  {isApproved && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>معتمد ومسجل بالمنظومة</span>
                    </span>
                  )}
                  {!isPending && !isApproved && (
                    <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-bold">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>طلب مرفوض</span>
                    </span>
                  )}
                </div>

                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(req.id, req.employeeName)}
                      className="px-3 py-1.5 rounded-xl border border-rose-600/40 text-rose-400 text-xs font-bold hover:bg-rose-950/50 transition-all cursor-pointer"
                    >
                      رفض
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id, req.employeeName)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>اعتماد الطلب</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
