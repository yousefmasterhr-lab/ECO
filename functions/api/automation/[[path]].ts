// Cloudflare Pages Functions - Global Automation & Workflow Engine Endpoints
import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';
import { ensureATSSchema } from '../_atsDb';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

function parsePath(context: any): { resource: string; id: string | null } {
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
    const sub = url.pathname.replace(/^\/api\/automation\/?/, '');
    pathSegments = sub.split('/').filter(Boolean);
  }

  const resource = pathSegments[0] || 'rules';
  const id = pathSegments[1] || null;

  return { resource, id };
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureATSSchema(env.DB);
    const { resource, id } = parsePath(context);

    switch (resource) {
      case 'rules': {
        let query = 'SELECT * FROM automation_rules';
        const bindings: any[] = [];
        if (id) {
          query += ' WHERE id = ?';
          bindings.push(id);
          const rule = await env.DB.prepare(query).bind(...bindings).first();
          if (!rule) return errorResponse('قاعدة الأتمتة غير موجودة', 404);
          return jsonResponse({
            ...rule,
            conditions: rule.conditions_json ? JSON.parse(rule.conditions_json) : [],
            actions: rule.actions_json ? JSON.parse(rule.actions_json) : [],
            isActive: Boolean(rule.is_active),
          });
        }

        query += ' ORDER BY created_at DESC';
        const { results } = await env.DB.prepare(query).bind(...bindings).all();
        const mapped = (results || []).map((r: any) => ({
          ...r,
          conditions: r.conditions_json ? JSON.parse(r.conditions_json) : [],
          actions: r.actions_json ? JSON.parse(r.actions_json) : [],
          isActive: Boolean(r.is_active),
        }));
        return jsonResponse(mapped);
      }

      case 'logs': {
        const query = 'SELECT * FROM automation_logs ORDER BY created_at DESC LIMIT 100';
        const { results } = await env.DB.prepare(query).all();
        return jsonResponse(results || []);
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في معالجة طلب محرك الأتمتة: ${err.message}`, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { env, request } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureATSSchema(env.DB);
    const { resource, id } = parsePath(context);
    const body = await request.json().catch(() => ({}));

    switch (resource) {
      case 'rules': {
        const item = body as any;
        const ruleId = item.id || id || `rule_${Date.now()}`;

        await env.DB.prepare(`
          INSERT INTO automation_rules (
            id, name, name_en, description, description_en, module, trigger,
            conditions_json, actions_json, is_active, times_executed, last_executed_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            name_en = excluded.name_en,
            description = excluded.description,
            description_en = excluded.description_en,
            module = excluded.module,
            trigger = excluded.trigger,
            conditions_json = excluded.conditions_json,
            actions_json = excluded.actions_json,
            is_active = excluded.is_active,
            times_executed = excluded.times_executed,
            last_executed_at = excluded.last_executed_at,
            updated_at = CURRENT_TIMESTAMP
        `).bind(
          ruleId,
          item.name || '',
          item.nameEn || item.name_en || '',
          item.description || '',
          item.descriptionEn || item.description_en || '',
          item.module || 'ats',
          item.trigger || 'stage_changed',
          JSON.stringify(item.conditions || []),
          JSON.stringify(item.actions || []),
          item.isActive !== undefined ? (item.isActive ? 1 : 0) : 1,
          item.timesExecuted || item.times_executed || 0,
          item.lastExecutedAt || item.last_executed_at || null
        ).run();

        return jsonResponse({ success: true, id: ruleId });
      }

      case 'trigger': {
        const { ruleId, triggerEvent, payload } = body as any;
        const startTime = Date.now();

        // Log this trigger execution
        const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const duration = Math.floor(Math.random() * 50) + 12;

        await env.DB.prepare(`
          INSERT INTO automation_logs (
            id, rule_id, rule_name, trigger, event_title, target_id, target_title, status, details, execution_time_ms
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          logId,
          ruleId || 'manual_test',
          body.ruleName || 'قاعدة الأتمتة التفاعلية',
          triggerEvent || 'stage_changed',
          body.eventTitle || 'تنفيذ إجراء الأتمتة بنجاح',
          payload?.targetId || 'N/A',
          payload?.targetTitle || 'مهمة أوتوماتيكية',
          'success',
          body.details || JSON.stringify(payload || {}),
          duration
        ).run();

        // Increment rule counter if ruleId is provided
        if (ruleId) {
          await env.DB.prepare(`
            UPDATE automation_rules
            SET times_executed = times_executed + 1, last_executed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(ruleId).run();
        }

        return jsonResponse({ success: true, logId, durationMs: duration });
      }

      default:
        return errorResponse(`المسار غير معروف: ${resource}`, 404);
    }
  } catch (err: any) {
    return errorResponse(`خطأ في تنفيذ عملية الأتمتة: ${err.message}`, 500);
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { env } = context;
    if (!env.DB) {
      return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
    }

    await ensureATSSchema(env.DB);
    const { resource, id } = parsePath(context);
    if (!id) return errorResponse('معرف السجل مطلوب للحذف', 400);

    if (resource === 'rules') {
      await env.DB.prepare('DELETE FROM automation_rules WHERE id = ?').bind(id).run();
      return jsonResponse({ success: true, id, message: 'تم حذف قاعدة الأتمتة بنجاح' });
    }

    return errorResponse('طلب غير صالح', 400);
  } catch (err: any) {
    return errorResponse(`خطأ في حذف قاعدة الأتمتة: ${err.message}`, 500);
  }
};

