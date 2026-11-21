import {
  PagesFunction,
  Env,
  jsonResponse,
  errorResponse,
  handleOptions,
  verifyPassword,
  hashPassword,
  createSessionToken,
  resolveJwtSecret,
} from '../_utils';

export const onRequestOptions: PagesFunction = async ({ request, env }) => {
  return handleOptions(request, env);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = (await request.json().catch(() => ({}))) as any;
    const identifier = String(body.identifier || body.username || body.email || body.emailOrUsername || '')
      .trim()
      .toLowerCase();
    const rawPassword = String(body.password || '').trim();

    if (!identifier || !rawPassword) {
      return errorResponse('يرجى إدخال اسم المستخدم وكلمة المرور', 400, undefined, request, env);
    }

    if (!env.DB) {
      return errorResponse('قاعدة البيانات غير متصلة', 500, undefined, request, env);
    }

    const jwtSecret = resolveJwtSecret(env, request.url);
    if (!jwtSecret) {
      return errorResponse('مفتاح توقيع الجلسات (JWT_SECRET) غير مهيأ على الخادم', 503, undefined, request, env);
    }

    // Explicit safe column projection + password_hash strictly for internal verification (never serialized)
    const user: any = await env.DB.prepare(
      `SELECT id, national_id, full_name, username, email, password_hash, role_id, department,
              job_title, phone, clearance_level, is_active, permissions_json, allowed_company_ids
       FROM users
       WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND is_active = 1
       LIMIT 1`
    )
      .bind(identifier, identifier)
      .first();

    // Generic 401 prevents user enumeration and never leaks hashes or debug fields
    if (!user) {
      return errorResponse('بيانات الدخول غير صحيحة', 401, undefined, request, env);
    }

    const { valid, needsUpgrade } = await verifyPassword(rawPassword, user.password_hash);
    if (!valid) {
      return errorResponse('بيانات الدخول غير صحيحة', 401, undefined, request, env);
    }

    // Transparently upgrade legacy unsalted SHA-256 or legacy plaintext hash to salted PBKDF2-SHA256
    if (needsUpgrade) {
      try {
        const upgradedHash = await hashPassword(rawPassword);
        await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
          .bind(upgradedHash, user.id)
          .run();
      } catch (upgradeErr) {
        console.warn('[Auth] Transparent password hash upgrade skipped:', upgradeErr);
      }
    }

    let perms: string[] = [];
    try {
      if (user.permissions_json) {
        perms = typeof user.permissions_json === 'string' ? JSON.parse(user.permissions_json) : user.permissions_json;
      }
    } catch {
      perms = [];
    }
    if ((user.role_id === 'SUPER_ADMIN' || user.id === 'usr_root_csuite_01') && perms.length === 0) {
      perms = ['*'];
    }

    let allowedCompanies: string[] = ['all'];
    try {
      if (user.allowed_company_ids) {
        allowedCompanies =
          typeof user.allowed_company_ids === 'string'
            ? JSON.parse(user.allowed_company_ids)
            : user.allowed_company_ids;
      }
    } catch {
      allowedCompanies = ['all'];
    }

    const rawJobTitle = user.job_title || user.role_id;
    const cleanJobTitle = String(rawJobTitle || '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\(HRMS\)|\(ATS\)|\(CTS\)|\(CFO\)|\(HRD\)|\(C-Suite\)/gi, '')
      .trim();

    // Explicit safe serializer — NEVER includes password_hash, password, or salt
    const sanitizedUser = {
      id: user.id,
      national_id: user.national_id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      department: user.department,
      clearance_level: user.clearance_level,
      job_title: cleanJobTitle,
      phone: user.phone,
      nationalId: user.national_id,
      fullName: user.full_name,
      nameAr: user.full_name,
      nameEn: user.username,
      role: user.role_id,
      departmentAr: user.department,
      jobTitleAr: cleanJobTitle,
      phoneStr: user.phone,
      clearanceLevel: user.clearance_level,
      permissions: perms,
      allowedCompanyIds: allowedCompanies,
      isActive: Boolean(user.is_active),
    };

    const token = await createSessionToken(
      {
        sub: user.id,
        id: user.id,
        role: user.role_id,
        username: user.username,
        email: user.email,
      },
      jwtSecret
    );

    return jsonResponse(
      {
        success: true,
        token,
        user: sanitizedUser,
      },
      200,
      { 'Cache-Control': 'no-store' },
      request,
      env
    );
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    return errorResponse('خطأ أثناء المعالجة في الخادم', 500, undefined, request, env);
  }
};
