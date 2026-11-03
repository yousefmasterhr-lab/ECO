/**
 * ECO ERP - Dynamic Multi-Database Connection Manager
 * Manages pooled connections across all 16 SQL Server databases.
 * Uses request context (e.g. X-Database-Key) for safe, dynamic multi-tenant query routing.
 */

import sql from 'mssql';
import { getSqlServerConfig, DATABASE_REGISTRY, DEFAULT_DATABASE_KEY } from '../config/databases.js';

export interface PoolHealthStatus {
  databaseKey: string;
  connected: boolean;
  activeRequests: number;
  lastHealthCheck: string;
  error?: string;
}

export class DynamicDatabaseManager {
  private static instance: DynamicDatabaseManager;
  private pools: Map<string, sql.ConnectionPool> = new Map();
  private healthStates: Map<string, PoolHealthStatus> = new Map();
  private connectingPromises: Map<string, Promise<sql.ConnectionPool>> = new Map();

  private constructor() {
    // Health probe interval
    setInterval(() => this.runHealthProbes(), 30000).unref();
  }

  public static getInstance(): DynamicDatabaseManager {
    if (!DynamicDatabaseManager.instance) {
      DynamicDatabaseManager.instance = new DynamicDatabaseManager();
    }
    return DynamicDatabaseManager.instance;
  }

  /**
   * Sanitizes and resolves the database key
   */
  public resolveDatabaseKey(requestedKey?: string | null): string {
    if (!requestedKey || typeof requestedKey !== 'string') {
      return DEFAULT_DATABASE_KEY;
    }
    const sanitized = requestedKey.trim().replace(/[^a-zA-Z0-9_]/g, '');
    if (!sanitized) return DEFAULT_DATABASE_KEY;

    // Check if known in registry
    if (DATABASE_REGISTRY[sanitized]) {
      return sanitized;
    }

    return sanitized;
  }

  /**
   * Retrieves an active, healthy ConnectionPool for the target database.
   * If not already pooled, initializes and caches a new pool.
   */
  public async getPool(databaseKey?: string): Promise<sql.ConnectionPool> {
    const dbKey = this.resolveDatabaseKey(databaseKey);

    // Return existing connected pool if healthy
    const existingPool = this.pools.get(dbKey);
    if (existingPool && existingPool.connected) {
      return existingPool;
    }

    // If currently connecting, await existing promise
    if (this.connectingPromises.has(dbKey)) {
      return this.connectingPromises.get(dbKey)!;
    }

    // Initialize connection
    const connectPromise = this.createAndConnectPool(dbKey);
    this.connectingPromises.set(dbKey, connectPromise);

    try {
      const pool = await connectPromise;
      this.pools.set(dbKey, pool);
      this.updateHealthState(dbKey, true);
      return pool;
    } catch (error: any) {
      this.updateHealthState(dbKey, false, error.message);
      throw new Error(`[DynamicDatabaseManager] Failed to connect to database [${dbKey}]: ${error.message}`);
    } finally {
      this.connectingPromises.delete(dbKey);
    }
  }

  private async createAndConnectPool(dbKey: string): Promise<sql.ConnectionPool> {
    const baseConfig = getSqlServerConfig();

    const poolConfig: sql.config = {
      server: baseConfig.server,
      port: baseConfig.port,
      user: baseConfig.user,
      password: baseConfig.password,
      database: dbKey,
      options: {
        encrypt: baseConfig.options.encrypt,
        trustServerCertificate: baseConfig.options.trustServerCertificate,
        connectTimeout: baseConfig.options.connectTimeout,
        requestTimeout: baseConfig.options.requestTimeout,
      },
      pool: {
        min: 2,
        max: 20,
        idleTimeoutMillis: 30000,
      },
    };

    console.log(`[DynamicDatabaseManager] Initializing ConnectionPool for [${dbKey}] on ${poolConfig.server}:${poolConfig.port}...`);
    const pool = new sql.ConnectionPool(poolConfig);

    pool.on('error', (err: any) => {
      console.error(`[DynamicDatabaseManager] Pool error on database [${dbKey}]:`, err.message);
      this.updateHealthState(dbKey, false, err.message);
    });

    await pool.connect();

    // Verify basic query execution
    const req = pool.request();
    await req.query('SELECT 1 AS health_check');
    console.log(`[DynamicDatabaseManager] Database [${dbKey}] pool is READY and verified.`);

    return pool;
  }

  /**
   * Executes a callback within a strict ACID transaction on the target database pool.
   * Auto-commits on success; auto-rollbacks on any exception.
   */
  public async executeTransaction<T>(
    databaseKey: string,
    callback: (tx: sql.Transaction, pool: sql.ConnectionPool) => Promise<T>
  ): Promise<T> {
    const pool = await this.getPool(databaseKey);
    const tx = new sql.Transaction(pool);

    try {
      await tx.begin();
      const result = await callback(tx, pool);
      await tx.commit();
      return result;
    } catch (err: any) {
      console.error(`[DynamicDatabaseManager] Transaction failed on [${databaseKey}]. Executing ROLLBACK... Error:`, err.message);
      try {
        await tx.rollback();
      } catch (rollbackErr: any) {
        console.error(`[DynamicDatabaseManager] Rollback failed or was already rolled back:`, rollbackErr.message);
      }
      throw err;
    }
  }

  /**
   * Runs periodic health checks on all active pools.
   */
  public async runHealthProbes(): Promise<Map<string, PoolHealthStatus>> {
    for (const [dbKey, pool] of this.pools.entries()) {
      if (!pool.connected) {
        this.updateHealthState(dbKey, false, 'Pool disconnected');
        continue;
      }
      try {
        const req = pool.request();
        await req.query('SELECT 1');
        this.updateHealthState(dbKey, true);
      } catch (e: any) {
        this.updateHealthState(dbKey, false, e.message);
      }
    }
    return this.healthStates;
  }

  private updateHealthState(dbKey: string, connected: boolean, error?: string): void {
    const pool = this.pools.get(dbKey);
    this.healthStates.set(dbKey, {
      databaseKey: dbKey,
      connected,
      activeRequests: (pool as any)?.pool?.borrowed || 0,
      lastHealthCheck: new Date().toISOString(),
      error,
    });
  }

  /**
   * Returns current health overview of all pools
   */
  public getHealthOverview(): PoolHealthStatus[] {
    return Array.from(this.healthStates.values());
  }

  /**
   * Graceful shutdown of all active pools
   */
  public async closeAll(): Promise<void> {
    for (const [dbKey, pool] of this.pools.entries()) {
      try {
        await pool.close();
        console.log(`[DynamicDatabaseManager] Closed pool for [${dbKey}]`);
      } catch (e: any) {
        console.warn(`[DynamicDatabaseManager] Error closing pool for [${dbKey}]:`, e.message);
      }
    }
    this.pools.clear();
    this.healthStates.clear();
  }
}
