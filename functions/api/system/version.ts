import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
} from '../_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

const DEFAULT_MAINTENANCE = {
  active: false,
  title: 'جاري تحديث وترقية النظام السحابي',
  message: 'برجاء عدم استخدام الموقع الآن لحين رفع التحديث برجاء الانتظار حتى يتم الانتهاء وإعادة تحميل الصفحة',
  estimatedMinutes: 3,
  startedAt: '',
  targetVersion: '1.2.0-rc',
  lastCompletedAt: ''
};

export const onRequestGet: PagesFunction = async (context) => {
  const { env } = context;

  const fallback = {
    version: '1.1.0-build.20261015',
    buildTimestamp: 1728956000000,
    gitCommit: 'd8ebc7c',
    maintenance: DEFAULT_MAINTENANCE,
  };

  if (!env.DB) {
    return jsonResponse({
      success: true,
      source: 'memory_fallback',
      ...fallback,
    });
  }

  try {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await env.DB.prepare(
      `SELECT key, value FROM system_settings WHERE key IN ('system_version', 'build_timestamp', 'maintenance_mode', 'security_epoch')`
    ).all();

    const map: Record<string, string> = {};
    for (const row of (result.results || []) as any[]) {
      if (row.key && row.value !== undefined) {
        map[row.key] = row.value;
      }
    }

    let maintenance = DEFAULT_MAINTENANCE;
    if (map['maintenance_mode']) {
      try {
        maintenance = { ...DEFAULT_MAINTENANCE, ...JSON.parse(map['maintenance_mode']) };
      } catch {}
    }

    const version = map['system_version'] || fallback.version;
    const buildTimestamp = map['build_timestamp'] ? parseInt(map['build_timestamp'], 10) : fallback.buildTimestamp;
    const securityEpoch = map['security_epoch'] ? parseInt(map['security_epoch'], 10) : 0;

    return jsonResponse({
      success: true,
      source: 'cloudflare_d1',
      version,
      buildTimestamp,
      securityEpoch,
      gitCommit: 'd8ebc7c',
      maintenance,
    });
  } catch (err: any) {
    return jsonResponse({
      success: true,
      source: 'error_fallback',
      warning: err.message,
      ...fallback,
    });
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context;

  if (!env.DB) {
    return errorResponse('قاعدة بيانات Cloudflare D1 غير متصلة', 500);
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return errorResponse('بيانات الطلب غير صالحة', 400);
  }

  try {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const action = body.action || 'update_version'; // 'start_maintenance' | 'finish_maintenance' | 'update_version'
    const nowTimestamp = Date.now();

    let targetVersion = body.version || `1.1.0-build.${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    let buildTimestamp = nowTimestamp;
    let maintenance = { ...DEFAULT_MAINTENANCE };

    // Fetch existing settings
    const existing = await env.DB.prepare(
      `SELECT key, value FROM system_settings WHERE key IN ('system_version', 'build_timestamp', 'maintenance_mode')`
    ).all();

    const map: Record<string, string> = {};
    for (const row of (existing.results || []) as any[]) {
      if (row.key && row.value !== undefined) {
        map[row.key] = row.value;
      }
    }

    if (map['system_version']) targetVersion = map['system_version'];
    if (map['build_timestamp']) buildTimestamp = parseInt(map['build_timestamp'], 10);
    if (map['maintenance_mode']) {
      try {
        maintenance = { ...DEFAULT_MAINTENANCE, ...JSON.parse(map['maintenance_mode']) };
      } catch {}
    }

    if (action === 'start_maintenance') {
      maintenance.active = true;
      maintenance.startedAt = new Date().toISOString();
      if (body.title) maintenance.title = body.title;
      if (body.message) maintenance.message = body.message;
      if (body.estimatedMinutes) maintenance.estimatedMinutes = Number(body.estimatedMinutes);
      if (body.targetVersion) maintenance.targetVersion = body.targetVersion;
    } else if (action === 'finish_maintenance') {
      maintenance.active = false;
      maintenance.lastCompletedAt = new Date().toISOString();
      // Bump build timestamp to trigger auto refresh & auto sign out across all devices
      buildTimestamp = nowTimestamp;
      if (body.version) {
        targetVersion = body.version;
      } else if (maintenance.targetVersion) {
        targetVersion = maintenance.targetVersion;
      }
    } else if (action === 'toggle_maintenance') {
      maintenance.active = !maintenance.active;
      if (maintenance.active) {
        maintenance.startedAt = new Date().toISOString();
      } else {
        maintenance.lastCompletedAt = new Date().toISOString();
        buildTimestamp = nowTimestamp;
      }
    } else if (action === 'update_version' || action === 'force_deploy_broadcast') {
      buildTimestamp = nowTimestamp;
      if (body.version) targetVersion = body.version;
      maintenance.active = false;
    }

    // Persist to D1 system_settings
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO system_settings (key, value, updated_at) VALUES ('system_version', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      ).bind(targetVersion),
      env.DB.prepare(
        `INSERT INTO system_settings (key, value, updated_at) VALUES ('build_timestamp', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      ).bind(String(buildTimestamp)),
      env.DB.prepare(
        `INSERT INTO system_settings (key, value, updated_at) VALUES ('maintenance_mode', ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
      ).bind(JSON.stringify(maintenance)),
    ]);

    return jsonResponse({
      success: true,
      message: 'تم تحديث بيانات الإصدار وحالة الصيانة بنجاح',
      version: targetVersion,
      buildTimestamp,
      maintenance,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في معالجة طلب تحديث النظام: ${err.message || String(err)}`, 500);
  }
};
