import {
  DatabaseFleetItem,
  DatabaseFleetResponse,
  ConnectionHealthStatus,
  FederatedQueryResult,
  PayrollGlBridgeData,
  UniversalProjectsBridgeData,
  MultiYearBalanceData
} from './types';

class FederationService {
  private activeContextDb: string = 'Tarabot_Data_2026';

  setActiveContext(dbName: string) {
    this.activeContextDb = dbName;
    try {
      localStorage.setItem('selected_database', dbName);
      localStorage.setItem('erp_active_db_context', dbName);
    } catch {}
  }

  getActiveContext(): string {
    try {
      const stored = localStorage.getItem('selected_database') || localStorage.getItem('erp_active_db_context');
      if (stored) return stored;
    } catch {}
    return this.activeContextDb;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Database-Context': this.getActiveContext()
    };
  }

  async fetchDatabaseFleet(): Promise<DatabaseFleetResponse> {
    try {
      const res = await fetch('/api/system/databases', {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn('[FederationService] fetchDatabaseFleet failed, returning fallback:', err.message);
      return {
        connected: false,
        isFailSafe: true,
        host: '100.76.198.119',
        port: 1433,
        portProxyTarget: '192.168.1.50:49748',
        engine: 'Microsoft SQL Server 2008 R2 (Safe Mode)',
        activePoolsCount: 0,
        latencyMs: 0,
        totalDatabases: 11,
        databases: this.getFallbackDatabases(),
        error: err.message
      };
    }
  }

  async fetchConnectionHealth(): Promise<ConnectionHealthStatus> {
    try {
      const res = await fetch('/api/system/health', {
        headers: this.getHeaders()
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      return {
        connected: false,
        isFailSafe: true,
        host: '100.76.198.119',
        port: 1433,
        portProxyTarget: '192.168.1.50:49748',
        serverName: 'Accounts-Server\\sqlexpress',
        version: 'Microsoft SQL Server 2008 (Fallback)',
        activeDatabase: this.getActiveContext(),
        activePoolsCount: 0,
        latencyMs: 0,
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeReadOnlyQuery(sqlQuery: string, database?: string): Promise<FederatedQueryResult> {
    const targetDb = database || this.getActiveContext();
    try {
      const res = await fetch('/api/system/query', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          database: targetDb,
          sqlQuery
        })
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        database: targetDb,
        rows: [],
        rowCount: 0,
        columns: [],
        durationMs: 0,
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async fetchPayrollGlBridge(): Promise<PayrollGlBridgeData> {
    try {
      const res = await fetch('/api/system/federation/payroll-gl', {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        database: 'SL_Salary_Db_2026',
        totalEmployees: 0,
        totalGross: 0,
        totalInsurance: 0,
        totalTax: 0,
        totalNet: 0,
        employees: [],
        glAccounts: [],
        timestamp: new Date().toISOString(),
        error: err.message
      };
    }
  }

  async fetchUniversalProjectsBridge(): Promise<UniversalProjectsBridgeData> {
    try {
      const res = await fetch('/api/system/federation/universal-projects', {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        totalCount: 0,
        databasesQueried: [],
        projects: [],
        timestamp: new Date().toISOString(),
        error: err.message
      };
    }
  }

  async fetchMultiYearBalanceBridge(): Promise<MultiYearBalanceData> {
    try {
      const res = await fetch('/api/system/federation/multi-year-balance', {
        headers: this.getHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        fiscalYears: [2022, 2023, 2026],
        databases: ['Tarabot_Data_2022', 'Tarabot_Data_2023', 'Tarabot_Data_2026'],
        comparativeMetrics: [],
        timestamp: new Date().toISOString(),
        error: err.message
      };
    }
  }

  private getFallbackDatabases(): DatabaseFleetItem[] {
    return [
      {
        name: 'Tarabot_Data_2026',
        displayNameAr: 'شركة ترابط - المنظومة المالية النشطة (2026)',
        displayNameEn: 'Tarabot Co. - Active Fiscal Year (2026)',
        category: 'primary',
        categoryNameAr: 'المنظومة المالية النشطة',
        categoryNameEn: 'Active Financial System',
        categoryIcon: 'Activity',
        isPrimary: true,
        createDate: '2026-03-25T16:42:19.070Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 56.81,
        descriptionAr: 'قاعدة البيانات التشغيلية الرئيسية للعام المالي 2026 والحسابات الجارية'
      },
      {
        name: 'Tarabot_Data_2023',
        displayNameAr: 'شركة ترابط - الأرشيف المالي المقفل (2023)',
        displayNameEn: 'Tarabot Co. - Fiscal Year Archive (2023)',
        category: 'archives',
        categoryNameAr: 'السنوات المالية السابقة',
        categoryNameEn: 'Prior Fiscal Years',
        categoryIcon: 'Archive',
        isPrimary: false,
        createDate: '2026-03-25T16:27:30.030Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 42.5,
        descriptionAr: 'الأرشيف المالي وحركات القيود والسندات المقفلة للعام المالي 2023'
      },
      {
        name: 'Tarabot_Data_2022',
        displayNameAr: 'شركة ترابط - الأرشيف المالي التأسيسي (2022)',
        displayNameEn: 'Tarabot Co. - Historical Archive (2022)',
        category: 'archives',
        categoryNameAr: 'السنوات المالية السابقة',
        categoryNameEn: 'Prior Fiscal Years',
        categoryIcon: 'Archive',
        isPrimary: false,
        createDate: '2023-06-05T13:49:45.140Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 24.25,
        descriptionAr: 'أرشيف ميزانيات وسجلات التأسيس والعمليات التاريخية 2022'
      },
      {
        name: 'SL_Salary_Db_2026',
        displayNameAr: 'منظومة الرواتب والأجور والكادر الوظيفي (2026)',
        displayNameEn: 'Payroll & Employee Compensation (2026)',
        category: 'specialized_payroll',
        categoryNameAr: 'الرواتب والأجور',
        categoryNameEn: 'Specialized Payroll',
        categoryIcon: 'Users',
        isPrimary: false,
        createDate: '2026-09-10T22:02:25.477Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 56.81,
        descriptionAr: 'كشوف رواتب العاملين، الاستقطاعات التأمينية، والضرائب الشهرية المستحقة'
      },
      {
        name: 'Old_Projects_Data',
        displayNameAr: 'الأرشيف الهندسي وعقود المشروعات السابقة',
        displayNameEn: 'Engineering Contracts & Projects Archive',
        category: 'engineering_archive',
        categoryNameAr: 'الأرشيف الهندسي',
        categoryNameEn: 'Engineering Archive',
        categoryIcon: 'HardHat',
        isPrimary: false,
        createDate: '2023-06-11T14:57:23.050Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 26.25,
        descriptionAr: 'أرشيف عقود الفيدك ومستخلصات المقاولات المنفذة سابقاً عبر الفروع'
      },
      {
        name: 'MKH_Tarabot_Data_2026',
        displayNameAr: 'شركة إم كيه إتش ترابط للتجارة والمقاولات (2026)',
        displayNameEn: 'MKH Tarabot Contracting & Trading (2026)',
        category: 'partners',
        categoryNameAr: 'شركات الشركاء والفروع',
        categoryNameEn: 'Partners & Affiliates',
        categoryIcon: 'Building2',
        isPrimary: false,
        createDate: '2026-03-25T16:39:04.137Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 56.81,
        descriptionAr: 'سجلات العمليات والحسابات لشركة الشراكة MKH للعام 2026'
      },
      {
        name: 'MK_Khalil_Db_2026',
        displayNameAr: 'مؤسسة محمد خليل للمقاولات العامة (2026)',
        displayNameEn: 'MK Khalil General Contracting (2026)',
        category: 'partners',
        categoryNameAr: 'شركات الشركاء والفروع',
        categoryNameEn: 'Partners & Affiliates',
        categoryIcon: 'Building2',
        isPrimary: false,
        createDate: '2026-07-06T13:13:46.857Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 56.81,
        descriptionAr: 'الحسابات المستقلة والتشغيلية لمؤسسة الشريك محمد خليل'
      },
      {
        name: 'MM_Moustafa_Db_26',
        displayNameAr: 'مؤسسة محمود مصطفى للأعمال الهندسية (2026)',
        displayNameEn: 'MM Moustafa Engineering Works (2026)',
        category: 'partners',
        categoryNameAr: 'شركات الشركاء والفروع',
        categoryNameEn: 'Partners & Affiliates',
        categoryIcon: 'Building2',
        isPrimary: false,
        createDate: '2026-07-07T10:17:42.247Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 56.81,
        descriptionAr: 'الحسابات المستقلة لمؤسسة الشريك محمود مصطفى'
      },
      {
        name: 'SV_SmartV_Db_2026',
        displayNameAr: 'شركة سمارت فيجن للحلول المتكاملة (2026)',
        displayNameEn: 'Smart Vision Integrated Solutions (2026)',
        category: 'partners',
        categoryNameAr: 'شركات الشركاء والفروع',
        categoryNameEn: 'Partners & Affiliates',
        categoryIcon: 'Building2',
        isPrimary: false,
        createDate: '2026-07-07T11:14:44.690Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 56.81,
        descriptionAr: 'المنظومة المالية والتجارية لشركة سمارت فيجن التابعة'
      },
      {
        name: 'AI_Test_Data_2026',
        displayNameAr: 'بيئة الاختبار والمحاكاة الذكية (AI Sandbox 2026)',
        displayNameEn: 'AI Sandbox & Simulation Environment (2026)',
        category: 'sandbox',
        categoryNameAr: 'بيئات الاختبار',
        categoryNameEn: 'Sandbox & Simulation',
        categoryIcon: 'FlaskConical',
        isPrimary: false,
        createDate: '2026-06-14T10:25:51.963Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 56.81,
        descriptionAr: 'قاعدة بيانات معزولة لاختبارات الذكاء الاصطناعي والمزامنة التجريبية'
      },
      {
        name: 'Test_Data_2023',
        displayNameAr: 'بيئة اختبارات التدقيق التاريخية (2023)',
        displayNameEn: 'Audit & Regression Test Sandbox (2023)',
        category: 'sandbox',
        categoryNameAr: 'بيئات الاختبار',
        categoryNameEn: 'Sandbox & Simulation',
        categoryIcon: 'FlaskConical',
        isPrimary: false,
        createDate: '2023-08-27T15:36:58.037Z',
        status: 'ONLINE (SAFE_MODE)',
        sizeMb: 27.25,
        descriptionAr: 'بيئة اختبارات الأداء واسترجاع القيود القديمة'
      }
    ];
  }
}

export const federationService = new FederationService();
