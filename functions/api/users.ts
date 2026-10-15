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

const ALL_COMPANY_PERMS = [
  'companies.directory.view', 'companies.directory.create', 'companies.directory.edit', 'companies.directory.toggle_status', 'companies.directory.view_docs', 'companies.directory.view_audit', 'companies.directory.delete',
  'companies.licenses.view', 'companies.licenses.create', 'companies.licenses.edit', 'companies.licenses.download', 'companies.licenses.view_audit', 'companies.licenses.delete',
  'companies.branches.view', 'companies.branches.create', 'companies.branches.edit', 'companies.branches.view_audit', 'companies.branches.delete',
  'companies.org.view', 'companies.org.create', 'companies.org.edit', 'companies.org.view_audit', 'companies.org.delete',
  'companies.signatories.view', 'companies.signatories.create', 'companies.signatories.edit', 'companies.signatories.download_poa', 'companies.signatories.view_audit', 'companies.signatories.delete'
];

async function ensureUserSchema(db: any) {
  try {
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          national_id TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role_id TEXT NOT NULL,
          department TEXT NOT NULL,
          job_title TEXT,
          phone TEXT,
          clearance_level INTEGER DEFAULT 1,
          is_active INTEGER DEFAULT 1,
          permissions_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS user_permissions (
          user_id TEXT NOT NULL,
          permission_key TEXT NOT NULL,
          granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, permission_key)
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          category TEXT NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    ]);
  } catch (e) {
    console.warn('ensureUserSchema base batch notice:', e);
  }

  // Add missing columns if they do not exist
  const alterColumns = [
    'ALTER TABLE users ADD COLUMN job_title TEXT',
    'ALTER TABLE users ADD COLUMN phone TEXT',
    'ALTER TABLE users ADD COLUMN permissions_json TEXT'
  ];
  for (const sql of alterColumns) {
    try {
      await db.prepare(sql).run();
    } catch {
      // Ignore if already exists
    }
  }

  // Ensure root administrator Yousef Hegazy exists
  try {
    const rootUser = await db.prepare(`SELECT id, full_name FROM users WHERE id = 'usr_root_csuite_01' OR username = 'admin' LIMIT 1`).first();
    if (!rootUser) {
      await db.prepare(`
        INSERT INTO users (
          id, national_id, full_name, username, email, password_hash, role_id, department,
          job_title, phone, clearance_level, is_active, permissions_json
        ) VALUES (
          'usr_root_csuite_01', '29001010100000', 'يوسف حجازي', 'admin', 'admin@hrsup.com',
          '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'SUPER_ADMIN',
          'الإدارة العليا والاستراتيجية', 'مدير النظام العام / رئيس مجلس الإدارة', '+20 100 000 0000',
          4, 1, ?
        )
      `).bind(JSON.stringify(ALL_COMPANY_PERMS)).run();
    } else if (rootUser.full_name === 'م. أحمد مصطفى') {
      await db.prepare(`
        UPDATE users
        SET full_name = 'يوسف حجازي',
            job_title = 'مدير النظام العام / رئيس مجلس الإدارة',
            permissions_json = ?
        WHERE id = ?
      `).bind(JSON.stringify(ALL_COMPANY_PERMS), rootUser.id).run();
    }
  } catch (err) {
    console.warn('Root user verification notice:', err);
  }
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { env } = context;

    if (!env.DB) {
      return errorResponse('قاعدة بيانات D1 غير متصلة', 500);
    }

    await ensureUserSchema(env.DB);

    const result = await env.DB.prepare(
      `SELECT id, national_id, full_name, username, email, role_id, department, job_title, phone, clearance_level, is_active, permissions_json, created_at
       FROM users
       ORDER BY created_at DESC`
    ).all();

    const users = (result.results || []).map((row: any) => {
      const isSuper = row.role_id === 'SUPER_ADMIN' || row.id === 'usr_root_csuite_01';
      let perms: string[] = [];
      try {
        if (row.permissions_json) {
          perms = JSON.parse(row.permissions_json);
        }
      } catch {
        perms = [];
      }
      if (isSuper && perms.length === 0) {
        perms = [...ALL_COMPANY_PERMS];
      }

      const nameAr = (row.id === 'usr_root_csuite_01' && (row.full_name === 'م. أحمد مصطفى' || !row.full_name)) ? 'يوسف حجازي' : row.full_name;
      const jobTitleAr = row.job_title || (isSuper ? 'مدير النظام العام / رئيس مجلس الإدارة' : row.role_id);

      return {
        id: row.id,
        nationalId: row.national_id,
        nameAr,
        nameEn: row.username,
        fullName: nameAr,
        username: row.username,
        email: row.email,
        jobTitleAr,
        jobTitleEn: jobTitleAr,
        phone: row.phone || '',
        role: row.role_id,
        roleLabelAr: jobTitleAr,
        roleLabelEn: row.role_id,
        department: row.department,
        departmentAr: row.department,
        departmentEn: row.department,
        departmentId: row.department,
        clearanceLevel: row.clearance_level,
        status: row.is_active === 1 ? 'ACTIVE' : 'SUSPENDED',
        permissions: perms,
        customPermissions: perms,
        createdAt: row.created_at,
      };
    });

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

    await ensureUserSchema(env.DB);

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
    const jobTitle = (body.jobTitleAr || body.jobTitle || body.job_title || roleId).toString().trim();
    const phone = (body.phone || '').toString().trim();
    const clearanceLevel = Number(body.clearanceLevel || body.clearance_level || 2);
    const isActive = body.status === 'SUSPENDED' || body.is_active === 0 ? 0 : 1;
    const permissions = Array.isArray(body.permissions)
      ? JSON.stringify(body.permissions)
      : (body.permissions_json || (roleId === 'SUPER_ADMIN' ? JSON.stringify(ALL_COMPANY_PERMS) : '[]'));

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
    const newUserId = body.id || ('usr_' + crypto.randomUUID());

    // Insert into D1 DB
    await env.DB.prepare(
      `INSERT INTO users (
        id, national_id, full_name, username, email, password_hash,
        role_id, department, job_title, phone, clearance_level, is_active, permissions_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      newUserId,
      nationalId,
      fullName,
      username,
      email,
      passwordHash,
      roleId,
      department,
      jobTitle,
      phone,
      clearanceLevel,
      isActive,
      permissions
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
        `تم إنشاء حساب مستخدم جديد: ${fullName} (${jobTitle}) بالرقم القومي: ${nationalId}`
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
      jobTitleAr: jobTitle,
      jobTitleEn: jobTitle,
      phone,
      role: roleId,
      roleLabelAr: jobTitle,
      roleLabelEn: roleId,
      department,
      departmentAr: department,
      clearanceLevel,
      status: isActive === 1 ? 'ACTIVE' : 'SUSPENDED',
      permissions: Array.isArray(body.permissions) ? body.permissions : (roleId === 'SUPER_ADMIN' ? ALL_COMPANY_PERMS : []),
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

    await ensureUserSchema(env.DB);

    const body = await request.json().catch(() => null);
    if (!body || !body.id) {
      return errorResponse('معرف المستخدم مطلوب للتحديث', 400);
    }

    const targetUser: any = await env.DB.prepare(
      `SELECT id, national_id, full_name, is_active, role_id, department, job_title, phone, permissions_json FROM users WHERE id = ? LIMIT 1`
    ).bind(body.id).first();

    // If not found, execute UPSERT / INSERT
    if (!targetUser) {
      const nationalId = body.nationalId || body.national_id || '29000000000000';
      const fullName = body.fullName || body.nameAr || 'مستخدم جديد';
      const username = body.username || `user_${Date.now()}`;
      const email = body.email || `${username}@hrsup.com`;
      const pwd = body.password ? await sha256Hex(body.password) : 'admin123';
      const roleId = body.roleId || body.role || 'HR_MANAGER';
      const department = body.department || body.departmentAr || 'الإدارة';
      const jobTitle = body.jobTitleAr || body.job_title || roleId;
      const phone = body.phone || '';
      const permissions = Array.isArray(body.permissions) ? JSON.stringify(body.permissions) : '[]';

      await env.DB.prepare(`
        INSERT INTO users (id, national_id, full_name, username, email, password_hash, role_id, department, job_title, phone, clearance_level, is_active, permissions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 1, ?)
      `).bind(body.id, nationalId, fullName, username, email, pwd, roleId, department, jobTitle, phone, permissions).run();

      return jsonResponse({ success: true, message: 'تم إنشاء المستخدم وحفظه بنجاح (UPSERT)' });
    }

    const fullName = body.fullName || body.nameAr || targetUser.full_name;
    const roleId = body.roleId || body.role || targetUser.role_id;
    const department = body.department || body.departmentAr || targetUser.department;
    const jobTitle = body.jobTitleAr || body.job_title || targetUser.job_title || roleId;
    const phone = body.phone !== undefined ? body.phone : (targetUser.phone || '');
    const clearanceLevel = body.clearanceLevel !== undefined ? Number(body.clearanceLevel) : undefined;
    const isActive = body.status !== undefined ? (body.status === 'ACTIVE' ? 1 : 0) : targetUser.is_active;

    let permissionsJson = targetUser.permissions_json;
    if (Array.isArray(body.permissions)) {
      permissionsJson = JSON.stringify(body.permissions);
    }

    // Optional password update
    let passwordClause = '';
    const queryParams: any[] = [fullName, roleId, department, jobTitle, phone, isActive, permissionsJson];

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
       SET full_name = ?, role_id = ?, department = ?, job_title = ?, phone = ?, is_active = ?, permissions_json = ?
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
        `تم تحديث بيانات المستخدم: ${fullName} (${jobTitle}) - الحالة: ${isActive === 1 ? 'نشط' : 'معطل'}`
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

    await ensureUserSchema(env.DB);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return errorResponse('معرف المستخدم مطلوب للحذف', 400);
    }

    // Block deletion of root admin
    if (id === 'usr_root_csuite_01' || id === 'usr_root_csuite') {
      return errorResponse('لا يمكن حذف حساب المسؤول الجذري للنظام', 403);
    }

    const targetUser: any = await env.DB.prepare(
      `SELECT id, full_name, email FROM users WHERE id = ? LIMIT 1`
    ).bind(id).first();

    if (!targetUser) {
      return errorResponse('المستخدم غير موجود أو تم حذفه مسبقاً', 404);
    }

    await env.DB.batch([
      env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(id),
      env.DB.prepare(`DELETE FROM user_permissions WHERE user_id = ?`).bind(id)
    ]);

    // Log deletion
    const logId = 'log_' + crypto.randomUUID();
    try {
      await env.DB.prepare(
        `INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        logId,
        id,
        targetUser.full_name,
        'حسابات المستخدمين',
        'حذف حساب مستخدم',
        `تم حذف حساب المستخدم: ${targetUser.full_name} (${targetUser.email})`
      ).run();
    } catch (logErr) {
      console.warn('Failed to log audit deletion:', logErr);
    }

    return jsonResponse({
      success: true,
      message: 'تم حذف المستخدم ومصفوفة صلاحياته بنجاح من قاعدة بيانات D1',
    });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف المستخدم: ${err.message || String(err)}`, 500);
  }
};
