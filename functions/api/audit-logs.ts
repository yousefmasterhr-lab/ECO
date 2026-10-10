import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from './_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = Math.min(Number(url.searchParams.get('limit')) || 200, 500);
    const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);

    let query = `
      SELECT id, user_id, user_name, category, action, details, created_at
      FROM audit_logs
    `;
    const params: any[] = [];

    if (category && category !== 'ALL' && category !== 'الكل') {
      query += ` WHERE category = ?`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const result = await env.DB.prepare(query).bind(...params).all();

    const logs = (result.results || []).map((row: any) => ({
      id: row.id,
      timestamp: row.created_at,
      actorName: row.user_name,
      actorEmail: '',
      actorRole: '',
      actionAr: row.action,
      actionEn: row.action,
      category: row.category,
      detailsAr: row.details || '',
      detailsEn: row.details || '',
      status: 'SUCCESS',
    }));

    return jsonResponse({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام سجل العمليات: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return errorResponse('بيانات السجل غير صالحة', 400);
    }

    const id = body.id || 'log_' + crypto.randomUUID();
    const userId = body.userId || body.user_id || 'system';
    const userName = body.userName || body.user_name || body.actorName || 'النظام المركزي';
    const category = body.category || 'إعدادات النظام';
    const action = body.action || body.actionAr || 'عملية في النظام';
    const details = body.details || body.detailsAr || '';

    await env.DB.prepare(
      `INSERT INTO audit_logs (id, user_id, user_name, category, action, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(id, userId, userName, category, action, details).run();

    return jsonResponse({
      success: true,
      log: {
        id,
        user_id: userId,
        user_name: userName,
        category,
        action,
        details,
      },
    }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في تسجيل العملية: ${err.message || String(err)}`, 500);
  }
};
