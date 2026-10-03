import React, { createContext, useContext, useState } from 'react';

export type VisitorStatus = 'checked_in' | 'expected' | 'checked_out';

export interface Visitor {
  id: string;
  nameAr: string;
  nameEn: string;
  company: string;
  nationalId: string;
  mobile: string;
  hostEmployeeAr: string;
  hostEmployeeEn: string;
  hostDepartmentAr: string;
  purposeAr: string;
  purposeEn: string;
  badgeNumber: string;
  entryTime: string;
  exitTime?: string;
  status: VisitorStatus;
  qrCode: string;
  vip?: boolean;
}

export interface MeetingRoom {
  id: string;
  nameAr: string;
  nameEn: string;
  capacity: number;
  floor: string;
  amenities: string[];
  isOccupied: boolean;
  currentMeeting?: {
    titleAr: string;
    hostAr: string;
    time: string;
    attendees: number;
  };
}

export interface RoomReservation {
  id: string;
  roomId: string;
  roomNameAr: string;
  titleAr: string;
  hostEmployeeAr: string;
  departmentAr: string;
  timeSlot: string;
  attendeesCount: number;
  amenities: string[];
  cateringRequired: boolean;
  cateringDetailsAr?: string;
  hospitalityStatus: 'ordered' | 'preparing' | 'delivered';
}

export type ParcelStatus = 'pending_handover' | 'received';

export interface InboundParcel {
  id: string;
  trackingNumber: string;
  courierName: string;
  packageTypeAr: string;
  senderName: string;
  recipientEmployeeAr: string;
  recipientDepartmentAr: string;
  arrivalTimestamp: string;
  status: ParcelStatus;
  handedOverAt?: string;
  isOfficialTransmittal?: boolean;
}

export interface CallLogEntry {
  id: string;
  timestamp: string;
  callerName: string;
  callerOrganization: string;
  callerPhone: string;
  directedToEmployeeAr: string;
  purposeAr: string;
  actionTakenAr: string;
  status: 'transferred' | 'message_taken' | 'callback_requested';
}

export interface CorporateContact {
  id: string;
  nameAr: string;
  nameEn: string;
  departmentAr: string;
  extension: string;
  mobile: string;
  roleAr: string;
  status: 'available' | 'in_meeting' | 'away';
}

export interface ContractorPass {
  id: string;
  passNumber: string;
  contractorCompanyAr: string;
  technicianNameAr: string;
  nationalId: string;
  workScopeAr: string;
  supervisedByAr: string;
  entryTime: string;
  validUntil: string;
  safetyBriefingCompleted: boolean;
  registeredToolsAr: string;
  status: 'active' | 'expired' | 'revoked';
}

interface ReceptionContextType {
  // Visitors
  visitors: Visitor[];
  checkInVisitor: (visitorData: Omit<Visitor, 'id' | 'entryTime' | 'status' | 'qrCode'>) => Visitor;
  checkOutVisitor: (id: string) => void;
  selectedVisitorForBadge: Visitor | null;
  setSelectedVisitorForBadge: (v: Visitor | null) => void;

  // Meeting Rooms
  meetingRooms: MeetingRoom[];
  reservations: RoomReservation[];
  bookMeetingRoom: (reservation: Omit<RoomReservation, 'id' | 'hospitalityStatus'>) => void;
  updateHospitalityStatus: (resId: string, status: 'ordered' | 'preparing' | 'delivered') => void;

  // Parcels
  parcels: InboundParcel[];
  addParcel: (parcel: Omit<InboundParcel, 'id' | 'arrivalTimestamp' | 'status'>) => void;
  confirmParcelPickup: (id: string) => void;

  // Calls & Contacts
  callLogs: CallLogEntry[];
  addCallLog: (call: Omit<CallLogEntry, 'id' | 'timestamp'>) => void;
  corporateDirectory: CorporateContact[];

  // Contractor Site Passes
  contractorPasses: ContractorPass[];
  issueContractorPass: (pass: Omit<ContractorPass, 'id' | 'passNumber' | 'entryTime' | 'status'>) => void;
  revokeContractorPass: (id: string) => void;

  // Live KPI Counters
  activeVisitorsCount: number;
  todayScheduledCount: number;
  occupiedRoomsCount: number;
  pendingParcelsCount: number;

  // Toast notification state
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'vis_01',
    nameAr: 'م. عبد العزيز الشمري',
    nameEn: 'Eng. Abdulaziz Al-Shammari',
    company: 'شركة إعمار للتطوير الهندسي',
    nationalId: '1088492011',
    mobile: '+966 55 412 8890',
    hostEmployeeAr: 'م. أحمد مصطفى',
    hostEmployeeEn: 'Eng. Ahmed Mostafa',
    hostDepartmentAr: 'المكتب الفني والمشاريع',
    purposeAr: 'مراجعة المخططات التنفيذية لمشروع برج النخبة',
    purposeEn: 'Shop drawings review for Elite Tower',
    badgeNumber: 'V-104',
    entryTime: '09:15 ص',
    status: 'checked_in',
    qrCode: 'ARKAN-VIS-104-2026',
    vip: true,
  },
  {
    id: 'vis_02',
    nameAr: 'د. طارق السبيعي',
    nameEn: 'Dr. Tareq Al-Subaie',
    company: 'مكتب دار الهندسة للاستشارات',
    nationalId: '1044738291',
    mobile: '+966 50 882 1194',
    hostEmployeeAr: 'أ. كمال إبراهيم',
    hostEmployeeEn: 'Kamal Ibrahim',
    hostDepartmentAr: 'الإدارة المالية',
    purposeAr: 'تسليم ومطابقة مستخلص مقاولي الباطن رقم 4',
    purposeEn: 'IPC #4 Consultant Verification',
    badgeNumber: 'V-105',
    entryTime: '10:00 ص',
    status: 'checked_in',
    qrCode: 'ARKAN-VIS-105-2026',
    vip: false,
  },
  {
    id: 'vis_03',
    nameAr: 'أ. فهد العصيمي',
    nameEn: 'Fahad Al-Osaimi',
    company: 'المصرف الأهلي التجاري',
    nationalId: '1029481102',
    mobile: '+966 54 991 3340',
    hostEmployeeAr: 'م. شريف حسني',
    hostEmployeeEn: 'Sherif Hosny',
    hostDepartmentAr: 'الإدارة العليا والاستراتيجية',
    purposeAr: 'جلسة استعراض التسهيلات الائتمانية وضمانات المشاريع',
    purposeEn: 'Credit facilities & Bank Guarantees review',
    badgeNumber: 'V-106',
    entryTime: '11:30 ص',
    status: 'expected',
    qrCode: 'ARKAN-VIS-106-2026',
    vip: true,
  },
  {
    id: 'vis_04',
    nameAr: 'م. زياد المنصور',
    nameEn: 'Eng. Ziad Al-Mansoor',
    company: 'سبيس إكس ديزاين للديكور',
    nationalId: '1099238471',
    mobile: '+966 56 331 8844',
    hostEmployeeAr: 'أ. نورة الغامدي',
    hostEmployeeEn: 'Noura Al-Ghamdi',
    hostDepartmentAr: 'المكتب الفني',
    purposeAr: 'معاينة عينات الرخام والواجهات الزجاجية',
    purposeEn: 'Marble & Glazing samples inspection',
    badgeNumber: 'V-102',
    entryTime: '08:30 ص',
    exitTime: '10:15 ص',
    status: 'checked_out',
    qrCode: 'ARKAN-VIS-102-2026',
    vip: false,
  },
];

const INITIAL_ROOMS: MeetingRoom[] = [
  {
    id: 'room_vip_board',
    nameAr: 'مجلس أركان التنفيذي (VIP Boardroom)',
    nameEn: 'Arkan Executive Boardroom',
    capacity: 18,
    floor: 'الدور 5 - الإدارة العليا',
    amenities: ['شاشة 4K تفاعلية 85 بوصة', 'نظام مؤتمرات فيديو Polycom', 'سبورة رقمية ذكية', 'ضيافة VIP'],
    isOccupied: true,
    currentMeeting: {
      titleAr: 'اجتماع مناقشة الموازنة الربع سنوية واعتمادات المشاريع',
      hostAr: 'م. أحمد مصطفى',
      time: '10:00 ص - 12:00 م',
      attendees: 12,
    },
  },
  {
    id: 'room_innovation',
    nameAr: 'قاعة الابتكار والمشروعات (Innovation Hub)',
    nameEn: 'Innovation & Projects Room',
    capacity: 10,
    floor: 'الدور 4 - المكتب الفني',
    amenities: ['شاشات عرض مزدوجة', 'نظام صوتي محيطي', 'سبورة حائطية بانورامية'],
    isOccupied: false,
  },
  {
    id: 'room_engineering',
    nameAr: 'قاعة التنسيق الهندسي (BIM Lab)',
    nameEn: 'Engineering BIM & Design Room',
    capacity: 8,
    floor: 'الدور 4 - الهندسة والنمذجة',
    amenities: ['محطات عمل نمذجة ثلاثية الأبعاد', 'طابعة مخططات معمارية', 'شاشة عرض تفاعلية'],
    isOccupied: true,
    currentMeeting: {
      titleAr: 'جلسة التنسيق المعماري والإلكتروميكانيكي (MEP/BIM)',
      hostAr: 'م. شريف حسني',
      time: '11:00 ص - 01:00 م',
      attendees: 6,
    },
  },
  {
    id: 'room_meet_compact',
    nameAr: 'قاعة المقابلات والاجتماعات المصغرة',
    nameEn: 'Compact Interview Suite',
    capacity: 4,
    floor: 'الدور 3 - الموارد البشرية والاستقبال',
    amenities: ['شاشة عرض 55 بوصة', 'كاميرا اجتماعات ذكية'],
    isOccupied: false,
  },
];

const INITIAL_RESERVATIONS: RoomReservation[] = [
  {
    id: 'res_01',
    roomId: 'room_vip_board',
    roomNameAr: 'مجلس أركان التنفيذي (VIP Boardroom)',
    titleAr: 'اجتماع مناقشة الموازنة الربع سنوية واعتمادات المشاريع',
    hostEmployeeAr: 'م. أحمد مصطفى',
    departmentAr: 'الإدارة العليا والاستراتيجية',
    timeSlot: '10:00 ص - 12:00 م',
    attendeesCount: 12,
    amenities: ['شاشة 4K تفاعلية 85 بوصة', 'نظام مؤتمرات فيديو Polycom', 'ضيافة VIP'],
    cateringRequired: true,
    cateringDetailsAr: 'قهوة سعودية مختصة، تمور فاخرة، شاي بالنعناع، ومشروبات باردة',
    hospitalityStatus: 'delivered',
  },
  {
    id: 'res_02',
    roomId: 'room_engineering',
    roomNameAr: 'قاعة التنسيق الهندسي (BIM Lab)',
    titleAr: 'جلسة التنسيق المعماري والإلكتروميكانيكي (MEP/BIM)',
    hostEmployeeAr: 'م. شريف حسني',
    departmentAr: 'المكتب الفني',
    timeSlot: '11:00 ص - 01:00 م',
    attendeesCount: 6,
    amenities: ['شاشة عرض تفاعلية', 'محطات عمل نمذجة ثلاثية الأبعاد'],
    cateringRequired: true,
    cateringDetailsAr: 'شاي وقهوة ومياه معدنية لـ 6 أشخاص',
    hospitalityStatus: 'preparing',
  },
];

const INITIAL_PARCELS: InboundParcel[] = [
  {
    id: 'parc_01',
    trackingNumber: 'SA-SPL-99201481',
    courierName: 'البريد السعودي (SPL)',
    packageTypeAr: 'مستندات تعاقدية أصلية مسجلة',
    senderName: 'وزارة الإسكان والشؤون القروية',
    recipientEmployeeAr: 'أ. رأفت عبد العال',
    recipientDepartmentAr: 'الشؤون القانونية',
    arrivalTimestamp: '08:45 ص',
    status: 'pending_handover',
    isOfficialTransmittal: true,
  },
  {
    id: 'parc_02',
    trackingNumber: 'DHL-EXP-4820193',
    courierName: 'DHL Express',
    packageTypeAr: 'عينات معمارية ومواد كيميائية للبناء',
    senderName: 'BASF Construction Chemicals - Dubai',
    recipientEmployeeAr: 'م. أحمد مصطفى',
    recipientDepartmentAr: 'المكتب الفني',
    arrivalTimestamp: '09:30 ص',
    status: 'pending_handover',
    isOfficialTransmittal: false,
  },
  {
    id: 'parc_03',
    trackingNumber: 'ARM-DOM-330192',
    courierName: 'Aramex',
    packageTypeAr: 'أجهزة مساحة ليزرية للموقع',
    senderName: 'شركة التجهيزات الجيوديسية',
    recipientEmployeeAr: 'م. خالد النجار',
    recipientDepartmentAr: 'عمليات المشاريع الميدانية',
    arrivalTimestamp: 'أمس - 03:20 م',
    status: 'received',
    handedOverAt: 'اليوم - 08:30 ص',
    isOfficialTransmittal: false,
  },
];

const INITIAL_CALLS: CallLogEntry[] = [
  {
    id: 'call_01',
    timestamp: '09:20 ص',
    callerName: 'المهندس / سامي الجابري',
    callerOrganization: 'أمانة منطقة الرياض - إدارة الرخص',
    callerPhone: '+966 11 411 9020',
    directedToEmployeeAr: 'أ. رأفت عبد العال (الشؤون القانونية)',
    purposeAr: 'استفسار بشأن تجديد رخصة تعلية برج النخبة',
    actionTakenAr: 'تم تحويل المكالمة للتحويلة الداخلية (402) بنجاح',
    status: 'transferred',
  },
  {
    id: 'call_02',
    timestamp: '09:55 ص',
    callerName: 'الأستاذة / ريم الحارثي',
    callerOrganization: 'بنك الراجحي - قطاع الشركات',
    callerPhone: '+966 11 829 4400',
    directedToEmployeeAr: 'أ. كمال إبراهيم (المدير المالي)',
    purposeAr: 'طلب تأكيد صحة إصدار خطاب الضمان النهائي للمشروع',
    actionTakenAr: 'الموظف في اجتماع - تم تسجيل الملاحظة وإرسال تنبيه عاجل',
    status: 'message_taken',
  },
  {
    id: 'call_03',
    timestamp: '10:30 ص',
    callerName: 'م. عادل الشهري',
    callerOrganization: 'مؤسسة إمداد للمقاولات الكهروميكانيكية',
    callerPhone: '+966 50 123 9988',
    directedToEmployeeAr: 'المكتب الفني (قسم التوريدات)',
    purposeAr: 'استفسار عن موعد فتح مظاريف مناقصة التكييف المركزي',
    actionTakenAr: 'بانتظار إعادة الاتصال من مهندس التوريدات بعد 01:00 م',
    status: 'callback_requested',
  },
];

const CORPORATE_DIRECTORY: CorporateContact[] = [
  {
    id: 'dir_01',
    nameAr: 'م. أحمد مصطفى',
    nameEn: 'Eng. Ahmed Mostafa',
    departmentAr: 'الإدارة العليا والمكتب الفني',
    extension: '101',
    mobile: '+966 50 111 2233',
    roleAr: 'الرئيس التنفيذي للعمليات (COO)',
    status: 'in_meeting',
  },
  {
    id: 'dir_02',
    nameAr: 'أ. كمال إبراهيم',
    nameEn: 'Kamal Ibrahim',
    departmentAr: 'الإدارة المالية والمصرفية',
    extension: '201',
    mobile: '+966 50 222 3344',
    roleAr: 'المدير المالي (CFO)',
    status: 'in_meeting',
  },
  {
    id: 'dir_03',
    nameAr: 'أ. رأفت عبد العال',
    nameEn: 'Raafat Abdel Aal',
    departmentAr: 'الشؤون القانونية والعقود',
    extension: '402',
    mobile: '+966 50 444 5566',
    roleAr: 'مدير الشؤون القانونية',
    status: 'available',
  },
  {
    id: 'dir_04',
    nameAr: 'م. شريف حسني',
    nameEn: 'Eng. Sherif Hosny',
    departmentAr: 'المكتب الفني والدراسات',
    extension: '305',
    mobile: '+966 50 555 6677',
    roleAr: 'مدير المكتب الفني',
    status: 'available',
  },
  {
    id: 'dir_05',
    nameAr: 'أ. نورة الغامدي',
    nameEn: 'Noura Al-Ghamdi',
    departmentAr: 'الموارد البشرية والخدمات المشتركة',
    extension: '501',
    mobile: '+966 50 777 8899',
    roleAr: 'مديرة الموارد البشرية',
    status: 'available',
  },
];

const INITIAL_CONTRACTOR_PASSES: ContractorPass[] = [
  {
    id: 'pass_01',
    passNumber: 'CP-2026-081',
    contractorCompanyAr: 'شركة كولينج إير للتهوية والتكييف',
    technicianNameAr: 'محمد فوزي الصعيدي',
    nationalId: '2399104812',
    workScopeAr: 'صيانة دورية واستبدال فلاتر التكييف المركزي بالدور 4 و 5',
    supervisedByAr: 'إدارة الخدمات والمرافق (أ. نبيل الفيشاوي)',
    entryTime: '08:00 ص',
    validUntil: '04:00 م (نهاية اليوم)',
    safetyBriefingCompleted: true,
    registeredToolsAr: 'حقيبة قياس ضغط غاز الفريون، مقياس رقمي، سلم تلسكوبي، ومفك شحن',
    status: 'active',
  },
  {
    id: 'pass_02',
    passNumber: 'CP-2026-082',
    contractorCompanyAr: 'أوتيس العالمية للمصاعد',
    technicianNameAr: 'م. حسن العبدلي',
    nationalId: '1099238491',
    workScopeAr: 'فحص الحساسات الإلكترونية والأمان لمصاعد البرج الرئيسية',
    supervisedByAr: 'مسؤول الأمن والسلامة المهنية (أ. فيصل الدوسري)',
    entryTime: '09:10 ص',
    validUntil: '01:00 م',
    safetyBriefingCompleted: true,
    registeredToolsAr: 'جهاز فحص كمبيوتر المصاعد المحمول، عدة يدوية معزولة 1000V',
    status: 'active',
  },
];

const ReceptionContext = createContext<ReceptionContextType | undefined>(undefined);

export const ReceptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>(INITIAL_ROOMS);
  const [reservations, setReservations] = useState<RoomReservation[]>(INITIAL_RESERVATIONS);
  const [parcels, setParcels] = useState<InboundParcel[]>(INITIAL_PARCELS);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>(INITIAL_CALLS);
  const [corporateDirectory] = useState<CorporateContact[]>(CORPORATE_DIRECTORY);
  const [contractorPasses, setContractorPasses] = useState<ContractorPass[]>(INITIAL_CONTRACTOR_PASSES);
  const [selectedVisitorForBadge, setSelectedVisitorForBadge] = useState<Visitor | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Visitor check-in
  const checkInVisitor = (visitorData: Omit<Visitor, 'id' | 'entryTime' | 'status' | 'qrCode'>): Visitor => {
    const badgeNum = `V-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'م' : 'ص'}`;
    const newVisitor: Visitor = {
      ...visitorData,
      id: `vis_${Date.now()}`,
      entryTime: timeStr,
      status: 'checked_in',
      badgeNumber: badgeNum,
      qrCode: `ARKAN-VIS-${badgeNum}-${now.getFullYear()}`,
    };

    setVisitors(prev => [newVisitor, ...prev]);
    showToast(`تم تسجيل دخول ${newVisitor.nameAr} وإرسال تنبيه فوري للمستضيف: ${newVisitor.hostEmployeeAr}`);
    return newVisitor;
  };

  // Visitor check-out
  const checkOutVisitor = (id: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'م' : 'ص'}`;
    setVisitors(prev =>
      prev.map(v => (v.id === id ? { ...v, status: 'checked_out', exitTime: timeStr } : v))
    );
    showToast('تم تسجيل مغادرة الزائر واستعادة تصريح الدخول بنجاح');
  };

  // Room booking
  const bookMeetingRoom = (reservation: Omit<RoomReservation, 'id' | 'hospitalityStatus'>) => {
    const newRes: RoomReservation = {
      ...reservation,
      id: `res_${Date.now()}`,
      hospitalityStatus: reservation.cateringRequired ? 'ordered' : 'delivered',
    };

    setReservations(prev => [newRes, ...prev]);
    setMeetingRooms(prev =>
      prev.map(r =>
        r.id === reservation.roomId
          ? {
              ...r,
              isOccupied: true,
              currentMeeting: {
                titleAr: reservation.titleAr,
                hostAr: reservation.hostEmployeeAr,
                time: reservation.timeSlot,
                attendees: reservation.attendeesCount,
              },
            }
          : r
      )
    );

    showToast(`تم حجز ${reservation.roomNameAr} بنجاح ${reservation.cateringRequired ? 'وتوجيه طلب الضيافة للخدمات' : ''}`);
  };

  const updateHospitalityStatus = (resId: string, status: 'ordered' | 'preparing' | 'delivered') => {
    setReservations(prev =>
      prev.map(r => (r.id === resId ? { ...r, hospitalityStatus: status } : r))
    );
    showToast(`تم تحديث حالة طلب الضيافة إلى: ${status === 'delivered' ? 'تم التقديم' : status === 'preparing' ? 'جاري التحضير' : 'تم الطلب'}`);
  };

  // Parcel Ingestion
  const addParcel = (parcel: Omit<InboundParcel, 'id' | 'arrivalTimestamp' | 'status'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'م' : 'ص'}`;
    const newParcel: InboundParcel = {
      ...parcel,
      id: `parc_${Date.now()}`,
      arrivalTimestamp: timeStr,
      status: 'pending_handover',
    };
    setParcels(prev => [newParcel, ...prev]);
    showToast(`تم قيد الشحنة رقم ${newParcel.trackingNumber} وإشعار المستلم ${newParcel.recipientEmployeeAr}`);
  };

  // Confirm Parcel Pickup
  const confirmParcelPickup = (id: string) => {
    const now = new Date();
    const timeStr = `اليوم - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'م' : 'ص'}`;
    setParcels(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'received', handedOverAt: timeStr } : p))
    );
    showToast('تم توثيق استلام الطرد وتوقيع الموظف المستلم بنجاح');
  };

  // Call Log
  const addCallLog = (call: Omit<CallLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'م' : 'ص'}`;
    const newCall: CallLogEntry = {
      ...call,
      id: `call_${Date.now()}`,
      timestamp: timeStr,
    };
    setCallLogs(prev => [newCall, ...prev]);
    showToast('تم تسجيل المكالمة في سجل السنترال بنجاح');
  };

  // Contractor Pass
  const issueContractorPass = (pass: Omit<ContractorPass, 'id' | 'passNumber' | 'entryTime' | 'status'>) => {
    const passNum = `CP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'م' : 'ص'}`;
    const newPass: ContractorPass = {
      ...pass,
      id: `pass_${Date.now()}`,
      passNumber: passNum,
      entryTime: timeStr,
      status: 'active',
    };
    setContractorPasses(prev => [newPass, ...prev]);
    showToast(`تم إصدار تصريح الدخول رقم ${passNum} للفني ${newPass.technicianNameAr}`);
  };

  const revokeContractorPass = (id: string) => {
    setContractorPasses(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'expired' } : p))
    );
    showToast('تم استعادة وإنهاء تصريح الدخول المؤقت');
  };

  // KPI Calculations
  const activeVisitorsCount = visitors.filter(v => v.status === 'checked_in').length;
  const todayScheduledCount = visitors.filter(v => v.status === 'expected').length + activeVisitorsCount;
  const occupiedRoomsCount = meetingRooms.filter(r => r.isOccupied).length;
  const pendingParcelsCount = parcels.filter(p => p.status === 'pending_handover').length;

  return (
    <ReceptionContext.Provider
      value={{
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
        occupiedRoomsCount,
        pendingParcelsCount,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ReceptionContext.Provider>
  );
};

export const useReception = (): ReceptionContextType => {
  const context = useContext(ReceptionContext);
  if (!context) {
    throw new Error('useReception must be used within a ReceptionProvider');
  }
  return context;
};
