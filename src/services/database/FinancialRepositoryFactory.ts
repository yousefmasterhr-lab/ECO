import { IFinancialRepository } from './FinancialRepository';
import { LocalSqlAdapter } from './LocalSqlAdapter';
import { CloudAdapter } from './CloudAdapter';
import { RepositoryMode } from './types';

class FinancialRepositoryFactoryClass {
  private currentMode: RepositoryMode;
  private localAdapter: LocalSqlAdapter;
  private cloudAdapter: CloudAdapter;
  private listeners: ((mode: RepositoryMode) => void)[] = [];

  constructor() {
    // Read from env variable or localStorage, default to LOCAL (Microsoft SQL Server)
    const envMode = ((import.meta as any).env?.VITE_DB_CONNECTION_MODE) as RepositoryMode | undefined;
    const storedMode = (typeof window !== 'undefined' ? localStorage.getItem('erp_financial_db_mode') : null) as RepositoryMode | null;
    
    this.currentMode = storedMode || envMode || 'LOCAL';
    this.localAdapter = new LocalSqlAdapter();
    this.cloudAdapter = new CloudAdapter();
  }

  public getRepository(): IFinancialRepository {
    return this.currentMode === 'LOCAL' ? this.localAdapter : this.cloudAdapter;
  }

  public getMode(): RepositoryMode {
    return this.currentMode;
  }

  public setMode(mode: RepositoryMode): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('erp_financial_db_mode', mode);
      }
      this.notifyListeners(mode);
    }
  }

  public toggleMode(): RepositoryMode {
    const nextMode: RepositoryMode = this.currentMode === 'LOCAL' ? 'CLOUD' : 'LOCAL';
    this.setMode(nextMode);
    return nextMode;
  }

  public subscribe(listener: (mode: RepositoryMode) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(mode: RepositoryMode): void {
    this.listeners.forEach(l => l(mode));
  }
}

export const FinancialRepositoryFactory = new FinancialRepositoryFactoryClass();
