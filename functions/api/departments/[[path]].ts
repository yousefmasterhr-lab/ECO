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
    const allDepartments = (result.results || []).map(mapRowToDepartment);

    // Automatic Server-Side Deduplication: Group by (companyId + nameAr)
    const groups = new Map<string, any[]>();
    allDepartments.forEach((dept: any) => {
      const key = `${dept.companyId || 'comp_default'}::${(dept.nameAr || '').trim()}`;
      const arr = groups.get(key) || [];
      arr.push(dept);
      groups.set(key, arr);
    });

    const canonical: any[] = [];
    const duplicateIdsToDelete: string[] = [];
    const oldIdToCanonical = new Map<string, string>();

    groups.forEach(group => {
      group.sort((a, b) => {
        const aScore = (a.parentId ? 2 : (a.level === 0 ? 3 : 0)) + (a.costCenterCode ? 1 : 0);
        const bScore = (b.parentId ? 2 : (b.level === 0 ? 3 : 0)) + (b.costCenterCode ? 1 : 0);
        return bScore - aScore;
      });

      const chosen = group[0];
      canonical.push(chosen);

      for (let i = 1; i < group.length; i++) {
        duplicateIdsToDelete.push(group[i].id);
        oldIdToCanonical.set(group[i].id, chosen.id);
      }
    });

    canonical.forEach(dept => {
      if (dept.parentId && oldIdToCanonical.has(dept.parentId)) {
        dept.parentId = oldIdToCanonical.get(dept.parentId);
      }
    });

    if (duplicateIdsToDelete.length > 0) {
      const deleteStmts = duplicateIdsToDelete.map(delId =>
        env.DB.prepare('DELETE FROM departments WHERE id = ?').bind(delId)
      );
      for (let i = 0; i < deleteStmts.length; i += 50) {
        await env.DB.batch(deleteStmts.slice(i, i + 50));
      }
    }

    return jsonResponse(canonical, 200, {
      'x-total-count': String(canonical.length),
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
    if (!body) {
      return errorResponse('بيانات الإدارة غير مكتملة', 400);
    }

    // Support Bulk Seeding / Batch Creation
    const bulkList = Array.isArray(body) ? body : (Array.isArray(body.bulk) ? body.bulk : (Array.isArray(body.departments) ? body.departments : null));
    if (bulkList && bulkList.length > 0) {
      const userName = body.userName || 'يوسف حجازي';
      const statements: any[] = [];
      const insertedDepts: any[] = [];

      for (const item of bulkList) {
        if (!item.nameAr) continue;
        const id = item.id || `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const companyId = item.companyId || null;
        const branchId = item.branchId || null;
        const parentId = item.parentId !== undefined ? item.parentId : null;
        const name = item.nameAr.trim();
        const manager = item.headAr || '';
        const costCenter = item.costCenterCode || '';
        const metadataJson = JSON.stringify({
          code: item.code || costCenter || 'DEP-01',
          titleEn: item.titleEn || item.nameEn || '',
          nameEn: item.nameEn || item.titleEn || '',
          level: item.level !== undefined ? Number(item.level) : 0,
          staffCount: Number(item.staffCount ?? 0),
          subUnits: Array.isArray(item.subUnits) ? item.subUnits : [],
          responsibilities: item.responsibilities || '',
          companyNameAr: item.companyNameAr || '',
          branchNameAr: item.branchNameAr || '',
          auditLogs: Array.isArray(item.auditLogs) ? item.auditLogs : [],
        });

        statements.push(
          env.DB.prepare(`
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
          `).bind(id, companyId, branchId, parentId, name, manager, costCenter, metadataJson)
        );

        insertedDepts.push({
          id,
          nameAr: name,
          titleEn: item.titleEn || item.nameEn || '',
          nameEn: item.nameEn || item.titleEn || '',
          level: item.level !== undefined ? Number(item.level) : 0,
          headAr: manager,
          code: item.code || costCenter || 'DEP-01',
          parentId,
          companyId,
          costCenterCode: costCenter
        });
      }

      if (body.resetHierarchy) {
        const targetCompId = body.companyId || bulkList[0]?.companyId || null;
        if (targetCompId) {
          await env.DB.prepare('DELETE FROM departments WHERE company_id = ? OR company_id IS NULL').bind(targetCompId).run();
        } else {
          await env.DB.prepare('DELETE FROM departments').run();
        }
      }

      if (statements.length > 0) {
        await env.DB.batch(statements);
      }

      await logCompanyAudit(env.DB, 'department', 'bulk_hierarchy', userName, 'create', [
        { field: 'hierarchy', fieldLabel: 'الهيكل القياسي الموحد', oldValue: '—', newValue: `تم استيراد ${statements.length} وحدة إدارية بنجاح` }
      ]);

      const result = await env.DB.prepare('SELECT * FROM departments ORDER BY created_at ASC').all();
      const departments = (result.results || []).map(mapRowToDepartment);

      return jsonResponse({ success: true, count: statements.length, departments }, 201);
    }

    if (!body.nameAr) {
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
      titleEn: body.titleEn || body.nameEn || '',
      nameEn: body.nameEn || body.titleEn || '',
      level: body.level !== undefined ? Number(body.level) : 0,
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
      titleEn: body.titleEn !== undefined ? body.titleEn : (body.nameEn !== undefined ? body.nameEn : existingMeta.titleEn || existingMeta.nameEn || ''),
      nameEn: body.nameEn !== undefined ? body.nameEn : (body.titleEn !== undefined ? body.titleEn : existingMeta.nameEn || existingMeta.titleEn || ''),
      level: body.level !== undefined ? Number(body.level) : (existingMeta.level !== undefined ? Number(existingMeta.level) : 0),
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
