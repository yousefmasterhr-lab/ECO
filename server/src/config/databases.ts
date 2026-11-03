/**
 * ECO ERP - Multi-Database Federation Registry & Configuration
 * Source of Truth: Tarabot ERP Legacy Architecture (16 Local Databases)
 */

export interface DatabaseRegistryEntry {
  name: string;
  displayNameAr: string;
  displayNameEn: string;
  category: 'primary' | 'archives' | 'partners' | 'specialized_payroll' | 'engineering_archive' | 'sandbox';
  categoryNameAr: string;
  categoryNameEn: string;
  categoryIcon: string;
  isPrimary: boolean;
  descriptionAr: string;
}

export const DATABASE_REGISTRY: Record<string, DatabaseRegistryEntry> = {
  Tarabot_Data_2026: {
    name: 'Tarabot_Data_2026',
    displayNameAr: 'شركة ترابط - المنظومة المالية النشطة (2026)',
    displayNameEn: 'Tarabot Co. - Active Fiscal Year (2026)',
    category: 'primary',
    categoryNameAr: 'المنظومة المالية النشطة',
    categoryNameEn: 'Active Financial System',
    categoryIcon: 'Activity',
    isPrimary: true,
    descriptionAr: 'قاعدة البيانات التشغيلية الرئيسية للعام المالي 2026 والحسابات الجارية',
  },
  MK_Khalil_Db_2026: {
    name: 'MK_Khalil_Db_2026',
    displayNameAr: 'مؤسسة محمد خليل للمقاولات العامة (2026)',
    displayNameEn: 'MK Khalil General Contracting (2026)',
    category: 'partners',
    categoryNameAr: 'شركات الشركاء والفروع',
    categoryNameEn: 'Partners & Affiliates',
    categoryIcon: 'Building2',
    isPrimary: false,
    descriptionAr: 'الحسابات المستقلة والتشغيلية لمؤسسة الشريك محمد خليل',
  },
  MKH_Tarabot_Data_2026: {
    name: 'MKH_Tarabot_Data_2026',
    displayNameAr: 'شركة إم كيه إتش ترابط للتجارة والمقاولات (2026)',
    displayNameEn: 'MKH Tarabot Contracting & Trading (2026)',
    category: 'partners',
    categoryNameAr: 'شركات الشركاء والفروع',
    categoryNameEn: 'Partners & Affiliates',
    categoryIcon: 'Building2',
    isPrimary: false,
    descriptionAr: 'سجلات العمليات والحسابات لشركة الشراكة MKH للعام 2026',
  },
  MM_Moustafa_Db_26: {
    name: 'MM_Moustafa_Db_26',
    displayNameAr: 'مؤسسة محمود مصطفى للأعمال الهندسية (2026)',
    displayNameEn: 'MM Moustafa Engineering Works (2026)',
    category: 'partners',
    categoryNameAr: 'شركات الشركاء والفروع',
    categoryNameEn: 'Partners & Affiliates',
    categoryIcon: 'Building2',
    isPrimary: false,
    descriptionAr: 'الحسابات المستقلة لمؤسسة الشريك محمود مصطفى',
  },
  SV_SmartV_Db_2026: {
    name: 'SV_SmartV_Db_2026',
    displayNameAr: 'شركة سمارت فيجن للحلول المتكاملة (2026)',
    displayNameEn: 'Smart Vision Integrated Solutions (2026)',
    category: 'partners',
    categoryNameAr: 'شركات الشركاء والفروع',
    categoryNameEn: 'Partners & Affiliates',
    categoryIcon: 'Building2',
    isPrimary: false,
    descriptionAr: 'المنظومة المالية والتجارية لشركة سمارت فيجن التابعة',
  },
  Tarabot_Data_2023: {
    name: 'Tarabot_Data_2023',
    displayNameAr: 'شركة ترابط - الأرشيف المالي المقفل (2023)',
    displayNameEn: 'Tarabot Co. - Fiscal Year Archive (2023)',
    category: 'archives',
    categoryNameAr: 'السنوات المالية السابقة',
    categoryNameEn: 'Prior Fiscal Years',
    categoryIcon: 'Archive',
    isPrimary: false,
    descriptionAr: 'الأرشيف المالي وحركات القيود والسندات المقفلة للعام المالي 2023',
  },
  Tarabot_Data_2022: {
    name: 'Tarabot_Data_2022',
    displayNameAr: 'شركة ترابط - الأرشيف المالي التأسيسي (2022)',
    displayNameEn: 'Tarabot Co. - Historical Archive (2022)',
    category: 'archives',
    categoryNameAr: 'السنوات المالية السابقة',
    categoryNameEn: 'Prior Fiscal Years',
    categoryIcon: 'Archive',
    isPrimary: false,
    descriptionAr: 'أرشيف ميزانيات وسجلات التأسيس والعمليات التاريخية 2022',
  },
  SL_Salary_Db_2026: {
    name: 'SL_Salary_Db_2026',
    displayNameAr: 'منظومة الرواتب والأجور والكادر الوظيفي (2026)',
    displayNameEn: 'Payroll & Employee Compensation (2026)',
    category: 'specialized_payroll',
    categoryNameAr: 'الرواتب والأجور',
    categoryNameEn: 'Specialized Payroll',
    categoryIcon: 'Users',
    isPrimary: false,
    descriptionAr: 'كشوف رواتب العاملين، الاستقطاعات التأمينية، والضرائب الشهرية المستحقة',
  },
  Old_Projects_Data: {
    name: 'Old_Projects_Data',
    displayNameAr: 'الأرشيف الهندسي وعقود المشروعات السابقة',
    displayNameEn: 'Engineering Contracts & Projects Archive',
    category: 'engineering_archive',
    categoryNameAr: 'الأرشيف الهندسي',
    categoryNameEn: 'Engineering Archive',
    categoryIcon: 'HardHat',
    isPrimary: false,
    descriptionAr: 'أرشيف عقود الفيدك ومستخلصات المقاولات المنفذة سابقاً عبر الفروع',
  },
  AI_Test_Data_2026: {
    name: 'AI_Test_Data_2026',
    displayNameAr: 'بيئة الاختبار والمحاكاة الذكية (AI Sandbox 2026)',
    displayNameEn: 'AI Sandbox & Simulation Environment (2026)',
    category: 'sandbox',
    categoryNameAr: 'بيئات الاختبار',
    categoryNameEn: 'Sandbox & Simulation',
    categoryIcon: 'FlaskConical',
    isPrimary: false,
    descriptionAr: 'قاعدة بيانات معزولة لاختبارات الذكاء الاصطناعي والمزامنة التجريبية',
  },
  Test_Data_2023: {
    name: 'Test_Data_2023',
    displayNameAr: 'بيئة اختبارات التدقيق التاريخية (2023)',
    displayNameEn: 'Audit & Regression Test Sandbox (2023)',
    category: 'sandbox',
    categoryNameAr: 'بيئات الاختبار',
    categoryNameEn: 'Sandbox & Simulation',
    categoryIcon: 'FlaskConical',
    isPrimary: false,
    descriptionAr: 'بيئة اختبارات الأداء واسترجاع القيود القديمة',
  },
  acc: {
    name: 'acc',
    displayNameAr: 'قاعدة الحسابات الميدانية (ACC)',
    displayNameEn: 'Field Accounts Database (ACC)',
    category: 'partners',
    categoryNameAr: 'شركات الشركاء والفروع',
    categoryNameEn: 'Partners & Affiliates',
    categoryIcon: 'Coins',
    isPrimary: false,
    descriptionAr: 'قاعدة الحسابات المحاسبية الميدانية للأفرع',
  },
  newhope: {
    name: 'newhope',
    displayNameAr: 'مؤسسة نيو هوب للاستثمارات (New Hope)',
    displayNameEn: 'New Hope Investments Enterprise',
    category: 'partners',
    categoryNameAr: 'شركات الشركاء والفروع',
    categoryNameEn: 'Partners & Affiliates',
    categoryIcon: 'Sparkles',
    isPrimary: false,
    descriptionAr: 'قاعدة بيانات مؤسسة نيو هوب الاستثمارية التابعة',
  },
};

export const DEFAULT_DATABASE_KEY = 'MK_Khalil_Db_2026';

export interface SqlServerBaseConfig {
  server: string;
  port: number;
  user: string;
  password: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    connectTimeout: number;
    requestTimeout: number;
  };
}

export function getSqlServerConfig(): SqlServerBaseConfig {
  return {
    server: process.env.DB_SERVER || '100.68.121.85',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || process.env.MSSQL_PASSWORD || 'sa123456789',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '15000', 10),
      requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000', 10),
    },
  };
}

