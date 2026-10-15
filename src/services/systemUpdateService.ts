/**
 * ECO System Update & Live Maintenance Synchronization Service
 * 
 * Provides:
 * 1. Automatic background polling for new Cloudflare deployments & system upgrades.
 * 2. Cross-device and multi-tab live sync for Maintenance Mode.
 * 3. Graceful auto-signout and reload to purge stale caches across all sessions.
 */

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
  buildTimestamp: number;
  gitCommit?: string;
  maintenance: MaintenanceInfo;
}

type UpdateListener = (info: {
  isMaintenance: boolean;
  maintenanceInfo: MaintenanceInfo;
  hasNewVersion: boolean;
  remoteVersion: string;
  remoteTimestamp: number;
}) => void;

class SystemUpdateService {
  private initialClientTimestamp: number;
  private currentVersionStr: string;
  private pollIntervalMs: number = 15000; // 15 seconds
  private timerId: any = null;
  private listeners: Set<UpdateListener> = new Set();

  private lastKnownState: {
    isMaintenance: boolean;
    maintenanceInfo: MaintenanceInfo;
    hasNewVersion: boolean;
    remoteVersion: string;
    remoteTimestamp: number;
  };

  constructor() {
    // Determine client build timestamp
    const definedTime = typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : null;
    const storedClientTime = typeof window !== 'undefined' ? sessionStorage.getItem('eco_client_build_timestamp') : null;

    if (definedTime) {
      this.initialClientTimestamp = definedTime;
    } else if (storedClientTime) {
      this.initialClientTimestamp = parseInt(storedClientTime, 10);
    } else {
      this.initialClientTimestamp = Date.now();
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eco_client_build_timestamp', String(this.initialClientTimestamp));
    }

    this.currentVersionStr = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.0';

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
    };

    if (typeof window !== 'undefined') {
      this.initEventListeners();
      this.startPolling();
    }
  }

  public getClientVersion(): string {
    return this.currentVersionStr;
  }

  public getClientTimestamp(): number {
    return this.initialClientTimestamp;
  }

  public getState() {
    return { ...this.lastKnownState };
  }

  public subscribe(listener: UpdateListener): () => void {
    this.listeners.add(listener);
    // Send immediate snapshot
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
    // When tab becomes visible again, check immediately
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates();
      }
    });

    window.addEventListener('online', () => {
      this.checkForUpdates();
    });
  }

  public startPolling(intervalMs?: number) {
    if (intervalMs) this.pollIntervalMs = intervalMs;
    this.stopPolling();
    this.checkForUpdates();
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
   * Probes /api/system/version with fallback to /version.json
   */
  public async checkForUpdates(): Promise<void> {
    try {
      const cacheBuster = Date.now();
      let res = await fetch(`/api/system/version?_t=${cacheBuster}`, {
        headers: { Accept: 'application/json' },
      }).catch(() => null);

      if (res && res.ok) {
        const data: SystemVersionInfo = await res.json();
        this.processRemoteInfo(data);
        return;
      }

      // Fallback: Check static version.json
      const staticRes = await fetch(`/version.json?_t=${cacheBuster}`, {
        headers: { Accept: 'application/json' },
      }).catch(() => null);

      if (staticRes && staticRes.ok) {
        const staticData = await staticRes.json();
        this.processRemoteInfo({
          version: staticData.version || this.currentVersionStr,
          buildTimestamp: staticData.buildTimestamp || this.initialClientTimestamp,
          maintenance: {
            active: false,
            title: '',
            message: '',
          },
        });
      }
    } catch (err) {
      // Quiet background failure
    }
  }

  private processRemoteInfo(remote: SystemVersionInfo) {
    const isMaintenance = Boolean(remote.maintenance && remote.maintenance.active);
    const remoteTime = remote.buildTimestamp || 0;
    
    // A new version exists if the remote build timestamp is substantially newer (more than 10 seconds difference)
    const hasNewVersion = remoteTime > this.initialClientTimestamp + 10000;

    const prevState = { ...this.lastKnownState };

    this.lastKnownState = {
      isMaintenance,
      maintenanceInfo: remote.maintenance || prevState.maintenanceInfo,
      hasNewVersion,
      remoteVersion: remote.version || this.currentVersionStr,
      remoteTimestamp: remoteTime,
    };

    // If state changed, notify subscribers
    if (
      prevState.isMaintenance !== isMaintenance ||
      prevState.hasNewVersion !== hasNewVersion ||
      prevState.remoteVersion !== this.lastKnownState.remoteVersion
    ) {
      this.notify();
    }
  }

  /**
   * Centralized Auto Sign-Out and Server Reload
   * Clears auth credentials, notifies the login screen, and forces fresh HTTP reload.
   */
  public performAutoSignOutAndReload(
    customMessage = 'تم تحديث وترقية النظام السحابي بنجاح. تم تسجيل الخروج تلقائياً لتأمين الجلسة وتحميل الملفات المحدثة.'
  ) {
    try {
      // Clear user credentials to enforce auto sign out
      localStorage.removeItem('eco_auth_session');
      sessionStorage.removeItem('eco_auth_session');
      localStorage.removeItem('d1_session_token');
      sessionStorage.removeItem('d1_session_token');

      // Store banner notice for login page
      sessionStorage.setItem(
        'eco_update_notice',
        JSON.stringify({
          title: 'تم تحديث وترقية النظام السحابي بنجاح',
          message: customMessage,
          timestamp: Date.now(),
        })
      );

      // Unregister or purge caches if ServiceWorker exists
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.warn('[performAutoSignOutAndReload] Error clearing storage:', e);
    }

    // Force clean navigation to login with cache bust
    window.location.href = `/login?v=${Date.now()}`;
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
