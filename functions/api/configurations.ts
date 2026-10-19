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
  audit_log_json?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConfigurationAuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  diffs: Array<{ field: string; from: string; to: string }>;
}

// Clean Practical Core Definitions (Pure Arabic Titles, No English acronyms or corporate filler)
const CLEAN_DEFAULT_SEEDS: Omit<SystemConfigurationRecord, 'created_at' | 'updated_at'>[] = [
  // 1. Roles & Job Titles (roles)
  {
    id: 'cfg_role_chair',
    category: 'roles',
    code: 'chairman',
    name_ar: 'رئيس مجلس الإدارة',
    name_en: 'Chairman of the Board',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_ceo',
    category: 'roles',
    code: 'ceo',
    name_ar: 'المدير التنفيذي',
    name_en: 'Chief Executive Officer',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_hr',
    category: 'roles',
    code: 'hr_manager',
    name_ar: 'مدير الموارد البشرية',
    name_en: 'Human Resources Director',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_cfo',
    category: 'roles',
    code: 'finance_director',
    name_ar: 'مدير مالي',
    name_en: 'Finance Director',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_accountant',
    category: 'roles',
    code: 'general_accountant',
    name_ar: 'محاسب عام',
    name_en: 'General Accountant',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_site_accountant',
    category: 'roles',
    code: 'site_accountant',
    name_ar: 'محاسب موقع ومشروع',
    name_en: 'Site & Project Accountant',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_projects',
    category: 'roles',
    code: 'tech_office_engineer',
    name_ar: 'مهندس مكتب فني',
    name_en: 'Technical Office Engineer',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_site_engineer',
    category: 'roles',
    code: 'site_engineer',
    name_ar: 'مهندس تنفيذ موقع',
    name_en: 'Site Execution Engineer',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_gov',
    category: 'roles',
    code: 'gov_relations',
    name_ar: 'مسؤول علاقات حكومية وتأمينات',
    name_en: 'Government Relations Officer',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_reception',
    category: 'roles',
    code: 'receptionist',
    name_ar: 'مسؤول استقبال واستعلامات',
    name_en: 'Receptionist',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_role_safety',
    category: 'roles',
    code: 'safety_officer',
    name_ar: 'مسؤول السلامة والصحة المهنية',
    name_en: 'HSE & Safety Officer',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },

  // 2. Departments & Specializations (departments)
  {
    id: 'cfg_dept_top',
    category: 'departments',
    code: 'executive',
    name_ar: 'الإدارة العليا',
    name_en: 'Executive Management',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_dept_hr',
    category: 'departments',
    code: 'hr',
    name_ar: 'الموارد البشرية',
    name_en: 'Human Resources',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_dept_fin',
    category: 'departments',
    code: 'finance',
    name_ar: 'الشؤون المالية',
    name_en: 'Financial Affairs',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_dept_projects',
    category: 'departments',
    code: 'engineering',
    name_ar: 'المكتب الفني والمشاريع',
    name_en: 'Technical Office & Projects',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_dept_legal',
    category: 'departments',
    code: 'legal',
    name_ar: 'الشؤون القانونية',
    name_en: 'Legal Affairs',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_dept_it',
    category: 'departments',
    code: 'it',
    name_ar: 'تكنولوجيا المعلومات',
    name_en: 'Information Technology',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_dept_proc',
    category: 'departments',
    code: 'procurement',
    name_ar: 'المشتريات والتعاقدات',
    name_en: 'Procurement & Contracts',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_dept_pr',
    category: 'departments',
    code: 'reception',
    name_ar: 'العلاقات العامة والاستقبال',
    name_en: 'Public Relations & Reception',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },

  // 3. Document & License Types (doc_types)
  {
    id: 'cfg_doc_cr',
    category: 'doc_types',
    code: 'commercial_register',
    name_ar: 'السجل التجاري الرئيسي',
    name_en: 'Commercial Registration',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_doc_tax',
    category: 'doc_types',
    code: 'tax_card',
    name_ar: 'البطاقة الضريبية',
    name_en: 'Corporate Tax Card',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_doc_vat',
    category: 'doc_types',
    code: 'vat_cert',
    name_ar: 'شهادة التسجيل بضريبة القيمة المضافة',
    name_en: 'VAT Registration Certificate',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_doc_contractors',
    category: 'doc_types',
    code: 'contractors_federation',
    name_ar: 'شهادة تصنيف الاتحاد المصري لمقاولي التشييد والبناء',
    name_en: 'Contractors Federation Classification',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_doc_insurance',
    category: 'doc_types',
    code: 'social_insurance_cert',
    name_ar: 'شهادة التأمينات الاجتماعية للمنشأة',
    name_en: 'Corporate Social Insurance Certificate',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_doc_license',
    category: 'doc_types',
    code: 'operating_license',
    name_ar: 'رخصة تشغيل المقر / رخصة النشاط',
    name_en: 'Operating License',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },

  // 4. Branch & Site Types (branch_types)
  {
    id: 'cfg_branch_hq',
    category: 'branch_types',
    code: 'headquarters',
    name_ar: 'مقر رئيسي عام',
    name_en: 'Corporate Headquarters',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_branch_admin',
    category: 'branch_types',
    code: 'admin_branch',
    name_ar: 'فرع إداري إقليمي',
    name_en: 'Regional Administrative Branch',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_branch_project',
    category: 'branch_types',
    code: 'project_site',
    name_ar: 'موقع عمل ومشروع إنشائي',
    name_en: 'Construction Project Site',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_branch_wh',
    category: 'branch_types',
    code: 'warehouse',
    name_ar: 'مستودع مركزي ومخزن إمداد',
    name_en: 'Central Warehouse & Logistics',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_branch_workshop',
    category: 'branch_types',
    code: 'workshop',
    name_ar: 'ورشة تصنيع وصيانة مركزية',
    name_en: 'Fabrication & Maintenance Workshop',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },

  // 5. Signatory Titles (signatory_titles)
  {
    id: 'cfg_sig_chair',
    category: 'signatory_titles',
    code: 'chairman',
    name_ar: 'رئيس مجلس الإدارة والعضو المنتدب',
    name_en: 'Chairman & Managing Director',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_sig_deputy',
    category: 'signatory_titles',
    code: 'deputy_chairman',
    name_ar: 'نائب رئيس مجلس الإدارة',
    name_en: 'Vice Chairman of the Board',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_sig_ceo',
    category: 'signatory_titles',
    code: 'ceo',
    name_ar: 'الرئيس التنفيذي والمفوض العام',
    name_en: 'Chief Executive Officer',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_sig_cfo',
    category: 'signatory_titles',
    code: 'cfo_signatory',
    name_ar: 'العضو المنتدب للشؤون المالية',
    name_en: 'Managing Director of Finance',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_sig_poa',
    category: 'signatory_titles',
    code: 'poa_holder',
    name_ar: 'مفوض قانوني بموجب توكيل رسمي',
    name_en: 'Authorized Signatory under Official POA',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },

  // 6. Reception & Facilities Lists (reception_lists)
  {
    id: 'cfg_rec_boardroom',
    category: 'reception_lists',
    code: 'boardroom',
    name_ar: 'قاعة الاجتماعات الرئيسية',
    name_en: 'Executive Boardroom',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_rec_training',
    category: 'reception_lists',
    code: 'training_hall',
    name_ar: 'قاعة ورش العمل والتدريب',
    name_en: 'Training & Workshop Hall',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_rec_aramex',
    category: 'reception_lists',
    code: 'courier_aramex',
    name_ar: 'شركة أرامكس للشحن السريع',
    name_en: 'Aramex Express Courier',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_rec_dhl',
    category: 'reception_lists',
    code: 'courier_dhl',
    name_ar: 'شركة DHL للشحن الدولي',
    name_en: 'DHL Express International',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_rec_ems',
    category: 'reception_lists',
    code: 'courier_egypt_post',
    name_ar: 'البريد المصري السريع (EMS)',
    name_en: 'Egypt Post Express (EMS)',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
  {
    id: 'cfg_rec_bosta',
    category: 'reception_lists',
    code: 'courier_bosta',
    name_ar: 'شركة بوسطة للشحن الداخلي',
    name_en: 'Bosta Logistics Services',
    color_var: '#D99B26',
    is_system: 0,
    is_active: 1,
  },
];

const INIT_FLAG_KEY = 'configurations_seeded_v5_clean';

export async function ensureConfigurationSchema(db: D1Database): Promise<void> {
  try {
    // 1. Create table schemas
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS system_init_flags (
          flag_key TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
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
          audit_log_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_cfg_cat ON system_configurations(category)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_sys_cfg_code ON system_configurations(category, code)`)
    ]);

    // Ensure audit_log_json column exists if table existed from an older version
    try {
      await db.prepare(`ALTER TABLE system_configurations ADD COLUMN audit_log_json TEXT`).run();
    } catch {
      // Column already exists
    }

    // 2. Check if one-time initialization was already executed
    const flagCheck = await db.prepare(
      `SELECT flag_key FROM system_init_flags WHERE flag_key = ?`
    ).bind(INIT_FLAG_KEY).first();

    if (!flagCheck) {
      // One-time purge of dirty legacy records with acronyms, technical keys, or governance filler
      await db.prepare(`
        DELETE FROM system_configurations 
        WHERE name_ar LIKE '%(C-Suite)%' 
           OR name_ar LIKE '%(CFO)%' 
           OR name_ar LIKE '%(HRD)%' 
           OR name_ar LIKE '%(HRMS)%' 
           OR name_ar LIKE '%(ATS)%' 
           OR name_ar LIKE '%(CTS)%'
           OR code IN ('SUPER_ADMIN', 'FINANCE_OFFICER', 'LEGAL_COUNSEL')
           OR description_ar LIKE '%حوكمة مؤسسية شاملة%'
           OR description_ar LIKE '%حوكمة الشركات الشقيقة%'
      `).run();

      // Only seed initial clean records if the table is currently empty
      const countRes = await db.prepare(`SELECT COUNT(*) as cnt FROM system_configurations`).first<{ cnt: number }>();
      if (!countRes || countRes.cnt === 0) {
        const initialAuditJson = JSON.stringify([
          {
            id: `aud_init_${Date.now()}`,
            timestamp: new Date().toISOString(),
            userName: 'النظام الأساسي',
            action: 'تهيئة القائمة المعتمدة',
            diffs: [],
          },
        ]);

        const stmts = CLEAN_DEFAULT_SEEDS.map(seed =>
          db.prepare(`
            INSERT INTO system_configurations (
              id, category, code, name_ar, name_en, description_ar, color_var, is_system, is_active, audit_log_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?)
            ON CONFLICT(id) DO NOTHING
          `).bind(
            seed.id,
            seed.category,
            seed.code,
            seed.name_ar,
            seed.name_en || null,
            seed.description_ar || null,
            seed.color_var || '#D99B26',
            initialAuditJson
          )
        );

        for (let i = 0; i < stmts.length; i += 10) {
          await db.batch(stmts.slice(i, i + 10));
        }
      }

      // Mark the flag so initial seeding NEVER runs again on subsequent requests
      await db.prepare(`INSERT OR IGNORE INTO system_init_flags (flag_key) VALUES (?)`).bind(INIT_FLAG_KEY).run();
    }
  } catch (err) {
    console.warn('[ensureConfigurationSchema] Schema init warning:', err);
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
      ? CLEAN_DEFAULT_SEEDS.filter(s => s.category === category)
      : CLEAN_DEFAULT_SEEDS;
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
    query += ` ORDER BY is_active DESC, name_ar ASC`;

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

// POST /api/configurations (Create new configuration item)
export const onRequestPost: PagesFunction = async ({ env, request }) => {
  const db = env.DB;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400);
  }

  const { category, nameAr, nameEn, code, descriptionAr, colorVar, isActive, userName } = body;

  if (!category || !nameAr) {
    return errorResponse('category and nameAr are strictly required', 400);
  }

  const id = body.id || `cfg_${category}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const finalCode = code || nameAr.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\u0600-\u06FF]/gi, '');

  const initialAudit: ConfigurationAuditEntry[] = [
    {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userName: userName || 'مدير النظام',
      action: 'إضافة عنصر جديد في القائمة',
      diffs: [
        { field: 'المسمى باللغة العربية', from: '—', to: nameAr.trim() },
        { field: 'التصنيف', from: '—', to: category },
        { field: 'الحالة', from: '—', to: isActive === false ? 'موقوف مؤقتاً' : 'نشط' },
      ],
    },
  ];

  if (nameEn?.trim()) {
    initialAudit[0].diffs.push({ field: 'المسمى باللغة الإنجليزية', from: '—', to: nameEn.trim() });
  }

  if (!db) {
    const newItem = {
      id,
      category,
      code: finalCode,
      name_ar: nameAr.trim(),
      name_en: nameEn ? nameEn.trim() : '',
      description_ar: descriptionAr || '',
      color_var: colorVar || '#D99B26',
      is_system: 0,
      is_active: isActive === false ? 0 : 1,
      audit_log_json: JSON.stringify(initialAudit),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return jsonResponse({ success: true, item: newItem, message: 'Created in local cache' });
  }

  await ensureConfigurationSchema(db);

  try {
    // Check if item already exists by code or Arabic name in this category
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
        id, category, code, name_ar, name_en, description_ar, color_var, is_system, is_active, audit_log_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(
      id,
      category,
      finalCode,
      nameAr.trim(),
      nameEn ? nameEn.trim() : null,
      descriptionAr ? descriptionAr.trim() : null,
      colorVar || '#D99B26',
      isActive === false ? 0 : 1,
      JSON.stringify(initialAudit)
    ).run();

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

// PUT /api/configurations (Update configuration item with exact field diff audit tracking)
export const onRequestPut: PagesFunction = async ({ env, request }) => {
  const db = env.DB;
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON payload', 400);
  }

  const { id, nameAr, nameEn, category, descriptionAr, colorVar, isActive, userName } = body;
  if (!id) {
    return errorResponse('Configuration id is required for update', 400);
  }

  if (!db) {
    return jsonResponse({ success: true, message: 'Updated in local fallback' });
  }

  await ensureConfigurationSchema(db);

  try {
    const existing = await db.prepare(
      `SELECT * FROM system_configurations WHERE id = ?`
    ).bind(id).first<SystemConfigurationRecord>();

    if (!existing) {
      return errorResponse('Configuration item not found in D1', 404);
    }

    // Compute exact field diffs
    const diffs: Array<{ field: string; from: string; to: string }> = [];

    if (nameAr && nameAr.trim() !== existing.name_ar) {
      diffs.push({ field: 'المسمى باللغة العربية', from: existing.name_ar, to: nameAr.trim() });
    }
    if (nameEn !== undefined && (nameEn?.trim() || '') !== (existing.name_en || '')) {
      diffs.push({
        field: 'المسمى باللغة الإنجليزية',
        from: existing.name_en || '—',
        to: nameEn?.trim() || '—',
      });
    }
    if (category && category !== existing.category) {
      diffs.push({ field: 'التصنيف / القائمة', from: existing.category, to: category });
    }
    if (isActive !== undefined) {
      const nextActiveNum = isActive ? 1 : 0;
      if (nextActiveNum !== existing.is_active) {
        diffs.push({
          field: 'حالة العنصر',
          from: existing.is_active === 1 ? 'نشط ومتاح' : 'موقوف مؤقتاً',
          to: nextActiveNum === 1 ? 'نشط ومتاح' : 'موقوف مؤقتاً',
        });
      }
    }

    let auditHistory: ConfigurationAuditEntry[] = [];
    try {
      if (existing.audit_log_json) {
        auditHistory = JSON.parse(existing.audit_log_json);
      }
    } catch {
      auditHistory = [];
    }

    if (diffs.length > 0) {
      auditHistory.unshift({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        userName: userName || 'مدير النظام',
        action: 'تعديل بيانات المسمى',
        diffs,
      });
    }

    await db.prepare(`
      UPDATE system_configurations
      SET name_ar = COALESCE(?, name_ar),
          name_en = COALESCE(?, name_en),
          category = COALESCE(?, category),
          description_ar = COALESCE(?, description_ar),
          color_var = COALESCE(?, color_var),
          is_active = COALESCE(?, is_active),
          audit_log_json = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      nameAr ? nameAr.trim() : null,
      nameEn !== undefined ? (nameEn ? nameEn.trim() : null) : null,
      category || null,
      descriptionAr !== undefined ? (descriptionAr ? descriptionAr.trim() : null) : null,
      colorVar || null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      JSON.stringify(auditHistory),
      id
    ).run();

    const updated = await db.prepare(`SELECT * FROM system_configurations WHERE id = ?`).bind(id).first();
    return jsonResponse({ success: true, item: updated });
  } catch (err: any) {
    return errorResponse(`Failed to update configuration: ${err?.message || err}`, 500);
  }
};

// DELETE /api/configurations?id=... OR ?clearCategory=...
// Permanently deletes from Cloudflare D1 — NEVER BLOCKS WITH SYSTEM LOCK!
export const onRequestDelete: PagesFunction = async ({ env, request }) => {
  const db = env.DB;
  const url = new URL(request.url);
  const clearCategory = url.searchParams.get('clearCategory');
  const id = url.searchParams.get('id');

  if (!db) {
    return jsonResponse({ success: true, message: 'Deleted from local fallback' });
  }

  await ensureConfigurationSchema(db);

  try {
    // 1. Wipe category clean if requested
    if (clearCategory) {
      await db.prepare(`DELETE FROM system_configurations WHERE category = ?`).bind(clearCategory).run();
      return jsonResponse({
        success: true,
        message: `تم تنظيف وتصفير تصنيف [${clearCategory}] بالكامل من قاعدة البيانات`,
        clearedCategory: clearCategory,
      });
    }

    // 2. Individual item permanent deletion
    if (!id) {
      return errorResponse('id or clearCategory query parameter is required', 400);
    }

    await db.prepare(`DELETE FROM system_configurations WHERE id = ?`).bind(id).run();

    return jsonResponse({
      success: true,
      message: 'تم حذف العنصر نهائياً وبشكل قطعي من قاعدة بيانات Cloudflare D1',
      deletedId: id,
    });
  } catch (err: any) {
    return errorResponse(`Failed to delete configuration: ${err?.message || err}`, 500);
  }
};
