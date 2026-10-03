import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DatabaseFleetItem, ConnectionHealthStatus } from './types';
import { federationService } from './federationService';

interface DatabaseContextType {
  activeDatabase: string;
  setActiveDatabase: (dbName: string) => void;
  activeDatabaseMeta?: DatabaseFleetItem;
  databases: DatabaseFleetItem[];
  health: ConnectionHealthStatus | null;
  isLoading: boolean;
  isFailSafe: boolean;
  activeMode: 'REMOTE' | 'LOCAL_FALLBACK';
  refresh: () => Promise<void>;
  pingConnection: () => Promise<number>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDatabase, setActiveDatabaseState] = useState<string>(() => federationService.getActiveContext());
  const [databases, setDatabases] = useState<DatabaseFleetItem[]>([]);
  const [health, setHealth] = useState<ConnectionHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFailSafe, setIsFailSafe] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'REMOTE' | 'LOCAL_FALLBACK'>('REMOTE');

  const setActiveDatabase = useCallback((dbName: string) => {
    setActiveDatabaseState(dbName);
    federationService.setActiveContext(dbName);
    try {
      localStorage.setItem('selected_database', dbName);
      localStorage.setItem('erp_active_db_context', dbName);
      window.dispatchEvent(new CustomEvent('database-context-changed', { detail: { database: dbName } }));
    } catch (e) {
      console.warn('Failed to store active db in localStorage:', e);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fleetRes, healthRes] = await Promise.all([
        federationService.fetchDatabaseFleet(),
        federationService.fetchConnectionHealth()
      ]);

      setDatabases(fleetRes.databases || []);
      setHealth(healthRes);
      const isRemote = (healthRes.active_mode || fleetRes.active_mode) === 'REMOTE';
      const mode: 'REMOTE' | 'LOCAL_FALLBACK' = isRemote ? 'REMOTE' : 'LOCAL_FALLBACK';
      setActiveMode(mode);
      setIsFailSafe(fleetRes.isFailSafe || !fleetRes.connected || mode === 'LOCAL_FALLBACK');
    } catch (err) {
      console.warn('[DatabaseContext] Refresh failed, engaging safe mode:', err);
      setIsFailSafe(true);
      setActiveMode('LOCAL_FALLBACK');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pingConnection = useCallback(async (): Promise<number> => {
    try {
      const h = await federationService.fetchConnectionHealth();
      setHealth(h);
      const isRemote = h.active_mode === 'REMOTE';
      const mode: 'REMOTE' | 'LOCAL_FALLBACK' = isRemote ? 'REMOTE' : 'LOCAL_FALLBACK';
      setActiveMode(mode);
      setIsFailSafe(h.isFailSafe || !h.connected || mode === 'LOCAL_FALLBACK');
      return h.latencyMs;
    } catch {
      setIsFailSafe(true);
      setActiveMode('LOCAL_FALLBACK');
      return 0;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeDatabaseMeta = useMemo(() => {
    return databases.find(d => d.name === activeDatabase) || databases[0];
  }, [databases, activeDatabase]);

  const value = useMemo(
    () => ({
      activeDatabase,
      setActiveDatabase,
      activeDatabaseMeta,
      databases,
      health,
      isLoading,
      isFailSafe,
      activeMode,
      refresh,
      pingConnection
    }),
    [activeDatabase, setActiveDatabase, activeDatabaseMeta, databases, health, isLoading, isFailSafe, activeMode, refresh, pingConnection]
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return ctx;
};
