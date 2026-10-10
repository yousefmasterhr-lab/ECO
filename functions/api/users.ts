import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
  sha256Hex,
} from './_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env } = context;

    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const result = await env.DB.prepare(
      `SELECT id, national_id, full_name, username, email, role_id, department, clearance_level, is_active, created_at
       FROM users
       ORDER BY created_at DESC`
    ).all();

    const users = (result.results || []).map((row: any) => ({
      id: row.id,
      nationalId: row.national_id,
      nameAr: row.full_name,
      nameEn: row.username,
      fullName: row.full_name,
      username: row.username,
      email: row.email,
      role: row.role_id,
      roleLabelAr: row.role_id === 'SUPER_ADMIN' ? 'الرئيس التنفيذي للعمليات (الإدارة العليا)' : row.role_id,
      roleLabelEn: row.role_id,
      department: row.department,
      departmentAr: row.department,
      departmentEn: row.department,
      departmentId: row.department,
      clearanceLevel: row.clearance_level,
      status: row.is_active === 1 ? 'ACTIVE' : 'SUSPENDED',
      createdAt: row.created_at,
    }));

    return jsonResponse({
      success: true,
      users,
      count: users.length,
    });
  } catch (err: any) {
    return errorResponse(`خطأ في جلب قائمة المستخدمين: ${err.message || String(err)}`, 500);
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
      return errorResponse('بيانات المستخدم غير صالحة', 400);
    }

    let nationalId = (body.nationalId || body.national_id || '').toString().trim();
    if (nationalId.length >= 10 && nationalId.length < 14 && /^\d+$/.test(nationalId)) {
      nationalId = nationalId.padStart(14, '0');
    }
    const fullName = (body.fullName || body.nameAr || body.full_name || '').toString().trim();
    const username = (body.username || '').toString().trim().toLowerCase();
    const email = (body.email || '').toString().trim().toLowerCase();
    const password = (body.password || body.passwordHash || '').toString();
    const roleId = (body.roleId || body.role_id || body.role || 'HR_MANAGER').toString();
    const department = (body.department || body.departmentAr || 'إدارة الموارد البشرية').toString();
    const clearanceLevel = Number(body.clearanceLevel || body.clearance_level || 2);
    const isActive = body.status === 'SUSPENDED' || body.is_active === 0 ? 0 : 1;

    // Strict Validations
    if (!fullName) {
      return errorResponse('يرجى إدخال الاسم بالكامل', 400);
    }

    if (!nationalId || nationalId.length !== 14 || !/^\d{14}$/.test(nationalId)) {
      return errorResponse('الرقم القومي يجب أن يتكون من 14 رقماً بصورة صحيحة (14 digits required)', 400);
    }

    if (!username || username.length < 3) {
      return errorResponse('اسم المستخدم يجب ألا يقل عن 3 أحرف', 400);
    }

    if (!email || !email.includes('@')) {
      return errorResponse('يرجى إدخال بريد إلكتروني صحيح', 400);
    }

    if (!password || password.length < 6) {
      return errorResponse('كلمة المرور يجب ألا تقل عن 6 أحرف', 400);
    }

    // Duplicate Prevention
    const existing: any = await env.DB.prepare(
      `SELECT national_id, username, email FROM users
       WHERE national_id = ? OR LOWER(username) = ? OR LOWER(email) = ?
       LIMIT 1`
    ).bind(nationalId, username, email).first();

    if (existing) {
      if (existing.national_id === nationalId) {
        return errorResponse('الرقم القومي مسجل بالفعل لمستخدم آخر', 409);
      }
      if (existing.username.toLowerCase() === username) {
        return errorResponse('اسم المستخدم مسجل بالفعل، يرجى اختيار اسم آخر', 409);
      }
      if (existing.email.toLowerCase() === email) {
        return errorResponse('البريد الإلكتروني مسجل بالفعل لمستخدم آخر', 409);
      }
    }

    // Hash Password
    const passwordHash = await sha256Hex(password);
    const newUserId = 'usr_' + crypto.randomUUID();

    // Insert into D1 DB
    await env.DB.prepare(
      `INSERT INTO users (
        id, national_id, full_name, username, email, password_hash,
        role_id, department, clearance_level, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      newUserId,
      nationalId,
      fullName,
      username,
      email,
      passwordHash,
      roleId,
      department,
      clearanceLevel,
      isActive
    ).run();

    // Log Action into audit_logs
    const logId = 'log_' + crypto.randomUUID();
    try {
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        logId,
        newUserId,
        fullName,
        'حسابات المستخدمين',
        'إنشاء حساب مستخدم جديد',
        `تم إنشاء حساب مستخدم جديد: ${fullName} (${roleId} - ${department}) بالرقم القومي: ${nationalId}`
      ).run();
    } catch (logErr) {
      console.warn('Failed to insert audit log for user creation:', logErr);
    }

    const createdUser = {
      id: newUserId,
      nationalId,
      nameAr: fullName,
      nameEn: username,
      fullName,
      username,
      email,
      role: roleId,
      department,
      clearanceLevel,
      status: isActive === 1 ? 'ACTIVE' : 'SUSPENDED',
      createdAt: new Date().toISOString().split('T')[0],
    };

    return jsonResponse({
      success: true,
      user: createdUser,
      message: 'تم إضافة المستخدم بنجاح في قاعدة بيانات D1',
    }, 201);
  } catch (err: any) {
    return errorResponse(`خطأ في حفظ المستخدم: ${err.message || String(err)}`, 500);
  }
};

export const onRequestPut: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return errorResponse('معرف المستخدم مطلوب للتحديث', 400);
    }

    const targetUser: any = await env.DB.prepare(
      `SELECT id, national_id, full_name, is_active, role_id, department FROM users WHERE id = ? LIMIT 1`
    ).bind(body.id).first();

    if (!targetUser) {
      return errorResponse('المستخدم غير موجود', 404);
    }

    const fullName = body.fullName || body.nameAr || targetUser.full_name;
    const roleId = body.roleId || body.role || targetUser.role_id;
    const department = body.department || body.departmentAr || targetUser.department;
    const clearanceLevel = body.clearanceLevel !== undefined ? Number(body.clearanceLevel) : undefined;
    const isActive = body.status !== undefined ? (body.status === 'ACTIVE' ? 1 : 0) : targetUser.is_active;

    // Optional password update
    let passwordClause = '';
    const queryParams: any[] = [fullName, roleId, department, isActive];

    if (clearanceLevel !== undefined) {
      queryParams.push(clearanceLevel);
    }

    if (body.password) {
      const newHash = await sha256Hex(body.password);
      queryParams.push(newHash);
      passwordClause = ', password_hash = ?';
    }

    queryParams.push(body.id);

    await env.DB.prepare(
      `UPDATE users
       SET full_name = ?, role_id = ?, department = ?, is_active = ?
       ${clearanceLevel !== undefined ? ', clearance_level = ?' : ''}
       ${passwordClause}
       WHERE id = ?`
    ).bind(...queryParams).run();

    // Log update
    const logId = 'log_' + crypto.randomUUID();
    try {
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        logId,
        body.id,
        fullName,
        'تعديل الصلاحيات',
        'تحديث بيانات وصلاحيات مستخدم',
        `تم تحديث بيانات المستخدم: ${fullName} (${roleId} - ${department}) - الحالة: ${isActive === 1 ? 'نشط' : 'معطل'}`
      ).run();
    } catch (logErr) {
      console.warn('Failed to log audit update:', logErr);
    }

    return jsonResponse({
      success: true,
      message: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح',
    });
  } catch (err: any) {
    return errorResponse(`خطأ في تحديث المستخدم: ${err.message || String(err)}`, 500);
  }
};

export const onRequestDelete: PagesFunction = async (context) => {
  try {
    const { request, env } = context;

    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return errorResponse('معرف المستخدم مطلوب', 400);
    }

    // Permanent Root Administrator Protection
    if (userId === 'usr_root_csuite_01' || userId === 'usr_root_csuite') {
      return errorResponse('حساب الإدارة العليا الجذري محمي بصفة دائمة ولا يمكن حذفه', 403);
    }

    const targetUser: any = await env.DB.prepare(
      `SELECT id, full_name, email FROM users WHERE id = ? LIMIT 1`
    ).bind(userId).first();

    if (!targetUser) {
      return errorResponse('المستخدم غير موجود', 404);
    }

    await env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run();

    // Log deletion
    const logId = 'log_' + crypto.randomUUID();
    try {
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        logId,
        userId,
        targetUser.full_name,
        'حسابات المستخدمين',
        'حذف حساب مستخدم',
        `تم حذف حساب المستخدم: ${targetUser.full_name} (${targetUser.email})`
      ).run();
    } catch (logErr) {
      console.warn('Failed to log deletion:', logErr);
    }

    return jsonResponse({
      success: true,
      message: 'تم حذف المستخدم بنجاح',
    });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف المستخدم: ${err.message || String(err)}`, 500);
  }
};
