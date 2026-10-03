import {
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
      console.warn('[FederationService] fetchDatabaseFleet failed, returning empty list:', err.message);
      return {
        connected: false,
        isFailSafe: true,
        host: '100.76.198.119',
        port: 1433,
        portProxyTarget: '192.168.1.50:49748',
        engine: 'Microsoft SQL Server 2008 R2 (Disconnected)',
        activePoolsCount: 0,
        latencyMs: 0,
        totalDatabases: 0,
        databases: [],
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
}

export const federationService = new FederationService();
