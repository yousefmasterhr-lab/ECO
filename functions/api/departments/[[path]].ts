import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import {
  ensureCompanySchema,
  logCompanyAudit,
  mapRowToDepartment,
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
  const parts = url.pathname.split('/api/departments').filter(Boolean);
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
      const row = await env.DB.prepare('SELECT * FROM departments WHERE id = ?').bind(id).first();
      if (!row) {
        return errorResponse(`الإدارة غير موجودة (معرف: ${id})`, 404);
      }
      return jsonResponse({ success: true, department: mapRowToDepartment(row) });
    }

    const result = await env.DB.prepare('SELECT * FROM departments ORDER BY created_at ASC').all();
    const departments = (result.results || []).map(mapRowToDepartment);

    return jsonResponse(departments, 200, {
      'x-total-count': String(departments.length),
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام الإدارات والهيكل التنظيمي: ${err.message || String(err)}`, 500);
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
      return errorResponse('بيانات الإدارة غير مكتملة (اسم الإدارة مطلوب)', 400);
    }

    const id = body.id || `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const companyId = body.companyId || null;
    const branchId = body.branchId || null;
    const parentId = body.parentId !== undefined ? body.parentId : null;
    const name = body.nameAr.trim();
    const manager = body.headAr || '';
    const costCenter = body.costCenterCode || '';
    const userName = body.userName || 'يوسف حجازي';

    const metadataJson = JSON.stringify({
      code: body.code || costCenter || 'DEP-01',
      staffCount: Number(body.staffCount ?? 0),
      subUnits: Array.isArray(body.subUnits) ? body.subUnits : [],
      responsibilities: body.responsibilities || '',
      companyNameAr: body.companyNameAr || '',
      branchNameAr: body.branchNameAr || '',
      auditLogs: Array.isArray(body.auditLogs) ? body.auditLogs : [],
    });

    await env.DB.prepare(`
      INSERT INTO departments (
        id, company_id, branch_id, parent_id, name, manager_name, cost_center_code, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(id, companyId, branchId, parentId, name, manager, costCenter, metadataJson).run();

    await logCompanyAudit(env.DB, 'department', id, userName, 'create', [
      { field: 'nameAr', fieldLabel: 'اسم الإدارة', oldValue: '—', newValue: name }
    ]);

    const createdRow = await env.DB.prepare('SELECT * FROM departments WHERE id = ?').bind(id).first();
    const department = mapRowToDepartment(createdRow);

    return jsonResponse({ success: true, department }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في إنشاء الإدارة: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف الإدارة غير محدد', 400);
    }

    const existing: any = (await env.DB.prepare('SELECT * FROM departments WHERE id = ?').bind(id).first()) || {};

    const companyId = body.companyId !== undefined ? body.companyId : (existing.company_id || '');
    const branchId = body.branchId !== undefined ? body.branchId : (existing.branch_id || '');
    const parentId = body.parentId !== undefined ? body.parentId : (existing.parent_id || null);
    const name = (body.nameAr || existing.name || '').trim();
    if (!name) {
      return errorResponse('اسم الإدارة مطلوب', 400);
    }
    const manager = body.headAr !== undefined ? body.headAr : (existing.manager_name || '');
    const costCenter = body.costCenterCode !== undefined ? body.costCenterCode : (existing.cost_center_code || '');
    const userName = body.userName || 'يوسف حجازي';

    let existingMeta: any = {};
    try {
      existingMeta = existing.metadata_json ? JSON.parse(existing.metadata_json as string) : {};
    } catch {}

    const metadataJson = JSON.stringify({
      code: body.code || existingMeta.code || costCenter,
      staffCount: Number(body.staffCount ?? existingMeta.staffCount ?? 0),
      subUnits: body.subUnits || existingMeta.subUnits || [],
      responsibilities: body.responsibilities !== undefined ? body.responsibilities : existingMeta.responsibilities,
      companyNameAr: body.companyNameAr || existingMeta.companyNameAr || '',
      branchNameAr: body.branchNameAr || existingMeta.branchNameAr || '',
      auditLogs: body.auditLogs || existingMeta.auditLogs || [],
    });

    await env.DB.prepare(`
      INSERT INTO departments (
        id, company_id, branch_id, parent_id, name, manager_name, cost_center_code, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        company_id = excluded.company_id,
        branch_id = excluded.branch_id,
        parent_id = excluded.parent_id,
        name = excluded.name,
        manager_name = excluded.manager_name,
        cost_center_code = excluded.cost_center_code,
        metadata_json = excluded.metadata_json
    `).bind(id, companyId, branchId, parentId, name, manager, costCenter, metadataJson).run();

    const diffs = Array.isArray(body.changes) ? body.changes : [];
    await logCompanyAudit(env.DB, 'department', id, userName, 'update', diffs);

    const updatedRow = await env.DB.prepare('SELECT * FROM departments WHERE id = ?').bind(id).first();
    const department = mapRowToDepartment(updatedRow);

    return jsonResponse({ success: true, department });
  } catch (err: any) {
    return errorResponse(`خطأ في تحديث الإدارة: ${err.message || String(err)}`, 500);
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
      return errorResponse('معرف الإدارة مطلوب للحذف', 400);
    }

    const existing: any = await env.DB.prepare('SELECT * FROM departments WHERE id = ?').bind(id).first();
    if (!existing) {
      return errorResponse(`الإدارة غير موجودة (معرف: ${id})`, 404);
    }

    // Reparent child departments to null (root) or delete
    await env.DB.prepare('UPDATE departments SET parent_id = NULL WHERE parent_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM departments WHERE id = ?').bind(id).run();

    await logCompanyAudit(env.DB, 'department', id, 'يوسف حجازي', 'delete', [
      { field: 'nameAr', fieldLabel: 'اسم الإدارة', oldValue: existing.name, newValue: 'محذوفة نهائياً' }
    ]);

    return jsonResponse({ success: true, message: `تم حذف الإدارة بنجاح (معرف: ${id})` });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف الإدارة: ${err.message || String(err)}`, 500);
  }
};
