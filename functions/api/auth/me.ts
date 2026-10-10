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
      `SELECT id, national_id, full_name, username, email, role_id, department, clearance_level, is_active, created_at
       FROM users
       WHERE id = ?
       LIMIT 1`
    ).bind(payload.id).first();

    if (!user || user.is_active !== 1) {
      return errorResponse('الحساب غير موجود أو تم تعطيله', 403);
    }

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
      clearanceLevel: user.clearance_level,
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
