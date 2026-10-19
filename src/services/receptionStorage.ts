/**
 * ECO ERP - Reception & Visitors (الاستقبال والزوار) Cloudflare D1 Storage & Synchronization Engine
 * 
 * Provides:
 * - 100% Zero Mock Data (Full relational D1 persistence across 5 tables).
 * - Instant optimistic UI updates with resilient local caching.
 * - Live background synchronization with Cloudflare D1 (/api/reception).
 * - Event broadcast ('eco-reception-updated') for reactive real-time multi-tab UI refresh.
 */

export interface AuditDiff {
  timestamp: string;
  userName: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface VisitorRecord {
  id: string;
  badge_code: string;
  visitor_name: string;
  visitor_organization?: string;
  national_id_or_passport?: string;
  id_type?: string;
  phone?: string;
  visitor_category?: string;
  company_id: string;
  branch_id?: string | null;
  department_name?: string;
  host_employee_id?: string | null;
  host_employee_name?: string;
  visit_purpose?: string;
  vehicle_plate?: string;
  belongings_notes?: string;
  check_in_time?: string;
  check_out_time?: string | null;
  visit_date?: string;
  status: 'inside' | 'expected' | 'checked_out';
  attachment_data?: string | null;
  attachment_name?: string | null;
  audit_log_json?: string | AuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface RoomBookingRecord {
  id: string;
  booking_code: string;
  room_name: string;
  company_id: string;
  branch_id?: string | null;
  organizer_name?: string;
  department_name?: string;
  meeting_title: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  attendees_count: number;
  hospitality_requests?: string;
  equipment_needed?: string;
  status: 'مؤكد' | 'جاري الآن' | 'مكتمل' | 'ملغي';
  notes?: string;
  audit_log_json?: string | AuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface ParcelRecord {
  id: string;
  tracking_code: string;
  direction: 'وارد' | 'صادر';
  courier_company: string;
  awb_number?: string;
  sender_name: string;
  recipient_name: string;
  company_id: string;
  branch_id?: string | null;
  department_name?: string;
  parcel_type: string;
  received_at?: string;
  delivered_to_recipient_at?: string | null;
  status: 'في الاستقبال' | 'تم التسليم للمستلم' | 'تم الإرسال';
  attachment_data?: string | null;
  attachment_name?: string | null;
  notes?: string;
  audit_log_json?: string | AuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface CallRecord {
  id: string;
  caller_name: string;
  caller_organization?: string;
  caller_phone?: string;
  call_type: 'وارد' | 'صادر' | 'رسالة صوتية / تحويل';
  company_id: string;
  branch_id?: string | null;
  target_department?: string;
  target_employee_name?: string;
  subject: string;
  call_summary?: string;
  priority: 'عادي' | 'مهم' | 'عاجل جداً';
  status: 'بانتظار الرد' | 'تم التحويل' | 'تمت المعالجة';
  call_time?: string;
  audit_log_json?: string | AuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface ContractorPermitRecord {
  id: string;
  permit_code: string;
  contractor_company: string;
  supervisor_name: string;
  supervisor_phone: string;
  supervisor_national_id?: string;
  workers_count: number;
  workers_names_json?: string | string[];
  company_id: string;
  branch_id?: string | null;
  work_nature?: string;
  tools_and_equipment?: string;
  start_date: string;
  end_date: string;
  daily_hours?: string;
  safety_approval: 'معتمد' | 'قيد الفحص';
  status: 'ساري بالمنشأة' | 'مجدول' | 'منتهي / مغلق' | 'موقوف';
  attachment_data?: string | null;
  attachment_name?: string | null;
  audit_log_json?: string | AuditDiff[];
  created_at?: string;
  updated_at?: string;
}

export interface ReceptionStats {
  visitorsInside: number;
  visitorsTotal: number;
  roomsOccupied: number;
  parcelsPending: number;
  callsPending: number;
  permitsActive: number;
}

const STORAGE_KEYS = {
  VISITORS: 'eco_rec_visitors_v1',
  ROOMS: 'eco_rec_rooms_v1',
  PARCELS: 'eco_rec_parcels_v1',
  CALLS: 'eco_rec_calls_v1',
  PERMITS: 'eco_rec_permits_v1',
};

class ReceptionStorageService {
  private visitors: VisitorRecord[] = [];
  private rooms: RoomBookingRecord[] = [];
  private parcels: ParcelRecord[] = [];
  private calls: CallRecord[] = [];
  private permits: ContractorPermitRecord[] = [];
  private isSyncing = false;

  constructor() {
    this.loadFromLocalStorage();
    if (typeof window !== 'undefined') {
      setTimeout(() => this.syncFromCloud(), 150);
    }
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const v = localStorage.getItem(STORAGE_KEYS.VISITORS);
      this.visitors = v ? JSON.parse(v) : [];

      const r = localStorage.getItem(STORAGE_KEYS.ROOMS);
      this.rooms = r ? JSON.parse(r) : [];

      const p = localStorage.getItem(STORAGE_KEYS.PARCELS);
      this.parcels = p ? JSON.parse(p) : [];

      const c = localStorage.getItem(STORAGE_KEYS.CALLS);
      this.calls = c ? JSON.parse(c) : [];

      const pm = localStorage.getItem(STORAGE_KEYS.PERMITS);
      this.permits = pm ? JSON.parse(pm) : [];
    } catch (e) {
      console.warn('[ReceptionStorage] Local cache load warning:', e);
    }
  }

  private persistLocal() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(this.visitors));
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(this.rooms));
      localStorage.setItem(STORAGE_KEYS.PARCELS, JSON.stringify(this.parcels));
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(this.calls));
      localStorage.setItem(STORAGE_KEYS.PERMITS, JSON.stringify(this.permits));
    } catch {}
  }

  private notify() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eco-reception-updated'));
    }
  }

  public async syncFromCloud(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const [vRes, rRes, pRes, cRes, pmRes] = await Promise.all([
        fetch('/api/reception/visitors').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/reception/rooms').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/reception/parcels').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/reception/calls').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/reception/permits').then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      if (vRes && Array.isArray(vRes)) this.visitors = vRes;
      if (rRes && Array.isArray(rRes)) this.rooms = rRes;
      if (pRes && Array.isArray(pRes)) this.parcels = pRes;
      if (cRes && Array.isArray(cRes)) this.calls = cRes;
      if (pmRes && Array.isArray(pmRes)) this.permits = pmRes;

      this.persistLocal();
      this.notify();
    } catch (e) {
      console.warn('[ReceptionStorage] Cloud sync fallback:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  // ==========================================
  // 1. Visitors API
  // ==========================================
  public getVisitors(companyId?: string): VisitorRecord[] {
    if (!companyId || companyId === 'all') return this.visitors;
    return this.visitors.filter(v => v.company_id === companyId);
  }

  public async saveVisitor(visitorData: Partial<VisitorRecord>, currentUser = 'مدير النظام'): Promise<VisitorRecord> {
    const isNew = !visitorData.id || !this.visitors.some(v => v.id === visitorData.id);
    const now = new Date().toISOString();

    const existing = !isNew ? this.visitors.find(v => v.id === visitorData.id) : null;
    const auditLogs: AuditDiff[] = existing
      ? (typeof existing.audit_log_json === 'string' ? JSON.parse(existing.audit_log_json) : (existing.audit_log_json || []))
      : [];

    if (!isNew && existing) {
      if (visitorData.status && visitorData.status !== existing.status) {
        auditLogs.unshift({
          timestamp: now,
          userName: currentUser,
          action: 'تغيير الحالة',
          field: 'الحالة',
          oldValue: existing.status,
          newValue: visitorData.status,
        });
      }
    } else {
      auditLogs.unshift({
        timestamp: now,
        userName: currentUser,
        action: 'تسجيل دخول الزائر',
      });
    }

    const badgeCode = visitorData.badge_code || existing?.badge_code || `V-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: VisitorRecord = {
      id: visitorData.id || `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      badge_code: badgeCode,
      visitor_name: visitorData.visitor_name || 'زائر',
      visitor_organization: visitorData.visitor_organization || '',
      national_id_or_passport: visitorData.national_id_or_passport || '',
      id_type: visitorData.id_type || 'national_id',
      phone: visitorData.phone || '',
      visitor_category: visitorData.visitor_category || 'زائر أعمال',
      company_id: visitorData.company_id || 'tarabot',
      branch_id: visitorData.branch_id || null,
      department_name: visitorData.department_name || '',
      host_employee_id: visitorData.host_employee_id || null,
      host_employee_name: visitorData.host_employee_name || '',
      visit_purpose: visitorData.visit_purpose || '',
      vehicle_plate: visitorData.vehicle_plate || '',
      belongings_notes: visitorData.belongings_notes || '',
      check_in_time: visitorData.check_in_time || existing?.check_in_time || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      check_out_time: visitorData.check_out_time || existing?.check_out_time || null,
      visit_date: visitorData.visit_date || existing?.visit_date || now.split('T')[0],
      status: visitorData.status || existing?.status || 'inside',
      attachment_data: visitorData.attachment_data !== undefined ? visitorData.attachment_data : existing?.attachment_data || null,
      attachment_name: visitorData.attachment_name !== undefined ? visitorData.attachment_name : existing?.attachment_name || null,
      audit_log_json: auditLogs,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    if (isNew) {
      this.visitors.unshift(record);
    } else {
      const idx = this.visitors.findIndex(v => v.id === record.id);
      if (idx !== -1) this.visitors[idx] = record;
    }

    this.persistLocal();
    this.notify();

    // Async Cloudflare D1 Persist
    fetch('/api/reception/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(e => console.warn('[ReceptionStorage] D1 save error:', e));

    return record;
  }

  public async checkOutVisitor(id: string, currentUser = 'مدير النظام'): Promise<void> {
    const visitor = this.visitors.find(v => v.id === id);
    if (!visitor) return;

    await this.saveVisitor({
      ...visitor,
      status: 'checked_out',
      check_out_time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    }, currentUser);
  }

  public async deleteVisitor(id: string): Promise<void> {
    this.visitors = this.visitors.filter(v => v.id !== id);
    this.persistLocal();
    this.notify();

    fetch(`/api/reception/visitors/${id}`, { method: 'DELETE' })
      .catch(e => console.warn('[ReceptionStorage] D1 delete error:', e));
  }

  // ==========================================
  // 2. Room Bookings API
  // ==========================================
  public getBookings(companyId?: string): RoomBookingRecord[] {
    if (!companyId || companyId === 'all') return this.rooms;
    return this.rooms.filter(r => r.company_id === companyId);
  }

  public async saveBooking(bookingData: Partial<RoomBookingRecord>, currentUser = 'مدير النظام'): Promise<RoomBookingRecord> {
    const isNew = !bookingData.id || !this.rooms.some(r => r.id === bookingData.id);
    const now = new Date().toISOString();

    const existing = !isNew ? this.rooms.find(r => r.id === bookingData.id) : null;
    const auditLogs: AuditDiff[] = existing
      ? (typeof existing.audit_log_json === 'string' ? JSON.parse(existing.audit_log_json) : (existing.audit_log_json || []))
      : [];

    if (!isNew && existing) {
      if (bookingData.status && bookingData.status !== existing.status) {
        auditLogs.unshift({
          timestamp: now,
          userName: currentUser,
          action: 'تغيير حالة الحجز',
          field: 'الحالة',
          oldValue: existing.status,
          newValue: bookingData.status,
        });
      }
    } else {
      auditLogs.unshift({
        timestamp: now,
        userName: currentUser,
        action: 'تأكيد حجز القاعة',
      });
    }

    const bookingCode = bookingData.booking_code || existing?.booking_code || `RB-${Math.floor(100 + Math.random() * 900)}`;

    const record: RoomBookingRecord = {
      id: bookingData.id || `room_bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      booking_code: bookingCode,
      room_name: bookingData.room_name || 'مجلس الإدارة التنفيذي',
      company_id: bookingData.company_id || 'tarabot',
      branch_id: bookingData.branch_id || null,
      organizer_name: bookingData.organizer_name || '',
      department_name: bookingData.department_name || '',
      meeting_title: bookingData.meeting_title || 'اجتماع تنسيقي',
      booking_date: bookingData.booking_date || now.split('T')[0],
      start_time: bookingData.start_time || '10:00',
      end_time: bookingData.end_time || '11:00',
      attendees_count: Number(bookingData.attendees_count) || 1,
      hospitality_requests: bookingData.hospitality_requests || '',
      equipment_needed: bookingData.equipment_needed || '',
      status: bookingData.status || existing?.status || 'مؤكد',
      notes: bookingData.notes || '',
      audit_log_json: auditLogs,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    if (isNew) {
      this.rooms.unshift(record);
    } else {
      const idx = this.rooms.findIndex(r => r.id === record.id);
      if (idx !== -1) this.rooms[idx] = record;
    }

    this.persistLocal();
    this.notify();

    fetch('/api/reception/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(e => console.warn('[ReceptionStorage] D1 room save error:', e));

    return record;
  }

  public async deleteBooking(id: string): Promise<void> {
    this.rooms = this.rooms.filter(r => r.id !== id);
    this.persistLocal();
    this.notify();

    fetch(`/api/reception/rooms/${id}`, { method: 'DELETE' })
      .catch(e => console.warn('[ReceptionStorage] D1 room delete error:', e));
  }

  // ==========================================
  // 3. Parcels API
  // ==========================================
  public getParcels(companyId?: string): ParcelRecord[] {
    if (!companyId || companyId === 'all') return this.parcels;
    return this.parcels.filter(p => p.company_id === companyId);
  }

  public async saveParcel(parcelData: Partial<ParcelRecord>, currentUser = 'مدير النظام'): Promise<ParcelRecord> {
    const isNew = !parcelData.id || !this.parcels.some(p => p.id === parcelData.id);
    const now = new Date().toISOString();

    const existing = !isNew ? this.parcels.find(p => p.id === parcelData.id) : null;
    const auditLogs: AuditDiff[] = existing
      ? (typeof existing.audit_log_json === 'string' ? JSON.parse(existing.audit_log_json) : (existing.audit_log_json || []))
      : [];

    if (!isNew && existing) {
      if (parcelData.status && parcelData.status !== existing.status) {
        auditLogs.unshift({
          timestamp: now,
          userName: currentUser,
          action: 'تحديث حالة الطرد',
          field: 'الحالة',
          oldValue: existing.status,
          newValue: parcelData.status,
        });
      }
    } else {
      auditLogs.unshift({
        timestamp: now,
        userName: currentUser,
        action: 'تسجيل استلام الطرد',
      });
    }

    const trackingCode = parcelData.tracking_code || existing?.tracking_code || `PCL-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: ParcelRecord = {
      id: parcelData.id || `pcl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tracking_code: trackingCode,
      direction: parcelData.direction || 'وارد',
      courier_company: parcelData.courier_company || 'مندوب خاص',
      awb_number: parcelData.awb_number || '',
      sender_name: parcelData.sender_name || '',
      recipient_name: parcelData.recipient_name || '',
      company_id: parcelData.company_id || 'tarabot',
      branch_id: parcelData.branch_id || null,
      department_name: parcelData.department_name || '',
      parcel_type: parcelData.parcel_type || 'مستندات رسمية',
      received_at: parcelData.received_at || existing?.received_at || now,
      delivered_to_recipient_at: parcelData.delivered_to_recipient_at || existing?.delivered_to_recipient_at || null,
      status: parcelData.status || existing?.status || 'في الاستقبال',
      attachment_data: parcelData.attachment_data !== undefined ? parcelData.attachment_data : existing?.attachment_data || null,
      attachment_name: parcelData.attachment_name !== undefined ? parcelData.attachment_name : existing?.attachment_name || null,
      notes: parcelData.notes || '',
      audit_log_json: auditLogs,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    if (isNew) {
      this.parcels.unshift(record);
    } else {
      const idx = this.parcels.findIndex(p => p.id === record.id);
      if (idx !== -1) this.parcels[idx] = record;
    }

    this.persistLocal();
    this.notify();

    fetch('/api/reception/parcels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(e => console.warn('[ReceptionStorage] D1 parcel save error:', e));

    return record;
  }

  public async handoverParcel(id: string, currentUser = 'مدير النظام'): Promise<void> {
    const parcel = this.parcels.find(p => p.id === id);
    if (!parcel) return;

    await this.saveParcel({
      ...parcel,
      status: 'تم التسليم للمستلم',
      delivered_to_recipient_at: new Date().toISOString(),
    }, currentUser);
  }

  public async deleteParcel(id: string): Promise<void> {
    this.parcels = this.parcels.filter(p => p.id !== id);
    this.persistLocal();
    this.notify();

    fetch(`/api/reception/parcels/${id}`, { method: 'DELETE' })
      .catch(e => console.warn('[ReceptionStorage] D1 parcel delete error:', e));
  }

  // ==========================================
  // 4. Calls API
  // ==========================================
  public getCalls(companyId?: string): CallRecord[] {
    if (!companyId || companyId === 'all') return this.calls;
    return this.calls.filter(c => c.company_id === companyId);
  }

  public async saveCall(callData: Partial<CallRecord>, currentUser = 'مدير النظام'): Promise<CallRecord> {
    const isNew = !callData.id || !this.calls.some(c => c.id === callData.id);
    const now = new Date().toISOString();

    const existing = !isNew ? this.calls.find(c => c.id === callData.id) : null;
    const auditLogs: AuditDiff[] = existing
      ? (typeof existing.audit_log_json === 'string' ? JSON.parse(existing.audit_log_json) : (existing.audit_log_json || []))
      : [];

    if (!isNew && existing) {
      if (callData.status && callData.status !== existing.status) {
        auditLogs.unshift({
          timestamp: now,
          userName: currentUser,
          action: 'تحديث حالة المكالمة',
          field: 'الحالة',
          oldValue: existing.status,
          newValue: callData.status,
        });
      }
    } else {
      auditLogs.unshift({
        timestamp: now,
        userName: currentUser,
        action: 'تسجيل مكالمة جديدة',
      });
    }

    const record: CallRecord = {
      id: callData.id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      caller_name: callData.caller_name || 'متصل',
      caller_organization: callData.caller_organization || '',
      caller_phone: callData.caller_phone || '',
      call_type: callData.call_type || 'وارد',
      company_id: callData.company_id || 'tarabot',
      branch_id: callData.branch_id || null,
      target_department: callData.target_department || '',
      target_employee_name: callData.target_employee_name || '',
      subject: callData.subject || 'استفسار عام',
      call_summary: callData.call_summary || '',
      priority: callData.priority || 'عادي',
      status: callData.status || existing?.status || 'بانتظار الرد',
      call_time: callData.call_time || existing?.call_time || now,
      audit_log_json: auditLogs,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    if (isNew) {
      this.calls.unshift(record);
    } else {
      const idx = this.calls.findIndex(c => c.id === record.id);
      if (idx !== -1) this.calls[idx] = record;
    }

    this.persistLocal();
    this.notify();

    fetch('/api/reception/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(e => console.warn('[ReceptionStorage] D1 call save error:', e));

    return record;
  }

  public async deleteCall(id: string): Promise<void> {
    this.calls = this.calls.filter(c => c.id !== id);
    this.persistLocal();
    this.notify();

    fetch(`/api/reception/calls/${id}`, { method: 'DELETE' })
      .catch(e => console.warn('[ReceptionStorage] D1 call delete error:', e));
  }

  // ==========================================
  // 5. Contractor Permits API
  // ==========================================
  public getPermits(companyId?: string): ContractorPermitRecord[] {
    if (!companyId || companyId === 'all') return this.permits;
    return this.permits.filter(pm => pm.company_id === companyId);
  }

  public async savePermit(permitData: Partial<ContractorPermitRecord>, currentUser = 'مدير النظام'): Promise<ContractorPermitRecord> {
    const isNew = !permitData.id || !this.permits.some(pm => pm.id === permitData.id);
    const now = new Date().toISOString();

    const existing = !isNew ? this.permits.find(pm => pm.id === permitData.id) : null;
    const auditLogs: AuditDiff[] = existing
      ? (typeof existing.audit_log_json === 'string' ? JSON.parse(existing.audit_log_json) : (existing.audit_log_json || []))
      : [];

    if (!isNew && existing) {
      if (permitData.status && permitData.status !== existing.status) {
        auditLogs.unshift({
          timestamp: now,
          userName: currentUser,
          action: 'تحديث حالة التصريح',
          field: 'الحالة',
          oldValue: existing.status,
          newValue: permitData.status,
        });
      }
    } else {
      auditLogs.unshift({
        timestamp: now,
        userName: currentUser,
        action: 'إصدار تصريح مقاول',
      });
    }

    const permitCode = permitData.permit_code || existing?.permit_code || `P-${Math.floor(2000 + Math.random() * 8000)}`;

    const record: ContractorPermitRecord = {
      id: permitData.id || `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      permit_code: permitCode,
      contractor_company: permitData.contractor_company || 'شركة مقاولات',
      supervisor_name: permitData.supervisor_name || 'مشرف أعمال',
      supervisor_phone: permitData.supervisor_phone || '',
      supervisor_national_id: permitData.supervisor_national_id || '',
      workers_count: Number(permitData.workers_count) || 1,
      workers_names_json: permitData.workers_names_json || [],
      company_id: permitData.company_id || 'tarabot',
      branch_id: permitData.branch_id || null,
      work_nature: permitData.work_nature || 'أعمال صيانة وتشطيبات',
      tools_and_equipment: permitData.tools_and_equipment || '',
      start_date: permitData.start_date || now.split('T')[0],
      end_date: permitData.end_date || now.split('T')[0],
      daily_hours: permitData.daily_hours || '08:00 - 17:00',
      safety_approval: permitData.safety_approval || 'معتمد',
      status: permitData.status || existing?.status || 'ساري بالمنشأة',
      attachment_data: permitData.attachment_data !== undefined ? permitData.attachment_data : existing?.attachment_data || null,
      attachment_name: permitData.attachment_name !== undefined ? permitData.attachment_name : existing?.attachment_name || null,
      audit_log_json: auditLogs,
      created_at: existing?.created_at || now,
      updated_at: now,
    };

    if (isNew) {
      this.permits.unshift(record);
    } else {
      const idx = this.permits.findIndex(pm => pm.id === record.id);
      if (idx !== -1) this.permits[idx] = record;
    }

    this.persistLocal();
    this.notify();

    fetch('/api/reception/permits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(e => console.warn('[ReceptionStorage] D1 permit save error:', e));

    return record;
  }

  public async closePermit(id: string, currentUser = 'مدير النظام'): Promise<void> {
    const permit = this.permits.find(pm => pm.id === id);
    if (!permit) return;

    await this.savePermit({
      ...permit,
      status: 'منتهي / مغلق',
    }, currentUser);
  }

  public async deletePermit(id: string): Promise<void> {
    this.permits = this.permits.filter(pm => pm.id !== id);
    this.persistLocal();
    this.notify();

    fetch(`/api/reception/permits/${id}`, { method: 'DELETE' })
      .catch(e => console.warn('[ReceptionStorage] D1 permit delete error:', e));
  }

  // ==========================================
  // 6. Real-time Aggregated Stats
  // ==========================================
  public getStats(companyId?: string): ReceptionStats {
    const vList = this.getVisitors(companyId);
    const rList = this.getBookings(companyId);
    const pList = this.getParcels(companyId);
    const cList = this.getCalls(companyId);
    const pmList = this.getPermits(companyId);

    return {
      visitorsInside: vList.filter(v => v.status === 'inside').length,
      visitorsTotal: vList.length,
      roomsOccupied: rList.filter(r => r.status === 'جاري الآن').length,
      parcelsPending: pList.filter(p => p.status === 'في الاستقبال').length,
      callsPending: cList.filter(c => c.status === 'بانتظار الرد').length,
      permitsActive: pmList.filter(pm => pm.status === 'ساري بالمنشأة').length,
    };
  }
}

export const receptionStorage = new ReceptionStorageService();
