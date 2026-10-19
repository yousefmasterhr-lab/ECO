import {
  PagesFunction,
  jsonResponse,
  errorResponse,
  handleOptions,
  D1Database,
} from './_utils';

export const onRequestOptions: PagesFunction = async () => {
  return handleOptions();
};

export interface SystemConfigurationRecord {
  id: string;
  category: string;
  code: string;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
  color_var?: string;
  is_system?: number;
  is_active?: number;
  metadata_json?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_CONFIG_SEEDS: Omit<SystemConfigurationRecord, 'created_at' | 'updated_at'>[] = [
  // 1. Roles & Job Titles (الأدوار والمسميات الوظيفية - مسميات عربية احترافية بدون اختصارات إنجليزية)
  {
    id: 'cfg_role_chair',
    category: 'roles',
    code: 'CHAIRMAN',
    name_ar: 'رئيس مجلس الإدارة',
    name_en: 'Chairman of the Board',
    description_ar: 'حوكمة استراتيجية وقرارات سيادية عليا',
    color_var: '#D99B26',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_ceo',
    category: 'roles',
    code: 'CEO',
    name_ar: 'المدير التنفيذي',
    name_en: 'Chief Executive Officer',
    description_ar: 'إدارة تشغيلية عليا وتنفيذ الاستراتيجيات العامة',
    color_var: '#D97706',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_csuite',
    category: 'roles',
    code: 'SUPER_ADMIN',
    name_ar: 'مدير النظام العام',
    name_en: 'System Administrator',
    description_ar: 'إشراف عام وصلاحيات النظام المؤسسي',
    color_var: '#B45309',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_hr',
    category: 'roles',
    code: 'HR_MANAGER',
    name_ar: 'مدير الموارد البشرية',
    name_en: 'Human Resources Director',
    description_ar: 'شؤون الموظفين، مسير الرواتب والتطوير الإداري',
    color_var: '#EBB34D',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_cfo',
    category: 'roles',
    code: 'FINANCE_DIRECTOR',
    name_ar: 'مدير مالي',
    name_en: 'Finance Director',
    description_ar: 'الحسابات العامة، الميزانيات والسيولة النقدية',
    color_var: '#059669',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_accountant',
    category: 'roles',
    code: 'ACCOUNTANT',
    name_ar: 'محاسب عام',
    name_en: 'General Accountant',
    description_ar: 'قيود اليومية ومطابقة الحسابات والتقارير',
    color_var: '#10B981',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_projects',
    category: 'roles',
    code: 'PROJECTS_ENGINEER',
    name_ar: 'مهندس مكتب فني',
    name_en: 'Technical Office Engineer',
    description_ar: 'المستخلصات الفنية، التسعير وحصر الكميات',
    color_var: '#2563EB',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_gov',
    category: 'roles',
    code: 'GOV_RELATIONS',
    name_ar: 'مسؤول علاقات حكومية وتأمينات',
    name_en: 'Government Relations & Insurance Officer',
    description_ar: 'التأمينات الاجتماعية والجهات الحكومية والامتثال',
    color_var: '#7C3AED',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_role_reception',
    category: 'roles',
    code: 'RECEPTIONIST',
    name_ar: 'موظف استقبال',
    name_en: 'Receptionist',
    description_ar: 'إدارة الاستقبال وبوابة الزوار والاتصالات الإدارية',
    color_var: '#0D9488',
    is_system: 1,
    is_active: 1,
  },

  // 2. Departments & Specializations (الأقسام والإدارات القياسية النقية)
  {
    id: 'cfg_dept_top',
    category: 'departments',
    code: 'executive',
    name_ar: 'الإدارة العليا',
    name_en: 'Executive Management',
    description_ar: 'القيادة المؤسسية والتخطيط الاستراتيجي',
    color_var: '#D99B26',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_dept_hr',
    category: 'departments',
    code: 'hr',
    name_ar: 'الموارد البشرية',
    name_en: 'Human Resources',
    description_ar: 'رأس المال البشري والشؤون الإدارية',
    color_var: '#EBB34D',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_dept_fin',
    category: 'departments',
    code: 'finance',
    name_ar: 'الشؤون المالية',
    name_en: 'Financial Affairs',
    description_ar: 'الإدارة المالية والمحاسبة والخزينة',
    color_var: '#059669',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_dept_projects',
    category: 'departments',
    code: 'engineering',
    name_ar: 'المكتب الفني والمشاريع',
    name_en: 'Technical Office & Projects',
    description_ar: 'الدراسات الهندسية وتنفيذ المشاريع',
    color_var: '#2563EB',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_dept_legal',
    category: 'departments',
    code: 'legal',
    name_ar: 'الشؤون القانونية',
    name_en: 'Legal Affairs',
    description_ar: 'الحوكمة القانونية والتوثيق والنزاعات',
    color_var: '#7C3AED',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_dept_it',
    category: 'departments',
    code: 'it',
    name_ar: 'تكنولوجيا المعلومات',
    name_en: 'Information Technology',
    description_ar: 'البنية التقنية والأنظمة الرقمية والأمن السيبراني',
    color_var: '#0284C7',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_dept_proc',
    category: 'departments',
    code: 'procurement',
    name_ar: 'المشتريات والتعاقدات',
    name_en: 'Procurement & Contracts',
    description_ar: 'سلاسل الإمداد ومناقصات الموردين',
    color_var: '#D97706',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_dept_pr',
    category: 'departments',
    code: 'reception',
    name_ar: 'العلاقات العامة والاستقبال',
    name_en: 'Public Relations & Reception',
    description_ar: 'إدارة المراسم والضيافة والزوار',
    color_var: '#0D9488',
    is_system: 1,
    is_active: 1,
  },

  // 3. Document & License Types (أنواع الوثائق والتراخيص)
  {
    id: 'cfg_doc_cr',
    category: 'doc_types',
    code: 'commercial_register',
    name_ar: 'السجل التجاري الرئيسي',
    name_en: 'Primary Commercial Register',
    description_ar: 'وثيقة السجل التجاري الصادرة من وزارة التجارة والاستثمار',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_doc_tax',
    category: 'doc_types',
    code: 'tax_card',
    name_ar: 'البطاقة الضريبية',
    name_en: 'Corporate Tax Card',
    description_ar: 'شهادة التسجيل الضريبي والرقم الضريبي الموحد',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_doc_vat',
    category: 'doc_types',
    code: 'vat_cert',
    name_ar: 'شهادة التسجيل بضريبة القيمة المضافة',
    name_en: 'VAT Registration Certificate',
    description_ar: 'شهادة الامتثال لضريبة القيمة المضافة المعتمدة',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_doc_contractors',
    category: 'doc_types',
    code: 'contractors_federation',
    name_ar: 'شهادة تصنيف الاتحاد المصري لمقاولي التشييد والبناء',
    name_en: 'Contractors Federation Classification',
    description_ar: 'الفئة التخصصية لتنفيذ الأعمال والمناقصات الحكومية',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_doc_insurance',
    category: 'doc_types',
    code: 'social_insurance_cert',
    name_ar: 'شهادة التأمينات الاجتماعية للمنشأة',
    name_en: 'Corporate Social Insurance Certificate',
    description_ar: 'موقف سداد اشتراكات التأمينات الاجتماعية للعاملين',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_doc_license',
    category: 'doc_types',
    code: 'operating_license',
    name_ar: 'رخصة تشغيل المقر / رخصة النشاط',
    name_en: 'Operating & Municipal License',
    description_ar: 'رخصة الحماية المدنية والتراخيص البلدية للمنشأة',
    is_system: 1,
    is_active: 1,
  },

  // 4. Branch & Site Types (أنواع المقرات والمواقع)
  {
    id: 'cfg_branch_hq',
    category: 'branch_types',
    code: 'headquarters',
    name_ar: 'مقر رئيسي عام',
    name_en: 'Corporate Headquarters',
    description_ar: 'المقر الإداري الرئيسي لإدارة المجموعة والشركات',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_branch_admin',
    category: 'branch_types',
    code: 'admin_branch',
    name_ar: 'فرع إداري إقليمي',
    name_en: 'Regional Administrative Branch',
    description_ar: 'مكتب تمثيل أو فرع إقليمي للمتابعة والإشراف',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_branch_project',
    category: 'branch_types',
    code: 'project_site',
    name_ar: 'موقع عمل ومشروع إنشائي',
    name_en: 'Construction Project Site',
    description_ar: 'مقر ميداني مؤقت لإدارة مشروع إنشائي جاري',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_branch_wh',
    category: 'branch_types',
    code: 'warehouse',
    name_ar: 'مستودع مركزي ومخزن إمداد',
    name_en: 'Central Warehouse & Logistics Hub',
    description_ar: 'مستودع لتخزين المعدات والمواد الخام الإنشائية',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_branch_workshop',
    category: 'branch_types',
    code: 'workshop',
    name_ar: 'ورشة تصنيع وصيانة مركزية',
    name_en: 'Fabrication & Maintenance Workshop',
    description_ar: 'ورشة صيانة المعدات الثقيلة والتصنيع المسبق',
    is_system: 1,
    is_active: 1,
  },

  // 5. Signatory Titles (صفات التفويض والتوكيلات)
  {
    id: 'cfg_sig_chair',
    category: 'signatory_titles',
    code: 'chairman',
    name_ar: 'رئيس مجلس الإدارة والعضو المنتدب',
    name_en: 'Chairman & Managing Director',
    description_ar: 'صلاحيات توقيع منفردة مطلقة أمام كافة الجهات الرسمية والبنكية',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_sig_deputy',
    category: 'signatory_titles',
    code: 'deputy_chairman',
    name_ar: 'نائب رئيس مجلس الإدارة',
    name_en: 'Vice Chairman of the Board',
    description_ar: 'صلاحيات إدارية وتوقيع قانوني وتفويضات وفق اللائحة',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_sig_ceo',
    category: 'signatory_titles',
    code: 'ceo',
    name_ar: 'الرئيس التنفيذي والمفوض العام',
    name_en: 'Chief Executive Officer',
    description_ar: 'تمثيل الشركة وإبرام العقود وفتح الحسابات البنكية',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_sig_cfo',
    category: 'signatory_titles',
    code: 'cfo_signatory',
    name_ar: 'العضو المنتدب للشؤون المالية',
    name_en: 'Managing Director of Finance',
    description_ar: 'توقيع الشيكات والتحويلات البنكية بالحدود المنصوص عليها',
    is_system: 1,
    is_active: 1,
  },
  {
    id: 'cfg_sig_poa',
    category: 'signatory_titles',
    code: 'poa_holder',
    name_ar: 'مفوض قانوني بموجب توكيل رسمي عام/خاص',
    name_en: 'Authorized Signatory under Official POA',
    description_ar: 'التعامل مع الجهات الحكومية ومصلحة الضرائب والسجل التجاري',
    is_system: 1,
    is_active: 1,
  },
];

export async function ensureConfigurationSchema(db: D1Database): Promise<void> {
  try {
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS system_configurations (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          code TEXT NOT NULL,
          name_ar TEXT NOT NULL,
          name_en TEXT,
          description_ar TEXT,
          description_en TEXT,
          color_var TEXT,
          is_system INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          metadata_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_cfg_cat ON system_configurations(category)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_cfg_code ON system_configurations(category, code)`)
    ]);

    // Ensure and sync default system seeds
    const stmts = DEFAULT_CONFIG_SEEDS.map(seed =>
      db.prepare(`
        INSERT INTO system_configurations (
          id, category, code, name_ar, name_en, description_ar, color_var, is_system, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          category = excluded.category,
          code = excluded.code,
          name_ar = excluded.name_ar,
          name_en = excluded.name_en,
          description_ar = excluded.description_ar,
          color_var = excluded.color_var
        WHERE system_configurations.is_system = 1
      `).bind(
        seed.id,
        seed.category,
        seed.code,
        seed.name_ar,
        seed.name_en || null,
        seed.description_ar || null,
        seed.color_var || null,
        seed.is_system || 0,
        seed.is_active !== undefined ? seed.is_active : 1
      )
    );

    // Execute in batches of 10
    for (let i = 0; i < stmts.length; i += 10) {
      await db.batch(stmts.slice(i, i + 10));
    }
  } catch (err) {
    console.warn('[ensureConfigurationSchema] Schema auto-init notice:', err);
  }
}

// GET /api/configurations?category=roles
export const onRequestGet: PagesFunction = async ({ env, request }) => {
  const db = env.DB;
  if (!db) {
    // In-memory fallback if no Cloudflare D1
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const items = category
      ? DEFAULT_CONFIG_SEEDS.filter(s => s.category === category)
      : DEFAULT_CONFIG_SEEDS;
    return jsonResponse({ success: true, configurations: items, source: 'fallback' });
  }

  await ensureConfigurationSchema(db);

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let query = `SELECT * FROM system_configurations`;
    const params: any[] = [];

    if (category) {
      query += ` WHERE category = ?`;
      params.push(category);
    }
    query += ` ORDER BY is_system DESC, name_ar ASC`;

    const stmt = params.length > 0 ? db.prepare(query).bind(...params) : db.prepare(query);
    const result = await stmt.all<SystemConfigurationRecord>();

    return jsonResponse({
      success: true,
      configurations: result.results || [],
      count: result.results?.length || 0,
    });
  } catch (err: any) {
    return errorResponse(`Failed to load configurations: ${err?.message || err}`, 500);
  }
};

// POST /api/configurations (Create new dynamic item on the fly)
export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const db = env.DB;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400);
  }

  const { category, nameAr, nameEn, code, descriptionAr, colorVar } = body;

  if (!category || !nameAr) {
    return errorResponse('category and nameAr are strictly required', 400);
  }

  const id = body.id || `cfg_${category}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const finalCode = code || nameAr.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\u0600-\u06FF]/gi, '');

  if (!db) {
    const newItem = {
      id,
      category,
      code: finalCode,
      name_ar: nameAr.trim(),
      name_en: nameEn ? nameEn.trim() : '',
      description_ar: descriptionAr || '',
      color_var: colorVar || '#059669',
      is_system: 0,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return jsonResponse({ success: true, item: newItem, message: 'Created in local cache' });
  }

  await ensureConfigurationSchema(db);

  try {
    // Check if code or name already exists in this category
    const existing = await db.prepare(`
      SELECT id, name_ar FROM system_configurations 
      WHERE category = ? AND (code = ? OR name_ar = ?) 
      LIMIT 1
    `).bind(category, finalCode, nameAr.trim()).first<SystemConfigurationRecord>();

    if (existing) {
      return jsonResponse({
        success: true,
        item: existing,
        message: 'Item already exists, returned existing record',
        alreadyExisted: true,
      });
    }

    await db.prepare(`
      INSERT INTO system_configurations (
        id, category, code, name_ar, name_en, description_ar, color_var, is_system, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1)
    `).bind(
      id,
      category,
      finalCode,
      nameAr.trim(),
      nameEn ? nameEn.trim() : null,
      descriptionAr ? descriptionAr.trim() : null,
      colorVar || null
    ).run();

    // Log to audit log
    try {
      await db.prepare(`
        INSERT INTO audit_logs (id, user_id, user_name, category, action, details)
        VALUES (?, 'system', 'Dynamic Config Engine', 'CONFIG', 'CREATE', ?)
      `).bind(
        `log_cfg_${Date.now()}`,
        `Created configuration [${category}]: ${nameAr.trim()}`
      ).run();
    } catch {
      // Non-critical
    }

    const created = await db.prepare(`SELECT * FROM system_configurations WHERE id = ?`).bind(id).first();

    return jsonResponse({
      success: true,
      item: created,
      message: 'Configuration created and persisted to Cloudflare D1 successfully',
    });
  } catch (err: any) {
    return errorResponse(`Failed to create configuration: ${err?.message || err}`, 500);
  }
};

// PUT /api/configurations (Update configuration item)
export const onRequestPut: PagesFunction = async ({ env, request }) => {
  const db = env.DB;
  if (!db) {
    return jsonResponse({ success: true, message: 'Updated in local fallback' });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400);
  }

  const { id, nameAr, nameEn, descriptionAr, colorVar, isActive } = body;
  if (!id) {
    return errorResponse('Configuration id is required for update', 400);
  }

  await ensureConfigurationSchema(db);

  try {
    await db.prepare(`
      UPDATE system_configurations
      SET name_ar = COALESCE(?, name_ar),
          name_en = COALESCE(?, name_en),
          description_ar = COALESCE(?, description_ar),
          color_var = COALESCE(?, color_var),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      nameAr ? nameAr.trim() : null,
      nameEn ? nameEn.trim() : null,
      descriptionAr ? descriptionAr.trim() : null,
      colorVar || null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      id
    ).run();

    const updated = await db.prepare(`SELECT * FROM system_configurations WHERE id = ?`).bind(id).first();
    return jsonResponse({ success: true, item: updated });
  } catch (err: any) {
    return errorResponse(`Failed to update configuration: ${err?.message || err}`, 500);
  }
};

// DELETE /api/configurations?id=...
export const onRequestDelete: PagesFunction = async ({ env, request }) => {
  const db = env.DB;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return errorResponse('id query parameter is required', 400);
  }

  if (!db) {
    return jsonResponse({ success: true, message: 'Deleted from local fallback' });
  }

  await ensureConfigurationSchema(db);

  try {
    // Prevent deletion of critical system seeds
    const item = await db.prepare(`SELECT * FROM system_configurations WHERE id = ?`).bind(id).first<SystemConfigurationRecord>();
    if (!item) {
      return errorResponse('Configuration item not found', 404);
    }

    if (item.is_system === 1) {
      // Soft disable system records instead of hard delete
      await db.prepare(`UPDATE system_configurations SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id).run();
      return jsonResponse({ success: true, message: 'System configuration deactivated', deactivated: true });
    }

    await db.prepare(`DELETE FROM system_configurations WHERE id = ?`).bind(id).run();

    return jsonResponse({ success: true, message: 'Configuration item permanently deleted' });
  } catch (err: any) {
    return errorResponse(`Failed to delete configuration: ${err?.message || err}`, 500);
  }
};
