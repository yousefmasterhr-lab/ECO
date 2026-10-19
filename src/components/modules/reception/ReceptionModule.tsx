import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { useAuth } from '../../../context/AuthContext';
import {
  receptionStorage,
  VisitorRecord,
  RoomBookingRecord,
  ParcelRecord,
  CallRecord,
  ContractorPermitRecord,
} from '../../../services/receptionStorage';
import { branchStorage } from '../companies/branchStorage';
import { hrStorage } from '../../../services/hrStorage';
import { CreatableSelect } from '../../common/CreatableSelect';
import { DocumentPreviewModal } from '../../common/DocumentPreviewModal';
import { ReceptionHeroHeader } from './ReceptionHeroHeader';
import { DigitalPassModal, PassData } from './DigitalPassModal';
import { AuditLogDrawer } from './AuditLogDrawer';
import {
  Users,
  Calendar,
  Package,
  PhoneCall,
  HardHat,
  Search,
  Plus,
  QrCode,
  FileText,
  LogOut,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  Upload,
  Coffee,
  X,
  Clock
} from 'lucide-react';

interface ReceptionModuleProps {
  activeSubItemId: string | null;
}

export const ReceptionModule: React.FC<ReceptionModuleProps> = ({ activeSubItemId }) => {
  const { isRtl, t } = useLanguage();
  const { companies, selectedCompanyIds } = useTenant();
  const { user } = useAuth();
  const currentUserName = user?.nameAr || 'مدير النظام';

  // Active Tab State (sync with sidebar subItem, default to visitors)
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (activeSubItemId === 'rec_rooms') return 'rooms';
    if (activeSubItemId === 'rec_parcels') return 'parcels';
    if (activeSubItemId === 'rec_calls') return 'calls';
    if (activeSubItemId === 'rec_passes' || activeSubItemId === 'rec_permits') return 'permits';
    return 'visitors';
  });

  useEffect(() => {
    if (activeSubItemId === 'rec_rooms') setCurrentTab('rooms');
    else if (activeSubItemId === 'rec_parcels') setCurrentTab('parcels');
    else if (activeSubItemId === 'rec_calls') setCurrentTab('calls');
    else if (activeSubItemId === 'rec_passes' || activeSubItemId === 'rec_permits') setCurrentTab('permits');
    else if (activeSubItemId === 'rec_visitors') setCurrentTab('visitors');
  }, [activeSubItemId]);

  // Selected company and branch context for filters & forms
  const defaultCompanyId = selectedCompanyIds[0] || companies[0]?.id || 'tarabot';
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(defaultCompanyId);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

  // Live Records State from receptionStorage
  const [visitors, setVisitors] = useState<VisitorRecord[]>(() => receptionStorage.getVisitors());
  const [rooms, setRooms] = useState<RoomBookingRecord[]>(() => receptionStorage.getBookings());
  const [parcels, setParcels] = useState<ParcelRecord[]>(() => receptionStorage.getParcels());
  const [calls, setCalls] = useState<CallRecord[]>(() => receptionStorage.getCalls());
  const [permits, setPermits] = useState<ContractorPermitRecord[]>(() => receptionStorage.getPermits());
  const [stats, setStats] = useState(() => receptionStorage.getStats());
  const [isSyncing, setIsSyncing] = useState(false);

  // Subscribe to reactive storage updates
  useEffect(() => {
    const handleUpdate = () => {
      setVisitors(receptionStorage.getVisitors());
      setRooms(receptionStorage.getBookings());
      setParcels(receptionStorage.getParcels());
      setCalls(receptionStorage.getCalls());
      setPermits(receptionStorage.getPermits());
      setStats(receptionStorage.getStats());
    };
    window.addEventListener('eco-reception-updated', handleUpdate);
    return () => window.removeEventListener('eco-reception-updated', handleUpdate);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await receptionStorage.syncFromCloud();
    setIsSyncing(false);
  };

  // Live Branches matching selected company
  const companyBranches = useMemo(() => {
    try {
      const all = branchStorage.getBranchesSync();
      if (!selectedCompanyId || selectedCompanyId === 'all') return all;
      return all.filter(b => b.companyId === selectedCompanyId || (b as any).company_id === selectedCompanyId);
    } catch {
      return [];
    }
  }, [selectedCompanyId]);

  // Live Employees matching selected company for Host selection
  const liveEmployees = useMemo(() => {
    try {
      return hrStorage.getEmployees();
    } catch {
      return [];
    }
  }, []);

  // Active Company metadata
  const currentCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];
  const companyDisplayName = currentCompany ? (isRtl ? currentCompany.nameAr : currentCompany.nameEn) : 'شركة ترابط للمقاولات والتجارة';

  // Sub-Module Searches & Filters
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorFilter, setVisitorFilter] = useState<'all' | 'inside' | 'expected' | 'checked_out'>('all');

  const [roomSearch, setRoomSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState<'all' | 'جاري الآن' | 'مؤكد' | 'مكتمل' | 'ملغي'>('all');

  const [parcelSearch, setParcelSearch] = useState('');
  const [parcelFilter, setParcelFilter] = useState<'all' | 'في الاستقبال' | 'تم التسليم للمستلم'>('all');

  const [callSearch, setCallSearch] = useState('');
  const [callFilter, setCallFilter] = useState<'all' | 'بانتظار الرد' | 'تم التحويل' | 'تمت المعالجة'>('all');

  const [permitSearch, setPermitSearch] = useState('');
  const [permitFilter, setPermitFilter] = useState<'all' | 'ساري بالمنشأة' | 'مجدول' | 'منتهي / مغلق'>('all');

  // Modals & Drawers State
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passData, setPassData] = useState<PassData | null>(null);

  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [auditDrawerTitle, setAuditDrawerTitle] = useState('');
  const [auditLogsData, setAuditLogsData] = useState<any[]>([]);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDocData, setPreviewDocData] = useState<{ title: string; fileData?: string; fileName?: string }>({ title: '' });

  // Creation / Editing Modals
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<VisitorRecord | null>(null);
  const [visForm, setVisForm] = useState<Partial<VisitorRecord>>({});

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomBookingRecord | null>(null);
  const [roomForm, setRoomForm] = useState<Partial<RoomBookingRecord>>({});

  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState<ParcelRecord | null>(null);
  const [parcelForm, setParcelForm] = useState<Partial<ParcelRecord>>({});

  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<CallRecord | null>(null);
  const [callForm, setCallForm] = useState<Partial<CallRecord>>({});

  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<ContractorPermitRecord | null>(null);
  const [permitForm, setPermitForm] = useState<Partial<ContractorPermitRecord>>({});

  const [formError, setFormError] = useState<string | null>(null);

  // File to Base64 helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (data: { base64: string; name: string }) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter({ base64: reader.result, name: file.name });
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered Collections
  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => {
      if (selectedCompanyId !== 'all' && v.company_id && v.company_id !== selectedCompanyId) return false;
      if (selectedBranchId !== 'all' && v.branch_id && v.branch_id !== selectedBranchId) return false;
      if (visitorFilter !== 'all' && v.status !== visitorFilter) return false;
      if (visitorSearch.trim()) {
        const q = visitorSearch.toLowerCase();
        const nameMatch = v.visitor_name.toLowerCase().includes(q);
        const codeMatch = v.badge_code.toLowerCase().includes(q);
        const orgMatch = v.visitor_organization?.toLowerCase().includes(q);
        const hostMatch = v.host_employee_name?.toLowerCase().includes(q);
        return nameMatch || codeMatch || orgMatch || hostMatch;
      }
      return true;
    });
  }, [visitors, selectedCompanyId, selectedBranchId, visitorFilter, visitorSearch]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      if (selectedCompanyId !== 'all' && r.company_id && r.company_id !== selectedCompanyId) return false;
      if (selectedBranchId !== 'all' && r.branch_id && r.branch_id !== selectedBranchId) return false;
      if (roomFilter !== 'all' && r.status !== roomFilter) return false;
      if (roomSearch.trim()) {
        const q = roomSearch.toLowerCase();
        return r.meeting_title.toLowerCase().includes(q) || r.room_name.toLowerCase().includes(q) || r.booking_code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [rooms, selectedCompanyId, selectedBranchId, roomFilter, roomSearch]);

  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      if (selectedCompanyId !== 'all' && p.company_id && p.company_id !== selectedCompanyId) return false;
      if (parcelFilter !== 'all' && p.status !== parcelFilter) return false;
      if (parcelSearch.trim()) {
        const q = parcelSearch.toLowerCase();
        return p.tracking_code.toLowerCase().includes(q) || p.courier_company.toLowerCase().includes(q) || p.recipient_name.toLowerCase().includes(q) || (p.awb_number && p.awb_number.toLowerCase().includes(q));
      }
      return true;
    });
  }, [parcels, selectedCompanyId, parcelFilter, parcelSearch]);

  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      if (selectedCompanyId !== 'all' && c.company_id && c.company_id !== selectedCompanyId) return false;
      if (callFilter !== 'all' && c.status !== callFilter) return false;
      if (callSearch.trim()) {
        const q = callSearch.toLowerCase();
        return c.caller_name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || (c.target_employee_name && c.target_employee_name.toLowerCase().includes(q));
      }
      return true;
    });
  }, [calls, selectedCompanyId, callFilter, callSearch]);

  const filteredPermits = useMemo(() => {
    return permits.filter(pm => {
      if (selectedCompanyId !== 'all' && pm.company_id && pm.company_id !== selectedCompanyId) return false;
      if (permitFilter !== 'all' && pm.status !== permitFilter) return false;
      if (permitSearch.trim()) {
        const q = permitSearch.toLowerCase();
        return pm.permit_code.toLowerCase().includes(q) || pm.contractor_company.toLowerCase().includes(q) || pm.supervisor_name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [permits, selectedCompanyId, permitFilter, permitSearch]);

  // Open QR Pass Modal
  const openVisitorPass = (v: VisitorRecord) => {
    const comp = companies.find(c => c.id === v.company_id);
    setPassData({
      type: 'visitor',
      code: v.badge_code,
      name: v.visitor_name,
      organization: v.visitor_organization,
      nationalId: v.national_id_or_passport,
      category: v.visitor_category,
      companyName: comp ? (isRtl ? comp.nameAr : comp.nameEn) : companyDisplayName,
      hostName: v.host_employee_name,
      departmentName: v.department_name,
      purpose: v.visit_purpose,
      checkInTime: v.check_in_time,
      date: v.visit_date,
    });
    setPassModalOpen(true);
  };

  const openContractorPass = (pm: ContractorPermitRecord) => {
    const comp = companies.find(c => c.id === pm.company_id);
    setPassData({
      type: 'contractor',
      code: pm.permit_code,
      name: `${pm.supervisor_name} (${pm.contractor_company})`,
      organization: pm.contractor_company,
      nationalId: pm.supervisor_national_id,
      companyName: comp ? (isRtl ? comp.nameAr : comp.nameEn) : companyDisplayName,
      purpose: pm.work_nature,
      checkInTime: pm.daily_hours,
      date: pm.start_date,
      validUntil: pm.end_date,
      workersCount: pm.workers_count,
    });
    setPassModalOpen(true);
  };

  // Open Audit Log Drawer
  const openAuditDrawer = (title: string, logs: any) => {
    setAuditDrawerTitle(title);
    setAuditLogsData(logs || []);
    setAuditDrawerOpen(true);
  };

  // Open Live Document Preview Modal
  const openDocPreview = (title: string, fileData?: string | null, fileName?: string | null) => {
    if (!fileData) return;
    setPreviewDocData({
      title,
      fileData,
      fileName: fileName || 'وثيقة-رسمية.pdf',
    });
    setPreviewModalOpen(true);
  };

  // ==========================================
  // Form Submission Handlers
  // ==========================================
  const handleSaveVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!visForm.visitor_name?.trim()) {
      setFormError('اسم الزائر مطلوب');
      return;
    }
    await receptionStorage.saveVisitor({
      ...visForm,
      id: editingVisitor ? editingVisitor.id : undefined,
      company_id: visForm.company_id || selectedCompanyId,
      branch_id: visForm.branch_id || (selectedBranchId !== 'all' ? selectedBranchId : null),
    }, currentUserName);
    setIsVisitorModalOpen(false);
    setEditingVisitor(null);
    setVisForm({});
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!roomForm.room_name?.trim() || !roomForm.meeting_title?.trim()) {
      setFormError('اسم القاعة وعنوان الاجتماع مطلوبان');
      return;
    }
    try {
      await receptionStorage.saveBooking({
        ...roomForm,
        id: editingRoom ? editingRoom.id : undefined,
        company_id: roomForm.company_id || selectedCompanyId,
        branch_id: roomForm.branch_id || (selectedBranchId !== 'all' ? selectedBranchId : null),
      }, currentUserName);
      setIsRoomModalOpen(false);
      setEditingRoom(null);
      setRoomForm({});
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ حجز القاعة');
    }
  };

  const handleSaveParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!parcelForm.recipient_name?.trim()) {
      setFormError('اسم المستلم مطلوب');
      return;
    }
    await receptionStorage.saveParcel({
      ...parcelForm,
      id: editingParcel ? editingParcel.id : undefined,
      company_id: parcelForm.company_id || selectedCompanyId,
      branch_id: parcelForm.branch_id || (selectedBranchId !== 'all' ? selectedBranchId : null),
    }, currentUserName);
    setIsParcelModalOpen(false);
    setEditingParcel(null);
    setParcelForm({});
  };

  const handleSaveCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!callForm.caller_name?.trim() || !callForm.subject?.trim()) {
      setFormError('اسم المتصل وموضوع المكالمة مطلوبان');
      return;
    }
    await receptionStorage.saveCall({
      ...callForm,
      id: editingCall ? editingCall.id : undefined,
      company_id: callForm.company_id || selectedCompanyId,
      branch_id: callForm.branch_id || (selectedBranchId !== 'all' ? selectedBranchId : null),
    }, currentUserName);
    setIsCallModalOpen(false);
    setEditingCall(null);
    setCallForm({});
  };

  const handleSavePermit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!permitForm.contractor_company?.trim() || !permitForm.supervisor_name?.trim()) {
      setFormError('اسم شركة المقاولات واسم المشرف مطلوبان');
      return;
    }
    await receptionStorage.savePermit({
      ...permitForm,
      id: editingPermit ? editingPermit.id : undefined,
      company_id: permitForm.company_id || selectedCompanyId,
      branch_id: permitForm.branch_id || (selectedBranchId !== 'all' ? selectedBranchId : null),
    }, currentUserName);
    setIsPermitModalOpen(false);
    setEditingPermit(null);
    setPermitForm({});
  };

  return (
    <div className="w-full max-w-none space-y-6 animate-in fade-in duration-200">
      {/* 1. 3D Cinematic Reception Hero Header */}
      <ReceptionHeroHeader
        stats={stats}
        activeCompanyId={selectedCompanyId}
        activeBranchId={selectedBranchId}
        companyName={companyDisplayName}
        onRefresh={handleManualSync}
        isSyncing={isSyncing}
      />

      {/* 2. Unified Company & Branch Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#121B14] border border-slate-200/80 dark:border-[#243628] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Company Switcher Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] text-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-slate-500 font-medium">{t('المنشأة:', 'Entity:')}</span>
            <select
              value={selectedCompanyId}
              onChange={e => {
                setSelectedCompanyId(e.target.value);
                setSelectedBranchId('all');
              }}
              className="bg-transparent font-bold text-slate-800 dark:text-[#F3EFE6] focus:outline-hidden cursor-pointer"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6]">
                  {isRtl ? c.nameAr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          {companyBranches.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] text-xs">
              <span className="text-slate-500 font-medium">{t('المقر / الفرع:', 'Site/Branch:')}</span>
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-[#F3EFE6] focus:outline-hidden cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#17231A]">{t('كافة الفروع والمقرات', 'All Sites')}</option>
                {companyBranches.map(b => (
                  <option key={b.id} value={b.id} className="bg-white dark:bg-[#17231A] text-slate-900 dark:text-[#F3EFE6]">
                    {b.nameAr}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Sub-Module Tab Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-100 dark:bg-[#0E1610] border border-slate-200/80 dark:border-[#243628]">
          <button
            onClick={() => setCurrentTab('visitors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              currentTab === 'visitors'
                ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t(`الزوار (${visitors.length})`, `Visitors (${visitors.length})`)}</span>
          </button>

          <button
            onClick={() => setCurrentTab('rooms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              currentTab === 'rooms'
                ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t(`القاعات (${rooms.length})`, `Rooms (${rooms.length})`)}</span>
          </button>

          <button
            onClick={() => setCurrentTab('parcels')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              currentTab === 'parcels'
                ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t(`الطرود (${parcels.length})`, `Parcels (${parcels.length})`)}</span>
          </button>

          <button
            onClick={() => setCurrentTab('calls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              currentTab === 'calls'
                ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t(`المكالمات (${calls.length})`, `Calls (${calls.length})`)}</span>
          </button>

          <button
            onClick={() => setCurrentTab('permits')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              currentTab === 'permits'
                ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6]'
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>{t(`التصاريح (${permits.length})`, `Permits (${permits.length})`)}</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SUB-MODULE 1: VISITORS & DIGITAL ACCESS */}
      {/* =================================================================== */}
      {currentTab === 'visitors' && (
        <div className="space-y-4">
          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121B14] p-3 rounded-2xl border border-slate-200/80 dark:border-[#243628] shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={visitorSearch}
                onChange={e => setVisitorSearch(e.target.value)}
                placeholder={t('البحث باسم الزائر، الكود، الجهة، أو الموظف المستضيف...', 'Search visitor name, code, company, or host...')}
                className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-[#F3EFE6] focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#17231A] p-1 rounded-xl text-xs font-bold">
                {(['all', 'inside', 'expected', 'checked_out'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setVisitorFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      visitorFilter === f
                        ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
                    }`}
                  >
                    {f === 'all' && t('الكل', 'All')}
                    {f === 'inside' && t('بالمنشأة', 'Inside')}
                    {f === 'expected' && t('متوقع', 'Expected')}
                    {f === 'checked_out' && t('غادر', 'Left')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingVisitor(null);
                  setVisForm({
                    company_id: selectedCompanyId,
                    visitor_category: 'زائر أعمال',
                    id_type: 'national_id',
                    status: 'inside',
                    visit_date: new Date().toISOString().split('T')[0],
                    check_in_time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                  });
                  setIsVisitorModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('تسجيل دخول زائر', 'New Check-In')}</span>
              </button>
            </div>
          </div>

          {/* Visitors Zero State or Records Grid */}
          {filteredVisitors.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-300 dark:border-[#243628] bg-white/60 dark:bg-[#121B14]/60 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6]">
                  {t('لا يوجد زوار مسجلون حالياً', 'No Visitor Records Found')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto leading-relaxed">
                  {t('لم يتم تسجيل أي زوار تحت الفلاتر الحالية. اضغط على الزر أدناه لتسجيل أول دخول رقمي وإصدار شارة الدخول فوراً.', 'No visitors found for the active filter. Click below to register the first visitor check-in.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingVisitor(null);
                  setVisForm({ company_id: selectedCompanyId, status: 'inside' });
                  setIsVisitorModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-700 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('+ تسجيل دخول زائر الآن', '+ New Visitor Check-In')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisitors.map(v => {
                const isInside = v.status === 'inside';
                const isExpected = v.status === 'expected';

                return (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121B14] border border-slate-200/80 dark:border-[#243628] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: Code + Category Pill + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                            {v.badge_code}
                          </span>
                          {v.visitor_category && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#17231A] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#243628]">
                              {v.visitor_category}
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isInside
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : isExpected
                              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-slate-100 dark:bg-[#17231A] text-slate-500 border border-slate-200 dark:border-[#243628]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isInside ? 'bg-amber-500 animate-ping' : isExpected ? 'bg-blue-500' : 'bg-slate-400'}`} />
                          {isInside ? t('بالمنشأة', 'Inside') : isExpected ? t('متوقع', 'Expected') : t('غادر', 'Departed')}
                        </span>
                      </div>

                      {/* Visitor Name & Info */}
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-[#F3EFE6]">
                          {v.visitor_name}
                        </h4>
                        {v.visitor_organization && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            {v.visitor_organization}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500 dark:text-[#8FA392] mt-0.5">
                          {v.phone || '—'} {v.national_id_or_passport ? `• ID: ${v.national_id_or_passport}` : ''}
                        </p>
                      </div>

                      {/* Host & Department */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">{t('المستضيف:', 'Host:')}</span>
                          <span className="font-bold text-slate-800 dark:text-stone-200">{v.host_employee_name || 'الاستقبال العام'}</span>
                        </div>
                        {v.department_name && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[10px] text-slate-500">{t('الإدارة:', 'Dept:')}</span>
                            <span className="text-slate-600 dark:text-[#8FA392]">{v.department_name}</span>
                          </div>
                        )}
                        {v.visit_purpose && (
                          <div className="text-[11px] text-slate-600 dark:text-[#8FA392] pt-1 border-t border-slate-200/60 dark:border-[#243628] line-clamp-2">
                            {v.visit_purpose}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Strip: Entry Time & Icon-Only Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-[#243628]">
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1" dir="ltr">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{v.check_in_time || '—'}</span>
                      </span>

                      {/* Golden Standard Icon-Only Action Bar */}
                      <div className="flex items-center gap-1">
                        {/* 1. View QR Digital Pass */}
                        <button
                          type="button"
                          onClick={() => openVisitorPass(v)}
                          title={t('عرض تصريح الدخول والـ QR', 'View Digital Pass & QR')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* 2. Document / ID Scan Preview */}
                        {v.attachment_data && (
                          <button
                            type="button"
                            onClick={() => openDocPreview(`وثيقة إثبات هوية - ${v.visitor_name}`, v.attachment_data, v.attachment_name)}
                            title={t('معاينة المستند المرفق (صورة الهوية)', 'Preview Attached ID')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        {/* 3. Fast Check-out */}
                        {isInside && (
                          <button
                            type="button"
                            onClick={() => receptionStorage.checkOutVisitor(v.id, currentUserName)}
                            title={t('تسجيل خروج فوري', 'Quick Check-Out')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}

                        {/* 4. Edit Record */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVisitor(v);
                            setVisForm({ ...v });
                            setIsVisitorModalOpen(true);
                          }}
                          title={t('تعديل السجل', 'Edit Visitor')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* 5. Audit Log Diff */}
                        <button
                          type="button"
                          onClick={() => openAuditDrawer(`الزائر: ${v.visitor_name} (${v.badge_code})`, v.audit_log_json)}
                          title={t('سجل التدقيق والتعديلات (!)', 'Audit Log (!)')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>

                        {/* 6. Delete Record */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(t('هل أنت متأكد من حذف هذا السجل نهائياً؟', 'Are you sure you want to delete this record?'))) {
                              receptionStorage.deleteVisitor(v.id);
                            }
                          }}
                          title={t('حذف السجل', 'Delete')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODULE 2: ROOM BOOKINGS & HOSPITALITY */}
      {/* =================================================================== */}
      {currentTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121B14] p-3 rounded-2xl border border-slate-200/80 dark:border-[#243628] shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={roomSearch}
                onChange={e => setRoomSearch(e.target.value)}
                placeholder={t('البحث باسم القاعة، عنوان الاجتماع، الكود، أو المنظم...', 'Search room name, title, code, or organizer...')}
                className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-[#F3EFE6] focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#17231A] p-1 rounded-xl text-xs font-bold">
                {(['all', 'جاري الآن', 'مؤكد', 'مكتمل', 'ملغي'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setRoomFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      roomFilter === f
                        ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
                    }`}
                  >
                    {f === 'all' && t('الكل', 'All')}
                    {f === 'جاري الآن' && t('جاري الآن', 'Active')}
                    {f === 'مؤكد' && t('مؤكد', 'Confirmed')}
                    {f === 'مكتمل' && t('مكتمل', 'Completed')}
                    {f === 'ملغي' && t('ملغي', 'Cancelled')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingRoom(null);
                  setRoomForm({
                    company_id: selectedCompanyId,
                    booking_date: new Date().toISOString().split('T')[0],
                    start_time: '10:00',
                    end_time: '11:00',
                    attendees_count: 6,
                    status: 'مؤكد',
                  });
                  setIsRoomModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('حجز قاعة اجتماع', 'New Reservation')}</span>
              </button>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-300 dark:border-[#243628] bg-white/60 dark:bg-[#121B14]/60 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xs">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6]">
                  {t('لا توجد حجوزات قاعات مسجلة', 'No Room Bookings Found')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto leading-relaxed">
                  {t('كافة القاعات متاحة وجاهزة للحجز. اضغط الزر أدناه لجدولة اجتماع جديد وتوجيه طلبات الضيافة والتجهيزات.', 'All rooms are currently vacant and available. Click below to book a room.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingRoom(null);
                  setRoomForm({ company_id: selectedCompanyId, status: 'مؤكد' });
                  setIsRoomModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-700 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('+ حجز قاعة اجتماع الآن', '+ Book Meeting Room')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map(r => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#121B14] border border-slate-200/80 dark:border-[#243628] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                        {r.booking_code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {r.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-[#F3EFE6]">
                        {r.room_name}
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                        {r.meeting_title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                        {r.organizer_name ? `${t('المنظم:', 'Organizer:')} ${r.organizer_name}` : ''} {r.department_name ? `(${r.department_name})` : ''}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628]">
                        <span className="text-[10px] text-slate-500 block">{t('التاريخ والتوقيت:', 'Date & Time:')}</span>
                        <span className="font-bold text-slate-800 dark:text-stone-200 font-mono text-[11px] block mt-0.5" dir="ltr">
                          {r.booking_date} • {r.start_time} - {r.end_time}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628]">
                        <span className="text-[10px] text-slate-500 block">{t('الحضور والتجهيزات:', 'Attendees & Gear:')}</span>
                        <span className="font-bold text-slate-800 dark:text-stone-200 text-[11px] block mt-0.5 truncate">
                          {r.attendees_count} {t('أفراد', 'people')} {r.equipment_needed ? `• ${r.equipment_needed}` : ''}
                        </span>
                      </div>
                    </div>

                    {r.hospitality_requests && (
                      <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-[#17231A] border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span className="truncate">{r.hospitality_requests}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-[#243628]">
                    <span className="text-[10px] text-slate-400 font-mono">
                      ECO-ROOM
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoom(r);
                          setRoomForm({ ...r });
                          setIsRoomModalOpen(true);
                        }}
                        title={t('تعديل الحجز', 'Edit Booking')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openAuditDrawer(`حجز قاعة: ${r.room_name} (${r.booking_code})`, r.audit_log_json)}
                        title={t('سجل التدقيق والتعديلات (!)', 'Audit Log (!)')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t('هل أنت متأكد من إلغاء وحذف هذا الحجز؟', 'Cancel and delete booking?'))) {
                            receptionStorage.deleteBooking(r.id);
                          }
                        }}
                        title={t('إلغاء وحذف', 'Delete')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODULE 3: PARCELS & SHIPMENTS */}
      {/* =================================================================== */}
      {currentTab === 'parcels' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121B14] p-3 rounded-2xl border border-slate-200/80 dark:border-[#243628] shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={parcelSearch}
                onChange={e => setParcelSearch(e.target.value)}
                placeholder={t('البحث بكود الشحنة، شركة النقل، اسم المستلم، أو رقم البوليصة...', 'Search tracking code, courier, recipient, AWB...')}
                className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-[#F3EFE6] focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#17231A] p-1 rounded-xl text-xs font-bold">
                {(['all', 'في الاستقبال', 'تم التسليم للمستلم'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setParcelFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      parcelFilter === f
                        ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
                    }`}
                  >
                    {f === 'all' && t('الكل', 'All')}
                    {f === 'في الاستقبال' && t('في الاستقبال', 'At Reception')}
                    {f === 'تم التسليم للمستلم' && t('تم التسليم', 'Delivered')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingParcel(null);
                  setParcelForm({
                    company_id: selectedCompanyId,
                    direction: 'وارد',
                    status: 'في الاستقبال',
                    received_at: new Date().toISOString(),
                    parcel_type: 'مستندات رسمية',
                  });
                  setIsParcelModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('تسجيل طرد أو شحنة', 'New Parcel')}</span>
              </button>
            </div>
          </div>

          {filteredParcels.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-300 dark:border-[#243628] bg-white/60 dark:bg-[#121B14]/60 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xs">
                <Package className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6]">
                  {t('لا توجد طرود أو شحنات مقيدة', 'No Parcels Found')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto leading-relaxed">
                  {t('سجل البريد والطرود نظيف تماماً. يمكنك قيد الشحنات الواردة أو الصادرة وتوثيق البوليصة وإشعار المستلم.', 'No parcel entries in the active scope. Click below to register inbound/outbound shipments.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingParcel(null);
                  setParcelForm({ company_id: selectedCompanyId, status: 'في الاستقبال' });
                  setIsParcelModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-700 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('+ تسجيل طرد أو شحنة الآن', '+ Log Parcel / Shipment')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParcels.map(p => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#121B14] border border-slate-200/80 dark:border-[#243628] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                          {p.tracking_code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#17231A] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#243628]">
                          {p.direction}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {p.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-[#F3EFE6]">
                        {p.courier_company}
                      </h4>
                      {p.awb_number && (
                        <p className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold">
                          AWB: {p.awb_number}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                        {t('المستلم:', 'To:')} {p.recipient_name} {p.department_name ? `(${p.department_name})` : ''}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-500">{t('المرسل:', 'From:')}</span>
                        <span className="text-slate-800 dark:text-stone-200 font-medium">{p.sender_name || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-500">{t('نوع المحتوى:', 'Content Type:')}</span>
                        <span className="text-amber-700 dark:text-amber-400 font-bold">{p.parcel_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-[#243628]">
                    <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                      {p.received_at ? new Date(p.received_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>

                    <div className="flex items-center gap-1">
                      {p.attachment_data && (
                        <button
                          type="button"
                          onClick={() => openDocPreview(`بوليصة شحن - ${p.tracking_code}`, p.attachment_data, p.attachment_name)}
                          title={t('معاينة صورة البوليصة', 'Preview Waybill')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}

                      {p.status === 'في الاستقبال' && (
                        <button
                          type="button"
                          onClick={() => receptionStorage.handoverParcel(p.id, currentUserName)}
                          title={t('تسليم فوري للمستلم', 'Handover to Recipient')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setEditingParcel(p);
                          setParcelForm({ ...p });
                          setIsParcelModalOpen(true);
                        }}
                        title={t('تعديل', 'Edit')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openAuditDrawer(`طرد: ${p.tracking_code}`, p.audit_log_json)}
                        title={t('سجل التدقيق والتعديلات (!)', 'Audit Log (!)')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t('حذف هذا الطرد؟', 'Delete parcel?'))) {
                            receptionStorage.deleteParcel(p.id);
                          }
                        }}
                        title={t('حذف', 'Delete')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODULE 4: CALLS & INQUIRIES */}
      {/* =================================================================== */}
      {currentTab === 'calls' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121B14] p-3 rounded-2xl border border-slate-200/80 dark:border-[#243628] shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={callSearch}
                onChange={e => setCallSearch(e.target.value)}
                placeholder={t('البحث باسم المتصل، الموضوع، أو الموظف المحال إليه...', 'Search caller name, subject, or target staff...')}
                className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-[#F3EFE6] focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#17231A] p-1 rounded-xl text-xs font-bold">
                {(['all', 'بانتظار الرد', 'تم التحويل', 'تمت المعالجة'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setCallFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      callFilter === f
                        ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
                    }`}
                  >
                    {f === 'all' && t('الكل', 'All')}
                    {f === 'بانتظار الرد' && t('بانتظار الرد', 'Pending')}
                    {f === 'تم التحويل' && t('تم التحويل', 'Transferred')}
                    {f === 'تمت المعالجة' && t('تمت المعالجة', 'Processed')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCall(null);
                  setCallForm({
                    company_id: selectedCompanyId,
                    call_type: 'وارد',
                    priority: 'عادي',
                    status: 'بانتظار الرد',
                    call_time: new Date().toISOString(),
                  });
                  setIsCallModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('تسجيل مكالمة واردة', 'Log New Call')}</span>
              </button>
            </div>
          </div>

          {filteredCalls.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-300 dark:border-[#243628] bg-white/60 dark:bg-[#121B14]/60 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xs">
                <PhoneCall className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6]">
                  {t('لا توجد مكالمات مسجلة', 'No Call Logs Found')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto leading-relaxed">
                  {t('سجل الاتصالات والمكالمات نظيف حالياً. انقر على الزر أدناه لتوثيق اتصالات العملاء والجهات الخارجية فور ورودها.', 'Central directory has no active calls logged. Click below to record inquiries.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCall(null);
                  setCallForm({ company_id: selectedCompanyId, status: 'بانتظار الرد' });
                  setIsCallModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-700 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('+ تسجيل مكالمة واردة الآن', '+ Log Inbound Call')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCalls.map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#121B14] border border-slate-200/80 dark:border-[#243628] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        {c.priority}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#17231A] text-slate-700 dark:text-stone-300 border border-slate-200 dark:border-[#243628]">
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-[#F3EFE6]">
                        {c.caller_name}
                      </h4>
                      {c.caller_organization && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                          {c.caller_organization}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                        {c.caller_phone || '—'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628] text-xs space-y-1">
                      <p className="font-bold text-slate-800 dark:text-stone-200">{c.subject}</p>
                      {c.call_summary && (
                        <p className="text-[11px] text-slate-600 dark:text-[#8FA392] line-clamp-2">{c.call_summary}</p>
                      )}
                      {c.target_employee_name && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 pt-1 font-medium">
                          {t('محالة إلى:', 'Directed to:')} {c.target_employee_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-[#243628]">
                    <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                      {c.call_time ? new Date(c.call_time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCall(c);
                          setCallForm({ ...c });
                          setIsCallModalOpen(true);
                        }}
                        title={t('تعديل', 'Edit')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openAuditDrawer(`مكالمة: ${c.caller_name}`, c.audit_log_json)}
                        title={t('سجل التدقيق والتعديلات (!)', 'Audit Log (!)')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t('حذف هذا الاتصال؟', 'Delete call?'))) {
                            receptionStorage.deleteCall(c.id);
                          }
                        }}
                        title={t('حذف', 'Delete')}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-MODULE 5: CONTRACTOR & SITE PASSES */}
      {/* =================================================================== */}
      {currentTab === 'permits' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121B14] p-3 rounded-2xl border border-slate-200/80 dark:border-[#243628] shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={permitSearch}
                onChange={e => setPermitSearch(e.target.value)}
                placeholder={t('البحث بكود التصريح، شركة المقاولات، أو المشرف المسؤول...', 'Search permit code, contractor company, supervisor...')}
                className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-200 dark:border-[#243628] rounded-xl ps-9 pe-3 py-2 text-xs text-slate-900 dark:text-[#F3EFE6] focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#17231A] p-1 rounded-xl text-xs font-bold">
                {(['all', 'ساري بالمنشأة', 'مجدول', 'منتهي / مغلق'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setPermitFilter(f)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      permitFilter === f
                        ? 'bg-gradient-to-l from-amber-600 to-amber-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-[#8FA392] hover:text-slate-900'
                    }`}
                  >
                    {f === 'all' && t('الكل', 'All')}
                    {f === 'ساري بالمنشأة' && t('ساري', 'Active')}
                    {f === 'مجدول' && t('مجدول', 'Scheduled')}
                    {f === 'منتهي / مغلق' && t('منتهي', 'Closed')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPermit(null);
                  setPermitForm({
                    company_id: selectedCompanyId,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: new Date().toISOString().split('T')[0],
                    daily_hours: '08:00 - 17:00',
                    workers_count: 2,
                    safety_approval: 'معتمد',
                    status: 'ساري بالمنشأة',
                  });
                  setIsPermitModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('إصدار تصريح مقاول', 'New Contractor Permit')}</span>
              </button>
            </div>
          </div>

          {filteredPermits.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-300 dark:border-[#243628] bg-white/60 dark:bg-[#121B14]/60 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xs">
                <HardHat className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6]">
                  {t('لا توجد تصاريح مقاولين مسجلة', 'No Contractor Permits Found')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8FA392] max-w-md mx-auto leading-relaxed">
                  {t('لم يتم إصدار أي تصاريح عمل فنية للمقاولين أو الفنيين. اضغط الزر أدناه لإصدار تصريح جديد وتوثيق شارة الدخول وعدد العمالة.', 'No technical contractor passes issued. Click below to issue a permit.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPermit(null);
                  setPermitForm({ company_id: selectedCompanyId, status: 'ساري بالمنشأة' });
                  setIsPermitModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-700 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('+ إصدار تصريح مقاول الآن', '+ Issue Contractor Pass')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPermits.map(pm => {
                const isActive = pm.status === 'ساري بالمنشأة';

                return (
                  <div
                    key={pm.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#121B14] border border-slate-200/80 dark:border-[#243628] shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                          {pm.permit_code}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          {pm.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-[#F3EFE6]">
                          {pm.contractor_company}
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                          {t('المشرف:', 'Supervisor:')} {pm.supervisor_name} ({pm.supervisor_phone || '—'})
                        </p>
                        {pm.supervisor_national_id && (
                          <p className="text-[10px] font-mono text-slate-500 dark:text-[#8FA392]">
                            ID: {pm.supervisor_national_id}
                          </p>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#17231A] border border-slate-200/80 dark:border-[#243628] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">{t('طبيعة الأعمال:', 'Scope:')}</span>
                          <span className="font-bold text-slate-800 dark:text-stone-200">{pm.work_nature || 'أعمال صيانة وتشطيبات'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-slate-500">{t('قوة العمالة:', 'Crew Size:')}</span>
                          <span className="text-amber-700 dark:text-amber-400 font-bold">{pm.workers_count} {t('فنيين وعمال', 'workers')}</span>
                        </div>
                        {pm.tools_and_equipment && (
                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-[#243628] truncate">
                            {t('المعدات:', 'Tools:')} {pm.tools_and_equipment}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-[#243628]">
                      <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                        {pm.start_date} إلى {pm.end_date}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* 1. View Digital Contractor QR Pass */}
                        <button
                          type="button"
                          onClick={() => openContractorPass(pm)}
                          title={t('عرض تصريح الدخول والـ QR', 'View Digital Pass & QR')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* 2. Document preview */}
                        {pm.attachment_data && (
                          <button
                            type="button"
                            onClick={() => openDocPreview(`تصريح مقاول - ${pm.contractor_company}`, pm.attachment_data, pm.attachment_name)}
                            title={t('معاينة المستند المرفق', 'Preview Attachment')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        {/* 3. Fast close/revoke */}
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => receptionStorage.closePermit(pm.id, currentUserName)}
                            title={t('إنهاء وإغلاق التصريح', 'Close Permit')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* 4. Edit */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPermit(pm);
                            setPermitForm({ ...pm });
                            setIsPermitModalOpen(true);
                          }}
                          title={t('تعديل', 'Edit')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* 5. Audit Log Diff */}
                        <button
                          type="button"
                          onClick={() => openAuditDrawer(`تصريح مقاول: ${pm.contractor_company} (${pm.permit_code})`, pm.audit_log_json)}
                          title={t('سجل التدقيق والتعديلات (!)', 'Audit Log (!)')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>

                        {/* 6. Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(t('حذف هذا التصريح؟', 'Delete permit?'))) {
                              receptionStorage.deletePermit(pm.id);
                            }
                          }}
                          title={t('حذف', 'Delete')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#17231A] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. MODALS & DRAWERS */}
      {/* =================================================================== */}

      {/* Modal 1: Visitor Form Modal */}
      {isVisitorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1610] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#243628] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span>{editingVisitor ? t('تعديل بيانات الزائر', 'Edit Visitor') : t('تسجيل دخول زائر جديد', 'New Visitor Check-In')}</span>
              </h3>
              <button onClick={() => setIsVisitorModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveVisitor} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('اسم الزائر الرباعي *', 'Visitor Full Name *')}</label>
                  <input
                    type="text"
                    required
                    value={visForm.visitor_name || ''}
                    onChange={e => setVisForm({ ...visForm, visitor_name: e.target.value })}
                    placeholder={t('أدخل الاسم الرباعي للزائر كما في تحقيق الشخصية', 'Enter full name as on national ID')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الجهة / المنظمة التابع لها', 'Organization / Company')}</label>
                  <input
                    type="text"
                    value={visForm.visitor_organization || ''}
                    onChange={e => setVisForm({ ...visForm, visitor_organization: e.target.value })}
                    placeholder={t('أدخل اسم الجهة أو الشركة التابع لها الزائر', 'Enter organization or independent')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('رقم الهاتف / الجوال', 'Mobile Phone')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={visForm.phone || ''}
                    onChange={e => setVisForm({ ...visForm, phone: e.target.value })}
                    placeholder="05xxxxxxxx / 01xxxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('رقم الهوية / جواز السفر', 'National ID or Passport')}</label>
                  <input
                    type="text"
                    value={visForm.national_id_or_passport || ''}
                    onChange={e => setVisForm({ ...visForm, national_id_or_passport: e.target.value })}
                    placeholder={t('أدخل رقم بطاقة الهوية أو جواز السفر', 'Enter ID or passport number')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('تصنيف الزيارة', 'Category')}</label>
                  <select
                    value={visForm.visitor_category || 'زائر أعمال'}
                    onChange={e => setVisForm({ ...visForm, visitor_category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 cursor-pointer"
                  >
                    <option value="زائر أعمال">{t('زائر أعمال', 'Business Visitor')}</option>
                    <option value="عميل / مستثمر">{t('عميل / مستثمر', 'Client / Investor')}</option>
                    <option value="VIP / كبار الشخصيات">{t('VIP / كبار الشخصيات', 'VIP Guest')}</option>
                    <option value="مندوب جهة حكومية">{t('مندوب جهة حكومية', 'Government Delegate')}</option>
                    <option value="مقابلة توظيف">{t('مقابلة توظيف', 'Job Interview')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الموظف المستضيف', 'Host Staff')}</label>
                  <select
                    value={visForm.host_employee_name || ''}
                    onChange={e => {
                      const emp = liveEmployees.find(emp => emp.nameAr === e.target.value);
                      setVisForm({
                        ...visForm,
                        host_employee_name: e.target.value,
                        host_employee_id: emp?.id || null,
                        department_name: emp?.departmentAr || visForm.department_name,
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">{t('اختر الموظف المستضيف...', 'Select host staff...')}</option>
                    {liveEmployees.map(emp => (
                      <option key={emp.id} value={emp.nameAr}>
                        {emp.nameAr} ({emp.jobTitleAr || 'موظف'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الإدارة / القسم', 'Department')}</label>
                  <CreatableSelect
                    category="departments"
                    value={visForm.department_name || ''}
                    onChange={val => setVisForm({ ...visForm, department_name: val })}
                    placeholder={t('اختر أو أضف الإدارة المستهدفة...', 'Select or add department...')}
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الغرض من الزيارة', 'Visit Purpose')}</label>
                  <input
                    type="text"
                    value={visForm.visit_purpose || ''}
                    onChange={e => setVisForm({ ...visForm, visit_purpose: e.target.value })}
                    placeholder={t('أدخل تفاصيل وموضوع الزيارة بالتفصيل', 'Enter detailed meeting or inspection purpose')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('رقم لوحة المركبة (إن وجدت)', 'Vehicle Plate')}</label>
                  <input
                    type="text"
                    value={visForm.vehicle_plate || ''}
                    onChange={e => setVisForm({ ...visForm, vehicle_plate: e.target.value })}
                    placeholder={t('مثال: أ ب ج 1234', 'e.g. ABC 1234')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الأمانات والمتعلقات المودعة', 'Belongings / Parcels')}</label>
                  <input
                    type="text"
                    value={visForm.belongings_notes || ''}
                    onChange={e => setVisForm({ ...visForm, belongings_notes: e.target.value })}
                    placeholder={t('أجهزة، حقائب، أو أدوات مسجلة بالاستقبال', 'Laptops, bags, or items left at desk')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                {/* Attachment Upload */}
                <div className="col-span-2 space-y-1 pt-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('إرفاق صورة بطاقة الهوية / المستند (Live Blob Preview)', 'Attach ID Card / Document Scan')}</label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-50/20 dark:bg-[#17231A] text-amber-800 dark:text-amber-300 font-bold cursor-pointer hover:bg-amber-50/40 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{visForm.attachment_name || t('اختر ملف صورة أو PDF لإرفاقه', 'Upload Image or PDF')}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={e => handleFileUpload(e, ({ base64, name }) => {
                          setVisForm({ ...visForm, attachment_data: base64, attachment_name: name });
                        })}
                      />
                    </label>
                    {visForm.attachment_data && (
                      <button
                        type="button"
                        onClick={() => openDocPreview(visForm.visitor_name || 'وثيقة', visForm.attachment_data, visForm.attachment_name)}
                        className="px-3 py-3 rounded-xl bg-slate-100 dark:bg-[#17231A] text-amber-600 font-bold border border-slate-200 dark:border-[#243628] cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#243628]">
                <button
                  type="button"
                  onClick={() => setIsVisitorModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold shadow-md shadow-amber-500/20 hover:from-amber-700 cursor-pointer"
                >
                  {editingVisitor ? t('حفظ التعديلات', 'Update') : t('تسجيل الدخول وإصدار الشارة', 'Check-In & Issue Badge')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Room Booking Form Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1610] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#243628] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                <span>{editingRoom ? t('تعديل حجز القاعة', 'Edit Booking') : t('حجز قاعة اجتماعات وضيافة جديدة', 'New Room Reservation')}</span>
              </h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('اسم قاعة الاجتماعات *', 'Meeting Room *')}</label>
                  <CreatableSelect
                    category="meeting_rooms"
                    value={roomForm.room_name || ''}
                    onChange={val => setRoomForm({ ...roomForm, room_name: val })}
                    placeholder={t('اختر أو أضف قاعة اجتماعات...', 'Select or add meeting room...')}
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('عنوان الاجتماع وموضوعه *', 'Meeting Title *')}</label>
                  <input
                    type="text"
                    required
                    value={roomForm.meeting_title || ''}
                    onChange={e => setRoomForm({ ...roomForm, meeting_title: e.target.value })}
                    placeholder={t('أدخل عنوان الاجتماع أو الغرض المؤسسي', 'Enter meeting title')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('تاريخ الحجز', 'Date')}</label>
                  <input
                    type="date"
                    required
                    value={roomForm.booking_date || new Date().toISOString().split('T')[0]}
                    onChange={e => setRoomForm({ ...roomForm, booking_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('عدد الحضور المتوقع', 'Attendees Count')}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={roomForm.attendees_count || 4}
                    onChange={e => setRoomForm({ ...roomForm, attendees_count: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('وقت البدء (Start)', 'Start Time')}</label>
                  <input
                    type="time"
                    required
                    value={roomForm.start_time || '10:00'}
                    onChange={e => setRoomForm({ ...roomForm, start_time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('وقت الانتهاء (End)', 'End Time')}</label>
                  <input
                    type="time"
                    required
                    value={roomForm.end_time || '11:00'}
                    onChange={e => setRoomForm({ ...roomForm, end_time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('المنظم المسؤول', 'Organizer')}</label>
                  <input
                    type="text"
                    value={roomForm.organizer_name || ''}
                    onChange={e => setRoomForm({ ...roomForm, organizer_name: e.target.value })}
                    placeholder={t('اسم منظم الاجتماع', 'Organizer name')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('التجهيزات المطلوبة', 'Equipment')}</label>
                  <input
                    type="text"
                    value={roomForm.equipment_needed || ''}
                    onChange={e => setRoomForm({ ...roomForm, equipment_needed: e.target.value })}
                    placeholder={t('شاشة عرض، فيديو كونفرنس، سبورة ذكية', 'Display screen, VC, smart board')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('طلبات الضيافة والبوفيه (VIP Catering)', 'Hospitality Requests')}</label>
                  <input
                    type="text"
                    value={roomForm.hospitality_requests || ''}
                    onChange={e => setRoomForm({ ...roomForm, hospitality_requests: e.target.value })}
                    placeholder={t('مشروبات ساخنة، عصائر، مياه معدنية، ضيافة VIP', 'Coffee, tea, water, VIP refreshments')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#243628]">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold shadow-md shadow-amber-500/20 hover:from-amber-700 cursor-pointer"
                >
                  {editingRoom ? t('حفظ التعديلات', 'Update') : t('تأكيد الحجز فوراً', 'Confirm Booking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Parcel Form Modal */}
      {isParcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1610] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#243628] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span>{editingParcel ? t('تعديل قيد الشحنة', 'Edit Parcel') : t('تسجيل طرد أو شحنة جديدة', 'New Parcel Log')}</span>
              </h3>
              <button onClick={() => setIsParcelModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveParcel} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('اتجاه الشحنة', 'Direction')}</label>
                  <select
                    value={parcelForm.direction || 'وارد'}
                    onChange={e => setParcelForm({ ...parcelForm, direction: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 cursor-pointer"
                  >
                    <option value="وارد">{t('شحنة واردة (Inbound)', 'Inbound')}</option>
                    <option value="صادر">{t('شحنة صادرة (Outbound)', 'Outbound')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('شركة الشحن / الناقل *', 'Courier *')}</label>
                  <CreatableSelect
                    category="couriers"
                    value={parcelForm.courier_company || ''}
                    onChange={val => setParcelForm({ ...parcelForm, courier_company: val })}
                    placeholder={t('اختر أو أضف شركة الشحن...', 'Select or add courier...')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('رقم بوليصة الشحن (AWB)', 'Tracking / AWB #')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={parcelForm.awb_number || ''}
                    onChange={e => setParcelForm({ ...parcelForm, awb_number: e.target.value })}
                    placeholder="AWB-123456789"
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('نوع الطرد أو المحتوى', 'Type')}</label>
                  <select
                    value={parcelForm.parcel_type || 'مستندات رسمية'}
                    onChange={e => setParcelForm({ ...parcelForm, parcel_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 cursor-pointer"
                  >
                    <option value="مستندات رسمية">{t('مستندات رسمية', 'Official Documents')}</option>
                    <option value="طرد بضائع / عينات">{t('طرد بضائع / عينات', 'Goods & Samples')}</option>
                    <option value="أجهزة ومعدات">{t('أجهزة ومعدات', 'Devices & Hardware')}</option>
                    <option value="شيكات / أوراق مالية">{t('شيكات / أوراق مالية', 'Cheques & Financial')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('اسم الراسل', 'Sender')}</label>
                  <input
                    type="text"
                    value={parcelForm.sender_name || ''}
                    onChange={e => setParcelForm({ ...parcelForm, sender_name: e.target.value })}
                    placeholder={t('أدخل اسم الراسل أو الجهة المصدرة', 'Sender name or organization')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('اسم المستلم *', 'Recipient *')}</label>
                  <input
                    type="text"
                    required
                    value={parcelForm.recipient_name || ''}
                    onChange={e => setParcelForm({ ...parcelForm, recipient_name: e.target.value })}
                    placeholder={t('اسم الموظف أو القسم المستلم', 'Recipient employee or dept')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('صورة بوليصة الشحن أو إيصال الاستلام (Blob Preview)', 'Attach AWB Photo / Receipt')}</label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-50/20 dark:bg-[#17231A] text-amber-800 dark:text-amber-300 font-bold cursor-pointer hover:bg-amber-50/40 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{parcelForm.attachment_name || t('اختر صورة البوليصة أو إيصال التسليم', 'Upload Waybill Scan')}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={e => handleFileUpload(e, ({ base64, name }) => {
                        setParcelForm({ ...parcelForm, attachment_data: base64, attachment_name: name });
                      })}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#243628]">
                <button
                  type="button"
                  onClick={() => setIsParcelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold shadow-md shadow-amber-500/20 hover:from-amber-700 cursor-pointer"
                >
                  {editingParcel ? t('حفظ التعديلات', 'Update') : t('قيد الشحنة بالاستقبال', 'Log Parcel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Call Form Modal */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1610] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#243628] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-amber-600" />
                <span>{editingCall ? t('تعديل قيد المكالمة', 'Edit Call') : t('تسجيل مكالمة جديدة', 'New Call Log')}</span>
              </h3>
              <button onClick={() => setIsCallModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCall} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('اسم المتصل *', 'Caller Name *')}</label>
                  <input
                    type="text"
                    required
                    value={callForm.caller_name || ''}
                    onChange={e => setCallForm({ ...callForm, caller_name: e.target.value })}
                    placeholder={t('أدخل اسم المتصل', 'Caller name')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('رقم الهاتف', 'Phone Number')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={callForm.caller_phone || ''}
                    onChange={e => setCallForm({ ...callForm, caller_phone: e.target.value })}
                    placeholder="05xxxxxxxx / 01xxxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الجهة / المنظمة', 'Organization')}</label>
                  <input
                    type="text"
                    value={callForm.caller_organization || ''}
                    onChange={e => setCallForm({ ...callForm, caller_organization: e.target.value })}
                    placeholder={t('اسم الشركة أو جهة الاتصال', 'Organization name')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الأهمية / الأولوية', 'Priority')}</label>
                  <select
                    value={callForm.priority || 'عادي'}
                    onChange={e => setCallForm({ ...callForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 cursor-pointer"
                  >
                    <option value="عادي">{t('عادي', 'Normal')}</option>
                    <option value="مهم">{t('مهم', 'Important')}</option>
                    <option value="عاجل جداً">{t('عاجل جداً', 'Urgent')}</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('موضوع المكالمة *', 'Subject *')}</label>
                  <input
                    type="text"
                    required
                    value={callForm.subject || ''}
                    onChange={e => setCallForm({ ...callForm, subject: e.target.value })}
                    placeholder={t('أدخل موضوع المكالمة بإيجاز', 'Brief call subject')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الموظف المحال إليه', 'Target Employee')}</label>
                  <input
                    type="text"
                    value={callForm.target_employee_name || ''}
                    onChange={e => setCallForm({ ...callForm, target_employee_name: e.target.value })}
                    placeholder={t('اسم الموظف أو المحول إليه', 'Target staff')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الحالة والإجراء', 'Status')}</label>
                  <select
                    value={callForm.status || 'بانتظار الرد'}
                    onChange={e => setCallForm({ ...callForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 cursor-pointer"
                  >
                    <option value="بانتظار الرد">{t('بانتظار الرد', 'Pending Response')}</option>
                    <option value="تم التحويل">{t('تم التحويل', 'Transferred')}</option>
                    <option value="تمت المعالجة">{t('تمت المعالجة', 'Processed')}</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('ملخص المكالمة والرسالة', 'Summary & Message')}</label>
                  <textarea
                    rows={3}
                    value={callForm.call_summary || ''}
                    onChange={e => setCallForm({ ...callForm, call_summary: e.target.value })}
                    placeholder={t('تفاصيل الرسالة أو ملخص الحوار', 'Call summary and message notes')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#243628]">
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold shadow-md shadow-amber-500/20 hover:from-amber-700 cursor-pointer"
                >
                  {editingCall ? t('حفظ التعديلات', 'Update') : t('قيد المكالمة بالسجل', 'Log Call')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Contractor Permit Form Modal */}
      {isPermitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1610] border border-amber-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#243628] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-[#F3EFE6] flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                <span>{editingPermit ? t('تعديل تصريح المقاول', 'Edit Permit') : t('إصدار تصريح عمل لمقاول / فني', 'New Contractor Pass')}</span>
              </h3>
              <button onClick={() => setIsPermitModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSavePermit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('شركة المقاولات / المنفذة *', 'Contractor Company *')}</label>
                  <input
                    type="text"
                    required
                    value={permitForm.contractor_company || ''}
                    onChange={e => setPermitForm({ ...permitForm, contractor_company: e.target.value })}
                    placeholder={t('أدخل اسم شركة المقاولات', 'Contractor company name')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('اسم المشرف الفني *', 'Supervisor Name *')}</label>
                  <input
                    type="text"
                    required
                    value={permitForm.supervisor_name || ''}
                    onChange={e => setPermitForm({ ...permitForm, supervisor_name: e.target.value })}
                    placeholder={t('اسم المشرف المسؤول بالموقع', 'Supervisor full name')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('هاتف المشرف', 'Supervisor Phone')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={permitForm.supervisor_phone || ''}
                    onChange={e => setPermitForm({ ...permitForm, supervisor_phone: e.target.value })}
                    placeholder="05xxxxxxxx / 01xxxxxxxxx"
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('رقم بطاقة المشرف', 'Supervisor National ID')}</label>
                  <input
                    type="text"
                    value={permitForm.supervisor_national_id || ''}
                    onChange={e => setPermitForm({ ...permitForm, supervisor_national_id: e.target.value })}
                    placeholder={t('أدخل رقم بطاقة الهوية للمشرف', 'Enter national ID number')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('طبيعة الأعمال والتصريح *', 'Work Nature *')}</label>
                  <CreatableSelect
                    category="work_permits"
                    value={permitForm.work_nature || ''}
                    onChange={val => setPermitForm({ ...permitForm, work_nature: val })}
                    placeholder={t('اختر أو أضف طبيعة الأعمال (صيانة، تركيبات، تكييف، كهرباء)...', 'Select or add work nature...')}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('عدد الفنيين والعمال', 'Workers Count')}</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={permitForm.workers_count || 1}
                    onChange={e => setPermitForm({ ...permitForm, workers_count: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('ساعات العمل اليومية المصرحة', 'Daily Hours')}</label>
                  <input
                    type="text"
                    value={permitForm.daily_hours || '08:00 - 17:00'}
                    onChange={e => setPermitForm({ ...permitForm, daily_hours: e.target.value })}
                    placeholder="08:00 - 17:00"
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('تاريخ بدء التصريح', 'Start Date')}</label>
                  <input
                    type="date"
                    required
                    value={permitForm.start_date || new Date().toISOString().split('T')[0]}
                    onChange={e => setPermitForm({ ...permitForm, start_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('تاريخ انتهاء التصريح', 'End Date')}</label>
                  <input
                    type="date"
                    required
                    value={permitForm.end_date || new Date().toISOString().split('T')[0]}
                    onChange={e => setPermitForm({ ...permitForm, end_date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('الأدوات والمعدات المصرح بدخولها', 'Authorized Tools')}</label>
                  <input
                    type="text"
                    value={permitForm.tools_and_equipment || ''}
                    onChange={e => setPermitForm({ ...permitForm, tools_and_equipment: e.target.value })}
                    placeholder={t('أدوات يدوية، سلالم، أجهزة لحام، معدات فحص', 'Hand tools, ladders, diagnostic gear')}
                    className="w-full bg-slate-50 dark:bg-[#17231A] border border-slate-300 dark:border-[#243628] rounded-xl px-3 py-2 text-slate-900 dark:text-[#F3EFE6] focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-stone-300">{t('إرفاق تصريح الأمن / كشف العمال (Blob Preview)', 'Attach Safety Approval / Crew List')}</label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-50/20 dark:bg-[#17231A] text-amber-800 dark:text-amber-300 font-bold cursor-pointer hover:bg-amber-50/40 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{permitForm.attachment_name || t('اختر ملف تصريح الأمن أو كشف الأسماء', 'Upload Permit Document')}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={e => handleFileUpload(e, ({ base64, name }) => {
                        setPermitForm({ ...permitForm, attachment_data: base64, attachment_name: name });
                      })}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-[#243628]">
                <button
                  type="button"
                  onClick={() => setIsPermitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-[#243628] text-slate-700 dark:text-stone-300 font-bold cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 text-white font-bold shadow-md shadow-amber-500/20 hover:from-amber-700 cursor-pointer"
                >
                  {editingPermit ? t('حفظ التعديلات', 'Update') : t('إصدار التصريح فوراً', 'Issue Permit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Interactive 3D Digital Pass Modal with Real QR Code */}
      <DigitalPassModal
        isOpen={passModalOpen}
        onClose={() => {
          setPassModalOpen(false);
          setPassData(null);
        }}
        data={passData}
      />

      {/* Drawer: Detailed Change Audit Log */}
      <AuditLogDrawer
        isOpen={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
        title={auditDrawerTitle}
        auditLogs={auditLogsData}
      />

      {/* Modal: Universal Live Blob URL Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewDocData.title}
        fileName={previewDocData.fileName}
        fileData={previewDocData.fileData}
      />
    </div>
  );
};
