/**
 * ECO System Update, Version Guard & Live Security Synchronization Service
 * 
 * Provides:
 * 1. Automatic background polling (every 25s, on boot, on focus, on visibility change)
 * 2. Instant detection of new builds/deployments via /version.json (buildId)
 * 3. Immediate Force-Logout & Hard Cache-Busting Refresh for all sessions upon updates
 * 4. Automatic session invalidation when security/RBAC permissions change (security_epoch)
 * 5. PWA cache purge and ServiceWorker deregistration
 */

declare const __APP_BUILD_ID__: string | undefined;
declare const __APP_BUILD_TIME__: number | undefined;
declare const __APP_VERSION__: string | undefined;

export interface MaintenanceInfo {
  active: boolean;
  title: string;
  message: string;
  estimatedMinutes?: number;
  startedAt?: string;
  targetVersion?: string;
  lastCompletedAt?: string;
}

export interface SystemVersionInfo {
  version: string;
  buildId?: string;
  buildTimestamp: number;
  deployedAt?: string;
  securityEpoch?: number;
  gitCommit?: string;
  maintenance?: MaintenanceInfo;
}

type UpdateListener = (info: {
  isMaintenance: boolean;
  maintenanceInfo: MaintenanceInfo;
  hasNewVersion: boolean;
  remoteVersion: string;
  remoteTimestamp: number;
  buildId?: string;
}) => void;

class SystemUpdateService {
  private initialClientBuildId: string;
  private initialClientTimestamp: number;
  private currentVersionStr: string;
  private pollIntervalMs: number = 25000; // Strictly 25 seconds
  private timerId: any = null;
  private listeners: Set<UpdateListener> = new Set();
  private isProcessingUpdate: boolean = false;

  private lastKnownState: {
    isMaintenance: boolean;
    maintenanceInfo: MaintenanceInfo;
    hasNewVersion: boolean;
    remoteVersion: string;
    remoteTimestamp: number;
    buildId?: string;
  };

  constructor() {
    // 1. Determine client build ID from injected Vite define, localStorage, or fallback
    const definedBuildId = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : null;
    const definedTime = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : null;

    this.initialClientBuildId = definedBuildId || String(definedTime || Date.now());
    this.initialClientTimestamp = definedTime || Date.now();
    this.currentVersionStr = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.0';

    // 2. Sync local active build ID
    if (typeof window !== 'undefined') {
      const activeStored = localStorage.getItem('eco_active_build_id');
      if (!activeStored) {
        localStorage.setItem('eco_active_build_id', this.initialClientBuildId);
      }
      sessionStorage.setItem('eco_client_build_timestamp', String(this.initialClientTimestamp));
    }

    this.lastKnownState = {
      isMaintenance: false,
      maintenanceInfo: {
        active: false,
        title: 'جاري تحديث وترقية النظام السحابي',
        message: 'برجاء عدم استخدام الموقع الآن لحين رفع التحديث برجاء الانتظار حتى يتم الانتهاء وإعادة تحميل الصفحة',
        estimatedMinutes: 3,
      },
      hasNewVersion: false,
      remoteVersion: this.currentVersionStr,
      remoteTimestamp: this.initialClientTimestamp,
      buildId: this.initialClientBuildId,
    };

    if (typeof window !== 'undefined') {
      this.initEventListeners();
      // Immediate check on boot
      setTimeout(() => this.checkForUpdates(), 1000);
      this.startPolling();
    }
  }

  public getClientVersion(): string {
    return this.currentVersionStr;
  }

  public getClientBuildId(): string {
    return this.initialClientBuildId;
  }

  public getClientTimestamp(): number {
    return this.initialClientTimestamp;
  }

  public getState() {
    return { ...this.lastKnownState };
  }

  public subscribe(listener: UpdateListener): () => void {
    this.listeners.add(listener);
    // Send immediate state snapshot
    listener(this.lastKnownState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.lastKnownState);
      } catch (err) {
        console.warn('[SystemUpdateService] Listener error:', err);
      }
    }
  }

  private initEventListeners() {
    if (typeof window === 'undefined') return;

    // Proactive check when user switches back to the tab or unlocks device
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates();
      }
    });

    window.addEventListener('focus', () => {
      this.checkForUpdates();
    });

    window.addEventListener('online', () => {
      this.checkForUpdates();
    });
  }

  public startPolling(intervalMs?: number) {
    if (intervalMs) this.pollIntervalMs = intervalMs;
    this.stopPolling();
    this.timerId = setInterval(() => {
      this.checkForUpdates();
    }, this.pollIntervalMs);
  }

  public stopPolling() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Main Version Probe: Fetches /version.json with cache: no-store and probes /api/system/version
   */
  public async checkForUpdates(): Promise<void> {
    if (this.isProcessingUpdate || typeof window === 'undefined') return;

    try {
      const cacheBuster = Date.now();

      // 1. Fetch static /version.json with no-cache headers
      const versionRes = await fetch(`/version.json?t=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Accept: 'application/json',
        },
      }).catch(() => null);

      if (versionRes && versionRes.ok) {
        const versionData = await versionRes.json();
        const remoteBuildId = versionData.buildId ? String(versionData.buildId) : null;
        const storedActiveBuildId = localStorage.getItem('eco_active_build_id');

        // Check if remote buildId is newer or different from active stored buildId
        if (remoteBuildId) {
          if (!storedActiveBuildId) {
            // First run on clean device
            localStorage.setItem('eco_active_build_id', remoteBuildId);
          } else if (storedActiveBuildId !== remoteBuildId || (this.initialClientBuildId && this.initialClientBuildId !== remoteBuildId)) {
            // Build ID mismatch detected: Trigger Immediate Force-Logout & Hard Cache-Busting Refresh!
            console.log('[SystemUpdateService] Build update detected! Remote:', remoteBuildId, 'Active:', storedActiveBuildId);
            this.isProcessingUpdate = true;
            localStorage.setItem('eco_active_build_id', remoteBuildId);
            await this.performAutoSignOutAndReload(
              'تم تحديث المنظومة إلى إصدار جديد — يرجى تسجيل الدخول مجدداً لمواصلة العمل بأحدث التعديلات'
            );
            return;
          }
        }
      }

      // 2. Fetch /api/system/version to check maintenance mode & security epoch
      const apiRes = await fetch(`/api/system/version?_t=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Accept: 'application/json',
        },
      }).catch(() => null);

      if (apiRes && apiRes.ok) {
        const apiData = await apiRes.json();
        
        // Check security epoch for live RBAC / user status invalidation
        const remoteSecurityEpoch = apiData.securityEpoch ? Number(apiData.securityEpoch) : 0;
        if (remoteSecurityEpoch > 0) {
          const storedEpochStr = localStorage.getItem('eco_security_epoch');
          const storedEpoch = storedEpochStr ? Number(storedEpochStr) : 0;

          if (storedEpoch > 0 && remoteSecurityEpoch > storedEpoch) {
            // Check if user is currently authenticated
            const hasAuthSession = localStorage.getItem('eco_auth_session') || sessionStorage.getItem('eco_auth_session');
            if (hasAuthSession) {
              console.log('[SystemUpdateService] Security Epoch changed! Epoch:', remoteSecurityEpoch);
              this.isProcessingUpdate = true;
              localStorage.setItem('eco_security_epoch', String(remoteSecurityEpoch));
              await this.performAutoSignOutAndReload(
                'تم تعديل الصلاحيات أو إعدادات الأمان المؤسسية — تم تسجيل الخروج تلقائياً لتطبيق أحدث الصلاحيات'
              );
              return;
            }
          }
          localStorage.setItem('eco_security_epoch', String(remoteSecurityEpoch));
        }

        // Process maintenance mode
        if (apiData.maintenance) {
          this.processMaintenanceInfo(apiData.maintenance);
        }
      }
    } catch (err) {
      // Quiet background failure to avoid interrupting user workflow
    }
  }

  private processMaintenanceInfo(maintenance: MaintenanceInfo) {
    const isMaintenance = Boolean(maintenance && maintenance.active);
    const prevState = { ...this.lastKnownState };

    this.lastKnownState = {
      ...this.lastKnownState,
      isMaintenance,
      maintenanceInfo: maintenance || prevState.maintenanceInfo,
    };

    if (prevState.isMaintenance !== isMaintenance) {
      this.notify();
    }
  }

  /**
   * Centralized Automated Force-Logout & Hard Cache-Busting Refresh
   * Completely purges user authentication, PWA caches, and Service Workers, then reloads to /login
   */
  public async performAutoSignOutAndReload(
    customMessage = 'تم تحديث المنظومة إلى إصدار جديد — يرجى تسجيل الدخول مجدداً لمواصلة العمل بأحدث التعديلات'
  ): Promise<void> {
    try {
      // 1. Force Clear all user authentication states across storage
      const keysToPurge = [
        'eco_auth_session',
        'eco_auth_user',
        'eco_current_user',
        'd1_session_token',
        'eco_client_build_timestamp'
      ];
      keysToPurge.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });
      try { sessionStorage.clear(); } catch {}

      // 2. Set update notice banner in sessionStorage
      try {
        sessionStorage.setItem(
          'eco_update_notice',
          JSON.stringify({
            title: 'تم تحديث وترقية المنظومة بنجاح',
            message: customMessage,
            timestamp: Date.now(),
          })
        );
      } catch {}

      // 3. Purge all Browser CacheStorage (PWA Cache Buster)
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map(key => window.caches.delete(key)));
        } catch (cacheErr) {
          console.warn('[SystemUpdateService] CacheStorage purge notice:', cacheErr);
        }
      }

      // 4. Unregister all active Service Workers to ensure fresh JS chunk resolution
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
        } catch (swErr) {
          console.warn('[SystemUpdateService] ServiceWorker unregister notice:', swErr);
        }
      }
    } catch (e) {
      console.warn('[performAutoSignOutAndReload] Notice:', e);
    }

    // 5. Hard reload to login gate with URL query parameters for guaranteed fresh fetch
    const loginTarget = `/login?reason=system_updated&_t=${Date.now()}`;
    window.location.replace(loginTarget);
  }

  /**
   * Admin API: Toggle Maintenance Mode on Cloudflare D1
   */
  public async setMaintenanceMode(
    active: boolean,
    details?: { title?: string; message?: string; estimatedMinutes?: number; targetVersion?: string }
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/system/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: active ? 'start_maintenance' : 'finish_maintenance',
          ...details,
        }),
      });

      if (res.ok) {
        await this.checkForUpdates();
        return true;
      }
    } catch (err) {
      console.error('[SystemUpdateService] Error setting maintenance mode:', err);
    }
    return false;
  }

  /**
   * Admin API: Broadcast immediate deployment/upgrade to force all connected devices to sign out & reload
   */
  public async broadcastDeployUpdate(version?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/system/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'force_deploy_broadcast',
          version: version || `1.2.0-build.${Date.now()}`,
        }),
      });

      if (res.ok) {
        await this.checkForUpdates();
        return true;
      }
    } catch (err) {
      console.error('[SystemUpdateService] Error broadcasting deploy update:', err);
    }
    return false;
  }
}

export const systemUpdateService = new SystemUpdateService();
