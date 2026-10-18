// Cloudflare Pages Functions - Dedicated RBAC Permissions Matrix API (/api/rbac)
import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from './_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

/**
 * Ensures the rbac_matrices table exists in Cloudflare D1
 */
async function ensureRbacTable(db: any) {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS rbac_matrices (
        target_type TEXT,
        target_id TEXT,
        permissions_json TEXT,
        updated_by TEXT,
        updated_at TEXT,
        PRIMARY KEY (target_type, target_id)
      )
    `)
  ]);
}

/**
 * GET /api/rbac
 * Returns stored RBAC permission matrices (per user and per role) from Cloudflare D1.
 * Query params (optional): targetType ('user' | 'role'), targetId (string)
 */
export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    await ensureRbacTable(env.DB);

    const url = new URL(request.url);
    const targetType = url.searchParams.get('targetType');
    const targetId = url.searchParams.get('targetId');

    let rows: any[] = [];
    if (targetType && targetId) {
      const res = await env.DB.prepare(
        `SELECT target_type, target_id, permissions_json, updated_by, updated_at 
         FROM rbac_matrices 
         WHERE target_type = ? AND target_id = ? 
         LIMIT 1`
      ).bind(targetType, targetId).first();
      if (res) rows = [res];
    } else if (targetType) {
      const res = await env.DB.prepare(
        `SELECT target_type, target_id, permissions_json, updated_by, updated_at 
         FROM rbac_matrices 
         WHERE target_type = ?`
      ).bind(targetType).all();
      rows = res.results || [];
    } else {
      const res = await env.DB.prepare(
        `SELECT target_type, target_id, permissions_json, updated_by, updated_at 
         FROM rbac_matrices`
      ).all();
      rows = res.results || [];
    }

    const matrices = rows.map((r: any) => {
      let permissions: string[] = [];
      try {
        if (r.permissions_json) {
          permissions = JSON.parse(r.permissions_json);
        }
      } catch {
        permissions = [];
      }
      return {
        targetType: r.target_type,
        targetId: r.target_id,
        permissions,
        updatedBy: r.updated_by,
        updatedAt: r.updated_at,
      };
    });

    return jsonResponse({
      success: true,
      matrices,
      count: matrices.length,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في جلب مصفوفات الصلاحيات: ${err.message || String(err)}`, 500);
  }
};

/**
 * PUT / POST /api/rbac
 * Performs an atomic UPSERT on rbac_matrices in Cloudflare D1.
 * Also keeps users.permissions_json synchronized for user targets.
 */
export const onRequestPut: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    await ensureRbacTable(env.DB);

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('بيانات الطلب غير صالحة', 400);
    }

    // Support both single item and array of matrices
    const items: Array<{
      targetType: 'user' | 'role';
      targetId: string;
      permissions: string[];
      updatedBy?: string;
    }> = Array.isArray(body.matrices)
      ? body.matrices
      : [
          {
            targetType: body.targetType || (body.userId ? 'user' : 'role'),
            targetId: String(body.targetId || body.userId || body.roleId || body.role || ''),
            permissions: Array.isArray(body.permissions) ? body.permissions : [],
            updatedBy: body.updatedBy || body.userName || 'مدير النظام',
          },
        ];

    const batchStatements: any[] = [];

    for (const item of items) {
      if (!item.targetType || !item.targetId) continue;
      const permissionsJson = JSON.stringify(item.permissions || []);
      const updatedBy = item.updatedBy || 'مدير النظام';

      // Atomic UPSERT into rbac_matrices
      batchStatements.push(
        env.DB.prepare(`
          INSERT INTO rbac_matrices (target_type, target_id, permissions_json, updated_by, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(target_type, target_id) DO UPDATE SET
            permissions_json = excluded.permissions_json,
            updated_by = excluded.updated_by,
            updated_at = CURRENT_TIMESTAMP
        `).bind(item.targetType, item.targetId, permissionsJson, updatedBy)
      );

      // If user target, also update users table to maintain dual-compatibility
      if (item.targetType === 'user') {
        batchStatements.push(
          env.DB.prepare(`
            UPDATE users SET permissions_json = ? WHERE id = ?
          `).bind(permissionsJson, item.targetId)
        );
      }
    }

    // Bump security_epoch in system_settings to trigger live force-logout and re-authentication
    batchStatements.push(
      env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      env.DB.prepare(`
        INSERT INTO system_settings (key, value, updated_at) VALUES ('security_epoch', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).bind(String(Date.now()))
    );

    if (batchStatements.length > 0) {
      await env.DB.batch(batchStatements);
    }

    // Audit Log Entry
    try {
      const first = items[0];
      const logId = 'log_' + crypto.randomUUID();
      const targetLabel = first ? `${first.targetType === 'user' ? 'المستخدم' : 'الدور'}: ${first.targetId}` : '';
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_name TEXT,
          category TEXT,
          action TEXT,
          details TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run().catch(() => null);

      await env.DB.prepare(`
        INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        logId,
        'system',
        items[0]?.updatedBy || 'مدير النظام',
        'تعديل الصلاحيات',
        'تحديث مصفوفة الصلاحيات (RBAC)',
        `تم حفظ مصفوفة الصلاحيات سحابياً لـ ${targetLabel} بإجمالي (${items[0]?.permissions?.length || 0}) صلاحية`
      ).run().catch(() => null);
    } catch {}

    return jsonResponse({
      success: true,
      message: 'تم حفظ مصفوفة الصلاحيات في قاعدة البيانات السحابية بنجاح',
      savedCount: items.length,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في حفظ مصفوفة الصلاحيات: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPost: PagesFunction = onRequestPut;
