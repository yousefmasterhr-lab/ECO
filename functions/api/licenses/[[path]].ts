import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import {
  ensureCompanySchema,
  logCompanyAudit,
  mapRowToLicense,
} from '../_companyDb';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

function extractIdFromContext(context: any): string | null {
  const { params, request } = context;
  if (params && params.path) {
    if (Array.isArray(params.path) && params.path.length > 0) {
      return params.path[0];
    }
    if (typeof params.path === 'string' && params.path.trim()) {
      return params.path.trim();
    }
  }
  const url = new URL(request.url);
  const parts = url.pathname.split('/api/licenses').filter(Boolean);
  if (parts.length > 0) {
    const sub = parts[0].replace(/^\/+|\/+$/g, '');
    if (sub) return sub;
  }
  return null;
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureCompanySchema(env.DB);
    const id = extractIdFromContext(context);

    if (id) {
      const row = await env.DB.prepare('SELECT * FROM company_licenses WHERE id = ?').bind(id).first();
      if (!row) {
        return errorResponse(`المستند / الترخيص غير موجود (معرف: ${id})`, 404);
      }
      return jsonResponse({ success: true, license: mapRowToLicense(row) });
    }

    const url = new URL(request.url);
    const companyId = url.searchParams.get('company_id');

    let query = 'SELECT * FROM company_licenses';
    const params: any[] = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    query += ' ORDER BY created_at DESC';

    const result = await env.DB.prepare(query).bind(...params).all();
    const licenses = (result.results || []).map(mapRowToLicense);

    return jsonResponse(licenses, 200, {
      'x-total-count': String(licenses.length),
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام السجلات والتراخيص: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureCompanySchema(env.DB);

    const body = await request.json().catch(() => null);
    if (!body || !body.titleAr || !body.companyId) {
      return errorResponse('بيانات المستند غير مكتملة (عنوان المستند والشركة الموكلة مطلوبان)', 400);
    }

    const id = body.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const companyId = body.companyId;
    const docType = body.docTypeAr || 'سجل تجاري';
    const docNumber = body.docNumber || '';
    const issuingAuthority = body.issuingAuthorityAr || '';
    const issueDate = body.issueDate || '';
    const expiryDate = body.isOpenEnded ? '' : (body.expiryDate || '');
    const fileUrl = body.attachment?.dataUrl || body.fileUrl || '';
    const status = body.status || 'active';
    const userName = body.userName || 'يوسف حجازي';

    const metadataJson = JSON.stringify({
      titleAr: body.titleAr,
      companyNameAr: body.companyNameAr || '',
      isOpenEnded: Boolean(body.isOpenEnded),
      daysRemaining: Number(body.daysRemaining ?? 0),
      notesAr: body.notesAr || '',
      attachment: body.attachment,
      auditLogs: Array.isArray(body.auditLogs) ? body.auditLogs : [],
    });

    await env.DB.prepare(`
      INSERT INTO company_licenses (
        id, company_id, doc_type, doc_number, issuing_authority, issue_date, expiry_date, file_url, status, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, companyId, docType, docNumber, issuingAuthority, issueDate, expiryDate, fileUrl, status, metadataJson).run();

    await logCompanyAudit(env.DB, 'license', id, userName, 'create', [
      { field: 'titleAr', fieldLabel: 'عنوان المستند', oldValue: '—', newValue: body.titleAr }
    ]);

    const createdRow = await env.DB.prepare('SELECT * FROM company_licenses WHERE id = ?').bind(id).first();
    const license = mapRowToLicense(createdRow);

    return jsonResponse({ success: true, license }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في إضافة الترخيص / المستند: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureCompanySchema(env.DB);

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('بيانات التحديث غير صالحة', 400);
    }

    const id = extractIdFromContext(context) || body.id;
    if (!id) {
      return errorResponse('معرف المستند غير محدد', 400);
    }

    const existing: any = await env.DB.prepare('SELECT * FROM company_licenses WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`المستند غير موجود (معرف: ${id})`, 404);
    }

    const companyId = body.companyId || existing.company_id;
    const docType = body.docTypeAr || existing.doc_type;
    const docNumber = body.docNumber !== undefined ? body.docNumber : existing.doc_number;
    const issuingAuthority = body.issuingAuthorityAr !== undefined ? body.issuingAuthorityAr : existing.issuing_authority;
    const issueDate = body.issueDate !== undefined ? body.issueDate : existing.issue_date;
    const expiryDate = body.isOpenEnded ? '' : (body.expiryDate !== undefined ? body.expiryDate : existing.expiry_date);
    const fileUrl = body.attachment?.dataUrl || body.fileUrl || existing.file_url;
    const status = body.status || existing.status;
    const userName = body.userName || 'يوسف حجازي';

    let existingMeta: any = {};
    try {
      existingMeta = existing.metadata_json ? JSON.parse(existing.metadata_json as string) : {};
    } catch {}

    const metadataJson = JSON.stringify({
      titleAr: body.titleAr || existingMeta.titleAr || docType,
      companyNameAr: body.companyNameAr || existingMeta.companyNameAr || '',
      isOpenEnded: body.isOpenEnded !== undefined ? Boolean(body.isOpenEnded) : existingMeta.isOpenEnded,
      daysRemaining: Number(body.daysRemaining ?? existingMeta.daysRemaining ?? 0),
      notesAr: body.notesAr !== undefined ? body.notesAr : existingMeta.notesAr,
      attachment: body.attachment || existingMeta.attachment,
      auditLogs: body.auditLogs || existingMeta.auditLogs || [],
    });

    await env.DB.prepare(`
      UPDATE company_licenses SET
        company_id = ?,
        doc_type = ?,
        doc_number = ?,
        issuing_authority = ?,
        issue_date = ?,
        expiry_date = ?,
        file_url = ?,
        status = ?,
        metadata_json = ?
      WHERE id = ?
    `).bind(companyId, docType, docNumber, issuingAuthority, issueDate, expiryDate, fileUrl, status, metadataJson, id).run();

    const diffs = Array.isArray(body.changes) ? body.changes : [];
    await logCompanyAudit(env.DB, 'license', id, userName, 'update', diffs);

    const updatedRow = await env.DB.prepare('SELECT * FROM company_licenses WHERE id = ?').bind(id).first();
    const license = mapRowToLicense(updatedRow);

    return jsonResponse({ success: true, license });
  } catch (err: any) {
    return errorResponse(`خطأ في تحديث الترخيص / المستند: ${err.message || String(err)}`, 500);
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureCompanySchema(env.DB);

    const id = extractIdFromContext(context);
    if (!id) {
      return errorResponse('معرف المستند مطلوب للحذف', 400);
    }

    const existing: any = await env.DB.prepare('SELECT * FROM company_licenses WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`المستند غير موجود (معرف: ${id})`, 404);
    }

    await env.DB.prepare('DELETE FROM company_licenses WHERE id = ?').bind(id).run();

    await logCompanyAudit(env.DB, 'license', id, 'يوسف حجازي', 'delete', [
      { field: 'status', fieldLabel: 'حالة المستند', oldValue: 'ساري', newValue: 'محذوف نهائياً' }
    ]);

    return jsonResponse({ success: true, message: `تم حذف المستند بنجاح (معرف: ${id})` });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف المستند: ${err.message || String(err)}`, 500);
  }
};
