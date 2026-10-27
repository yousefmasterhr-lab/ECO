// Cloudflare Pages Functions - Reception & Front Desk Endpoints
import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import { ensureReceptionSchema } from '../_receptionDb';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

function parsePath(context: any): { resource: string; id: string | null } {
  const { params, request } = context;
  let pathSegments: string[] = [];

  if (params && params.path) {
    if (Array.isArray(params.path)) {
      pathSegments = params.path;
    } else if (typeof params.path === 'string') {
      pathSegments = params.path.split('/').filter(Boolean);
    }
  }

  if (pathSegments.length === 0) {
    const url = new URL(request.url);
    const sub = url.pathname.replace(/^\/api\/reception\/?/, '');
    pathSegments = sub.split('/').filter(Boolean);
  }

  const rawResource = pathSegments[0] || 'visitors';
  const id = pathSegments[1] || null;

  // Normalize aliases
  let resource = rawResource;
  if (rawResource === 'passes') resource = 'permits';
  if (rawResource === 'room_bookings') resource = 'rooms';

  return { resource, id };
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureReceptionSchema(env.DB);
    const { resource, id } = parsePath(context);
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const branchId = url.searchParams.get('branchId');
    const status = url.searchParams.get('status');

    switch (resource) {
      case 'stats': {
        // Aggregate live facility KPIs across the 5 tables
        let compFilter = '';
        const bindings: any[] = [];
        if (companyId && companyId !== 'all') {
          compFilter = ' WHERE company_id = ?';
          bindings.push(companyId);
        }

        const [visInside, visTotal, roomsOccupied, parcelsPending, callsPending, permitsActive] = await Promise.all([
          env.DB.prepare(`SELECT COUNT(*) as count FROM rec_visitors WHERE status = 'inside'${companyId && companyId !== 'all' ? ' AND company_id = ?' : ''}`)
            .bind(...(companyId && companyId !== 'all' ? [companyId] : [])).first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM rec_visitors${compFilter}`)
            .bind(...bindings).first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM rec_room_bookings WHERE status = 'جاري الآن'${companyId && companyId !== 'all' ? ' AND company_id = ?' : ''}`)
            .bind(...(companyId && companyId !== 'all' ? [companyId] : [])).first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM rec_parcels WHERE status = 'في الاستقبال'${companyId && companyId !== 'all' ? ' AND company_id = ?' : ''}`)
            .bind(...(companyId && companyId !== 'all' ? [companyId] : [])).first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM rec_calls WHERE status = 'بانتظار الرد'${companyId && companyId !== 'all' ? ' AND company_id = ?' : ''}`)
            .bind(...(companyId && companyId !== 'all' ? [companyId] : [])).first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM rec_contractor_permits WHERE status = 'ساري بالمنشأة'${companyId && companyId !== 'all' ? ' AND company_id = ?' : ''}`)
            .bind(...(companyId && companyId !== 'all' ? [companyId] : [])).first<{ count: number }>(),
        ]);

        return jsonResponse({
          success: true,
          stats: {
            visitorsInside: visInside?.count || 0,
            visitorsTotal: visTotal?.count || 0,
            roomsOccupied: roomsOccupied?.count || 0,
            parcelsPending: parcelsPending?.count || 0,
            callsPending: callsPending?.count || 0,
            permitsActive: permitsActive?.count || 0,
          },
        });
      }

      case 'visitors': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM rec_visitors WHERE id = ? OR badge_code = ?').bind(id, id).first();
          if (!row) return errorResponse(`الزائر غير موجود (${id})`, 404);
          return jsonResponse({ success: true, visitor: row });
        }
        let query = 'SELECT * FROM rec_visitors';
        const bindings: any[] = [];
        const conds: string[] = [];
        if (companyId && companyId !== 'all') {
          conds.push('company_id = ?');
          bindings.push(companyId);
        }
        if (branchId && branchId !== 'all') {
          conds.push('branch_id = ?');
          bindings.push(branchId);
        }
        if (status && status !== 'all') {
          conds.push('status = ?');
          bindings.push(status);
        }
        if (conds.length > 0) {
          query += ' WHERE ' + conds.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'rooms': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM rec_room_bookings WHERE id = ?').bind(id).first();
          if (!row) return errorResponse('الحجز غير موجود', 404);
          return jsonResponse({ success: true, booking: row });
        }
        let query = 'SELECT * FROM rec_room_bookings';
        const bindings: any[] = [];
        const conds: string[] = [];
        if (companyId && companyId !== 'all') {
          conds.push('company_id = ?');
          bindings.push(companyId);
        }
        if (branchId && branchId !== 'all') {
          conds.push('branch_id = ?');
          bindings.push(branchId);
        }
        if (conds.length > 0) {
          query += ' WHERE ' + conds.join(' AND ');
        }
        query += ' ORDER BY booking_date DESC, start_time DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'parcels': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM rec_parcels WHERE id = ? OR tracking_code = ?').bind(id, id).first();
          if (!row) return errorResponse('الشحنة غير موجودة', 404);
          return jsonResponse({ success: true, parcel: row });
        }
        let query = 'SELECT * FROM rec_parcels';
        const bindings: any[] = [];
        const conds: string[] = [];
        if (companyId && companyId !== 'all') {
          conds.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conds.length > 0) {
          query += ' WHERE ' + conds.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'calls': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM rec_calls WHERE id = ?').bind(id).first();
          if (!row) return errorResponse('المكالمة غير موجودة', 404);
          return jsonResponse({ success: true, call: row });
        }
        let query = 'SELECT * FROM rec_calls';
        const bindings: any[] = [];
        const conds: string[] = [];
        if (companyId && companyId !== 'all') {
          conds.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conds.length > 0) {
          query += ' WHERE ' + conds.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'permits': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM rec_contractor_permits WHERE id = ? OR permit_code = ?').bind(id, id).first();
          if (!row) return errorResponse('التصريح غير موجود', 404);
          return jsonResponse({ success: true, permit: row });
        }
        let query = 'SELECT * FROM rec_contractor_permits';
        const bindings: any[] = [];
        const conds: string[] = [];
        if (companyId && companyId !== 'all') {
          conds.push('company_id = ?');
          bindings.push(companyId);
        }
        if (conds.length > 0) {
          query += ' WHERE ' + conds.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      default:
        return errorResponse(`المورد غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(err.message || 'خطأ داخلي في الخادم', 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureReceptionSchema(env.DB);
    const { resource } = parsePath(context);
    const body: any = await request.json().catch(() => null);
    if (!body) return errorResponse('جسم الطلب غير صالح (JSON مطلوب)', 400);

    const now = new Date().toISOString();

    switch (resource) {
      case 'visitors': {
        const id = body.id || `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const badgeCode = body.badge_code || `V-${Math.floor(1000 + Math.random() * 9000)}`;

        await env.DB.prepare(`
          INSERT INTO rec_visitors (
            id, badge_code, visitor_name, visitor_organization, national_id_or_passport,
            id_type, phone, visitor_category, company_id, branch_id, department_name,
            host_employee_id, host_employee_name, visit_purpose, vehicle_plate,
            belongings_notes, check_in_time, check_out_time, visit_date, status,
            attachment_data, attachment_name, audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            badge_code = excluded.badge_code,
            visitor_name = excluded.visitor_name,
            visitor_organization = excluded.visitor_organization,
            national_id_or_passport = excluded.national_id_or_passport,
            id_type = excluded.id_type,
            phone = excluded.phone,
            visitor_category = excluded.visitor_category,
            company_id = excluded.company_id,
            branch_id = excluded.branch_id,
            department_name = excluded.department_name,
            host_employee_id = excluded.host_employee_id,
            host_employee_name = excluded.host_employee_name,
            visit_purpose = excluded.visit_purpose,
            vehicle_plate = excluded.vehicle_plate,
            belongings_notes = excluded.belongings_notes,
            check_in_time = excluded.check_in_time,
            check_out_time = excluded.check_out_time,
            visit_date = excluded.visit_date,
            status = excluded.status,
            attachment_data = excluded.attachment_data,
            attachment_name = excluded.attachment_name,
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          badgeCode,
          body.visitor_name || body.nameAr || 'زائر',
          body.visitor_organization || body.company || '',
          body.national_id_or_passport || body.nationalId || '',
          body.id_type || 'national_id',
          body.phone || body.mobile || '',
          body.visitor_category || (body.vip ? 'VIP / كبار الشخصيات' : 'زائر أعمال'),
          body.company_id || 'tarabot',
          body.branch_id || null,
          body.department_name || body.hostDepartmentAr || '',
          body.host_employee_id || null,
          body.host_employee_name || body.hostEmployeeAr || '',
          body.visit_purpose || body.purposeAr || '',
          body.vehicle_plate || '',
          body.belongings_notes || '',
          body.check_in_time || body.entryTime || new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          body.check_out_time || null,
          body.visit_date || now.split('T')[0],
          body.status || 'inside',
          body.attachment_data || null,
          body.attachment_name || null,
          typeof body.audit_log_json === 'string' ? body.audit_log_json : JSON.stringify(body.audit_log_json || []),
          body.created_at || now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM rec_visitors WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, visitor: created });
      }

      case 'rooms': {
        const id = body.id || `room_bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const bookingCode = body.booking_code || `RB-${Math.floor(100 + Math.random() * 900)}`;

        // Conflict check: Overlap validation
        const conflict = await env.DB.prepare(`
          SELECT * FROM rec_room_bookings
          WHERE room_name = ?
            AND booking_date = ?
            AND status != 'ملغي'
            AND id != ?
            AND (
              (start_time < ? AND end_time > ?) OR
              (start_time >= ? AND start_time < ?)
            )
        `).bind(
          body.room_name,
          body.booking_date,
          id,
          body.end_time,
          body.start_time,
          body.start_time,
          body.end_time
        ).first<any>();

        if (conflict) {
          return errorResponse(`القاعة (${body.room_name}) محجوزة بالفعل في نفس التوقيت والتاريخ (${conflict.start_time} - ${conflict.end_time})`, 409);
        }

        await env.DB.prepare(`
          INSERT INTO rec_room_bookings (
            id, booking_code, room_name, company_id, branch_id, organizer_name,
            department_name, meeting_title, booking_date, start_time, end_time,
            attendees_count, hospitality_requests, equipment_needed, status,
            notes, audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            booking_code = excluded.booking_code,
            room_name = excluded.room_name,
            company_id = excluded.company_id,
            branch_id = excluded.branch_id,
            organizer_name = excluded.organizer_name,
            department_name = excluded.department_name,
            meeting_title = excluded.meeting_title,
            booking_date = excluded.booking_date,
            start_time = excluded.start_time,
            end_time = excluded.end_time,
            attendees_count = excluded.attendees_count,
            hospitality_requests = excluded.hospitality_requests,
            equipment_needed = excluded.equipment_needed,
            status = excluded.status,
            notes = excluded.notes,
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          bookingCode,
          body.room_name,
          body.company_id || 'tarabot',
          body.branch_id || null,
          body.organizer_name || body.hostAr || '',
          body.department_name || '',
          body.meeting_title || body.titleAr || 'اجتماع عمل',
          body.booking_date || now.split('T')[0],
          body.start_time || '09:00',
          body.end_time || '10:00',
          Number(body.attendees_count) || 1,
          body.hospitality_requests || (body.cateringDetailsAr || ''),
          body.equipment_needed || '',
          body.status || 'مؤكد',
          body.notes || '',
          typeof body.audit_log_json === 'string' ? body.audit_log_json : JSON.stringify(body.audit_log_json || []),
          body.created_at || now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM rec_room_bookings WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, booking: created });
      }

      case 'parcels': {
        const id = body.id || `pcl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const trackingCode = body.tracking_code || `PCL-${Math.floor(1000 + Math.random() * 9000)}`;

        await env.DB.prepare(`
          INSERT INTO rec_parcels (
            id, tracking_code, direction, courier_company, awb_number,
            sender_name, recipient_name, company_id, branch_id, department_name,
            parcel_type, received_at, delivered_to_recipient_at, status,
            attachment_data, attachment_name, notes, audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            tracking_code = excluded.tracking_code,
            direction = excluded.direction,
            courier_company = excluded.courier_company,
            awb_number = excluded.awb_number,
            sender_name = excluded.sender_name,
            recipient_name = excluded.recipient_name,
            company_id = excluded.company_id,
            branch_id = excluded.branch_id,
            department_name = excluded.department_name,
            parcel_type = excluded.parcel_type,
            received_at = excluded.received_at,
            delivered_to_recipient_at = excluded.delivered_to_recipient_at,
            status = excluded.status,
            attachment_data = excluded.attachment_data,
            attachment_name = excluded.attachment_name,
            notes = excluded.notes,
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          trackingCode,
          body.direction || 'وارد',
          body.courier_company || body.courierName || 'مندوب خاص',
          body.awb_number || body.trackingNumber || '',
          body.sender_name || body.senderName || '',
          body.recipient_name || body.recipientEmployeeAr || '',
          body.company_id || 'tarabot',
          body.branch_id || null,
          body.department_name || body.recipientDepartmentAr || '',
          body.parcel_type || body.packageTypeAr || 'مستندات رسمية',
          body.received_at || body.arrivalTimestamp || now,
          body.delivered_to_recipient_at || body.handedOverAt || null,
          body.status || 'في الاستقبال',
          body.attachment_data || null,
          body.attachment_name || null,
          body.notes || '',
          typeof body.audit_log_json === 'string' ? body.audit_log_json : JSON.stringify(body.audit_log_json || []),
          body.created_at || now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM rec_parcels WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, parcel: created });
      }

      case 'calls': {
        const id = body.id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        await env.DB.prepare(`
          INSERT INTO rec_calls (
            id, caller_name, caller_organization, caller_phone, call_type,
            company_id, branch_id, target_department, target_employee_name,
            subject, call_summary, priority, status, call_time,
            audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            caller_name = excluded.caller_name,
            caller_organization = excluded.caller_organization,
            caller_phone = excluded.caller_phone,
            call_type = excluded.call_type,
            company_id = excluded.company_id,
            branch_id = excluded.branch_id,
            target_department = excluded.target_department,
            target_employee_name = excluded.target_employee_name,
            subject = excluded.subject,
            call_summary = excluded.call_summary,
            priority = excluded.priority,
            status = excluded.status,
            call_time = excluded.call_time,
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          body.caller_name || body.callerName || 'متصل',
          body.caller_organization || body.callerOrganization || '',
          body.caller_phone || body.callerPhone || '',
          body.call_type || 'وارد',
          body.company_id || 'tarabot',
          body.branch_id || null,
          body.target_department || '',
          body.target_employee_name || body.directedToEmployeeAr || '',
          body.subject || body.purposeAr || 'استفسار عام',
          body.call_summary || body.actionTakenAr || '',
          body.priority || 'عادي',
          body.status || 'بانتظار الرد',
          body.call_time || body.timestamp || now,
          typeof body.audit_log_json === 'string' ? body.audit_log_json : JSON.stringify(body.audit_log_json || []),
          body.created_at || now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM rec_calls WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, call: created });
      }

      case 'permits': {
        const id = body.id || `pmt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const permitCode = body.permit_code || `P-${Math.floor(2000 + Math.random() * 8000)}`;

        await env.DB.prepare(`
          INSERT INTO rec_contractor_permits (
            id, permit_code, contractor_company, supervisor_name, supervisor_phone,
            supervisor_national_id, workers_count, workers_names_json, company_id,
            branch_id, work_nature, tools_and_equipment, start_date, end_date,
            daily_hours, safety_approval, status, attachment_data, attachment_name,
            audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            permit_code = excluded.permit_code,
            contractor_company = excluded.contractor_company,
            supervisor_name = excluded.supervisor_name,
            supervisor_phone = excluded.supervisor_phone,
            supervisor_national_id = excluded.supervisor_national_id,
            workers_count = excluded.workers_count,
            workers_names_json = excluded.workers_names_json,
            company_id = excluded.company_id,
            branch_id = excluded.branch_id,
            work_nature = excluded.work_nature,
            tools_and_equipment = excluded.tools_and_equipment,
            start_date = excluded.start_date,
            end_date = excluded.end_date,
            daily_hours = excluded.daily_hours,
            safety_approval = excluded.safety_approval,
            status = excluded.status,
            attachment_data = excluded.attachment_data,
            attachment_name = excluded.attachment_name,
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          permitCode,
          body.contractor_company || body.contractorCompanyAr || '',
          body.supervisor_name || body.technicianNameAr || '',
          body.supervisor_phone || '',
          body.supervisor_national_id || body.nationalId || '',
          Number(body.workers_count) || 1,
          typeof body.workers_names_json === 'string' ? body.workers_names_json : JSON.stringify(body.workers_names_json || []),
          body.company_id || 'tarabot',
          body.branch_id || null,
          body.work_nature || body.workScopeAr || '',
          body.tools_and_equipment || body.registeredToolsAr || '',
          body.start_date || now.split('T')[0],
          body.end_date || now.split('T')[0],
          body.daily_hours || body.validUntil || '08:00 - 17:00',
          body.safety_approval || 'معتمد',
          body.status || 'ساري بالمنشأة',
          body.attachment_data || null,
          body.attachment_name || null,
          typeof body.audit_log_json === 'string' ? body.audit_log_json : JSON.stringify(body.audit_log_json || []),
          body.created_at || now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM rec_contractor_permits WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, permit: created });
      }

      default:
        return errorResponse(`المورد غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(err.message || 'خطأ داخلي في الخادم', 500);
  }
};

export const onRequestPut: PagesFunction = async (context) => {
  return onRequestPost(context);
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    const { resource, id } = parsePath(context);
    if (!id) return errorResponse('المعرف مفقود في مسار الحذف', 400);

    let table = '';
    if (resource === 'visitors') table = 'rec_visitors';
    else if (resource === 'rooms') table = 'rec_room_bookings';
    else if (resource === 'parcels') table = 'rec_parcels';
    else if (resource === 'calls') table = 'rec_calls';
    else if (resource === 'permits') table = 'rec_contractor_permits';
    else return errorResponse(`المورد غير معروف: ${resource}`, 404);

    await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    return jsonResponse({ success: true, deletedId: id });
  } catch (err: any) {
    return errorResponse(err.message || 'خطأ داخلي في الخادم', 500);
  }
};
