/**
 * Cloudflare D1 Core Client Service
 * Encapsulates Edge D1 SQL operations for Authentication, Users, and Audit Logs
 * Completely decoupled from the local SQL Server financial bridge.
 */

import { AuthUser, ManagedUser, AuditLogEntry } from '../types/auth';

const TOKEN_KEY = 'eco_session_token';

export const getSessionToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setSessionToken = (token: string, remember = true): void => {
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
};

export const clearSessionToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const d1Client = {
  /**
   * Authentic Edge Login via Cloudflare Pages Function & D1 Database
   */
  login: async (
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'فشل تسجيل الدخول، يرجى التأكد من صحة البيانات.',
        };
      }

      if (data.token) {
        setSessionToken(data.token, true);
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'خطأ في الاتصال بخدمة المصادقة السحابية',
      };
    }
  },

  /**
   * Verify Session / Get Me
   */
  getMe: async (): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        return { success: false, error: 'الجلسة غير صالحة' };
      }

      const data = await response.json();
      return { success: data.success, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch All Users from D1
   */
  fetchUsers: async (): Promise<ManagedUser[]> => {
    try {
      const response = await fetch('/api/users', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.users)) {
          return data.users;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch users from D1 API:', e);
    }
    return [];
  },

  /**
   * Create User in D1
   */
  createUser: async (user: Partial<ManagedUser> & { password?: string }): Promise<{ success: boolean; user?: ManagedUser; error?: string }> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'فشل حفظ المستخدم' };
      }

      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'خطأ في الاتصال بقاعدة بيانات D1' };
    }
  },

  /**
   * Update User in D1
   */
  updateUser: async (id: string, updates: Partial<ManagedUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'فشل تحديث المستخدم' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Delete User in D1
   */
  deleteUser: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/users?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'فشل حذف المستخدم' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch Audit Logs from D1
   */
  fetchAuditLogs: async (category?: string): Promise<AuditLogEntry[]> => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'ALL' && category !== 'الكل') {
        params.append('category', category);
      }

      const response = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.logs)) {
          return data.logs;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch audit logs from D1 API:', e);
    }
    return [];
  },

  /**
   * Insert Audit Log into D1
   */
  insertAuditLog: async (log: Partial<AuditLogEntry> & { user_id?: string; user_name?: string }): Promise<void> => {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: log.id,
          userId: log.user_id || log.actorEmail || 'system',
          userName: log.user_name || log.actorName || 'النظام المركزي',
          category: log.category,
          action: log.actionAr,
          details: log.detailsAr,
        }),
      });
    } catch (e) {
      console.warn('Failed to insert audit log to D1 API:', e);
    }
  },
};
