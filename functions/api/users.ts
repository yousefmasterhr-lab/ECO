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
    'ALTER TABLE users ADD COLUMN permissions_json TEXT',
    'ALTER TABLE users ADD COLUMN allowed_company_ids TEXT'
  ];
  for (const sql of alterColumns) {
    try {
      await db.prepare(sql).run();
    } catch {
      // Ignore if already exists
    }
  }

  // Ensure system initialization flags table exists to prevent re-seeding / overwriting
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS system_init_flags (
        flag_key TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const isInitialized = await db.prepare(
      `SELECT flag_key FROM system_init_flags WHERE flag_key = 'init_users_governance_v4' LIMIT 1`
    ).first();

    if (!isInitialized) {
      // Ensure root administrator Yousef Hegazy exists
      const rootUser = await db.prepare(`SELECT id FROM users WHERE id = 'usr_root_csuite_01' OR username = 'admin' LIMIT 1`).first();
      if (!rootUser) {
        await db.prepare(`
          INSERT INTO users (
            id, national_id, full_name, username, email, password_hash, role_id, department,
            job_title, phone, clearance_level, is_active, permissions_json, allowed_company_ids
          ) VALUES (
            'usr_root_csuite_01', '', 'يوسف حجازي', 'admin', 'admin@hrsup.com',
            '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'SUPER_ADMIN',
            'الإدارة العليا والاستراتيجية', 'مدير النظام العام / رئيس مجلس الإدارة', '+20 100 000 0000',
            4, 1, ?, '["all"]'
          )
        `).bind(JSON.stringify(ALL_COMPANY_PERMS)).run();
      }

      // Check if Taghreed Atef exists, insert only if absent
      const taghreedUser = await db.prepare(
        `SELECT id FROM users WHERE id = 'usr_hr_taghreed_01' OR email = 'taghreed@hrsup.com' OR username = 'taghreed' LIMIT 1`
      ).first();

      if (!taghreedUser) {
        await db.prepare(`
          INSERT INTO users (
            id, national_id, full_name, username, email, password_hash, role_id, department,
            job_title, phone, clearance_level, is_active, permissions_json, allowed_company_ids
          ) VALUES (
            'usr_hr_taghreed_01', '', 'تغريد عاطف', 'taghreed', 'taghreed@hrsup.com',
            '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'HR_MANAGER',
            'إدارة الموارد البشرية والرواتب', 'مدير الموارد البشرية', '+20 100 000 0001',
            3, 1, '["companies.directory.view", "companies.licenses.view"]', '["comp_01"]'
          )
        `).run();
      }

      // Clean up legacy titles in users table (strip technical tags like HRMS, CFO, C-Suite and fix typos)
      await db.prepare(`
        UPDATE users
        SET job_title = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(job_title, '(HRMS)', ''), '(ATS)', ''), '(CTS)', ''), '(C-Suite)', ''), 'موادر', 'موارد'),
            department = REPLACE(department, 'موادر', 'موارد')
        WHERE job_title LIKE '%(%' OR job_title LIKE '%موادر%' OR department LIKE '%موادر%'
      `).run().catch(() => null);

      // Record flag so this never runs again and user modifications are 100% persistent
      await db.prepare(`INSERT OR IGNORE INTO system_init_flags (flag_key) VALUES ('init_users_governance_v4')`).run();
    }
  } catch (err) {
    console.warn('User schema verification notice:', err);
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
      `SELECT id, national_id, full_name, username, email, role_id, department, job_title, phone, clearance_level, is_active, permissions_json, allowed_company_ids, created_at
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

      let allowedCompanyIds: string[] = ['all'];
      try {
        if (row.allowed_company_ids) {
          allowedCompanyIds = JSON.parse(row.allowed_company_ids);
        }
      } catch {
        allowedCompanyIds = ['all'];
      }

      // Purge fake national ID 29001010100000 or internal fallback tokens
      const rawNatId = String(row.national_id || '').trim();
      const nationalId = (rawNatId === '29001010100000' || rawNatId.startsWith('NID_UNSET_')) ? '' : rawNatId;

      const nameAr = (row.id === 'usr_root_csuite_01' && (row.full_name === 'م. أحمد مصطفى' || !row.full_name)) ? 'يوسف حجازي' : row.full_name;
      const rawJobTitle = row.job_title || (isSuper ? 'مدير النظام العام / رئيس مجلس الإدارة' : row.role_id);
      const jobTitleAr = String(rawJobTitle || '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\(HRMS\)|\(ATS\)|\(CTS\)|\(CFO\)|\(HRD\)|\(C-Suite\)/gi, '')
        .trim();

      return {
        id: row.id,
        nationalId,
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
        allowedCompanyIds,
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
    const department = (body.department || body.departmentAr || 'إدارة الموارد البشرية').toString().replace(/موادر/g, 'موارد');
    const rawJt = (body.jobTitleAr || body.jobTitle || body.job_title || roleId).toString().trim();
    const jobTitle = rawJt
      .replace(/موادر/g, 'موارد')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\(HRMS\)|\(ATS\)|\(CTS\)|\(CFO\)|\(HRD\)|\(C-Suite\)/gi, '')
      .trim();
    const phone = (body.phone || '').toString().trim();
    const clearanceLevel = Number(body.clearanceLevel || body.clearance_level || 2);
    const isActive = body.status === 'SUSPENDED' || body.is_active === 0 ? 0 : 1;
    const permissions = Array.isArray(body.permissions)
      ? JSON.stringify(body.permissions)
      : (body.permissions_json || (roleId === 'SUPER_ADMIN' ? JSON.stringify(ALL_COMPANY_PERMS) : '[]'));

    const allowedCompanyIds = Array.isArray(body.allowedCompanyIds) && body.allowedCompanyIds.length > 0
      ? JSON.stringify(body.allowedCompanyIds)
      : '["all"]';

    // Strict Validations
    if (!fullName) {
      return errorResponse('يرجى إدخال الاسم بالكامل', 400);
    }

    if (nationalId && (!/^\d{14}$/.test(nationalId))) {
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
    if (nationalId) {
      const existingNatId: any = await env.DB.prepare(
        `SELECT national_id FROM users WHERE national_id = ? LIMIT 1`
      ).bind(nationalId).first();
      if (existingNatId) {
        return errorResponse('الرقم القومي مسجل بالفعل لمستخدم آخر', 409);
      }
    }

    const existingUserOrEmail: any = await env.DB.prepare(
      `SELECT username, email FROM users
       WHERE LOWER(username) = ? OR LOWER(email) = ?
       LIMIT 1`
    ).bind(username, email).first();

    if (existingUserOrEmail) {
      if (existingUserOrEmail.username.toLowerCase() === username) {
        return errorResponse('اسم المستخدم مسجل بالفعل، يرجى اختيار اسم آخر', 409);
      }
      if (existingUserOrEmail.email.toLowerCase() === email) {
        return errorResponse('البريد الإلكتروني مسجل بالفعل لمستخدم آخر', 409);
      }
    }

    // Hash Password
    const passwordHash = await sha256Hex(password);
    const newUserId = body.id || ('usr_' + crypto.randomUUID());
    const storedNationalId = nationalId || ('NID_UNSET_' + newUserId);

    // Insert into D1 DB
    await env.DB.prepare(
      `INSERT INTO users (
        id, national_id, full_name, username, email, password_hash,
        role_id, department, job_title, phone, clearance_level, is_active, permissions_json, allowed_company_ids, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      newUserId,
      storedNationalId,
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
      permissions,
      allowedCompanyIds
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
        `تم إنشاء حساب مستخدم جديد: ${fullName} (${jobTitle}) - الرقم القومي: ${nationalId || 'غير مسجل'}`
      ).run();
    } catch (logErr) {
      console.warn('Failed to insert audit log for user creation:', logErr);
    }

    let parsedAllowedCompanies: string[] = ['all'];
    try {
      parsedAllowedCompanies = JSON.parse(allowedCompanyIds);
    } catch {
      parsedAllowedCompanies = ['all'];
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
      allowedCompanyIds: parsedAllowedCompanies,
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
      `SELECT id, national_id, full_name, is_active, role_id, department, job_title, phone, permissions_json, allowed_company_ids FROM users WHERE id = ? LIMIT 1`
    ).bind(body.id).first();

    // If not found, execute UPSERT / INSERT
    if (!targetUser) {
      const newUserId = body.id;
      const rawNatId = (body.nationalId || body.national_id || '').trim();
      const nationalId = (rawNatId && rawNatId !== '29001010100000') ? rawNatId : ('NID_UNSET_' + newUserId);
      const fullName = body.fullName || body.nameAr || 'مستخدم جديد';
      const username = body.username || `user_${Date.now()}`;
      const email = body.email || `${username}@hrsup.com`;
      const pwd = body.password ? await sha256Hex(body.password) : 'admin123';
      const roleId = body.roleId || body.role || 'HR_MANAGER';
      const department = body.department || body.departmentAr || 'الإدارة';
      const jobTitle = body.jobTitleAr || body.job_title || roleId;
      const phone = body.phone || '';
      const permissions = Array.isArray(body.permissions) ? JSON.stringify(body.permissions) : '[]';
      const allowedCompanyIds = Array.isArray(body.allowedCompanyIds) && body.allowedCompanyIds.length > 0
        ? JSON.stringify(body.allowedCompanyIds)
        : '["all"]';

      await env.DB.prepare(`
        INSERT INTO users (id, national_id, full_name, username, email, password_hash, role_id, department, job_title, phone, clearance_level, is_active, permissions_json, allowed_company_ids)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 1, ?, ?)
      `).bind(body.id, nationalId, fullName, username, email, pwd, roleId, department, jobTitle, phone, permissions, allowedCompanyIds).run();

      return jsonResponse({ success: true, message: 'تم إنشاء المستخدم وحفظه بنجاح (UPSERT)' });
    }

    const fullName = body.fullName || body.nameAr || targetUser.full_name;
    const roleId = body.roleId || body.role || targetUser.role_id;
    const department = (body.department || body.departmentAr || targetUser.department).toString().replace(/موادر/g, 'موارد');
    const rawPutJt = (body.jobTitleAr || body.job_title || targetUser.job_title || roleId).toString();
    const jobTitle = rawPutJt
      .replace(/موادر/g, 'موارد')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\(HRMS\)|\(ATS\)|\(CTS\)|\(CFO\)|\(HRD\)|\(C-Suite\)/gi, '')
      .trim();
    const phone = body.phone !== undefined ? body.phone : (targetUser.phone || '');
    const clearanceLevel = body.clearanceLevel !== undefined ? Number(body.clearanceLevel) : undefined;
    const isActive = body.status !== undefined ? (body.status === 'ACTIVE' ? 1 : 0) : targetUser.is_active;

    let permissionsJson = targetUser.permissions_json;
    if (Array.isArray(body.permissions)) {
      permissionsJson = JSON.stringify(body.permissions);
    }

    let allowedCompanyIdsJson = targetUser.allowed_company_ids || '["all"]';
    if (Array.isArray(body.allowedCompanyIds)) {
      allowedCompanyIdsJson = JSON.stringify(body.allowedCompanyIds.length > 0 ? body.allowedCompanyIds : ['all']);
    }

    let nationalIdClause = '';
    const queryParams: any[] = [fullName, roleId, department, jobTitle, phone, isActive, permissionsJson, allowedCompanyIdsJson];

    if (body.nationalId !== undefined) {
      const rawNid = String(body.nationalId).trim();
      const storedNid = (rawNid && rawNid !== '29001010100000') ? rawNid : ('NID_UNSET_' + body.id);
      nationalIdClause = ', national_id = ?';
      queryParams.push(storedNid);
    }

    // Optional password update
    let passwordClause = '';

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
       SET full_name = ?, role_id = ?, department = ?, job_title = ?, phone = ?, is_active = ?, permissions_json = ?, allowed_company_ids = ?
       ${nationalIdClause}
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

    // Bump security_epoch to invalidate sessions if user status or clearance changed
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      await env.DB.prepare(`
        INSERT INTO system_settings (key, value, updated_at) VALUES ('security_epoch', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).bind(String(Date.now())).run();
    } catch {}

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

    // Bump security_epoch to invalidate deleted user sessions immediately
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      await env.DB.prepare(`
        INSERT INTO system_settings (key, value, updated_at) VALUES ('security_epoch', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).bind(String(Date.now())).run();
    } catch {}

    return jsonResponse({
      success: true,
      message: 'تم حذف المستخدم ومصفوفة صلاحياته بنجاح من قاعدة بيانات D1',
    });
  } catch (err: any) {
    return errorResponse(`خطأ في حذف المستخدم: ${err.message || String(err)}`, 500);
  }
};
