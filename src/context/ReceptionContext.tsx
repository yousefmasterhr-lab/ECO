import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  receptionStorage,
  VisitorRecord,
  RoomBookingRecord,
  ParcelRecord,
  CallRecord,
  ContractorPermitRecord,
  ReceptionStats
} from '../services/receptionStorage';

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
  vehiclePlate?: string;
  belongingsNotes?: string;
  attachmentData?: string | null;
  attachmentName?: string | null;
  raw: VisitorRecord;
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
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  raw: RoomBookingRecord;
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
  attachmentData?: string | null;
  attachmentName?: string | null;
  raw: ParcelRecord;
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
  priority: string;
  raw: CallRecord;
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
  workersCount: number;
  attachmentData?: string | null;
  attachmentName?: string | null;
  raw: ContractorPermitRecord;
}

interface ReceptionContextType {
  // Visitors
  visitors: Visitor[];
  checkInVisitor: (visitorData: Partial<VisitorRecord>) => Promise<VisitorRecord>;
  checkOutVisitor: (id: string) => Promise<void>;
  deleteVisitor: (id: string) => Promise<void>;
  selectedVisitorForBadge: Visitor | null;
  setSelectedVisitorForBadge: (v: Visitor | null) => void;

  // Meeting Rooms
  meetingRooms: MeetingRoom[];
  reservations: RoomReservation[];
  bookMeetingRoom: (reservation: Partial<RoomBookingRecord>) => Promise<RoomBookingRecord>;
  deleteBooking: (id: string) => Promise<void>;
  updateHospitalityStatus: (resId: string, status: 'ordered' | 'preparing' | 'delivered') => Promise<void>;

  // Parcels
  parcels: InboundParcel[];
  addParcel: (parcel: Partial<ParcelRecord>) => Promise<ParcelRecord>;
  confirmParcelPickup: (id: string) => Promise<void>;
  deleteParcel: (id: string) => Promise<void>;

  // Calls
  callLogs: CallLogEntry[];
  addCallLog: (call: Partial<CallRecord>) => Promise<CallRecord>;
  deleteCall: (id: string) => Promise<void>;

  // Contractor Site Passes
  contractorPasses: ContractorPass[];
  issueContractorPass: (pass: Partial<ContractorPermitRecord>) => Promise<ContractorPermitRecord>;
  revokeContractorPass: (id: string) => Promise<void>;
  deleteContractorPass: (id: string) => Promise<void>;

  // Live KPI Counters
  activeVisitorsCount: number;
  todayScheduledCount: number;
  occupiedRoomsCount: number;
  pendingParcelsCount: number;
  stats: ReceptionStats;

  // Toast notification state
  toastMessage: string | null;
  showToast: (msg: string) => void;
  syncFromCloud: () => Promise<void>;
}

const mapVisitor = (r: VisitorRecord): Visitor => ({
  id: r.id,
  nameAr: r.visitor_name,
  nameEn: r.visitor_name,
  company: r.visitor_organization || '',
  nationalId: r.national_id_or_passport || '',
  mobile: r.phone || '',
  hostEmployeeAr: r.host_employee_name || '',
  hostEmployeeEn: r.host_employee_name || '',
  hostDepartmentAr: r.department_name || '',
  purposeAr: r.visit_purpose || '',
  purposeEn: r.visit_purpose || '',
  badgeNumber: r.badge_code,
  entryTime: r.check_in_time || '',
  exitTime: r.check_out_time || undefined,
  status: r.status === 'inside' ? 'checked_in' : r.status === 'checked_out' ? 'checked_out' : 'expected',
  qrCode: `ECO-VIS-${r.badge_code}-${r.visit_date || 'PASS'}`,
  vip: r.visitor_category?.includes('VIP'),
  vehiclePlate: r.vehicle_plate,
  belongingsNotes: r.belongings_notes,
  attachmentData: r.attachment_data,
  attachmentName: r.attachment_name,
  raw: r,
});

const mapBooking = (r: RoomBookingRecord): RoomReservation => ({
  id: r.id,
  roomId: r.id,
  roomNameAr: r.room_name,
  titleAr: r.meeting_title,
  hostEmployeeAr: r.organizer_name || '',
  departmentAr: r.department_name || '',
  timeSlot: `${r.start_time} - ${r.end_time}`,
  attendeesCount: r.attendees_count,
  amenities: r.equipment_needed ? [r.equipment_needed] : [],
  cateringRequired: Boolean(r.hospitality_requests),
  cateringDetailsAr: r.hospitality_requests,
  hospitalityStatus: 'ordered',
  bookingDate: r.booking_date,
  startTime: r.start_time,
  endTime: r.end_time,
  status: r.status,
  raw: r,
});

const mapParcel = (r: ParcelRecord): InboundParcel => ({
  id: r.id,
  trackingNumber: r.tracking_code,
  courierName: r.courier_company,
  packageTypeAr: r.parcel_type,
  senderName: r.sender_name,
  recipientEmployeeAr: r.recipient_name,
  recipientDepartmentAr: r.department_name || '',
  arrivalTimestamp: r.received_at || '',
  status: r.status === 'تم التسليم للمستلم' ? 'received' : 'pending_handover',
  handedOverAt: r.delivered_to_recipient_at || undefined,
  isOfficialTransmittal: r.parcel_type.includes('مستندات'),
  attachmentData: r.attachment_data,
  attachmentName: r.attachment_name,
  raw: r,
});

const mapCall = (r: CallRecord): CallLogEntry => ({
  id: r.id,
  timestamp: r.call_time || '',
  callerName: r.caller_name,
  callerOrganization: r.caller_organization || '',
  callerPhone: r.caller_phone || '',
  directedToEmployeeAr: r.target_employee_name || '',
  purposeAr: r.subject,
  actionTakenAr: r.call_summary || '',
  status: r.status === 'تم التحويل' ? 'transferred' : r.status === 'تمت المعالجة' ? 'message_taken' : 'callback_requested',
  priority: r.priority,
  raw: r,
});

const mapPermit = (r: ContractorPermitRecord): ContractorPass => ({
  id: r.id,
  passNumber: r.permit_code,
  contractorCompanyAr: r.contractor_company,
  technicianNameAr: r.supervisor_name,
  nationalId: r.supervisor_national_id || '',
  workScopeAr: r.work_nature || '',
  supervisedByAr: '',
  entryTime: r.daily_hours || '08:00',
  validUntil: `${r.start_date} إلى ${r.end_date}`,
  safetyBriefingCompleted: r.safety_approval === 'معتمد',
  registeredToolsAr: r.tools_and_equipment || '',
  status: r.status === 'ساري بالمنشأة' ? 'active' : r.status === 'منتهي / مغلق' ? 'expired' : 'revoked',
  workersCount: r.workers_count,
  attachmentData: r.attachment_data,
  attachmentName: r.attachment_name,
  raw: r,
});

const ReceptionContext = createContext<ReceptionContextType | undefined>(undefined);

export const ReceptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitorRecords, setVisitorRecords] = useState<VisitorRecord[]>(() => receptionStorage.getVisitors());
  const [roomRecords, setRoomRecords] = useState<RoomBookingRecord[]>(() => receptionStorage.getBookings());
  const [parcelRecords, setParcelRecords] = useState<ParcelRecord[]>(() => receptionStorage.getParcels());
  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => receptionStorage.getCalls());
  const [permitRecords, setPermitRecords] = useState<ContractorPermitRecord[]>(() => receptionStorage.getPermits());
  const [selectedVisitorForBadge, setSelectedVisitorForBadge] = useState<Visitor | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshState = useCallback(() => {
    setVisitorRecords(receptionStorage.getVisitors());
    setRoomRecords(receptionStorage.getBookings());
    setParcelRecords(receptionStorage.getParcels());
    setCallRecords(receptionStorage.getCalls());
    setPermitRecords(receptionStorage.getPermits());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refreshState();
    window.addEventListener('eco-reception-updated', handleUpdate);
    return () => window.removeEventListener('eco-reception-updated', handleUpdate);
  }, [refreshState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Actions
  const checkInVisitor = async (data: Partial<VisitorRecord>): Promise<VisitorRecord> => {
    const created = await receptionStorage.saveVisitor(data);
    showToast(`تم تسجيل دخول ${created.visitor_name} بنجاح وإصدار شارة الدخول ${created.badge_code}`);
    return created;
  };

  const checkOutVisitor = async (id: string): Promise<void> => {
    await receptionStorage.checkOutVisitor(id);
    showToast('تم تسجيل مغادرة الزائر بنجاح وإغلاق تصريح الدخول');
  };

  const deleteVisitor = async (id: string): Promise<void> => {
    await receptionStorage.deleteVisitor(id);
    showToast('تم حذف سجل الزائر بنجاح');
  };

  const bookMeetingRoom = async (data: Partial<RoomBookingRecord>): Promise<RoomBookingRecord> => {
    const created = await receptionStorage.saveBooking(data);
    showToast(`تم تأكيد حجز قاعة (${created.room_name}) بنجاح`);
    return created;
  };

  const deleteBooking = async (id: string): Promise<void> => {
    await receptionStorage.deleteBooking(id);
    showToast('تم إلغاء وحذف حجز القاعة بنجاح');
  };

  const updateHospitalityStatus = async (resId: string, status: 'ordered' | 'preparing' | 'delivered'): Promise<void> => {
    const booking = roomRecords.find(r => r.id === resId);
    if (booking) {
      await receptionStorage.saveBooking({
        ...booking,
        status: status === 'delivered' ? 'مكتمل' : 'جاري الآن',
      });
      showToast(`تم تحديث حالة الضيافة إلى: ${status === 'delivered' ? 'تم التقديم' : 'جاري التحضير'}`);
    }
  };

  const addParcel = async (data: Partial<ParcelRecord>): Promise<ParcelRecord> => {
    const created = await receptionStorage.saveParcel(data);
    showToast(`تم تسجيل الشحنة رقم ${created.tracking_code} بنجاح في الاستقبال`);
    return created;
  };

  const confirmParcelPickup = async (id: string): Promise<void> => {
    await receptionStorage.handoverParcel(id);
    showToast('تم توثيق تسليم الشحنة للمستلم بنجاح');
  };

  const deleteParcel = async (id: string): Promise<void> => {
    await receptionStorage.deleteParcel(id);
    showToast('تم حذف سجل الشحنة بنجاح');
  };

  const addCallLog = async (data: Partial<CallRecord>): Promise<CallRecord> => {
    const created = await receptionStorage.saveCall(data);
    showToast(`تم قيد مكالمة ${created.caller_name} في السجل بنجاح`);
    return created;
  };

  const deleteCall = async (id: string): Promise<void> => {
    await receptionStorage.deleteCall(id);
    showToast('تم حذف سجل المكالمة بنجاح');
  };

  const issueContractorPass = async (data: Partial<ContractorPermitRecord>): Promise<ContractorPermitRecord> => {
    const created = await receptionStorage.savePermit(data);
    showToast(`تم إصدار تصريح المقاولين رقم ${created.permit_code} بنجاح`);
    return created;
  };

  const revokeContractorPass = async (id: string): Promise<void> => {
    await receptionStorage.closePermit(id);
    showToast('تم إنهاء وإغلاق تصريح المقاول بنجاح');
  };

  const deleteContractorPass = async (id: string): Promise<void> => {
    await receptionStorage.deletePermit(id);
    showToast('تم حذف تصريح المقاول بنجاح');
  };

  const syncFromCloud = async (): Promise<void> => {
    await receptionStorage.syncFromCloud();
    refreshState();
  };

  // Mapped entities for UI consumption
  const visitors = visitorRecords.map(mapVisitor);
  const reservations = roomRecords.map(mapBooking);
  const parcels = parcelRecords.map(mapParcel);
  const callLogs = callRecords.map(mapCall);
  const contractorPasses = permitRecords.map(mapPermit);

  // Derived meeting room objects from reservations
  const meetingRooms: MeetingRoom[] = [
    {
      id: 'room_vip_board',
      nameAr: 'مجلس الإدارة التنفيذي (VIP Boardroom)',
      nameEn: 'Executive Boardroom',
      capacity: 18,
      floor: 'الدور 5 - الإدارة العليا',
      amenities: ['شاشة 4K تفاعلية 85 بوصة', 'نظام مؤتمرات فيديو Polycom', 'سبورة ذكية', 'بوفيه وضيافة VIP'],
      isOccupied: reservations.some(r => r.roomNameAr.includes('مجلس') && r.status === 'جاري الآن'),
    },
    {
      id: 'room_innovation',
      nameAr: 'قاعة الابتكار والمشروعات (Innovation Hub)',
      nameEn: 'Innovation & Projects Room',
      capacity: 10,
      floor: 'الدور 4 - المكتب الفني',
      amenities: ['شاشات عرض مزدوجة', 'نظام صوتي محيطي', 'سبورة بانورامية'],
      isOccupied: reservations.some(r => r.roomNameAr.includes('الابتكار') && r.status === 'جاري الآن'),
    },
    {
      id: 'room_meeting_a',
      nameAr: 'قاعة الاجتماعات الرئيسية (Meeting Hall A)',
      nameEn: 'Main Meeting Hall A',
      capacity: 14,
      floor: 'الدور 3 - العمليات',
      amenities: ['جهاز إسقاط ضوئي Projector', 'ميكروفونات مدمجة طاولة'],
      isOccupied: reservations.some(r => r.roomNameAr.includes('Hall A') && r.status === 'جاري الآن'),
    },
  ];

  const stats = receptionStorage.getStats();

  return (
    <ReceptionContext.Provider
      value={{
        visitors,
        checkInVisitor,
        checkOutVisitor,
        deleteVisitor,
        selectedVisitorForBadge,
        setSelectedVisitorForBadge,
        meetingRooms,
        reservations,
        bookMeetingRoom,
        deleteBooking,
        updateHospitalityStatus,
        parcels,
        addParcel,
        confirmParcelPickup,
        deleteParcel,
        callLogs,
        addCallLog,
        deleteCall,
        contractorPasses,
        issueContractorPass,
        revokeContractorPass,
        deleteContractorPass,
        activeVisitorsCount: stats.visitorsInside,
        todayScheduledCount: stats.visitorsTotal,
        occupiedRoomsCount: stats.roomsOccupied,
        pendingParcelsCount: stats.parcelsPending,
        stats,
        toastMessage,
        showToast,
        syncFromCloud,
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
