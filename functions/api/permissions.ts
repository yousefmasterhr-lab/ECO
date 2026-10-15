// Cloudflare Pages Functions - User Permissions API (/api/permissions)
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
 * GET /api/permissions?userId=...
 * Returns the granular permissions for a given user.
 */
export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return errorResponse('معرف المستخدم مطلوب (userId is required)', 400);
    }

    const user: any = await env.DB.prepare(
      `SELECT id, role_id, permissions_json FROM users WHERE id = ? LIMIT 1`
    ).bind(userId).first();

    if (!user) {
      return errorResponse('المستخدم غير موجود', 404);
    }

    let permissions: string[] = [];
    try {
      if (user.permissions_json) {
        permissions = JSON.parse(user.permissions_json);
      }
    } catch {
      permissions = [];
    }

    return jsonResponse({
      success: true,
      userId: user.id,
      role: user.role_id,
      permissions,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في جلب الصلاحيات: ${err.message || String(err)}`, 500);
  }
};

/**
 * PUT / POST /api/permissions
 * Saves or updates permissions for a user using atomic db.batch.
 */
export const onRequestPut: PagesFunction = async (context) => {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.userId) {
      return errorResponse('معرف المستخدم وقائمة الصلاحيات مطلوبة', 400);
    }

    const userId = String(body.userId);
    const permissions: string[] = Array.isArray(body.permissions) ? body.permissions : [];
    const permissionsJson = JSON.stringify(permissions);

    // 1. Ensure user_permissions table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        user_id TEXT NOT NULL,
        permission_key TEXT NOT NULL,
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, permission_key)
      )
    `).run().catch(() => null);

    // 2. Prepare atomic batch: Update users.permissions_json + delete old + insert new
    const batchStatements: any[] = [
      env.DB.prepare(`UPDATE users SET permissions_json = ? WHERE id = ?`).bind(permissionsJson, userId),
      env.DB.prepare(`DELETE FROM user_permissions WHERE user_id = ?`).bind(userId)
    ];

    for (const key of permissions) {
      batchStatements.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO user_permissions (user_id, permission_key) VALUES (?, ?)`
        ).bind(userId, key)
      );
    }

    await env.DB.batch(batchStatements);

    // Audit Log
    try {
      const logId = 'log_' + crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        logId,
        userId,
        body.userName || 'مدير النظام',
        'تعديل الصلاحيات',
        'تحديث مصفوفة صلاحيات المستخدم',
        `تم تحديث مصفوفة الصلاحيات للمستخدم ${userId} بإجمالي (${permissions.length}) صلاحية مخصصة`
      ).run();
    } catch {}

    return jsonResponse({
      success: true,
      message: 'تم حفظ مصفوفة الصلاحيات بنجاح في قاعدة بيانات Cloudflare D1',
      userId,
      permissionsCount: permissions.length,
      permissions,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في حفظ الصلاحيات: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPost: PagesFunction = onRequestPut;
