// Cloudflare Pages Functions - Project Correspondence Management System (CTS / PCMS) API Routes
import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import { ensureCTSSchema } from '../_ctsDb';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

function parsePath(context: any): { resource: string; id: string | null; subAction: string | null } {
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
    const sub = url.pathname.replace(/^\/api\/cts\/?/, '');
    pathSegments = sub.split('/').filter(Boolean);
  }

  const resource = pathSegments[0] || 'stats';
  const id = pathSegments[1] || null;
  const subAction = pathSegments[2] || null;

  return { resource, id, subAction };
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureCTSSchema(env.DB);
    const { resource, id } = parsePath(context);
    const url = new URL(request.url);
    const projectRef = url.searchParams.get('projectRef') || url.searchParams.get('projectId');
    const docType = url.searchParams.get('docType');
    const classification = url.searchParams.get('classification');
    const status = url.searchParams.get('status');

    switch (resource) {
      case 'stats': {
        let projectFilter = '';
        const params: any[] = [];
        if (projectRef && projectRef !== 'ALL') {
          projectFilter = ' WHERE project_ref = ?';
          params.push(projectRef);
        }

        const totalLetters = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM cts_correspondences${projectFilter}`
        ).bind(...params).first<{ count: number }>();

        const inbounds = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM cts_correspondences WHERE doc_type = 'Incoming'${projectRef && projectRef !== 'ALL' ? ' AND project_ref = ?' : ''}`
        ).bind(...(projectRef && projectRef !== 'ALL' ? [projectRef] : [])).first<{ count: number }>();

        const outbounds = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM cts_correspondences WHERE doc_type = 'Outgoing' AND is_draft = 0${projectRef && projectRef !== 'ALL' ? ' AND project_ref = ?' : ''}`
        ).bind(...(projectRef && projectRef !== 'ALL' ? [projectRef] : [])).first<{ count: number }>();

        const drafts = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM cts_correspondences WHERE (is_draft = 1 OR status = 'Draft' OR status = 'Pending')${projectRef && projectRef !== 'ALL' ? ' AND project_ref = ?' : ''}`
        ).bind(...(projectRef && projectRef !== 'ALL' ? [projectRef] : [])).first<{ count: number }>();

        const replied = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM cts_correspondences WHERE doc_type = 'Incoming' AND status = 'Replied'${projectRef && projectRef !== 'ALL' ? ' AND project_ref = ?' : ''}`
        ).bind(...(projectRef && projectRef !== 'ALL' ? [projectRef] : [])).first<{ count: number }>();

        const projectsCount = await env.DB.prepare(
          `SELECT COUNT(*) as count FROM cts_projects WHERE project_status = 'Active'`
        ).first<{ count: number }>();

        const inCount = inbounds?.count || 0;
        const repCount = replied?.count || 0;
        const replyRate = inCount > 0 ? Math.round((repCount / inCount) * 100) : 100;

        return jsonResponse({
          totalLetters: totalLetters?.count || 0,
          inboundCount: inCount,
          outboundCount: outbounds?.count || 0,
          draftsCount: drafts?.count || 0,
          replyRate,
          activeProjectsCount: projectsCount?.count || 0,
        });
      }

      case 'projects': {
        let query = 'SELECT * FROM cts_projects';
        const bindings: any[] = [];
        if (id) {
          query += ' WHERE id = ?';
          bindings.push(id);
          const project = await env.DB.prepare(query).bind(...bindings).first();
          if (!project) return errorResponse('المشروع غير موجود', 404);
          return jsonResponse(project);
        }
        query += ' ORDER BY created_at DESC';
        const projects = await env.DB.prepare(query).all();
        return jsonResponse(projects.results || []);
      }

      case 'entities': {
        let query = 'SELECT * FROM cts_entities';
        const bindings: any[] = [];
        if (id) {
          query += ' WHERE id = ?';
          bindings.push(id);
          const entity = await env.DB.prepare(query).bind(...bindings).first();
          if (!entity) return errorResponse('الجهة الهندسية غير موجودة', 404);
          return jsonResponse(entity);
        }
        query += ' ORDER BY created_at DESC';
        const entities = await env.DB.prepare(query).all();
        return jsonResponse(entities.results || []);
      }

      case 'correspondences': {
        let query = 'SELECT * FROM cts_correspondences';
        const bindings: any[] = [];
        const whereClauses: string[] = [];

        if (id) {
          query += ' WHERE id = ?';
          bindings.push(id);
          const item = await env.DB.prepare(query).bind(...bindings).first<any>();
          if (!item) return errorResponse('المعاملة غير موجودة', 404);
          item.attachments = item.attachments_json ? JSON.parse(item.attachments_json) : [];
          item.workflow_history = item.workflow_history_json ? JSON.parse(item.workflow_history_json) : [];
          return jsonResponse(item);
        }

        if (projectRef && projectRef !== 'ALL') {
          whereClauses.push('project_ref = ?');
          bindings.push(projectRef);
        }
        if (docType && docType !== 'ALL') {
          whereClauses.push('doc_type = ?');
          bindings.push(docType);
        }
        if (classification && classification !== 'ALL') {
          whereClauses.push('classification = ?');
          bindings.push(classification);
        }
        if (status && status !== 'ALL') {
          whereClauses.push('status = ?');
          bindings.push(status);
        }

        if (whereClauses.length > 0) {
          query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY issue_date DESC, created_at DESC';
        const list = await env.DB.prepare(query).bind(...bindings).all<any>();
        const mapped = (list.results || []).map(r => ({
          ...r,
          attachments: r.attachments_json ? JSON.parse(r.attachments_json) : [],
          workflow_history: r.workflow_history_json ? JSON.parse(r.workflow_history_json) : [],
        }));
        return jsonResponse(mapped);
      }

      case 'audit-logs': {
        let query = 'SELECT * FROM cts_audit_logs';
        const bindings: any[] = [];
        if (id) {
          query += ' WHERE correspondence_id = ?';
          bindings.push(id);
        }
        query += ' ORDER BY timestamp DESC LIMIT 200';
        const logs = await env.DB.prepare(query).bind(...bindings).all();
        return jsonResponse(logs.results || []);
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في معالجة طلب CTS GET: ${err.message}`, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);

    await ensureCTSSchema(env.DB);
    const { resource, id, subAction } = parsePath(context);
    const body = await request.json().catch(() => ({})) as any;

    switch (resource) {
      case 'projects': {
        const prjId = body.id || body.project_id || `PRJ-${Date.now()}`;
        const code = body.code || body.project_code || 'PRJ';
        const name = body.name || body.project_name || 'مشروع جديد';
        const client = body.client_name || '';
        const consultant = body.consultant_name || '';
        const contractor = body.contractor_name || '';
        const status = body.project_status || 'Active';
        const startDate = body.start_date || '';
        const endDate = body.end_date || '';
        const location = body.location || '';
        const totalBudget = Number(body.total_budget || body.total_budget_sar || 0);
        const currency = body.currency || 'EGP';
        const description = body.description || '';
        const scope = body.scope_of_work || '';
        const notes = body.notes || '';

        await env.DB.prepare(`
          INSERT INTO cts_projects (
            id, code, name, client_name, consultant_name, contractor_name,
            project_status, start_date, end_date, location, total_budget,
            currency, description, scope_of_work, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            code = excluded.code,
            name = excluded.name,
            client_name = excluded.client_name,
            consultant_name = excluded.consultant_name,
            contractor_name = excluded.contractor_name,
            project_status = excluded.project_status,
            start_date = excluded.start_date,
            end_date = excluded.end_date,
            location = excluded.location,
            total_budget = excluded.total_budget,
            currency = excluded.currency,
            description = excluded.description,
            scope_of_work = excluded.scope_of_work,
            notes = excluded.notes,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          prjId, code, name, client, consultant, contractor,
          status, startDate, endDate, location, totalBudget,
          currency, description, scope, notes
        ).run();

        return jsonResponse({ success: true, id: prjId }, 201);
      }

      case 'entities': {
        const entId = body.id || `ent-${Date.now()}`;
        const code = body.code || 'ENT';
        const name = body.name || 'جهة هندسية جديدة';
        const shortName = body.short_name || '';
        const role = body.role || 'Consultant';
        const legalType = body.legal_type || 'Company';
        const regNo = body.registration_no || '';
        const taxNo = body.tax_no || '';
        const contactPerson = body.contact_person || '';
        const contactTitle = body.contact_title || '';
        const phone = body.phone || '';
        const mobile = body.mobile || '';
        const email = body.email || '';
        const address = body.address || '';
        const website = body.website || '';
        const status = body.status || 'Active';
        const notes = body.notes || '';

        await env.DB.prepare(`
          INSERT INTO cts_entities (
            id, code, name, short_name, role, legal_type, registration_no,
            tax_no, contact_person, contact_title, phone, mobile, email,
            address, website, status, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            code = excluded.code,
            name = excluded.name,
            short_name = excluded.short_name,
            role = excluded.role,
            legal_type = excluded.legal_type,
            registration_no = excluded.registration_no,
            tax_no = excluded.tax_no,
            contact_person = excluded.contact_person,
            contact_title = excluded.contact_title,
            phone = excluded.phone,
            mobile = excluded.mobile,
            email = excluded.email,
            address = excluded.address,
            website = excluded.website,
            status = excluded.status,
            notes = excluded.notes,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          entId, code, name, shortName, role, legalType, regNo,
          taxNo, contactPerson, contactTitle, phone, mobile, email,
          address, website, status, notes
        ).run();

        return jsonResponse({ success: true, id: entId }, 201);
      }

      case 'correspondences': {
        const corrId = body.id || body.doc_id || `corr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const serialNo = body.serial_number || 'DRAFT-0000';
        const externalRef = body.external_ref_no || '';
        const docType = body.doc_type || 'Incoming';
        const classification = body.classification || 'LTR';
        const isDraft = body.is_draft ? 1 : 0;
        const projectRef = body.project_ref || '';
        const projectName = body.project_name || '';
        const subject = body.subject || '';
        const bodyText = body.body_text || '';
        const sender = body.sender_entity || '';
        const receiver = body.receiver_entity || '';
        const origCode = body.originator_code || 'CON';
        const recipCode = body.recipient_code || 'CTR';
        const priority = body.priority || 'Normal';
        const issueDate = body.issue_date || new Date().toISOString().split('T')[0];
        const receivedDate = body.received_date || '';
        const dueDate = body.due_date || '';
        const status = body.status || (isDraft ? 'Draft' : 'Pending');
        const parentId = body.parent_doc_id || null;
        const parentSerial = body.parent_serial || null;
        const createdByUserId = body.created_by_user_id || 'usr_root';
        const createdByName = body.created_by_name || 'مسؤول النظام';
        const approvedByUserId = body.approved_by_user_id || null;
        const approvedByName = body.approved_by_name || null;
        const approvalDate = body.approval_date || null;
        const attachmentsJson = JSON.stringify(body.attachments || []);
        const workflowJson = JSON.stringify(body.workflow_history || []);
        const reviewRemarks = body.review_remarks || '';
        const returnedByName = body.returned_by_name || null;
        const returnedAt = body.returned_at || null;

        await env.DB.prepare(`
          INSERT INTO cts_correspondences (
            id, serial_number, external_ref_no, doc_type, classification, is_draft,
            project_ref, project_name, subject, body_text, sender_entity, receiver_entity,
            originator_code, recipient_code, priority, issue_date, received_date, due_date,
            status, parent_doc_id, parent_serial, created_by_user_id, created_by_name,
            approved_by_user_id, approved_by_name, approval_date, attachments_json,
            workflow_history_json, review_remarks, returned_by_name, returned_at,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            serial_number = excluded.serial_number,
            external_ref_no = excluded.external_ref_no,
            doc_type = excluded.doc_type,
            classification = excluded.classification,
            is_draft = excluded.is_draft,
            project_ref = excluded.project_ref,
            project_name = excluded.project_name,
            subject = excluded.subject,
            body_text = excluded.body_text,
            sender_entity = excluded.sender_entity,
            receiver_entity = excluded.receiver_entity,
            originator_code = excluded.originator_code,
            recipient_code = excluded.recipient_code,
            priority = excluded.priority,
            issue_date = excluded.issue_date,
            received_date = excluded.received_date,
            due_date = excluded.due_date,
            status = excluded.status,
            parent_doc_id = excluded.parent_doc_id,
            parent_serial = excluded.parent_serial,
            approved_by_user_id = excluded.approved_by_user_id,
            approved_by_name = excluded.approved_by_name,
            approval_date = excluded.approval_date,
            attachments_json = excluded.attachments_json,
            workflow_history_json = excluded.workflow_history_json,
            review_remarks = excluded.review_remarks,
            returned_by_name = excluded.returned_by_name,
            returned_at = excluded.returned_at,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          corrId, serialNo, externalRef, docType, classification, isDraft,
          projectRef, projectName, subject, bodyText, sender, receiver,
          origCode, recipCode, priority, issueDate, receivedDate, dueDate,
          status, parentId, parentSerial, createdByUserId, createdByName,
          approvedByUserId, approvedByName, approvalDate, attachmentsJson,
          workflowJson, reviewRemarks, returnedByName, returnedAt
        ).run();

        return jsonResponse({ success: true, id: corrId }, 201);
      }

      case 'audit-logs': {
        const logId = body.id || body.log_id || `log_${Date.now()}`;
        const corrId = body.correspondence_id || null;
        const targetDoc = body.target_doc || '';
        const actionType = body.action_type || 'ACTION_LOGGED';
        const userId = body.user_id || 'usr_root';
        const userName = body.user_name || 'مسؤول النظام';
        const timestamp = body.timestamp || new Date().toISOString();
        const details = body.details || '';
        const prevVal = body.previous_value || '';
        const newVal = body.new_value || '';
        const changedFieldsJson = JSON.stringify(body.changed_fields || []);
        const detailsJson = JSON.stringify(body.details_json || {});

        await env.DB.prepare(`
          INSERT INTO cts_audit_logs (
            id, correspondence_id, target_doc, action_type, user_id, user_name,
            timestamp, details, previous_value, new_value, changed_fields_json, details_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          logId, corrId, targetDoc, actionType, userId, userName,
          timestamp, details, prevVal, newVal, changedFieldsJson, detailsJson
        ).run();

        return jsonResponse({ success: true, id: logId }, 201);
      }

      case 'counters': {
        if (id === 'reserve' || subAction === 'reserve' || body.action === 'reserve') {
          const projectCode = body.project_code || '1233';
          const docType = body.doc_type || 'LTR';
          const year = body.year || new Date().getFullYear().toString().slice(-2);
          const counterKey = `${projectCode}_${docType}_${year}`;

          const existing = await env.DB.prepare(
            `SELECT last_serial FROM cts_system_counters WHERE counter_key = ?`
          ).bind(counterKey).first<{ last_serial: number }>();

          let nextSeq = 1;
          if (existing && typeof existing.last_serial === 'number') {
            nextSeq = existing.last_serial + 1;
          } else if (projectCode === '1233' && docType === 'LTR') {
            nextSeq = 45; // Default seed sequence baseline
          }

          await env.DB.prepare(`
            INSERT INTO cts_system_counters (counter_key, project_code, doc_type, year, last_serial, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(counter_key) DO UPDATE SET
              last_serial = excluded.last_serial,
              updated_at = CURRENT_TIMESTAMP
          `).bind(counterKey, projectCode, docType, year, nextSeq).run();

          const padded = String(nextSeq).padStart(4, '0');
          const serial = `${projectCode}-${body.originator_code || 'CON'}-${body.recipient_code || 'CTR'}-${docType}-${year}-${padded}`;

          return jsonResponse({
            serial_number: serial,
            sequence_number: nextSeq,
            counter_key: counterKey,
          });
        }
        return errorResponse('إجراء العدادات غير معروف', 400);
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في معالجة طلب CTS POST: ${err.message}`, 500);
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);

    await ensureCTSSchema(env.DB);
    const { resource, id } = parsePath(context);
    if (!id) return errorResponse('معرف السجل مفقود', 400);

    switch (resource) {
      case 'projects':
        await env.DB.prepare(`DELETE FROM cts_projects WHERE id = ?`).bind(id).run();
        return jsonResponse({ success: true, message: 'تم حذف المشروع بنجاح' });
      case 'entities':
        await env.DB.prepare(`DELETE FROM cts_entities WHERE id = ?`).bind(id).run();
        return jsonResponse({ success: true, message: 'تم حذف الجهة بنجاح' });
      case 'correspondences':
        await env.DB.prepare(`DELETE FROM cts_correspondences WHERE id = ?`).bind(id).run();
        return jsonResponse({ success: true, message: 'تم حذف المعاملة بنجاح' });
      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في معالجة طلب CTS DELETE: ${err.message}`, 500);
  }
};

