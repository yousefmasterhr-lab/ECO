import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
  verifySessionToken,
} from '../_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse('رمز المصادقة مفقود (Authorization header missing)', 401);
    }

    const token = authHeader.substring(7).trim();
    const payload = await verifySessionToken(token, env.JWT_SECRET);

    if (!payload || !payload.id) {
      return errorResponse('رمز المصادقة غير صالح أو منتهي الصلاحية', 401);
    }

    if (!env.DB) {
      // If DB is offline but token is valid, return payload data
      return jsonResponse({
        success: true,
        user: payload,
      });
    }

    // Refresh user state from D1 database
    const user: any = await env.DB.prepare(
      `SELECT id, national_id, full_name, username, email, role_id, department, job_title, phone, clearance_level, is_active, permissions_json, allowed_company_ids, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    ).bind(payload.id).first();

    if (!user || user.is_active !== 1) {
      return errorResponse('الحساب غير موجود أو تم تعطيله', 403);
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
        allowedCompanies = typeof user.allowed_company_ids === 'string' ? JSON.parse(user.allowed_company_ids) : user.allowed_company_ids;
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

    const safeUser = {
      id: user.id,
      nationalId: user.national_id,
      fullName: user.full_name,
      nameAr: user.full_name,
      nameEn: user.username,
      username: user.username,
      email: user.email,
      role: user.role_id,
      department: user.department,
      departmentAr: user.department,
      jobTitleAr: cleanJobTitle,
      phone: user.phone || '',
      clearanceLevel: user.clearance_level,
      permissions: perms,
      allowedCompanyIds: allowedCompanies,
      isActive: Boolean(user.is_active),
      createdAt: user.created_at,
    };

    return jsonResponse({
      success: true,
      user: safeUser,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في استعلام بيانات المستخدم: ${err.message || String(err)}`, 500);
  }
};
