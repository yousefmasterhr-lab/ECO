// Cloudflare Pages Functions - Social Insurance (التأمينات الاجتماعية) Endpoints
import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import { ensureInsuranceSchema } from '../_insuranceDb';

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
    const sub = url.pathname.replace(/^\/api\/insurance\/?/, '');
    pathSegments = sub.split('/').filter(Boolean);
  }

  const rawResource = pathSegments[0] || 'operations';
  const id = pathSegments[1] || null;

  let resource = rawResource;
  if (rawResource === 'register') resource = 'employees';
  if (rawResource === 'wages') resource = 'remittances';

  return { resource, id };
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureInsuranceSchema(env.DB);
    const { resource, id } = parsePath(context);
    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');
    const status = url.searchParams.get('status');

    switch (resource) {
      case 'stats': {
        let compFilter = '';
        const bindings: any[] = [];
        if (companyId && companyId !== 'all') {
          compFilter = ' WHERE company_id = ?';
          bindings.push(companyId);
        }

        const [
          opsTotal,
          opsPending,
          opsReview,
          opsDone,
          opsRejected,
          opsDup,
          empTotal,
          formsTotal,
          remTotal,
          compTotal,
        ] = await Promise.all([
          env.DB.prepare(`SELECT COUNT(*) as count FROM ins_operations${compFilter}`)
            .bind(...bindings)
            .first<{ count: number }>(),
          env.DB.prepare(
            `SELECT COUNT(*) as count FROM ins_operations WHERE status = 'انتظار'${
              companyId && companyId !== 'all' ? ' AND company_id = ?' : ''
            }`
          )
            .bind(...(companyId && companyId !== 'all' ? [companyId] : []))
            .first<{ count: number }>(),
          env.DB.prepare(
            `SELECT COUNT(*) as count FROM ins_operations WHERE status = 'قيد المراجعة'${
              companyId && companyId !== 'all' ? ' AND company_id = ?' : ''
            }`
          )
            .bind(...(companyId && companyId !== 'all' ? [companyId] : []))
            .first<{ count: number }>(),
          env.DB.prepare(
            `SELECT COUNT(*) as count FROM ins_operations WHERE status = 'مكتمل'${
              companyId && companyId !== 'all' ? ' AND company_id = ?' : ''
            }`
          )
            .bind(...(companyId && companyId !== 'all' ? [companyId] : []))
            .first<{ count: number }>(),
          env.DB.prepare(
            `SELECT COUNT(*) as count FROM ins_operations WHERE status = 'مرفوض'${
              companyId && companyId !== 'all' ? ' AND company_id = ?' : ''
            }`
          )
            .bind(...(companyId && companyId !== 'all' ? [companyId] : []))
            .first<{ count: number }>(),
          env.DB.prepare(
            `SELECT COUNT(*) as count FROM ins_operations WHERE status = 'مكرر'${
              companyId && companyId !== 'all' ? ' AND company_id = ?' : ''
            }`
          )
            .bind(...(companyId && companyId !== 'all' ? [companyId] : []))
            .first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM ins_employees${compFilter}`)
            .bind(...bindings)
            .first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM ins_forms${compFilter}`)
            .bind(...bindings)
            .first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM ins_remittances${compFilter}`)
            .bind(...bindings)
            .first<{ count: number }>(),
          env.DB.prepare(`SELECT COUNT(*) as count FROM ins_compliance${compFilter}`)
            .bind(...bindings)
            .first<{ count: number }>(),
        ]);

        return jsonResponse({
          success: true,
          stats: {
            operationsTotal: opsTotal?.count || 0,
            operationsPending: opsPending?.count || 0,
            operationsReview: opsReview?.count || 0,
            operationsDone: opsDone?.count || 0,
            operationsRejected: opsRejected?.count || 0,
            operationsDuplicate: opsDup?.count || 0,
            employeesTotal: empTotal?.count || 0,
            formsTotal: formsTotal?.count || 0,
            remittancesTotal: remTotal?.count || 0,
            complianceTotal: compTotal?.count || 0,
          },
        });
      }

      case 'operations': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM ins_operations WHERE id = ? OR request_code = ?')
            .bind(id, id)
            .first();
          if (!row) return errorResponse(`العملية غير موجودة (${id})`, 404);
          return jsonResponse({ success: true, operation: row });
        }
        let query = 'SELECT * FROM ins_operations';
        const bindings: any[] = [];
        const conds: string[] = [];
        if (companyId && companyId !== 'all') {
          conds.push('company_id = ?');
          bindings.push(companyId);
        }
        if (status && status !== 'all') {
          conds.push('status = ?');
          bindings.push(status);
        }
        if (conds.length > 0) query += ' WHERE ' + conds.join(' AND ');
        query += ' ORDER BY seq_num DESC, created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'employees': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM ins_employees WHERE id = ? OR code = ?')
            .bind(id, id)
            .first();
          if (!row) return errorResponse(`الموظف غير موجود (${id})`, 404);
          return jsonResponse({ success: true, employee: row });
        }
        let query = 'SELECT * FROM ins_employees';
        const bindings: any[] = [];
        const conds: string[] = [];
        if (companyId && companyId !== 'all') {
          conds.push('company_id = ?');
          bindings.push(companyId);
        }
        if (status && status !== 'all') {
          conds.push('status = ?');
          bindings.push(status);
        }
        if (conds.length > 0) query += ' WHERE ' + conds.join(' AND ');
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'forms': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM ins_forms WHERE id = ? OR form_code = ?')
            .bind(id, id)
            .first();
          if (!row) return errorResponse('الاستمارة غير موجودة', 404);
          return jsonResponse({ success: true, form: row });
        }
        let query = 'SELECT * FROM ins_forms';
        const bindings: any[] = [];
        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'remittances': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM ins_remittances WHERE id = ? OR batch_code = ?')
            .bind(id, id)
            .first();
          if (!row) return errorResponse('دفعة التوريد غير موجودة', 404);
          return jsonResponse({ success: true, remittance: row });
        }
        let query = 'SELECT * FROM ins_remittances';
        const bindings: any[] = [];
        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY month_year DESC, created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      case 'compliance': {
        if (id) {
          const row = await env.DB.prepare('SELECT * FROM ins_compliance WHERE id = ? OR check_code = ?')
            .bind(id, id)
            .first();
          if (!row) return errorResponse('سجل الفحص غير موجود', 404);
          return jsonResponse({ success: true, check: row });
        }
        let query = 'SELECT * FROM ins_compliance';
        const bindings: any[] = [];
        if (companyId && companyId !== 'all') {
          query += ' WHERE company_id = ?';
          bindings.push(companyId);
        }
        query += ' ORDER BY due_date DESC, created_at DESC';
        const result = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(result.results || []);
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في استرجاع بيانات التأمينات: ${err.message}`, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);

    await ensureInsuranceSchema(env.DB);
    const { resource } = parsePath(context);
    const body = await request.json();
    const now = new Date().toISOString();

    const serializeAudit = (audit: any, defaultAction: string) => {
      if (typeof audit === 'string') return audit;
      if (Array.isArray(audit)) return JSON.stringify(audit);
      return JSON.stringify([
        {
          timestamp: now,
          userName: body.actorName || 'النظام',
          action: defaultAction,
        },
      ]);
    };

    switch (resource) {
      case 'operations': {
        // Support bulk import array or single item
        const items: any[] = Array.isArray(body.items) ? body.items : [body];
        const stmts = items.map((item, idx) => {
          const id = item.id || `ins_op_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
          const seqNum = Number(item.seq_num ?? item.seqNum ?? idx + 1);
          const requestCode = item.request_code || item.requestCode || `OP-${String(seqNum).padStart(4, '0')}`;
          const auditJson = serializeAudit(item.audit_log_json || item.auditLog, 'تسجيل عملية تأمينية جديدة');

          return env.DB.prepare(`
            INSERT INTO ins_operations (
              id, seq_num, request_code, incoming_number, incoming_date, request_type, status,
              company_id, company_name, employee_id, employee_code, employee_name,
              national_id, insurance_number, notes, attachment_data, attachment_name,
              audit_log_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              seq_num = excluded.seq_num,
              request_code = excluded.request_code,
              incoming_number = excluded.incoming_number,
              incoming_date = excluded.incoming_date,
              request_type = excluded.request_type,
              status = excluded.status,
              company_id = excluded.company_id,
              company_name = excluded.company_name,
              employee_id = excluded.employee_id,
              employee_code = excluded.employee_code,
              employee_name = excluded.employee_name,
              national_id = excluded.national_id,
              insurance_number = excluded.insurance_number,
              notes = excluded.notes,
              attachment_data = COALESCE(excluded.attachment_data, ins_operations.attachment_data),
              attachment_name = COALESCE(excluded.attachment_name, ins_operations.attachment_name),
              audit_log_json = excluded.audit_log_json,
              updated_at = excluded.updated_at
          `).bind(
            id,
            seqNum,
            requestCode,
            item.incoming_number ?? item.incomingNumber ?? '',
            item.incoming_date ?? item.incomingDate ?? now.slice(0, 10),
            item.request_type ?? item.requestType ?? 'س1',
            item.status || 'انتظار',
            item.company_id ?? item.companyId ?? '',
            item.company_name ?? item.companyName ?? '',
            item.employee_id ?? item.employeeId ?? '',
            item.employee_code ?? item.employeeCode ?? '',
            item.employee_name ?? item.employeeName ?? '',
            item.national_id ?? item.nationalId ?? '',
            item.insurance_number ?? item.insuranceNumber ?? '',
            item.notes ?? '',
            item.attachment_data ?? item.attachmentData ?? null,
            item.attachment_name ?? item.attachmentName ?? null,
            auditJson,
            item.created_at || now,
            now
          );
        });

        for (let i = 0; i < stmts.length; i += 20) {
          await env.DB.batch(stmts.slice(i, i + 20));
        }

        return jsonResponse({ success: true, count: items.length }, 201);
      }

      case 'employees': {
        const items: any[] = Array.isArray(body.items) ? body.items : [body];
        const stmts = items.map((item, idx) => {
          const id = item.id || `ins_emp_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`;
          const auditJson = serializeAudit(item.audit_log_json || item.auditLog, 'إضافة سجل موظف مؤمن عليه');
          const attachmentsJson =
            typeof item.attachments_json === 'string'
              ? item.attachments_json
              : JSON.stringify(item.attachments || item.attachments_json || []);

          return env.DB.prepare(`
            INSERT INTO ins_employees (
              id, code, name, national_id, insurance_number, company_id, company_name,
              office_name, mother_name, qualification, occupation, occupation_code,
              hire_date, sub_start_date, ins_date, resignation_date, resignation_reason,
              duration_type, sub_wage, comp_wage, status, s1_incoming_number,
              has_disability, disability_date, disability_percent,
              gov, center, village, street, building_no, phone,
              attachments_json, audit_log_json, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              code = excluded.code,
              name = excluded.name,
              national_id = excluded.national_id,
              insurance_number = excluded.insurance_number,
              company_id = excluded.company_id,
              company_name = excluded.company_name,
              office_name = excluded.office_name,
              mother_name = excluded.mother_name,
              qualification = excluded.qualification,
              occupation = excluded.occupation,
              occupation_code = excluded.occupation_code,
              hire_date = excluded.hire_date,
              sub_start_date = excluded.sub_start_date,
              ins_date = excluded.ins_date,
              resignation_date = excluded.resignation_date,
              resignation_reason = excluded.resignation_reason,
              duration_type = excluded.duration_type,
              sub_wage = excluded.sub_wage,
              comp_wage = excluded.comp_wage,
              status = excluded.status,
              s1_incoming_number = excluded.s1_incoming_number,
              has_disability = excluded.has_disability,
              disability_date = excluded.disability_date,
              disability_percent = excluded.disability_percent,
              gov = excluded.gov,
              center = excluded.center,
              village = excluded.village,
              street = excluded.street,
              building_no = excluded.building_no,
              phone = excluded.phone,
              attachments_json = excluded.attachments_json,
              audit_log_json = excluded.audit_log_json,
              updated_at = excluded.updated_at
          `).bind(
            id,
            item.code ?? '',
            item.name ?? '',
            item.national_id ?? item.nationalId ?? '',
            item.insurance_number ?? item.insuranceNumber ?? '',
            item.company_id ?? item.companyId ?? '',
            item.company_name ?? item.companyName ?? '',
            item.office_name ?? item.officeName ?? '',
            item.mother_name ?? item.motherName ?? '',
            item.qualification ?? '',
            item.occupation ?? '',
            item.occupation_code ?? item.occupationCode ?? '',
            item.hire_date ?? item.hireDate ?? '',
            item.sub_start_date ?? item.subStartDate ?? '',
            item.ins_date ?? item.insDate ?? '',
            item.resignation_date ?? item.resignationDate ?? '',
            item.resignation_reason ?? item.resignationReason ?? '',
            item.duration_type ?? item.durationType ?? 'نمطي',
            Number(item.sub_wage ?? item.subWage ?? 0),
            Number(item.comp_wage ?? item.compWage ?? 0),
            item.status || 'قيد المراجعة',
            item.s1_incoming_number ?? item.s1IncomingNumber ?? '',
            item.has_disability ?? item.hasDisability ?? 'لا',
            item.disability_date ?? item.disabilityDate ?? '',
            item.disability_percent ?? item.disabilityPercent ?? '',
            item.gov ?? '',
            item.center ?? '',
            item.village ?? '',
            item.street ?? '',
            item.building_no ?? item.buildingNo ?? '',
            item.phone ?? '',
            attachmentsJson,
            auditJson,
            item.created_at || now,
            now
          );
        });

        for (let i = 0; i < stmts.length; i += 20) {
          await env.DB.batch(stmts.slice(i, i + 20));
        }

        return jsonResponse({ success: true, count: items.length }, 201);
      }

      case 'forms': {
        const id = body.id || `ins_frm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const formCode = body.form_code || body.formCode || `FRM-${Date.now().toString().slice(-5)}`;
        const auditJson = serializeAudit(body.audit_log_json, `حفظ استمارة ${body.form_type || 'س1'}`);
        const payloadJson =
          typeof body.payload_json === 'string'
            ? body.payload_json
            : JSON.stringify(body.payload || body.payload_json || {});

        await env.DB.prepare(`
          INSERT INTO ins_forms (
            id, form_type, form_code, company_id, company_name,
            employee_id, employee_name, national_id, insurance_number,
            form_date, status, payload_json, attachment_data, attachment_name,
            audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            form_type = excluded.form_type,
            form_code = excluded.form_code,
            company_id = excluded.company_id,
            company_name = excluded.company_name,
            employee_id = excluded.employee_id,
            employee_name = excluded.employee_name,
            national_id = excluded.national_id,
            insurance_number = excluded.insurance_number,
            form_date = excluded.form_date,
            status = excluded.status,
            payload_json = excluded.payload_json,
            attachment_data = COALESCE(excluded.attachment_data, ins_forms.attachment_data),
            attachment_name = COALESCE(excluded.attachment_name, ins_forms.attachment_name),
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          body.form_type || 'س1',
          formCode,
          body.company_id || '',
          body.company_name || '',
          body.employee_id || '',
          body.employee_name || '',
          body.national_id || '',
          body.insurance_number || '',
          body.form_date || now.slice(0, 10),
          body.status || 'معتمد',
          payloadJson,
          body.attachment_data || null,
          body.attachment_name || null,
          auditJson,
          now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM ins_forms WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, form: created }, 201);
      }

      case 'remittances': {
        const id = body.id || `ins_rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const batchCode = body.batch_code || body.batchCode || `REM-${Date.now().toString().slice(-5)}`;
        const auditJson = serializeAudit(body.audit_log_json, 'إنشاء حافظة توريد اشتراكات تأمينية');

        await env.DB.prepare(`
          INSERT INTO ins_remittances (
            id, batch_code, month_year, company_id, company_name,
            employees_count, total_sub_wage, total_comp_wage,
            employee_share_total, employer_share_total, total_due,
            receipt_number, payment_date, status, notes,
            attachment_data, attachment_name, audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            batch_code = excluded.batch_code,
            month_year = excluded.month_year,
            company_id = excluded.company_id,
            company_name = excluded.company_name,
            employees_count = excluded.employees_count,
            total_sub_wage = excluded.total_sub_wage,
            total_comp_wage = excluded.total_comp_wage,
            employee_share_total = excluded.employee_share_total,
            employer_share_total = excluded.employer_share_total,
            total_due = excluded.total_due,
            receipt_number = excluded.receipt_number,
            payment_date = excluded.payment_date,
            status = excluded.status,
            notes = excluded.notes,
            attachment_data = COALESCE(excluded.attachment_data, ins_remittances.attachment_data),
            attachment_name = COALESCE(excluded.attachment_name, ins_remittances.attachment_name),
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          batchCode,
          body.month_year || now.slice(0, 7),
          body.company_id || '',
          body.company_name || '',
          Number(body.employees_count || 0),
          Number(body.total_sub_wage || 0),
          Number(body.total_comp_wage || 0),
          Number(body.employee_share_total || 0),
          Number(body.employer_share_total || 0),
          Number(body.total_due || 0),
          body.receipt_number || '',
          body.payment_date || '',
          body.status || 'مجدول للدفع',
          body.notes || '',
          body.attachment_data || null,
          body.attachment_name || null,
          auditJson,
          now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM ins_remittances WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, remittance: created }, 201);
      }

      case 'compliance': {
        const id = body.id || `ins_cmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const checkCode = body.check_code || body.checkCode || `CMP-${Date.now().toString().slice(-5)}`;
        const auditJson = serializeAudit(body.audit_log_json, 'إضافة بند فحص وامتثال تأميني');

        await env.DB.prepare(`
          INSERT INTO ins_compliance (
            id, check_code, title, category, company_id, company_name,
            inspector_name, due_date, status, score, findings,
            attachment_data, attachment_name, audit_log_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            check_code = excluded.check_code,
            title = excluded.title,
            category = excluded.category,
            company_id = excluded.company_id,
            company_name = excluded.company_name,
            inspector_name = excluded.inspector_name,
            due_date = excluded.due_date,
            status = excluded.status,
            score = excluded.score,
            findings = excluded.findings,
            attachment_data = COALESCE(excluded.attachment_data, ins_compliance.attachment_data),
            attachment_name = COALESCE(excluded.attachment_name, ins_compliance.attachment_name),
            audit_log_json = excluded.audit_log_json,
            updated_at = excluded.updated_at
        `).bind(
          id,
          checkCode,
          body.title || '',
          body.category || 'فحص دوري',
          body.company_id || '',
          body.company_name || '',
          body.inspector_name || '',
          body.due_date || now.slice(0, 10),
          body.status || 'قيد الفحص',
          Number(body.score ?? 100),
          body.findings || '',
          body.attachment_data || null,
          body.attachment_name || null,
          auditJson,
          now,
          now
        ).run();

        const created = await env.DB.prepare('SELECT * FROM ins_compliance WHERE id = ?').bind(id).first();
        return jsonResponse({ success: true, check: created }, 201);
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في حفظ بيانات التأمينات: ${err.message}`, 500);
  }
};

export const onRequestPut: PagesFunction = async (context) => {
  return onRequestPost(context);
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);

    await ensureInsuranceSchema(env.DB);
    const { resource, id } = parsePath(context);
    const url = new URL(request.url);
    const queryId = id || url.searchParams.get('id');
    const idsParam = url.searchParams.get('ids');

    const tableMap: Record<string, string> = {
      operations: 'ins_operations',
      employees: 'ins_employees',
      forms: 'ins_forms',
      remittances: 'ins_remittances',
      compliance: 'ins_compliance',
    };

    const tableName = tableMap[resource];
    if (!tableName) {
      return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }

    if (idsParam) {
      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        const stmts = ids.map((itemId) =>
          env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(itemId)
        );
        for (let i = 0; i < stmts.length; i += 20) {
          await env.DB.batch(stmts.slice(i, i + 20));
        }
        return jsonResponse({ success: true, deletedCount: ids.length });
      }
    }

    if (!queryId) {
      return errorResponse('معرف السجل مطلوب للحذف', 400);
    }

    await env.DB.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(queryId).run();
    return jsonResponse({ success: true, deletedId: queryId });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف سجل التأمينات: ${err.message}`, 500);
  }
};
