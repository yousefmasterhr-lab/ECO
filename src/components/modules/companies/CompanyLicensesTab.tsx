import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import { SmartDocument, CompanyEntity } from './types';

interface CompanyLicensesTabProps {
  documents: SmartDocument[];
  companies: CompanyEntity[];
  onAddDocument: (doc: SmartDocument) => void;
  onUpdateDocument: (doc: SmartDocument) => void;
  onDeleteDocument: (id: string) => void;
  preselectedCompanyId?: string | null;
}

export const CompanyLicensesTab: React.FC<CompanyLicensesTabProps> = ({
  documents,
  companies,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  preselectedCompanyId
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(preselectedCompanyId || 'ALL');
  const [selectedDocType, setSelectedDocType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SmartDocument | null>(null);

  // Form State
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formDocType, setFormDocType] = useState<SmartDocument['docType']>('سجل تجاري');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formIssuerAr, setFormIssuerAr] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formDriveUrl, setFormDriveUrl] = useState('');
  const [formNotesAr, setFormNotesAr] = useState('');

  // Helper to compute remaining days from today
  const getDaysRemaining = (expiryDateStr: string): number => {
    if (!expiryDateStr) return 0;
    const now = new Date();
    // Normalize to start of day
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const exp = new Date(expiryDateStr);
    const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
    const diffTime = expDay.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to categorize status
  const getDocumentStatus = (daysRemaining: number): 'expired' | 'urgent' | 'active' => {
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= 45) return 'urgent';
    return 'active';
  };

  // Enriched & Dynamically Sorted Documents
  const enrichedDocuments = useMemo(() => {
    return documents.map(doc => {
      const daysRemaining = getDaysRemaining(doc.expiryDate);
      const computedStatus = getDocumentStatus(daysRemaining);
      return {
        ...doc,
        remainingDays: daysRemaining,
        computedStatus
      };
    });
  }, [documents]);

  // Priority Sorting Logic:
  // 1st Priority: Expired (daysRemaining <= 0)
  // 2nd Priority: Near-expiration (1 <= daysRemaining <= 45)
  // 3rd Priority: Active (> 45 days)
  // Secondary sort: ascending daysRemaining
  const sortedDocuments = useMemo(() => {
    return [...enrichedDocuments].sort((a, b) => {
      const priorityOrder = { expired: 1, urgent: 2, active: 3 };
      const pDiff = priorityOrder[a.computedStatus] - priorityOrder[b.computedStatus];
      if (pDiff !== 0) return pDiff;
      return a.remainingDays - b.remainingDays;
    });
  }, [enrichedDocuments]);

  // Filtered List
  const filteredDocuments = useMemo(() => {
    return sortedDocuments.filter(doc => {
      const matchSearch =
        !searchQuery.trim() ||
        doc.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.issuerAr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCompany = selectedCompanyId === 'ALL' || doc.companyId === selectedCompanyId;
      const matchDocType = selectedDocType === 'ALL' || doc.docType === selectedDocType;
      const matchStatus = selectedStatus === 'ALL' || doc.computedStatus === selectedStatus;

      return matchSearch && matchCompany && matchDocType && matchStatus;
    });
  }, [sortedDocuments, searchQuery, selectedCompanyId, selectedDocType, selectedStatus]);

  // Count summaries
  const expiredCount = enrichedDocuments.filter(d => d.computedStatus === 'expired').length;
  const urgentCount = enrichedDocuments.filter(d => d.computedStatus === 'urgent').length;
  const activeCount = enrichedDocuments.filter(d => d.computedStatus === 'active').length;

  const handleOpenAddModal = (companyIdToSelect?: string) => {
    setEditingDoc(null);
    setFormCompanyId(companyIdToSelect || companies[0]?.id || '');
    setFormDocType('سجل تجاري');
    setFormTitleAr('');
    setFormDocNumber('');
    setFormIssuerAr('مصلحة السجل التجاري');
    setFormIssueDate(new Date().toISOString().slice(0, 10));
    // Default expiry 1 year ahead
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setFormExpiryDate(nextYear.toISOString().slice(0, 10));
    setFormDriveUrl('');
    setFormNotesAr('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (doc: SmartDocument) => {
    setEditingDoc(doc);
    setFormCompanyId(doc.companyId);
    setFormDocType(doc.docType);
    setFormTitleAr(doc.titleAr);
    setFormDocNumber(doc.docNumber);
    setFormIssuerAr(doc.issuerAr);
    setFormIssueDate(doc.issueDate);
    setFormExpiryDate(doc.expiryDate);
    setFormDriveUrl(doc.driveUrl);
    setFormNotesAr(doc.notesAr || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleAr.trim()) return;

    const selectedComp = companies.find(c => c.id === formCompanyId);
    const companyNameAr = selectedComp ? selectedComp.nameAr : 'شركة أركان';

    if (editingDoc) {
      const updated: SmartDocument = {
        ...editingDoc,
        companyId: formCompanyId,
        companyNameAr,
        docType: formDocType,
        titleAr: formTitleAr,
        docNumber: formDocNumber,
        issuerAr: formIssuerAr,
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        driveUrl: formDriveUrl,
        notesAr: formNotesAr
      };
      onUpdateDocument(updated);
    } else {
      const newDoc: SmartDocument = {
        id: `doc_${Date.now()}`,
        companyId: formCompanyId,
        companyNameAr,
        docType: formDocType,
        titleAr: formTitleAr,
        docNumber: formDocNumber || `DOC-${Date.now().toString().slice(-5)}`,
        issuerAr: formIssuerAr || 'الجهة الحكومية المختصة',
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        driveUrl: formDriveUrl || 'https://drive.google.com/',
        notesAr: formNotesAr
      };
      onAddDocument(newDoc);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Fast KPI Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-[#1A241C] dark:text-[#F3EFE6]">
            السجلات الرسمية والتراخيص الحكومية
          </h3>
          <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
            تتبع صلاحية السجلات التجارية والبطاقات الضريبية والاشتراكات مع الفرز الفوري للأولويات
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة مستند / ترخيص</span>
        </button>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'expired' ? 'ALL' : 'expired')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            selectedStatus === 'expired'
              ? 'ring-2 ring-red-500 bg-red-950/30 border-red-800'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] border-red-900/30 hover:border-red-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">منتهية الصلاحية (أولوية قصوى)</span>
            </div>
            <span className="text-lg font-black text-red-500 font-mono">{expiredCount}</span>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block mt-1">
            مستندات يلزم تجديدها فوراً لتجنب إيقاف التعاملات
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'urgent' ? 'ALL' : 'urgent')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            selectedStatus === 'urgent'
              ? 'ring-2 ring-amber-500 bg-amber-950/30 border-amber-800'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] border-amber-900/30 hover:border-amber-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold">تجديد عاجل (أقل من 45 يوماً)</span>
            </div>
            <span className="text-lg font-black text-amber-500 font-mono">{urgentCount}</span>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block mt-1">
            في مرحلة إعداد ملف التجديد والسداد
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'active' ? 'ALL' : 'active')}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            selectedStatus === 'active'
              ? 'ring-2 ring-emerald-500 bg-emerald-950/30 border-emerald-800'
              : 'bg-[#F3EFE6] dark:bg-[#17231A] border-emerald-900/30 hover:border-emerald-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">سارية ومطابقة</span>
            </div>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{activeCount}</span>
          </div>
          <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392] block mt-1">
            سارية الصلاحية لأكثر من 45 يوماً
          </span>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="p-3.5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-[#5C665E] dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المستند، الرقم، الجهة..."
              className="w-full min-h-[44px] pr-9 pl-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-[#D97706]"
            />
          </div>

          {/* Filter by Company (Arabic Names Only!) */}
          <div>
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold focus:outline-none focus:border-[#D97706]"
            >
              <option value="ALL">كافة الشركات المسجلة</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Document Type */}
          <div>
            <select
              value={selectedDocType}
              onChange={e => setSelectedDocType(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-[#D97706]"
            >
              <option value="ALL">كافة أنواع المستندات</option>
              <option value="سجل تجاري">سجل تجاري</option>
              <option value="بطاقة ضريبية">بطاقة ضريبية</option>
              <option value="رخصة تشغيل">رخصة تشغيل</option>
              <option value="اتحاد مقاولين">اتحاد مقاولين</option>
              <option value="تأمينات اجتماعية">تأمينات اجتماعية</option>
              <option value="شهادة تصنيف">شهادة تصنيف</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] text-xs font-bold focus:outline-none focus:border-[#D97706]"
            >
              <option value="ALL">كافة الحالات</option>
              <option value="expired">منتهي (أولوية قصوى)</option>
              <option value="urgent">تجديد عاجل (أقل من 45 يوماً)</option>
              <option value="active">ساري الصلاحية</option>
            </select>
          </div>
        </div>

        {/* Active Filters Clear Button if filtered */}
        {(searchQuery || selectedCompanyId !== 'ALL' || selectedDocType !== 'ALL' || selectedStatus !== 'ALL') && (
          <div className="flex items-center justify-between text-xs text-[#5C665E] dark:text-[#8FA392] pt-1">
            <span>عرض <strong>{filteredDocuments.length}</strong> من إجمالي <strong>{documents.length}</strong> مستند</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCompanyId('ALL');
                setSelectedDocType('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-[#D97706] hover:underline font-bold"
            >
              إعادة تعيين كافة الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Responsive Table with Priority Color Coding */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] overflow-hidden bg-[#F3EFE6] dark:bg-[#17231A] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#1A241C] dark:text-[#F3EFE6] border-b border-[#E0D9CB] dark:border-[#243628]">
              <tr>
                <th className="p-3.5 text-start sticky right-0 bg-[#EAE4D7] dark:bg-[#1F2E23] z-10 shadow-xs whitespace-nowrap">
                  المستند والترخيص
                </th>
                <th className="p-3.5 text-start whitespace-nowrap">الشركة التابعة</th>
                <th className="p-3.5 text-start whitespace-nowrap">جهة الإصدار</th>
                <th className="p-3.5 text-start whitespace-nowrap">رقم القيد / الوثيقة</th>
                <th className="p-3.5 text-start whitespace-nowrap">تاريخ الانتهاء</th>
                <th className="p-3.5 text-center whitespace-nowrap">المدة المتبقية</th>
                <th className="p-3.5 text-center whitespace-nowrap">الحالة</th>
                <th className="p-3.5 text-center whitespace-nowrap">المستند</th>
                <th className="p-3.5 text-center whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D9CB]/60 dark:divide-[#243628]">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#5C665E] dark:text-[#8FA392]">
                    لا توجد مستندات مطابقة لمعايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => {
                  const isExpired = doc.computedStatus === 'expired';
                  const isUrgent = doc.computedStatus === 'urgent';

                  // Row background tint based on priority
                  const rowClass = isExpired
                    ? 'bg-red-950/15 hover:bg-red-950/25 border-l-4 border-l-red-500'
                    : isUrgent
                    ? 'bg-amber-950/15 hover:bg-amber-950/25 border-l-4 border-l-amber-500'
                    : 'hover:bg-[#EAE4D7]/50 dark:hover:bg-[#1F2E23]/50';

                  return (
                    <tr key={doc.id} className={`transition-colors ${rowClass}`}>
                      {/* Sticky Doc Title */}
                      <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6] sticky right-0 bg-[#F3EFE6] dark:bg-[#17231A] z-10 shadow-xs whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText
                            className={`w-4 h-4 shrink-0 ${
                              isExpired ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-[#D97706]'
                            }`}
                          />
                          <div>
                            <span className="block leading-tight">{doc.titleAr}</span>
                            <span className="text-[10px] font-semibold text-[#5C665E] dark:text-[#8FA392]">
                              {doc.docType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Parent Company (Arabic Full Name) */}
                      <td className="p-3.5 font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                        {doc.companyNameAr}
                      </td>

                      {/* Issuer */}
                      <td className="p-3.5 text-[#5C665E] dark:text-[#8FA392] whitespace-nowrap">
                        {doc.issuerAr}
                      </td>

                      {/* Record Number */}
                      <td className="p-3.5 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                        {doc.docNumber}
                      </td>

                      {/* Expiry Date */}
                      <td className="p-3.5 font-mono font-bold text-[#1A241C] dark:text-[#F3EFE6] whitespace-nowrap">
                        {doc.expiryDate}
                      </td>

                      {/* Days Remaining Calculation */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {isExpired ? (
                          <span className="font-bold text-red-500 font-mono text-xs">
                            منتهي منذ {Math.abs(doc.remainingDays)} يوم
                          </span>
                        ) : isUrgent ? (
                          <span className="font-bold text-amber-500 font-mono text-xs">
                            متبقي {doc.remainingDays} يوم فقط
                          </span>
                        ) : (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                            متبقي {doc.remainingDays} يوم
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black text-red-500 bg-red-950/20 border border-red-900/50">
                            <AlertTriangle className="w-3 h-3" />
                            <span>منتهي الصلاحية</span>
                          </span>
                        ) : isUrgent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold text-amber-400 bg-amber-950/20 border border-amber-900/50">
                            <Clock className="w-3 h-3" />
                            <span>تجديد عاجل</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold text-emerald-500 bg-emerald-950/20 border border-emerald-900/50">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ساري ومطابق</span>
                          </span>
                        )}
                      </td>

                      {/* Drive View Link */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <a
                          href={doc.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="معاينة المستند المؤرشف على Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(doc)}
                            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:text-[#D97706] hover:bg-[#D97706]/10 transition-colors"
                            title="تعديل بيانات الترخيص"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDocument(doc.id)}
                            className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                            title="حذف المستند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: إضافة / تعديل مستند وترخيص */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden p-5 text-start"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#243628] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {editingDoc ? 'تعديل بيانات المستند / الترخيص' : 'إضافة مستند أو ترخيص رسمي جديد'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {/* Select Company (Arabic Names Only) */}
                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    الشركة المسجل باسمها المستند *
                  </label>
                  <select
                    required
                    value={formCompanyId}
                    onChange={e => setFormCompanyId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-bold focus:outline-none focus:border-[#D97706]"
                  >
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      نوع المستند *
                    </label>
                    <select
                      value={formDocType}
                      onChange={e => setFormDocType(e.target.value as SmartDocument['docType'])}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    >
                      <option value="سجل تجاري">سجل تجاري</option>
                      <option value="بطاقة ضريبية">بطاقة ضريبية</option>
                      <option value="رخصة تشغيل">رخصة تشغيل ومطابقة</option>
                      <option value="اتحاد مقاولين">اتحاد مقاولين</option>
                      <option value="تأمينات اجتماعية">تأمينات اجتماعية</option>
                      <option value="شهادة تصنيف">شهادة تصنيف واعتماد</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      رقم القيد / الترخيص *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDocNumber}
                      onChange={e => setFormDocNumber(e.target.value)}
                      placeholder="EG-CR-2024-99"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    عنوان / مسمى الوثيقة *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleAr}
                    onChange={e => setFormTitleAr(e.target.value)}
                    placeholder="مثال: شهادة تجديد الاتحاد المصري لمقاولي البناء الفئة الأولى"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    جهة الإصدار الرسمية *
                  </label>
                  <input
                    type="text"
                    required
                    value={formIssuerAr}
                    onChange={e => setFormIssuerAr(e.target.value)}
                    placeholder="مصلحة السجل التجاري / نقابة المهندسين / وزارة العمل"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      تاريخ الاستخراج / الإصدار *
                    </label>
                    <input
                      type="date"
                      required
                      value={formIssueDate}
                      onChange={e => setFormIssueDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      تاريخ انتهاء الصلاحية *
                    </label>
                    <input
                      type="date"
                      required
                      value={formExpiryDate}
                      onChange={e => setFormExpiryDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    رابط المستند المؤرشف (Google Drive)
                  </label>
                  <input
                    type="url"
                    value={formDriveUrl}
                    onChange={e => setFormDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    ملاحظات أو إجراءات مطلوبة
                  </label>
                  <textarea
                    rows={2}
                    value={formNotesAr}
                    onChange={e => setFormNotesAr(e.target.value)}
                    placeholder="أي ملاحظات حول إجراءات الفحص أو رسوم التجديد..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:bg-gray-100 dark:hover:bg-white/5 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-6 py-2 rounded-xl bg-[#D97706] text-white font-bold hover:bg-[#B45309] transition-colors shadow-xs"
                  >
                    {editingDoc ? 'حفظ التعديل' : 'إضافة المستند'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
