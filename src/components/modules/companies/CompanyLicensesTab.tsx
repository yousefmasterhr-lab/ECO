import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  X,
  UploadCloud,
  Download,
  ExternalLink,
  Eye,
  Building,
  Calendar,
  Layers,
  History,
  FileCheck
} from 'lucide-react';
import { SmartDocument, CompanyEntity, CompanyDocumentAttachment } from './types';
import { getFormattedAuditTimestamp } from './licenseStorage';
import { useAuth } from '../../../context/AuthContext';

interface CompanyLicensesTabProps {
  documents: SmartDocument[];
  companies: CompanyEntity[];
  onAddDocument: (doc: SmartDocument) => void;
  onUpdateDocument: (doc: SmartDocument) => void;
  onDeleteDocument: (id: string) => void;
  preselectedCompanyId?: string | null;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const CompanyLicensesTab: React.FC<CompanyLicensesTabProps> = ({
  documents,
  companies,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  preselectedCompanyId
}) => {
  const { hasPermission } = useAuth();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(preselectedCompanyId || 'ALL');
  const [selectedDocType, setSelectedDocType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal Visibility States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SmartDocument | null>(null);
  const [auditDoc, setAuditDoc] = useState<SmartDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<SmartDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    attachment?: CompanyDocumentAttachment;
    driveUrl?: string;
  } | null>(null);

  // Form State
  const [formCompanyId, setFormCompanyId] = useState('');
  const [formDocType, setFormDocType] = useState<string>('سجل تجاري');
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formIssuerAr, setFormIssuerAr] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formDriveUrl, setFormDriveUrl] = useState('');
  const [formNotesAr, setFormNotesAr] = useState('');
  const [formFileAttachment, setFormFileAttachment] = useState<CompanyDocumentAttachment | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize filter when preselectedCompanyId changes (e.g. navigation from Company Directory card)
  React.useEffect(() => {
    if (preselectedCompanyId) {
      setSelectedCompanyId(preselectedCompanyId);
    }
  }, [preselectedCompanyId]);

  // Helper to compute remaining days from today
  const getDaysRemaining = (expiryDateStr?: string): number => {
    if (!expiryDateStr || !expiryDateStr.trim()) return 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const exp = new Date(expiryDateStr);
    const expDay = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());
    const diffTime = expDay.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to categorize status
  const getDocumentStatus = (daysRemaining: number, expiryDateStr?: string): 'expired' | 'urgent' | 'active' | 'draft' => {
    if (!expiryDateStr || !expiryDateStr.trim()) return 'draft';
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= 45) return 'urgent';
    return 'active';
  };

  // Enriched & Dynamically Computed Documents
  const enrichedDocuments = useMemo(() => {
    return documents.map(doc => {
      const daysRemaining = getDaysRemaining(doc.expiryDate);
      const computedStatus = getDocumentStatus(daysRemaining, doc.expiryDate);
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
  // 3rd Priority: Draft / Missing expiry
  // 4th Priority: Active (> 45 days)
  const sortedDocuments = useMemo(() => {
    return [...enrichedDocuments].sort((a, b) => {
      const priorityOrder: Record<string, number> = { expired: 1, urgent: 2, draft: 3, active: 4 };
      const pDiff = (priorityOrder[a.computedStatus] || 99) - (priorityOrder[b.computedStatus] || 99);
      if (pDiff !== 0) return pDiff;
      return a.remainingDays - b.remainingDays;
    });
  }, [enrichedDocuments]);

  // Dynamic KPI counters computed directly from live enriched list
  const expiredCount = useMemo(() => enrichedDocuments.filter(d => d.computedStatus === 'expired').length, [enrichedDocuments]);
  const urgentCount = useMemo(() => enrichedDocuments.filter(d => d.computedStatus === 'urgent').length, [enrichedDocuments]);
  const activeCount = useMemo(() => enrichedDocuments.filter(d => d.computedStatus === 'active').length, [enrichedDocuments]);

  // Filtered List
  const filteredDocuments = useMemo(() => {
    return sortedDocuments.filter(doc => {
      const matchSearch =
        !searchQuery.trim() ||
        doc.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.issuerAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.companyNameAr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCompany = selectedCompanyId === 'ALL' || doc.companyId === selectedCompanyId;
      const matchDocType = selectedDocType === 'ALL' || doc.docType === selectedDocType;
      const matchStatus = selectedStatus === 'ALL' || doc.computedStatus === selectedStatus;

      return matchSearch && matchCompany && matchDocType && matchStatus;
    });
  }, [sortedDocuments, searchQuery, selectedCompanyId, selectedDocType, selectedStatus]);

  // Modal Open Handlers
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
    setFormFileAttachment(undefined);
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
    setFormDriveUrl(doc.driveUrl || '');
    setFormNotesAr(doc.notesAr || '');
    setFormFileAttachment(doc.fileAttachment);
    setModalOpen(true);
  };

  // File Upload Processing
  const handleProcessUploadedFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0]; // Support single primary official document upload
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      const newAttachment: CompanyDocumentAttachment = {
        id: `lic_file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        docType: formDocType,
        sizeBytes: file.size,
        mimeType: file.type || 'application/pdf',
        uploadedAt: getFormattedAuditTimestamp(),
        dataUrl
      };
      setFormFileAttachment(newAttachment);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessUploadedFiles(e.dataTransfer.files);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleAr.trim()) return;

    const selectedComp = companies.find(c => c.id === formCompanyId);
    const companyNameAr = selectedComp ? selectedComp.nameAr : (companies[0]?.nameAr || 'الشركة الرئيسية');

    if (editingDoc) {
      const updated: SmartDocument = {
        ...editingDoc,
        companyId: formCompanyId || companies[0]?.id || 'comp_main',
        companyNameAr,
        docType: formDocType,
        titleAr: formTitleAr.trim(),
        docNumber: formDocNumber.trim(),
        issuerAr: formIssuerAr.trim(),
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        driveUrl: formDriveUrl.trim() || undefined,
        notesAr: formNotesAr.trim() || undefined,
        fileAttachment: formFileAttachment
      };
      onUpdateDocument(updated);
    } else {
      const newDoc: SmartDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        companyId: formCompanyId || companies[0]?.id || 'comp_main',
        companyNameAr,
        docType: formDocType,
        titleAr: formTitleAr.trim(),
        docNumber: formDocNumber.trim() || `DOC-${Date.now().toString().slice(-5)}`,
        issuerAr: formIssuerAr.trim() || 'الجهة الحكومية المختصة',
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        driveUrl: formDriveUrl.trim() || undefined,
        notesAr: formNotesAr.trim() || undefined,
        fileAttachment: formFileAttachment
      };
      onAddDocument(newDoc);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-4 text-start">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <span>السجلات الرسمية والتراخيص الحكومية</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#8FA392]">
            تتبع صلاحية السجلات التجارية، البطاقات الضريبية، شهادات القيد، وتراخيص مزاولة النشاط مع الفرز الديناميكي للأولويات
          </p>
        </div>

        {hasPermission('companies.licenses.create') && (
          <button
            onClick={() => handleOpenAddModal()}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستند / ترخيص</span>
          </button>
        )}
      </div>

      {/* Dynamic 3-Card KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* KPI 1: Expired */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setSelectedStatus(selectedStatus === 'expired' ? 'ALL' : 'expired')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
            selectedStatus === 'expired'
              ? 'ring-2 ring-rose-500 bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 shadow-md'
              : 'bg-white dark:bg-[#17231A] border-slate-200 dark:border-[#243628] hover:border-rose-400 dark:hover:border-rose-700 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">منتهية الصلاحية (أولوية قصوى)</span>
            </div>
            <span className={`text-xl font-black font-mono text-rose-600 dark:text-rose-400 ${expiredCount > 0 ? 'animate-pulse' : ''}`}>
              {expiredCount}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block mt-2">
            مستندات يلزم تجديدها فوراً لتجنب توقف المعاملات والغرامات
          </span>
        </motion.div>

        {/* KPI 2: Urgent Renewal (1 to 45 days) */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setSelectedStatus(selectedStatus === 'urgent' ? 'ALL' : 'urgent')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
            selectedStatus === 'urgent'
              ? 'ring-2 ring-amber-500 bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-md'
              : 'bg-white dark:bg-[#17231A] border-slate-200 dark:border-[#243628] hover:border-amber-400 dark:hover:border-amber-700 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">تجديد عاجل (أقل من 45 يوماً)</span>
            </div>
            <span className={`text-xl font-black font-mono text-amber-600 dark:text-amber-400 ${urgentCount > 0 ? 'animate-pulse' : ''}`}>
              {urgentCount}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block mt-2">
            في مرحلة إعداد ملفات التجديد وسداد الرسوم الرسمية
          </span>
        </motion.div>

        {/* KPI 3: Active & Compliant */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setSelectedStatus(selectedStatus === 'active' ? 'ALL' : 'active')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 select-none ${
            selectedStatus === 'active'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-md'
              : 'bg-white dark:bg-[#17231A] border-slate-200 dark:border-[#243628] hover:border-emerald-400 dark:hover:border-emerald-700 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">سارية ومطابقة</span>
            </div>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-[#8FA392] block mt-2">
            مستندات سارية الصلاحية لأكثر من 45 يوماً ومطابقة
          </span>
        </motion.div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-[#243628] bg-white dark:bg-[#17231A] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 dark:text-[#8FA392]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المستند، الرقم، الجهة، أو الشركة..."
              className="w-full min-h-[44px] pr-9 pl-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter by Registered Company */}
          <div>
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs font-bold focus:outline-none focus:border-amber-500"
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
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">كافة أنواع المستندات</option>
              <option value="سجل تجاري">سجل تجاري</option>
              <option value="بطاقة ضريبية">بطاقة ضريبية</option>
              <option value="رخصة تشغيل">رخصة تشغيل ومطابقة</option>
              <option value="اتحاد مقاولين">اتحاد مقاولين</option>
              <option value="تأمينات اجتماعية">تأمينات اجتماعية</option>
              <option value="شهادة تصنيف">شهادة تصنيف واعتماد</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#0E1610] text-slate-900 dark:text-[#F3EFE6] text-xs font-bold focus:outline-none focus:border-amber-500"
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
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8FA392] pt-1">
            <span>عرض <strong>{filteredDocuments.length}</strong> من إجمالي <strong>{documents.length}</strong> مستند</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCompanyId('ALL');
                setSelectedDocType('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-amber-600 dark:text-amber-400 hover:underline font-bold cursor-pointer"
            >
              إعادة تعيين كافة الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table OR Clean Empty State */}
      {documents.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#17231A] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800/60">
            <FileText className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
            لا توجد تراخيص أو سجلات مضافة حالياً
          </h4>
          <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto mb-6">
            ابدأ بإضافة المستند الأول لشركتك لتتبع مواعيد الانتهاء وسجلات التعديل وأرشفة الملفات الرسمية بأمان.
          </p>
          {hasPermission('companies.licenses.create') && (
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة المستند الأول الآن</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-[#243628] overflow-hidden bg-white dark:bg-[#17231A] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-100 dark:bg-[#1F2E23] text-slate-900 dark:text-[#F3EFE6] border-b border-slate-200 dark:border-[#243628]">
                <tr>
                  <th className="p-3.5 text-start sticky right-0 bg-slate-100 dark:bg-[#1F2E23] z-10 shadow-xs whitespace-nowrap">
                    المستند والترخيص
                  </th>
                  <th className="p-3.5 text-start whitespace-nowrap">الشركة التابعة</th>
                  <th className="p-3.5 text-start whitespace-nowrap">جهة الإصدار</th>
                  <th className="p-3.5 text-start whitespace-nowrap">رقم القيد / الوثيقة</th>
                  <th className="p-3.5 text-start whitespace-nowrap">تاريخ الانتهاء</th>
                  <th className="p-3.5 text-center whitespace-nowrap">المدة المتبقية</th>
                  <th className="p-3.5 text-center whitespace-nowrap">الحالة</th>
                  <th className="p-3.5 text-center whitespace-nowrap">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-[#243628]">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-[#8FA392]">
                      لا توجد مستندات مطابقة لمعايير البحث الحالية.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map(doc => {
                    const isExpired = doc.computedStatus === 'expired';
                    const isUrgent = doc.computedStatus === 'urgent';

                    // High contrast row styling
                    const rowClass = isExpired
                      ? 'bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 border-r-4 border-r-rose-500'
                      : isUrgent
                      ? 'bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/15 dark:hover:bg-amber-950/25 border-r-4 border-r-amber-500'
                      : 'hover:bg-slate-50 dark:hover:bg-[#1F2E23]/50';

                    return (
                      <tr key={doc.id} className={`transition-colors ${rowClass}`}>
                        {/* Title & Document Type */}
                        <td className="p-3.5 font-bold text-slate-900 dark:text-[#F3EFE6] sticky right-0 bg-inherit z-10 shadow-xs whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText
                              className={`w-4 h-4 shrink-0 ${
                                isExpired ? 'text-rose-500' : isUrgent ? 'text-amber-500' : 'text-slate-600 dark:text-amber-400'
                              }`}
                            />
                            <div>
                              <span className="block leading-tight text-slate-900 dark:text-[#F3EFE6]">{doc.titleAr}</span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-[#8FA392]">
                                {doc.docType}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Company Name */}
                        <td className="p-3.5 font-bold text-slate-800 dark:text-[#F3EFE6] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{doc.companyNameAr}</span>
                          </div>
                        </td>

                        {/* Issuer */}
                        <td className="p-3.5 text-slate-600 dark:text-[#8FA392] whitespace-nowrap">
                          {doc.issuerAr}
                        </td>

                        {/* Record Number */}
                        <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-[#F3EFE6] whitespace-nowrap">
                          {doc.docNumber}
                        </td>

                        {/* Expiry Date */}
                        <td className="p-3.5 font-mono font-bold text-slate-800 dark:text-[#F3EFE6] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{doc.expiryDate || '— (غير محدد)'}</span>
                          </div>
                        </td>

                        {/* Remaining Days */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {doc.computedStatus === 'draft' ? (
                            <span className="font-semibold text-slate-500 dark:text-[#8FA392] text-xs">
                              بانتظار تحديد التاريخ
                            </span>
                          ) : isExpired ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-xs">
                              منتهي منذ {Math.abs(doc.remainingDays)} يوم
                            </span>
                          ) : isUrgent ? (
                            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-xs">
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
                          {doc.computedStatus === 'draft' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 shadow-2xs">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>مسودة / غير مكتمل</span>
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60 shadow-2xs">
                              <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" />
                              <span>منتهي الصلاحية</span>
                            </span>
                          ) : isUrgent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 shadow-2xs">
                              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                              <span>تجديد عاجل</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>ساري ومطابق</span>
                            </span>
                          )}
                        </td>

                        {/* Icon-Only Action Buttons */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {/* 1. Preview / Download Document */}
                            {hasPermission('companies.licenses.download') && (doc.fileAttachment || doc.driveUrl) && (
                              <button
                                onClick={() => setPreviewDoc({
                                  title: doc.titleAr,
                                  attachment: doc.fileAttachment,
                                  driveUrl: doc.driveUrl
                                })}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                                title="معاينة / تحميل المستند المرفوع"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            {/* 2. Edit Document */}
                            {hasPermission('companies.licenses.edit') && (
                              <button
                                onClick={() => handleOpenEditModal(doc)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                                title="تعديل بيانات الترخيص"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            {/* 3. Audit Log Exclamation Icon */}
                            {hasPermission('companies.licenses.view_audit') && (
                              <button
                                onClick={() => setAuditDoc(doc)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors cursor-pointer relative"
                                title="سجل التعديلات (Audit Trail)"
                              >
                                <AlertCircle className="w-4 h-4" />
                                {doc.auditLogs && doc.auditLogs.length > 1 && (
                                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                )}
                              </button>
                            )}

                            {/* 4. Delete Document */}
                            {hasPermission('companies.licenses.delete') && (
                              <button
                                onClick={() => setDocToDelete(doc)}
                                className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                title="حذف المستند نهائياً"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
      )}

      {/* ============================================================= */}
      {/* Modal 1: إضافة / تعديل مستند مع محرك رفع الملفات           */}
      {/* ============================================================= */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#243628] shrink-0 bg-slate-50/70 dark:bg-[#121B14]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6]">
                      {editingDoc ? 'تعديل بيانات المستند / الترخيص' : 'إضافة مستند أو ترخيص رسمي جديد'}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                      تسجيل البيانات الرسمية، تواريخ الصلاحية، وإيداع الملف الرقمي
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
                {/* 1. Company Selection */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    الشركة التابعة *
                  </label>
                  <select
                    required
                    value={formCompanyId}
                    onChange={e => setFormCompanyId(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-bold focus:outline-none focus:border-amber-500"
                  >
                    {companies.length === 0 ? (
                      <option value="">لا توجد شركات مسجلة (الشركة الافتراضية)</option>
                    ) : (
                      companies.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.nameAr}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* 2. Doc Type & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      نوع المستند *
                    </label>
                    <select
                      value={formDocType}
                      onChange={e => setFormDocType(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
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
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      رقم القيد / الوثيقة *
                    </label>
                    <input
                      type="text"
                      required
                      value={formDocNumber}
                      onChange={e => setFormDocNumber(e.target.value)}
                      placeholder="رقم القيد، الترخيص، أو كود الشهادة الرسمي"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 3. Document Title */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    اسم المستند / الترخيص *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleAr}
                    onChange={e => setFormTitleAr(e.target.value)}
                    placeholder="أدخل المسمى الرسمي للمستند كما هو مدون بالشهادة الحكومية"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 4. Issuer & Dates */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    جهة الإصدار *
                  </label>
                  <input
                    type="text"
                    required
                    value={formIssuerAr}
                    onChange={e => setFormIssuerAr(e.target.value)}
                    placeholder="الوزارة، الهيئة، أو النقابة المصدرة للترخيص"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      تاريخ الإصدار *
                    </label>
                    <input
                      type="date"
                      required
                      value={formIssueDate}
                      onChange={e => setFormIssueDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                      تاريخ الانتهاء *
                    </label>
                    <input
                      type="date"
                      required
                      value={formExpiryDate}
                      onChange={e => setFormExpiryDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 5. Cloud Drive Link (Optional) */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    رابط الأرشيف الرقمي (اختياري)
                  </label>
                  <input
                    type="url"
                    value={formDriveUrl}
                    onChange={e => setFormDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 6. Multi-Format Document Upload Zone (PDF, JPG, PNG) */}
                <div className="space-y-2 pt-1">
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6]">
                    إيداع الملف الرقمي للترخيص (PDF أو صور عالية الدقة)
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files) handleProcessUploadedFiles(e.target.files);
                    }}
                  />

                  {formFileAttachment ? (
                    <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block font-bold text-slate-900 dark:text-[#F3EFE6] truncate text-xs">
                            {formFileAttachment.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-[#8FA392]">
                            {formatBytes(formFileAttachment.sizeBytes)} • تم الرفع {formFileAttachment.uploadedAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {formFileAttachment.dataUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDoc({
                              title: formFileAttachment.name,
                              attachment: formFileAttachment
                            })}
                            className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 cursor-pointer"
                            title="معاينة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setFormFileAttachment(undefined)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 cursor-pointer"
                          title="حذف الملف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 scale-[0.99]'
                          : 'border-slate-300 dark:border-[#243628] hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/50 dark:bg-[#121B14]'
                      }`}
                    >
                      <UploadCloud className="w-7 h-7 mx-auto mb-1.5 text-amber-500" />
                      <span className="font-bold text-slate-800 dark:text-[#F3EFE6] block text-xs">
                        انقر لاختيار الملف أو اسحبه وأفلته هنا
                      </span>
                      <span className="text-[10.5px] text-slate-500 dark:text-[#8FA392] block mt-0.5">
                        صيغ مدعومة: PDF, JPG, PNG (بحد أقصى 15 ميجابايت)
                      </span>
                    </div>
                  )}
                </div>

                {/* 7. Notes */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-[#F3EFE6] mb-1">
                    ملاحظات التجديد والمتابعة (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={formNotesAr}
                    onChange={e => setFormNotesAr(e.target.value)}
                    placeholder="تعليمات أو إجراءات التجديد المطلوبة..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#243628] bg-slate-50 dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#243628]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-[#8FA392] font-bold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {editingDoc ? 'حفظ التعديلات' : 'تسجيل المستند'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 2: سجل تعديلات المستند / الترخيص (Audit Trail Drawer)   */}
      {/* ============================================================= */}
      <AnimatePresence>
        {auditDoc && (
          <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden text-start"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#121B14] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6]">
                      سجل تعديلات الترخيص (Audit Trail)
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-[#8FA392] truncate block max-w-xs">
                      {auditDoc.titleAr} ({auditDoc.docNumber})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setAuditDoc(null)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Log List */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
                {!auditDoc.auditLogs || auditDoc.auditLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-[#8FA392]">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <p>تم إنشاء المستند ولم يتم إجراء أي تعديلات لاحقة عليه.</p>
                  </div>
                ) : (
                  auditDoc.auditLogs.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-[#243628] bg-slate-50/70 dark:bg-[#17231A] space-y-2.5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#243628] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10.5px] bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            {entry.actionLabelAr || (entry.action === 'create' ? 'إنشاء المستند' : 'تحديث البيانات')}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-[#F3EFE6]">
                            بواسطة: {entry.userName || 'يوسف حجازي'}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-[#8FA392] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.timestamp}</span>
                        </span>
                      </div>

                      {/* Changes Diff List */}
                      {entry.changes && entry.changes.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {entry.changes.map((ch, chIdx) => (
                            <div
                              key={chIdx}
                              className="text-[11px] p-2 rounded-lg bg-white dark:bg-[#101912] border border-slate-200/80 dark:border-[#243628] leading-relaxed text-slate-800 dark:text-[#F3EFE6]"
                            >
                              <strong className="text-amber-600 dark:text-amber-400 font-bold ml-1">
                                [{ch.fieldLabel || ch.field}]:
                              </strong>
                              <span>تم التغيير من </span>
                              <span className="font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 line-through mx-1">
                                {ch.oldValue || '—'}
                              </span>
                              <span> إلى </span>
                              <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold mx-1">
                                {ch.newValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                          تم الحفظ وتثبيت البيانات دون تغيير في القيم.
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 3: نافذة تأكيد حذف المستند نهائياً                     */}
      {/* ============================================================= */}
      <AnimatePresence>
        {docToDelete && (
          <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl p-5 text-start"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-[#F3EFE6] mb-1.5">
                تأكيد حذف المستند / الترخيص نهائياً
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#8FA392] leading-relaxed mb-5">
                هل أنت متأكد من حذف المستند <strong>&quot;{docToDelete.titleAr}&quot;</strong> (رقم: {docToDelete.docNumber}) التابع لشركة <strong>&quot;{docToDelete.companyNameAr}&quot;</strong>؟ سيتم إزالة المستند والملف المرفق وسجل تدقيقه نهائياً.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDocToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-[#8FA392] font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteDocument(docToDelete.id);
                    setDocToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md active:scale-95"
                >
                  نعم، احذف المستند
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* Modal 4: نافذة معاينة / تحميل المستند (Preview Lightbox)       */}
      {/* ============================================================= */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0E1610] rounded-2xl border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-[#243628] bg-slate-50 dark:bg-[#121B14] shrink-0">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-bold text-xs text-slate-900 dark:text-[#F3EFE6] truncate">
                    {previewDoc.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {previewDoc.attachment?.dataUrl && (
                    <a
                      href={previewDoc.attachment.dataUrl}
                      download={previewDoc.attachment.name}
                      className="min-h-[36px] px-3 flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </a>
                  )}
                  {previewDoc.driveUrl && (
                    <a
                      href={previewDoc.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[36px] px-3 flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح في Google Drive</span>
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewDoc(null)}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-4 bg-slate-900/5 flex items-center justify-center overflow-auto min-h-[320px]">
                {previewDoc.attachment?.dataUrl?.startsWith('data:image') ? (
                  <img
                    src={previewDoc.attachment.dataUrl}
                    alt={previewDoc.title}
                    className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
                  />
                ) : previewDoc.attachment?.dataUrl?.startsWith('data:application/pdf') ? (
                  <object
                    data={previewDoc.attachment.dataUrl}
                    type="application/pdf"
                    className="w-full h-[70vh] rounded-lg"
                  >
                    <div className="p-6 text-center text-xs text-slate-500">
                      <p className="mb-3">تم تجهيز ملف الـ PDF. إذا لم يتم عرضه تلقائياً، يمكنك تنزيله مباشرة:</p>
                      <a
                        href={previewDoc.attachment.dataUrl}
                        download={previewDoc.attachment.name}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل {previewDoc.attachment.name}</span>
                      </a>
                    </div>
                  </object>
                ) : previewDoc.driveUrl ? (
                  <div className="p-8 text-center space-y-3">
                    <ExternalLink className="w-12 h-12 text-blue-500 mx-auto" />
                    <p className="font-bold text-sm text-slate-800 dark:text-[#F3EFE6]">
                      المستند مؤرشف عبر الرابط السحابي الخارجي
                    </p>
                    <a
                      href={previewDoc.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                    >
                      <span>الانتقال إلى Google Drive</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">لا توجد معاينة متاحة لهذا الملف.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
