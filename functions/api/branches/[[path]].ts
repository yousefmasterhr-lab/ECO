import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import {
  ensureCompanySchema,
  logCompanyAudit,
  mapRowToBranch,
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
  const parts = url.pathname.split('/api/branches').filter(Boolean);
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
      const row = await env.DB.prepare('SELECT * FROM branches_sites WHERE id = ?').bind(id).first();
      if (!row) {
        return errorResponse(`المقر / الفرع غير موجود (معرف: ${id})`, 404);
      }
      return jsonResponse({ success: true, branch: mapRowToBranch(row) });
    }

    const url = new URL(request.url);
    const companyId = url.searchParams.get('company_id');

    let query = 'SELECT * FROM branches_sites';
    const params: any[] = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    query += ' ORDER BY created_at DESC';

    const result = await env.DB.prepare(query).bind(...params).all();
    const branches = (result.results || []).map(mapRowToBranch);

    return jsonResponse(branches, 200, {
      'x-total-count': String(branches.length),
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام الفروع والمواقع: ${err.message || String(err)}`, 500);
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
      return errorResponse('بيانات الفرع غير مكتملة (اسم الفرع والشركة مطلوبان)', 400);
    }

    const id = body.id || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const companyId = body.companyId;
    const name = body.nameAr.trim();
    const type = body.typeAr || 'فرع رئيسي';
    const address = body.addressAr || '';
    const manager = body.managerAr || '';
    const costCenter = body.costCenterCode || '';
    const userName = body.userName || 'يوسف حجازي';

    const metadataJson = JSON.stringify({
      cityAr: body.cityAr || 'القاهرة',
      phone: body.phone || '',
      status: body.status || 'نشط',
      staffCount: Number(body.staffCount ?? 0),
      activeProjects: Number(body.activeProjects ?? 0),
      notesAr: body.notesAr || '',
      companyNameAr: body.companyNameAr || '',
      auditLogs: Array.isArray(body.auditLogs) ? body.auditLogs : [],
    });

    await env.DB.prepare(`
      INSERT INTO branches_sites (
        id, company_id, name, type, address, manager_name, cost_center_code, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, companyId, name, type, address, manager, costCenter, metadataJson).run();

    await logCompanyAudit(env.DB, 'branch', id, userName, 'create', [
      { field: 'nameAr', fieldLabel: 'اسم المقر', oldValue: '—', newValue: name }
    ]);

    const createdRow = await env.DB.prepare('SELECT * FROM branches_sites WHERE id = ?').bind(id).first();
    const branch = mapRowToBranch(createdRow);

    return jsonResponse({ success: true, branch }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في تسجيل المقر / الموقع: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف المقر غير محدد', 400);
    }

    const existing = await env.DB.prepare('SELECT * FROM branches_sites WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`المقر غير موجود (معرف: ${id})`, 404);
    }

    const companyId = body.companyId || existing.company_id;
    const name = (body.nameAr || existing.name || '').trim();
    const type = body.typeAr || existing.type;
    const address = body.addressAr !== undefined ? body.addressAr : existing.address;
    const manager = body.managerAr !== undefined ? body.managerAr : existing.manager_name;
    const costCenter = body.costCenterCode !== undefined ? body.costCenterCode : existing.cost_center_code;
    const userName = body.userName || 'يوسف حجازي';

    let existingMeta: any = {};
    try {
      existingMeta = existing.metadata_json ? JSON.parse(existing.metadata_json as string) : {};
    } catch {}

    const metadataJson = JSON.stringify({
      cityAr: body.cityAr !== undefined ? body.cityAr : existingMeta.cityAr,
      phone: body.phone !== undefined ? body.phone : existingMeta.phone,
      status: body.status || existingMeta.status || 'نشط',
      staffCount: Number(body.staffCount ?? existingMeta.staffCount ?? 0),
      activeProjects: Number(body.activeProjects ?? existingMeta.activeProjects ?? 0),
      notesAr: body.notesAr !== undefined ? body.notesAr : existingMeta.notesAr,
      companyNameAr: body.companyNameAr || existingMeta.companyNameAr || '',
      auditLogs: body.auditLogs || existingMeta.auditLogs || [],
    });

    await env.DB.prepare(`
      UPDATE branches_sites SET
        company_id = ?,
        name = ?,
        type = ?,
        address = ?,
        manager_name = ?,
        cost_center_code = ?,
        metadata_json = ?
      WHERE id = ?
    `).bind(companyId, name, type, address, manager, costCenter, metadataJson, id).run();

    const diffs = Array.isArray(body.changes) ? body.changes : [];
    await logCompanyAudit(env.DB, 'branch', id, userName, 'update', diffs);

    const updatedRow = await env.DB.prepare('SELECT * FROM branches_sites WHERE id = ?').bind(id).first();
    const branch = mapRowToBranch(updatedRow);

    return jsonResponse({ success: true, branch });
  } catch (err: any) {
    return errorResponse(`خطأ في تحديث المقر: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف المقر مطلوب للحذف', 400);
    }

    const existing = await env.DB.prepare('SELECT * FROM branches_sites WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`المقر غير موجود (معرف: ${id})`, 404);
    }

    await env.DB.prepare('DELETE FROM branches_sites WHERE id = ?').bind(id).run();

    await logCompanyAudit(env.DB, 'branch', id, 'يوسف حجازي', 'delete', [
      { field: 'status', fieldLabel: 'حالة المقر', oldValue: 'نشط', newValue: 'محذوف نهائياً' }
    ]);

    return jsonResponse({ success: true, message: `تم حذف المقر بنجاح (معرف: ${id})` });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف المقر: ${err.message || String(err)}`, 500);
  }
};
