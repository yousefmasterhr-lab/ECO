import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import {
  ensureCompanySchema,
  logCompanyAudit,
  mapRowToSignatory,
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
  const parts = url.pathname.split('/api/authorized-persons').filter(Boolean);
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
      const row = await env.DB.prepare('SELECT * FROM authorized_persons WHERE id = ?').bind(id).first();
      if (!row) {
        return errorResponse(`المفوض غير موجود (معرف: ${id})`, 404);
      }
      return jsonResponse({ success: true, signatory: mapRowToSignatory(row) });
    }

    const url = new URL(request.url);
    const companyId = url.searchParams.get('company_id');

    let query = 'SELECT * FROM authorized_persons';
    const params: any[] = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    query += ' ORDER BY created_at DESC';

    const result = await env.DB.prepare(query).bind(...params).all();
    const signatories = (result.results || []).map(mapRowToSignatory);

    return jsonResponse(signatories, 200, {
      'x-total-count': String(signatories.length),
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام المفوضين والصلاحيات: ${err.message || String(err)}`, 500);
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
    if (!body || !body.nameAr || !body.companyId) {
      return errorResponse('بيانات المفوض غير مكتملة (اسم المفوض والشركة مطلوبان)', 400);
    }

    const id = body.id || `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const companyId = body.companyId;
    const name = body.nameAr.trim();
    const title = body.roleAr || 'نائب رئيس مجلس الإدارة';
    const poaNumber = body.poaNumber || '';
    const notaryOffice = body.notaryOfficeAr || '';
    const issueDate = body.issueDate || '';
    const expiryDate = body.isOpenEnded ? '' : (body.expiryDate || '');
    const status = body.status || 'active';
    const userName = body.userName || 'يوسف حجازي';

    const powersJson = JSON.stringify({
      nationalId: body.nationalId || '',
      companyNameAr: body.companyNameAr || '',
      isOpenEnded: Boolean(body.isOpenEnded),
      driveDocUrl: body.driveDocUrl || '',
      bankingLimits: body.bankingLimits || { singleLimit: 0, jointLimit: 0, allowLettersOfGuarantee: false, allowLettersOfCredit: false, allowOpenAccounts: false, notesAr: '' },
      contractualLimits: body.contractualLimits || { allowContracts: false, allowTenders: false, allowAssetTrade: false, notesAr: '' },
      judicialLimits: body.judicialLimits || { allowCourtRepresentation: false, allowGovRepresentation: false, allowDisputeResolution: false, notesAr: '' },
      poaAttachment: body.poaAttachment,
      auditLogs: Array.isArray(body.auditLogs) ? body.auditLogs : [],
    });

    await env.DB.prepare(`
      INSERT INTO authorized_persons (
        id, company_id, name, title, poa_number, notary_office, issue_date, expiry_date, powers_json, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, companyId, name, title, poaNumber, notaryOffice, issueDate, expiryDate, powersJson, status).run();

    await logCompanyAudit(env.DB, 'authorized_person', id, userName, 'create', [
      { field: 'nameAr', fieldLabel: 'اسم المفوض', oldValue: '—', newValue: name }
    ]);

    const createdRow = await env.DB.prepare('SELECT * FROM authorized_persons WHERE id = ?').bind(id).first();
    const signatory = mapRowToSignatory(createdRow);

    return jsonResponse({ success: true, signatory }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في تسجيل المفوض: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف المفوض غير محدد', 400);
    }

    const existing: any = await env.DB.prepare('SELECT * FROM authorized_persons WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`المفوض غير موجود (معرف: ${id})`, 404);
    }

    const companyId = body.companyId || existing.company_id;
    const name = (body.nameAr || existing.name || '').trim();
    const title = body.roleAr || existing.title;
    const poaNumber = body.poaNumber !== undefined ? body.poaNumber : existing.poa_number;
    const notaryOffice = body.notaryOfficeAr !== undefined ? body.notaryOfficeAr : existing.notary_office;
    const issueDate = body.issueDate !== undefined ? body.issueDate : existing.issue_date;
    const expiryDate = body.isOpenEnded ? '' : (body.expiryDate !== undefined ? body.expiryDate : existing.expiry_date);
    const status = body.status || existing.status;
    const userName = body.userName || 'يوسف حجازي';

    let existingPowers: any = {};
    try {
      existingPowers = existing.powers_json ? JSON.parse(existing.powers_json as string) : {};
    } catch {}

    const powersJson = JSON.stringify({
      nationalId: body.nationalId !== undefined ? body.nationalId : existingPowers.nationalId,
      companyNameAr: body.companyNameAr || existingPowers.companyNameAr || '',
      isOpenEnded: body.isOpenEnded !== undefined ? Boolean(body.isOpenEnded) : existingPowers.isOpenEnded,
      driveDocUrl: body.driveDocUrl !== undefined ? body.driveDocUrl : existingPowers.driveDocUrl,
      bankingLimits: body.bankingLimits || existingPowers.bankingLimits,
      contractualLimits: body.contractualLimits || existingPowers.contractualLimits,
      judicialLimits: body.judicialLimits || existingPowers.judicialLimits,
      poaAttachment: body.poaAttachment !== undefined ? body.poaAttachment : existingPowers.poaAttachment,
      auditLogs: body.auditLogs || existingPowers.auditLogs || [],
    });

    await env.DB.prepare(`
      UPDATE authorized_persons SET
        company_id = ?,
        name = ?,
        title = ?,
        poa_number = ?,
        notary_office = ?,
        issue_date = ?,
        expiry_date = ?,
        powers_json = ?,
        status = ?
      WHERE id = ?
    `).bind(companyId, name, title, poaNumber, notaryOffice, issueDate, expiryDate, powersJson, status, id).run();

    const diffs = Array.isArray(body.changes) ? body.changes : [];
    await logCompanyAudit(env.DB, 'authorized_person', id, userName, 'update', diffs);

    const updatedRow = await env.DB.prepare('SELECT * FROM authorized_persons WHERE id = ?').bind(id).first();
    const signatory = mapRowToSignatory(updatedRow);

    return jsonResponse({ success: true, signatory });
  } catch (err: any) {
    return errorResponse(`خطأ في تحديث المفوض: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف المفوض مطلوب للحذف', 400);
    }

    const existing = await env.DB.prepare('SELECT * FROM authorized_persons WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`المفوض غير موجود (معرف: ${id})`, 404);
    }

    await env.DB.prepare('DELETE FROM authorized_persons WHERE id = ?').bind(id).run();

    await logCompanyAudit(env.DB, 'authorized_person', id, 'يوسف حجازي', 'delete', [
      { field: 'status', fieldLabel: 'حالة التفويض', oldValue: 'ساري', newValue: 'محذوف نهائياً' }
    ]);

    return jsonResponse({ success: true, message: `تم حذف المفوض بنجاح (معرف: ${id})` });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف المفوض: ${err.message || String(err)}`, 500);
  }
};
