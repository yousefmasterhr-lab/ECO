import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../../context/LanguageContext';
import { useNavigation } from '../../../context/NavigationContext';
import { useReception } from '../../../context/ReceptionContext';
import {
  ConciergeBell,
  Calendar,
  Package,
  PhoneCall,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  QrCode,
  Coffee,
  X,
  Send,
  Building2,
  ExternalLink,
} from 'lucide-react';

interface ReceptionModuleProps {
  activeSubItemId: string | null;
}

export const ReceptionModule: React.FC<ReceptionModuleProps> = ({ activeSubItemId }) => {
  const { isRtl, t } = useLanguage();
  const { selectItem } = useNavigation();
  const {
    visitors,
    checkInVisitor,
    checkOutVisitor,
    selectedVisitorForBadge,
    setSelectedVisitorForBadge,
    meetingRooms,
    reservations,
    bookMeetingRoom,
    updateHospitalityStatus,
    parcels,
    addParcel,
    confirmParcelPickup,
    callLogs,
    addCallLog,
    corporateDirectory,
    contractorPasses,
    issueContractorPass,
    revokeContractorPass,
    activeVisitorsCount,
    todayScheduledCount,
    toastMessage,
    showToast,
  } = useReception();

  // Visitor state
  const [visitorFilter, setVisitorFilter] = useState<'all' | 'checked_in' | 'expected' | 'checked_out'>('all');
  const [visitorSearch, setVisitorSearch] = useState('');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);

  // New Visitor Form State
  const [visNameAr, setVisNameAr] = useState('');
  const [visCompany, setVisCompany] = useState('');
  const [visNationalId, setVisNationalId] = useState('');
  const [visMobile, setVisMobile] = useState('');
  const [visHostEmployee, setVisHostEmployee] = useState('م. أحمد مصطفى');
  const visHostDept = 'المكتب الفني';
  const [visPurpose, setVisPurpose] = useState('');
  const [visIsVip, setVisIsVip] = useState(false);

  // Meeting Room Booking Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(meetingRooms[0]?.id || '');
  const [roomMeetingTitle, setRoomMeetingTitle] = useState('');
  const roomHost = 'م. أحمد مصطفى';
  const roomDept = 'الإدارة العليا';
  const [roomTimeSlot, setRoomTimeSlot] = useState('02:00 م - 03:30 م');
  const [roomAttendees, setRoomAttendees] = useState(6);
  const [roomCatering, setRoomCatering] = useState(true);
  const [roomCateringDetails, setRoomCateringDetails] = useState('قهوة سعودية مختصة وشاي وتمور فاخرة');

  // Parcel Ingestion Modal State
  const [isParcelModalOpen, setIsParcelModalOpen] = useState(false);
  const [parcelTracking, setParcelTracking] = useState('');
  const [parcelCourier, setParcelCourier] = useState('البريد السعودي (SPL)');
  const [parcelType, setParcelType] = useState('مستندات تعاقدية أصلية');
  const [parcelSender, setParcelSender] = useState('');
  const [parcelRecipient, setParcelRecipient] = useState('أ. رأفت عبد العال');
  const parcelDept = 'الشؤون القانونية';
  const [parcelIsCTS, setParcelIsCTS] = useState(false);

  // Call Log Modal State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callCaller, setCallCaller] = useState('');
  const [callOrg, setCallOrg] = useState('');
  const [callPhone, setCallPhone] = useState('');
  const [callDirectedTo, setCallDirectedTo] = useState('أ. كمال إبراهيم');
  const [callPurpose, setCallPurpose] = useState('');
  const [callAction, setCallAction] = useState('تم التحويل');
  const [callStatus, setCallStatus] = useState<'transferred' | 'message_taken' | 'callback_requested'>('transferred');
  const [directorySearch, setDirectorySearch] = useState('');

  // Contractor Pass Modal State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passCompany, setPassCompany] = useState('');
  const [passTechName, setPassTechName] = useState('');
  const [passNatId, setPassNatId] = useState('');
  const [passWorkScope, setPassWorkScope] = useState('');
  const passSupervisor = 'أ. نبيل الفيشاوي (إدارة المرافق)';
  const [passValidUntil, setPassValidUntil] = useState('04:00 م (نهاية اليوم)');
  const [passSafetyBriefed, setPassSafetyBriefed] = useState(true);
  const [passTools, setPassTools] = useState('حقيبة عدد يدوية، جهاز فحص رقمي');

  // Fast check-in submit
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visNameAr || !visMobile) return;

    const newVisitor = checkInVisitor({
      nameAr: visNameAr,
      nameEn: visNameAr,
      company: visCompany || 'زائر مستقل',
      nationalId: visNationalId || '10xxxxxxxx',
      mobile: visMobile,
      hostEmployeeAr: visHostEmployee,
      hostEmployeeEn: visHostEmployee,
      hostDepartmentAr: visHostDept,
      purposeAr: visPurpose || 'زيارة عمل واجتماع تنسيقي',
      purposeEn: 'Business meeting',
      badgeNumber: 'TEMP',
      vip: visIsVip,
    });

    // Reset & close
    setVisNameAr('');
    setVisCompany('');
    setVisNationalId('');
    setVisMobile('');
    setVisPurpose('');
    setVisIsVip(false);
    setIsCheckInModalOpen(false);

    // Auto prompt visitor pass
    setSelectedVisitorForBadge(newVisitor);
  };

  // Book room submit
  const handleBookRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const room = meetingRooms.find(r => r.id === selectedRoomId);
    if (!room) return;

    bookMeetingRoom({
      roomId: room.id,
      roomNameAr: room.nameAr,
      titleAr: roomMeetingTitle || 'جلسة عمل تنسيقية',
      hostEmployeeAr: roomHost,
      departmentAr: roomDept,
      timeSlot: roomTimeSlot,
      attendeesCount: roomAttendees,
      amenities: room.amenities,
      cateringRequired: roomCatering,
      cateringDetailsAr: roomCateringDetails,
    });

    setRoomMeetingTitle('');
    setIsRoomModalOpen(false);
  };

  // Add parcel submit
  const handleAddParcelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trackNo = parcelTracking || `TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    addParcel({
      trackingNumber: trackNo,
      courierName: parcelCourier,
      packageTypeAr: parcelType,
      senderName: parcelSender || 'جهة خارجية',
      recipientEmployeeAr: parcelRecipient,
      recipientDepartmentAr: parcelDept,
      isOfficialTransmittal: parcelIsCTS,
    });

    setParcelTracking('');
    setParcelSender('');
    setIsParcelModalOpen(false);
  };

  // Add call submit
  const handleAddCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callCaller) return;

    addCallLog({
      callerName: callCaller,
      callerOrganization: callOrg || 'جهة خارجية',
      callerPhone: callPhone || '+966 11 xxx xxxx',
      directedToEmployeeAr: callDirectedTo,
      purposeAr: callPurpose || 'استفسار عام',
      actionTakenAr: callAction,
      status: callStatus,
    });

    setCallCaller('');
    setCallOrg('');
    setCallPhone('');
    setCallPurpose('');
    setIsCallModalOpen(false);
  };

  // Issue pass submit
  const handleIssuePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passTechName || !passCompany) return;

    issueContractorPass({
      contractorCompanyAr: passCompany,
      technicianNameAr: passTechName,
      nationalId: passNatId || '2xxxxxxxxx',
      workScopeAr: passWorkScope || 'أعمال فحص وصيانة دورية',
      supervisedByAr: passSupervisor,
      validUntil: passValidUntil,
      safetyBriefingCompleted: passSafetyBriefed,
      registeredToolsAr: passTools,
    });

    setPassCompany('');
    setPassTechName('');
    setPassNatId('');
    setPassWorkScope('');
    setIsPassModalOpen(false);
  };

  // Filter visitors
  const filteredVisitors = visitors.filter(v => {
    const matchesFilter = visitorFilter === 'all' || v.status === visitorFilter;
    const matchesSearch =
      v.nameAr.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.company.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.hostEmployeeAr.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.badgeNumber.toLowerCase().includes(visitorSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filter contacts
  const filteredContacts = corporateDirectory.filter(c =>
    c.nameAr.toLowerCase().includes(directorySearch.toLowerCase()) ||
    c.departmentAr.toLowerCase().includes(directorySearch.toLowerCase()) ||
    c.extension.includes(directorySearch)
  );

  // --- Sub-View 1: الزوار والدخول الرقمي ---
  const renderVisitorsView = () => (
    <div className="space-y-4">
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            {t('الزوار حالياً بالمنشأة', 'Currently On-Premises')}
          </span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
            {activeVisitorsCount} <span className="text-xs font-normal">{isRtl ? 'زائر' : 'visitors'}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            {t('المواعيد المجدولة اليوم', 'Expected Today')}
          </span>
          <span className="text-xl font-black text-[#D99B26] dark:text-[#EBB34D] mt-1 block font-mono">
            {todayScheduledCount} <span className="text-xs font-normal">{isRtl ? 'موعد' : 'scheduled'}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            {t('الزوار المغادرون اليوم', 'Departed Today')}
          </span>
          <span className="text-xl font-black text-[#5C665E] dark:text-[#8FA392] mt-1 block font-mono">
            {visitors.filter(v => v.status === 'checked_out').length} <span className="text-xs font-normal">{isRtl ? 'زائر' : 'checked-out'}</span>
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628]">
          <span className="text-[11px] font-bold text-[#5C665E] dark:text-[#8FA392] block">
            {t('زوار VIP وكبار الشخصيات', 'VIP Visitors')}
          </span>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 block font-mono">
            {visitors.filter(v => v.vip).length} <span className="text-xs font-normal">{isRtl ? 'شخصية' : 'VIPs'}</span>
          </span>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'checked_in', 'expected', 'checked_out'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setVisitorFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-target whitespace-nowrap ${
                visitorFilter === tab
                  ? 'bg-[#1C291E] dark:bg-[#F3EFE6] text-[#F3EFE6] dark:text-[#0E1610] shadow-xs'
                  : 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
              }`}
            >
              {tab === 'all'
                ? isRtl ? 'كافة الزوار' : 'All Visitors'
                : tab === 'checked_in'
                ? isRtl ? 'داخل المنشأة' : 'On-Premises'
                : tab === 'expected'
                ? isRtl ? 'مواعيد متوقعة' : 'Expected'
                : isRtl ? 'غادروا المنشأة' : 'Departed'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={visitorSearch}
              onChange={e => setVisitorSearch(e.target.value)}
              placeholder={t('بحث بالاسم، الشركة، التصريح...', 'Search visitors...')}
              className="w-full ps-8 pe-3 py-1.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
            />
          </div>

          <button
            onClick={() => setIsCheckInModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] dark:hover:bg-[#D99B26] text-[#1C291E] dark:text-[#0E1610] shadow-xs transition-colors shrink-0 touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>{t('تسجيل دخول زائر', 'New Check-In')}</span>
          </button>
        </div>
      </div>

      {/* Visitor Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredVisitors.map(vis => (
          <motion.div
            key={vis.id}
            whileHover={{ y: -1 }}
            className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] shadow-2xs space-y-3"
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1C291E] dark:bg-[#0E1610] text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                  {vis.badgeNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] leading-snug">
                      {isRtl ? vis.nameAr : vis.nameEn}
                    </h4>
                    {vis.vip && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                    {vis.company}
                  </span>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                  vis.status === 'checked_in'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : vis.status === 'expected'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border border-gray-500/30'
                }`}
              >
                {vis.status === 'checked_in'
                  ? isRtl ? 'بالمنشأة' : 'In-Building'
                  : vis.status === 'expected'
                  ? isRtl ? 'متوقع' : 'Expected'
                  : isRtl ? 'غادر' : 'Departed'}
              </span>
            </div>

            {/* Visit Details Box */}
            <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] text-xs space-y-1.5 border border-[#E0D9CB]/60 dark:border-[#243628]">
              <div className="flex items-center justify-between">
                <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الموظف المضيف:', 'Host Employee:')}</span>
                <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{vis.hostEmployeeAr} ({vis.hostDepartmentAr})</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C665E] dark:text-[#8FA392]">{t('الغرض من الزيارة:', 'Purpose:')}</span>
                <span className="text-[#1A241C] dark:text-[#F3EFE6] font-medium truncate max-w-[200px]">{vis.purposeAr}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] pt-1 border-t border-[#E0D9CB]/40 dark:border-[#243628]">
                <span className="text-[#5C665E] dark:text-[#8FA392]">{t('وقت الدخول:', 'Entry:')} {vis.entryTime}</span>
                {vis.exitTime && (
                  <span className="text-rose-600 dark:text-rose-400">{t('وقت الخروج:', 'Exit:')} {vis.exitTime}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1 gap-2">
              <button
                onClick={() => setSelectedVisitorForBadge(vis)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#D99B26] dark:text-[#EBB34D] bg-[#D99B26]/12 hover:bg-[#D99B26]/20 border border-[#D99B26]/30 transition-colors touch-target"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{t('عرض البطاقة والـ QR', 'Pass & QR Badge')}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => showToast(`تم إرسال إشعار تنبيه للمضيف ${vis.hostEmployeeAr}`)}
                  className="p-1.5 rounded-xl text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                  title={t('إرسال تنبيه للمضيف', 'Alert Host')}
                >
                  <Send className="w-4 h-4" />
                </button>
                {vis.status === 'checked_in' && (
                  <button
                    onClick={() => checkOutVisitor(vis.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-400 border border-rose-500/30 transition-colors touch-target"
                  >
                    {t('تسجيل خروج', 'Check Out')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // --- Sub-View 2: قاعات الاجتماعات والضيافة ---
  const renderMeetingRoomsView = () => (
    <div className="space-y-5">
      {/* Header & Book Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D99B26]/20 text-[#D99B26] dark:text-[#EBB34D] flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('حجز قاعات الاجتماعات والضيافة التنفيذية', 'Meeting Rooms & VIP Hospitality')}
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('متابعة إشغال القاعات وتوجيه طلبات الضيافة لمسؤولي الخدمات المكتبية', 'Track occupancy and route catering requests to office staff')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRoomModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] dark:hover:bg-[#D99B26] text-[#1C291E] dark:text-[#0E1610] shadow-xs transition-colors shrink-0 touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('حجز قاعة جديدة', 'Book Room')}</span>
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetingRooms.map(room => (
          <div
            key={room.id}
            className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-3 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  {isRtl ? room.nameAr : room.nameEn}
                </h4>
                <span className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                  {room.floor} • {t('السعة:', 'Capacity:')} {room.capacity} {isRtl ? 'مقعد' : 'seats'}
                </span>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  room.isOccupied
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {room.isOccupied ? (isRtl ? 'مشغولة حالياً' : 'Occupied') : (isRtl ? 'متاحة للحجز' : 'Available')}
              </span>
            </div>

            {/* Current Meeting Banner if Occupied */}
            {room.isOccupied && room.currentMeeting && (
              <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                  <Clock className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                  <span>{room.currentMeeting.titleAr}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                  <span>{t('المستضيف:', 'Host:')} {room.currentMeeting.hostAr}</span>
                  <span className="font-mono">{room.currentMeeting.time}</span>
                </div>
              </div>
            )}

            {/* Amenities Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {room.amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Reservations & Hospitality Stepper */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C665E] dark:text-[#8FA392]">
          {t('حجوزات اليوم ومسار الضيافة (Catering Queue)', 'Today’s Reservations & Hospitality')}
        </h4>

        <div className="space-y-2.5">
          {reservations.map(res => (
            <div
              key={res.id}
              className="p-3.5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#D99B26] dark:text-[#EBB34D]">{res.timeSlot}</span>
                  <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{res.roomNameAr}</span>
                </div>
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                  {res.titleAr} • {t('المستضيف:', 'Host:')} {res.hostEmployeeAr} ({res.departmentAr})
                </p>
                {res.cateringRequired && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#D99B26] dark:text-[#EBB34D] font-semibold">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{res.cateringDetailsAr}</span>
                  </div>
                )}
              </div>

              {/* Hospitality Stepper Controls */}
              {res.cateringRequired && (
                <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                  <button
                    onClick={() => updateHospitalityStatus(res.id, 'ordered')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-colors ${
                      res.hospitalityStatus === 'ordered'
                        ? 'bg-amber-500 text-white'
                        : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]'
                    }`}
                  >
                    {isRtl ? 'تم الطلب' : 'Ordered'}
                  </button>
                  <button
                    onClick={() => updateHospitalityStatus(res.id, 'preparing')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-colors ${
                      res.hospitalityStatus === 'preparing'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]'
                    }`}
                  >
                    {isRtl ? 'جاري التحضير' : 'Preparing'}
                  </button>
                  <button
                    onClick={() => updateHospitalityStatus(res.id, 'delivered')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10.5px] transition-colors ${
                      res.hospitalityStatus === 'delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]'
                    }`}
                  >
                    {isRtl ? 'تم التقديم' : 'Delivered'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- Sub-View 3: الشحنات والطرود البريدية ---
  const renderParcelsView = () => (
    <div className="space-y-4">
      {/* Header & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D9488]/20 text-[#0D9488] dark:text-[#2DD4BF] flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('سجل الطرود والشحنات السريعة', 'Couriers & Inbound Packages')}
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('إثبات استلام الطرود وتسليمها للموظفين مع إمكانية التصعيد للصادر والوارد (CTS)', 'Package handover verification and direct CTS escalation')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsParcelModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610] shadow-xs transition-colors shrink-0 touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('قيد شحنة جديدة', 'Log Parcel')}</span>
        </button>
      </div>

      {/* Parcels Cards */}
      <div className="space-y-3">
        {parcels.map(parcel => (
          <div
            key={parcel.id}
            className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-2xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23] text-[#5C665E] dark:text-[#8FA392]">
                  {parcel.trackingNumber}
                </span>
                <span className="font-bold text-[#D99B26] dark:text-[#EBB34D]">{parcel.courierName}</span>
                {parcel.isOfficialTransmittal && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                    {isRtl ? 'إرسالية رسمية / CTS' : 'Official Document'}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-[#1A241C] dark:text-[#F3EFE6] text-sm">
                {parcel.packageTypeAr}
              </h4>
              <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                {t('المرسل:', 'Sender:')} <strong>{parcel.senderName}</strong> • {t('المستلم الداخلي:', 'Recipient:')}{' '}
                <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{parcel.recipientEmployeeAr} ({parcel.recipientDepartmentAr})</strong>
              </p>
              <span className="font-mono text-[10.5px] text-[#5C665E] dark:text-[#8FA392] block">
                {t('وقت الوصول للاستقبال:', 'Arrived:')} {parcel.arrivalTimestamp}
              </span>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-[#E0D9CB]/60 dark:border-[#243628]">
              {parcel.status === 'received' ? (
                <div className="text-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'تم التسليم للموظف' : 'Picked Up'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#5C665E] dark:text-[#8FA392] block mt-0.5">
                    {parcel.handedOverAt}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {parcel.isOfficialTransmittal && (
                    <button
                      onClick={() => {
                        selectItem('cts', 'cts_incoming_new');
                        showToast(`تم فتح قيد وارد رسمي جديد في منظومة الصادر والوارد (CTS) للشحنة ${parcel.trackingNumber}`);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0D9488]/15 hover:bg-[#0D9488]/25 text-[#0D9488] dark:text-[#2DD4BF] border border-[#0D9488]/30 transition-colors touch-target"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t('تصعيد لوارد CTS', 'Escalate to CTS')}</span>
                    </button>
                  )}

                  <button
                    onClick={() => confirmParcelPickup(parcel.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors touch-target"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('تأكيد الاستلام والتوقيع', 'Confirm Pickup')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Sub-View 4: سجل المكالمات ودليل التحويلات ---
  const renderCallsView = () => (
    <div className="space-y-4">
      {/* Header & Log Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 text-[#6366F1] dark:text-[#818CF8] flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('سجل المكالمات ودليل التحويلات الداخلية', 'Call Registry & Corporate Directory')}
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('توثيق اتصالات السنترال وتدوين رسائل الموظفين الغائبين والدليل السريع', 'Log calls, absent staff message pad, and quick corporate directory')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCallModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610] shadow-xs transition-colors shrink-0 touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('تسجيل مكالمة جديدة', 'Log Inbound Call')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Inbound Call Registry */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C665E] dark:text-[#8FA392]">
            {t('سجل اتصالات السنترال اليوم', 'Inbound Call Registry')}
          </h4>

          <div className="space-y-2.5">
            {callLogs.map(call => (
              <div
                key={call.id}
                className="p-3.5 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-2 text-xs shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{call.callerName}</span>
                      <span className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">({call.callerOrganization})</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#D99B26] dark:text-[#EBB34D]">{call.callerPhone}</span>
                  </div>

                  <span
                    className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      call.status === 'transferred'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : call.status === 'message_taken'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {call.status === 'transferred'
                      ? isRtl ? 'تم التحويل' : 'Transferred'
                      : call.status === 'message_taken'
                      ? isRtl ? 'تم تدوين رسالة' : 'Message Taken'
                      : isRtl ? 'طلب معاودة اتصال' : 'Callback Needed'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] text-[11px] text-[#5C665E] dark:text-[#8FA392] space-y-1 border border-[#E0D9CB]/60 dark:border-[#243628]">
                  <div>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{t('المطلوب الاتصال به:', 'Target:')}</span> {call.directedToEmployeeAr}
                  </div>
                  <div>
                    <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{t('موضوع المكالمة:', 'Subject:')}</span> {call.purposeAr}
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>{t('الإجراء المنفذ:', 'Action:')}</span> {call.actionTakenAr}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Corporate Directory Search */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C665E] dark:text-[#8FA392]">
              {t('الدليل الداخلي للتحويلات', 'Extensions Directory')}
            </h4>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5C665E] dark:text-[#8FA392] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={directorySearch}
              onChange={e => setDirectorySearch(e.target.value)}
              placeholder={t('بحث بالاسم أو القسم...', 'Search directory...')}
              className="w-full ps-8 pe-3 py-1.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
            />
          </div>

          <div className="space-y-2">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                className="p-3 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">{contact.nameAr}</span>
                  <span className="font-mono font-black text-sm text-[#D99B26] dark:text-[#EBB34D] px-2 py-0.5 rounded-md bg-[#EAE4D7] dark:bg-[#1F2E23]">
                    {contact.extension}
                  </span>
                </div>
                <p className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">{contact.roleAr} • {contact.departmentAr}</p>
                <div className="flex items-center justify-between font-mono text-[10.5px] pt-1">
                  <span className="text-[#5C665E] dark:text-[#8FA392]">{contact.mobile}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-sm font-semibold text-[9.5px] ${
                      contact.status === 'available'
                        ? 'bg-emerald-500/15 text-emerald-600'
                        : 'bg-amber-500/15 text-amber-600'
                    }`}
                  >
                    {contact.status === 'available' ? (isRtl ? 'متاح' : 'Available') : (isRtl ? 'في اجتماع' : 'In Meeting')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- Sub-View 5: تصاريح المقاولين والفنيين المؤقتة ---
  const renderPassesView = () => (
    <div className="space-y-4">
      {/* Header & Issue Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F3EFE6] dark:bg-[#17231A] p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B45309]/20 text-[#B45309] dark:text-[#F59E0B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
              {t('تصاريح المقاولين والفنيين المؤقتة', 'Contractor & Maintenance Site Passes')}
            </h3>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
              {t('إصدار بطاقات الدخول المؤقتة وحصر المعدات وإقرار السلامة والصحة المهنية (HSE)', 'Temporary badges, equipment registry, and HSE safety briefing')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPassModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610] shadow-xs transition-colors shrink-0 touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>{t('إصدار تصريح جديد', 'Issue Pass')}</span>
        </button>
      </div>

      {/* Passes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contractorPasses.map(pass => (
          <div
            key={pass.id}
            className="p-4 rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A] space-y-3 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#1C291E] dark:bg-[#0E1610] text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30">
                  {pass.passNumber}
                </span>
                <h4 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6] pt-1">
                  {pass.technicianNameAr}
                </h4>
                <p className="text-xs text-[#5C665E] dark:text-[#8FA392] font-semibold">
                  {pass.contractorCompanyAr}
                </p>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  pass.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border border-gray-500/30'
                }`}
              >
                {pass.status === 'active' ? (isRtl ? 'تصريح ساري' : 'Active Pass') : (isRtl ? 'مستعاد / منتهي' : 'Expired')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1610] text-xs space-y-1.5 border border-[#E0D9CB]/60 dark:border-[#243628]">
              <div>
                <span className="text-[#5C665E] dark:text-[#8FA392]">{t('طبيعة ونطاق العمل:', 'Work Scope:')}</span>{' '}
                <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{pass.workScopeAr}</strong>
              </div>
              <div>
                <span className="text-[#5C665E] dark:text-[#8FA392]">{t('تحت إشراف:', 'Supervisor:')}</span> {pass.supervisedByAr}
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-[#E0D9CB]/40 dark:border-[#243628]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تم التوقيع على إقرار السلامة المهنية والمخاطر' : 'HSE Safety Briefing Signed'}</span>
              </div>
              <div className="text-[11px] text-[#5C665E] dark:text-[#8FA392]">
                <span className="font-bold">{t('العدد والمعدات المسجلة:', 'Registered Tools:')}</span> {pass.registeredToolsAr}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-mono text-[#5C665E] dark:text-[#8FA392]">
                {t('صالح حتى:', 'Valid Until:')} {pass.validUntil}
              </span>
              {pass.status === 'active' && (
                <button
                  onClick={() => revokeContractorPass(pass.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 transition-colors touch-target"
                >
                  {t('إنهاء واستعادة التصريح', 'Revoke Pass')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Switch Current Sub-View
  const renderCurrentSubView = () => {
    switch (activeSubItemId) {
      case 'rec_rooms':
        return renderMeetingRoomsView();
      case 'rec_parcels':
        return renderParcelsView();
      case 'rec_calls':
        return renderCallsView();
      case 'rec_passes':
        return renderPassesView();
      case 'rec_visitors':
      default:
        return renderVisitorsView();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 z-50 left-1/2 -translate-x-1/2 bg-[#1C291E] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-[#D99B26]/40 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D99B26]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Active View */}
      {renderCurrentSubView()}

      {/* Modal: Fast Check-In Visitor */}
      <AnimatePresence>
        {isCheckInModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckInModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 pb-safe max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div className="flex items-center gap-2">
                  <ConciergeBell className="w-5 h-5 text-[#D99B26] dark:text-[#EBB34D]" />
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('تسجيل دخول زائر فوري وإصدار تصريح', 'Fast Visitor Check-In')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCheckInModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCheckInSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('اسم الزائر ثلاثي *', 'Visitor Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={visNameAr}
                    onChange={e => setVisNameAr(e.target.value)}
                    placeholder="مثال: م. خالد عبد الله القحطاني"
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الجهة / الشركة التابع لها', 'Company / Entity')}
                    </label>
                    <input
                      type="text"
                      value={visCompany}
                      onChange={e => setVisCompany(e.target.value)}
                      placeholder="شركة العمارة الحديثة"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('رقم الهوية الوطنية / الإقامة', 'National / Resident ID')}
                    </label>
                    <input
                      type="text"
                      value={visNationalId}
                      onChange={e => setVisNationalId(e.target.value)}
                      placeholder="10xxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('رقم الجوال للتواصل *', 'Mobile Number *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={visMobile}
                      onChange={e => setVisMobile(e.target.value)}
                      placeholder="+966 5x xxx xxxx"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الموظف المضيف المطلوب زيارته', 'Host Employee')}
                    </label>
                    <select
                      value={visHostEmployee}
                      onChange={e => setVisHostEmployee(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26] font-bold"
                    >
                      <option value="م. أحمد مصطفى">م. أحمد مصطفى (المكتب الفني)</option>
                      <option value="أ. كمال إبراهيم">أ. كمال إبراهيم (المالية)</option>
                      <option value="أ. رأفت عبد العال">أ. رأفت عبد العال (القانونية)</option>
                      <option value="م. شريف حسني">م. شريف حسني (الدراسات والتصميم)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('الغرض من الزيارة', 'Purpose of Visit')}
                  </label>
                  <input
                    type="text"
                    value={visPurpose}
                    onChange={e => setVisPurpose(e.target.value)}
                    placeholder="اجتماع مراجعة مستخلصات، تسليم عينات..."
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-hidden focus:border-[#D99B26]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="vip_check"
                    checked={visIsVip}
                    onChange={e => setVisIsVip(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D99B26]"
                  />
                  <label htmlFor="vip_check" className="font-bold text-xs text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('تصنيف كـ ضيف VIP (تفعيل بروتوكول الضيافة والاستقبال الخاص)', 'Mark as VIP Guest')}
                  </label>
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckInModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610] shadow-md transition-all touch-target"
                  >
                    {t('إتمام الدخول وتوليد التصريح', 'Check-In & Generate Pass')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Digital Visitor Pass & QR Badge */}
      <AnimatePresence>
        {selectedVisitorForBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVisitorForBadge(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-sm bg-[#FBF9F5] dark:bg-[#0E1610] rounded-3xl border-2 border-[#D99B26]/50 shadow-2xl p-6 text-center space-y-4"
            >
              {/* Badge Top Header */}
              <div className="flex items-center justify-between border-b border-[#E0D9CB] dark:border-[#243628] pb-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#D99B26] dark:text-[#EBB34D]">
                  <Building2 className="w-4 h-4" />
                  <span>ARKAN ENTERPRISE PASS</span>
                </div>
                <button
                  onClick={() => setSelectedVisitorForBadge(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badge Visual Design */}
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {selectedVisitorForBadge.nameAr.charAt(0)}
                </div>

                <div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] border border-[#D99B26]/30">
                    {selectedVisitorForBadge.badgeNumber}
                  </span>
                  <h3 className="text-base font-extrabold text-[#1A241C] dark:text-[#F3EFE6] mt-2">
                    {selectedVisitorForBadge.nameAr}
                  </h3>
                  <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                    {selectedVisitorForBadge.company}
                  </p>
                </div>

                {/* Simulated QR Code Canvas */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] shadow-inner inline-block mx-auto">
                  <div className="w-36 h-36 flex flex-col items-center justify-center bg-gray-50 dark:bg-black/40 rounded-xl p-2 border border-dashed border-[#D99B26]/40">
                    <QrCode className="w-24 h-24 text-[#1C291E] dark:text-[#EBB34D]" />
                    <span className="text-[9px] font-mono font-bold text-[#5C665E] dark:text-[#8FA392] mt-1">
                      {selectedVisitorForBadge.qrCode}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] text-xs text-start space-y-1 border border-[#E0D9CB]/60 dark:border-[#243628]">
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('المستضيف:', 'Host:')}</span>
                    <strong className="text-[#1A241C] dark:text-[#F3EFE6]">{selectedVisitorForBadge.hostEmployeeAr}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C665E] dark:text-[#8FA392]">{t('وقت الدخول:', 'Checked-In:')}</span>
                    <span className="font-mono text-[#1A241C] dark:text-[#F3EFE6]">{selectedVisitorForBadge.entryTime}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast('جاري طباعة بطاقة الزائر الرقمية...');
                  setSelectedVisitorForBadge(null);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] shadow-md transition-all touch-target"
              >
                {t('طباعة بطاقة وتصريح الزائر', 'Print Visitor Pass')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Book Meeting Room */}
      <AnimatePresence>
        {isRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRoomModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 pb-safe max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D99B26] dark:text-[#EBB34D]" />
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('حجز قاعة اجتماعات وطلب ضيافة', 'Book Meeting Room & Catering')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsRoomModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBookRoomSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('اختيار القاعة المطلوبة *', 'Select Room *')}
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={e => setSelectedRoomId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
                  >
                    {meetingRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.nameAr} (سعة {r.capacity} مقعد - {r.floor})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('عنوان وموضوع الاجتماع *', 'Meeting Subject *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={roomMeetingTitle}
                    onChange={e => setRoomMeetingTitle(e.target.value)}
                    placeholder="مثال: جلسة اعتماد المخططات الهندسية ومستخلص رقم 5"
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الفترة الزمنية', 'Time Slot')}
                    </label>
                    <input
                      type="text"
                      value={roomTimeSlot}
                      onChange={e => setRoomTimeSlot(e.target.value)}
                      placeholder="01:00 م - 02:30 م"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('عدد الحضور المتوقع', 'Attendees Count')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={roomAttendees}
                      onChange={e => setRoomAttendees(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="catering_check"
                      checked={roomCatering}
                      onChange={e => setRoomCatering(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D99B26]"
                    />
                    <label htmlFor="catering_check" className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                      {t('طلب خدمات ضيافة ومشروبات للاجتماع', 'Request Catering & Beverages')}
                    </label>
                  </div>
                  {roomCatering && (
                    <input
                      type="text"
                      value={roomCateringDetails}
                      onChange={e => setRoomCateringDetails(e.target.value)}
                      placeholder="قهوة، شاي، مياه، تمور..."
                      className="w-full p-2 rounded-lg bg-[#FBF9F5] dark:bg-[#0E1610] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  )}
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRoomModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#D99B26] hover:bg-[#C28519] dark:bg-[#EBB34D] text-[#1C291E] dark:text-[#0E1610] shadow-md transition-all touch-target"
                  >
                    {t('تأكيد الحجز وتوجيه الضيافة', 'Confirm Booking')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Log Inbound Parcel */}
      <AnimatePresence>
        {isParcelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsParcelModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 pb-safe max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#0D9488] dark:text-[#2DD4BF]" />
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('قيد شحنة أو طرد بريدي وارد', 'Log Inbound Parcel')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsParcelModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddParcelSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('شركة الشحن / التوصيل', 'Courier Service')}
                    </label>
                    <select
                      value={parcelCourier}
                      onChange={e => setParcelCourier(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
                    >
                      <option value="البريد السعودي (SPL)">البريد السعودي (SPL)</option>
                      <option value="DHL Express">DHL Express</option>
                      <option value="Aramex">Aramex</option>
                      <option value="SMSA Express">SMSA Express</option>
                      <option value="مندوب خاص">مندوب خاص مباشر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('رقم التتبع / البوليصة', 'Tracking Number')}
                    </label>
                    <input
                      type="text"
                      value={parcelTracking}
                      onChange={e => setParcelTracking(e.target.value)}
                      placeholder="SPL-99201..."
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('نوع ومحتوى الشحنة *', 'Package Content *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={parcelType}
                    onChange={e => setParcelType(e.target.value)}
                    placeholder="مستندات تعاقدية، عينات خرسانة، أجهزة..."
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الجهة أو الشخص المرسل', 'Sender')}
                    </label>
                    <input
                      type="text"
                      value={parcelSender}
                      onChange={e => setParcelSender(e.target.value)}
                      placeholder="وزارة التجارة / دار الهندسة"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الموظف المستلم المعني', 'Recipient Staff')}
                    </label>
                    <select
                      value={parcelRecipient}
                      onChange={e => setParcelRecipient(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
                    >
                      <option value="أ. رأفت عبد العال">أ. رأفت عبد العال (الشؤون القانونية)</option>
                      <option value="م. أحمد مصطفى">م. أحمد مصطفى (المكتب الفني)</option>
                      <option value="أ. كمال إبراهيم">أ. كمال إبراهيم (المالية)</option>
                      <option value="م. خالد النجار">م. خالد النجار (المشاريع)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0D9488]/10 border border-[#0D9488]/30 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cts_check"
                    checked={parcelIsCTS}
                    onChange={e => setParcelIsCTS(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0D9488]"
                  />
                  <label htmlFor="cts_check" className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('إرسالية رسمية تستوجب القيد والربط بنظام الصادر والوارد (CTS)', 'Official Document (Link with CTS)')}
                  </label>
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsParcelModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-md transition-all touch-target"
                  >
                    {t('قيد الشحنة وإشعار المستلم', 'Save & Notify')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Log Inbound Call */}
      <AnimatePresence>
        {isCallModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCallModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 pb-safe max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-[#6366F1] dark:text-[#818CF8]" />
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('تسجيل مكالمة هاتفية واردة للسنترال', 'Log Inbound Call')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCallModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCallSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('اسم المتصل *', 'Caller Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={callCaller}
                      onChange={e => setCallCaller(e.target.value)}
                      placeholder="م. عبد العزيز الشمري"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الجهة / المنظمة', 'Organization')}
                    </label>
                    <input
                      type="text"
                      value={callOrg}
                      onChange={e => setCallOrg(e.target.value)}
                      placeholder="أمانة منطقة الرياض"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('رقم الهاتف للتواصل', 'Phone Number')}
                    </label>
                    <input
                      type="text"
                      value={callPhone}
                      onChange={e => setCallPhone(e.target.value)}
                      placeholder="+966 11 xxx xxxx"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('المطلوب الاتصال به', 'Directed To')}
                    </label>
                    <input
                      type="text"
                      value={callDirectedTo}
                      onChange={e => setCallDirectedTo(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('موضوع المكالمة والرسالة', 'Subject & Message')}
                  </label>
                  <textarea
                    rows={2}
                    value={callPurpose}
                    onChange={e => setCallPurpose(e.target.value)}
                    placeholder="استفسار بشأن تجديد الرخصة..."
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('حالة الإجراء', 'Status')}
                    </label>
                    <select
                      value={callStatus}
                      onChange={e => setCallStatus(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] font-bold"
                    >
                      <option value="transferred">تم التحويل بنجاح</option>
                      <option value="message_taken">الموظف مشغول - تم تدوين رسالة</option>
                      <option value="callback_requested">مطلوب معاودة الاتصال</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الإجراء المنفذ', 'Action Taken')}
                    </label>
                    <input
                      type="text"
                      value={callAction}
                      onChange={e => setCallAction(e.target.value)}
                      placeholder="تم التحويل للتحويلة 201"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCallModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-md transition-all touch-target"
                  >
                    {t('حفظ المكالمة في السجل', 'Save to Log')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Issue Contractor Pass */}
      <AnimatePresence>
        {isPassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPassModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg bg-[#FBF9F5] dark:bg-[#0E1610] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 pb-safe max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0D9CB] dark:border-[#243628]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#B45309] dark:text-[#F59E0B]" />
                  <h3 className="text-sm font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('إصدار تصريح مؤقت لمقاول / فني صيانة', 'Issue Temporary Contractor Pass')}
                  </h3>
                </div>
                <button
                  onClick={() => setIsPassModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleIssuePassSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('اسم الفني / المقاول *', 'Technician Name *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={passTechName}
                      onChange={e => setPassTechName(e.target.value)}
                      placeholder="محمد حسن"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('شركة المقاولات *', 'Contractor Firm *')}
                    </label>
                    <input
                      type="text"
                      required
                      value={passCompany}
                      onChange={e => setPassCompany(e.target.value)}
                      placeholder="شركة كولينج للتهوية"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('رقم الهوية / الإقامة', 'National ID')}
                    </label>
                    <input
                      type="text"
                      value={passNatId}
                      onChange={e => setPassNatId(e.target.value)}
                      placeholder="2xxxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                      {t('الصلاحية الزمنية للتصريح', 'Validity')}
                    </label>
                    <input
                      type="text"
                      value={passValidUntil}
                      onChange={e => setPassValidUntil(e.target.value)}
                      placeholder="04:00 م (نهاية اليوم)"
                      className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('طبيعة ونطاق العمل بالموقع', 'Work Scope')}
                  </label>
                  <input
                    type="text"
                    value={passWorkScope}
                    onChange={e => setPassWorkScope(e.target.value)}
                    placeholder="صيانة مصاعد، كابلات ألياف بصرية، فحص إنذار حريق..."
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1">
                    {t('العدد والأجهزة والمعدات المسجلة بالدخول', 'Registered Tools')}
                  </label>
                  <input
                    type="text"
                    value={passTools}
                    onChange={e => setPassTools(e.target.value)}
                    placeholder="حقيبة عدد يدوية، جهاز قياس رقمي..."
                    className="w-full p-2.5 rounded-xl bg-[#F3EFE6] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="safety_check"
                    checked={passSafetyBriefed}
                    onChange={e => setPassSafetyBriefed(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <label htmlFor="safety_check" className="font-bold text-[#1A241C] dark:text-[#F3EFE6]">
                    {t('تم تقديم إقرار وتوجيهات السلامة والصحة المهنية (HSE) للفني', 'HSE Safety Briefing Completed')}
                  </label>
                </div>

                <div className="pt-3 border-t border-[#E0D9CB] dark:border-[#243628] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPassModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] touch-target"
                  >
                    {t('إلغاء', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#B45309] hover:bg-[#92400E] text-white shadow-md transition-all touch-target"
                  >
                    {t('إصدار التصريح وتسليم البطاقة', 'Issue Pass')}
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
