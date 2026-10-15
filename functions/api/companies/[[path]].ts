import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import {
  ensureCompanySchema,
  logCompanyAudit,
  mapRowToCompany,
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
  const parts = url.pathname.split('/api/companies').filter(Boolean);
  if (parts.length > 0) {
    const sub = parts[0].replace(/^\/+|\/+$/g, '');
    if (sub) return sub;
  }
  return null;
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureCompanySchema(env.DB);
    const id = extractIdFromContext(context);

    if (id) {
      // Get single company
      const row = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first();
      if (!row) {
        return errorResponse(`الشركة غير موجودة (معرف: ${id})`, 404);
      }
      const company = mapRowToCompany(row);
      return jsonResponse({ success: true, company });
    }

    // List all companies
    const result = await env.DB.prepare('SELECT * FROM companies ORDER BY created_at DESC').all();
    const companies = (result.results || []).map(mapRowToCompany);

    return jsonResponse(companies, 200, {
      'x-total-count': String(companies.length),
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام الشركات: ${err.message || String(err)}`, 500);
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
    if (!body || !body.nameAr) {
      return errorResponse('بيانات الشركة غير مكتملة (اسم الشركة مطلوب)', 400);
    }

    const id = body.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const name = body.nameAr.trim();
    const legalForm = body.legalType || 'ش.م.م';
    const capital = Number(body.issuedCapital || body.capital || 0);
    const cr = body.crNumber || '';
    const tax = body.taxNumber || '';
    const manager = body.ceoAr || '';
    const address = body.crOffice || '';
    const userName = body.userName || 'يوسف حجازي';

    const metadataJson = JSON.stringify({
      paidCapital: Number(body.paidCapital ?? capital),
      totalShares: Number(body.totalShares ?? 1000000),
      nominalShareValue: Number(body.nominalShareValue ?? 100),
      crOffice: body.crOffice || '',
      establishedYear: body.establishedYear || String(new Date().getFullYear()),
      branchesCount: Number(body.branchesCount ?? 0),
      projectsCount: Number(body.projectsCount ?? 0),
      status: body.status || 'active',
      shareholders: Array.isArray(body.shareholders) ? body.shareholders : [],
      documents: Array.isArray(body.documents) ? body.documents : [],
      auditLogs: Array.isArray(body.auditLogs) ? body.auditLogs : [],
    });

    await env.DB.prepare(`
      INSERT INTO companies (
        id, name, legal_form, capital, commercial_register, tax_id, manager_name, address, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(id, name, legalForm, capital, cr, tax, manager, address, metadataJson).run();

    // Log creation audit
    await logCompanyAudit(env.DB, 'company', id, userName, 'create', [
      { field: 'nameAr', fieldLabel: 'اسم الشركة', oldValue: '—', newValue: name }
    ]);

    const createdRow = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first();
    const company = mapRowToCompany(createdRow);

    return jsonResponse({ success: true, company }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في تسجيل الشركة: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف الشركة غير محدد', 400);
    }

    const existing: any = (await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first()) || {};

    const name = (body.nameAr || existing.name || body.name || '').trim();
    if (!name) {
      return errorResponse('اسم الشركة مطلوب', 400);
    }
    const legalForm = body.legalType || existing.legal_form || 'ش.م.م';
    const capital = Number(body.issuedCapital ?? body.capital ?? existing.capital ?? 0);
    const cr = body.crNumber !== undefined ? body.crNumber : (existing.commercial_register || '');
    const tax = body.taxNumber !== undefined ? body.taxNumber : (existing.tax_id || '');
    const manager = body.ceoAr !== undefined ? body.ceoAr : (existing.manager_name || '');
    const address = body.crOffice !== undefined ? body.crOffice : (existing.address || '');
    const userName = body.userName || 'يوسف حجازي';

    let existingMeta: any = {};
    try {
      existingMeta = existing.metadata_json ? JSON.parse(existing.metadata_json as string) : {};
    } catch {}

    const metadataJson = JSON.stringify({
      paidCapital: Number(body.paidCapital ?? existingMeta.paidCapital ?? capital),
      totalShares: Number(body.totalShares ?? existingMeta.totalShares ?? 1000000),
      nominalShareValue: Number(body.nominalShareValue ?? existingMeta.nominalShareValue ?? 100),
      crOffice: body.crOffice !== undefined ? body.crOffice : (existingMeta.crOffice || ''),
      establishedYear: body.establishedYear || existingMeta.establishedYear || String(new Date().getFullYear()),
      branchesCount: Number(body.branchesCount ?? existingMeta.branchesCount ?? 0),
      projectsCount: Number(body.projectsCount ?? existingMeta.projectsCount ?? 0),
      status: body.status || existingMeta.status || 'active',
      shareholders: body.shareholders || existingMeta.shareholders || [],
      documents: body.documents || existingMeta.documents || [],
      auditLogs: body.auditLogs || existingMeta.auditLogs || [],
    });

    await env.DB.prepare(`
      INSERT INTO companies (
        id, name, legal_form, capital, commercial_register, tax_id, manager_name, address, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        legal_form = excluded.legal_form,
        capital = excluded.capital,
        commercial_register = excluded.commercial_register,
        tax_id = excluded.tax_id,
        manager_name = excluded.manager_name,
        address = excluded.address,
        metadata_json = excluded.metadata_json,
        updated_at = CURRENT_TIMESTAMP
    `).bind(id, name, legalForm, capital, cr, tax, manager, address, metadataJson).run();

    // Log update audit
    const diffs = Array.isArray(body.changes) ? body.changes : [];
    await logCompanyAudit(env.DB, 'company', id, userName, 'update', diffs);

    const updatedRow = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first();
    const company = mapRowToCompany(updatedRow);

    return jsonResponse({ success: true, company });
  } catch (err: any) {
    return errorResponse(`خطأ في تحديث الشركة: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف الشركة مطلوب للحذف', 400);
    }

    const existing: any = await env.DB.prepare('SELECT * FROM companies WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`الشركة غير موجودة (معرف: ${id})`, 404);
    }

    // Cascade delete sub-module records belonging to this company
    await env.DB.batch([
      env.DB.prepare('DELETE FROM company_licenses WHERE company_id = ?').bind(id),
      env.DB.prepare('DELETE FROM branches_sites WHERE company_id = ?').bind(id),
      env.DB.prepare('DELETE FROM authorized_persons WHERE company_id = ?').bind(id),
      env.DB.prepare('DELETE FROM companies WHERE id = ?').bind(id),
    ]);

    // Log delete audit
    await logCompanyAudit(env.DB, 'company', id, 'يوسف حجازي', 'delete', [
      { field: 'status', fieldLabel: 'حالة الشركة', oldValue: 'نشطة', newValue: 'محذوفة نهائياً' }
    ]);

    return jsonResponse({ success: true, message: `تم حذف الشركة وكافة سجلاتها بنجاح (معرف: ${id})` });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف الشركة: ${err.message || String(err)}`, 500);
  }
};
