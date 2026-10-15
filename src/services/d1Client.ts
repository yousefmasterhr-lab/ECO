/**
 * Cloudflare D1 Core Client Service
 * Encapsulates Edge D1 SQL operations for Authentication, Users, and Audit Logs
 * Completely decoupled from the local SQL Server financial bridge.
 */

import { AuthUser, ManagedUser, AuditLogEntry } from '../types/auth';
import { SystemConfigurationItem, ConfigurationCategory } from '../types/configurations';

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
  updateUser: async (
    id: string,
    updates: Partial<ManagedUser> & { password?: string }
  ): Promise<{ success: boolean; error?: string }> => {
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
   * Save User Permissions in D1
   */
  saveUserPermissions: async (userId: string, permissions: string[], userName?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/permissions', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, permissions, userName }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'فشل حفظ الصلاحيات' };
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

  /**
   * Dynamic Configuration Engine (Cloudflare D1 Persistence)
   */
  fetchConfigurations: async (category?: ConfigurationCategory): Promise<SystemConfigurationItem[]> => {
    try {
      const url = category ? `/api/configurations?category=${encodeURIComponent(category)}` : '/api/configurations';
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.configurations)) {
          return data.configurations.map((item: any) => ({
            id: item.id,
            category: item.category as ConfigurationCategory,
            code: item.code,
            nameAr: item.name_ar || item.nameAr,
            nameEn: item.name_en || item.nameEn,
            descriptionAr: item.description_ar || item.descriptionAr,
            descriptionEn: item.description_en || item.descriptionEn,
            colorVar: item.color_var || item.colorVar,
            isSystem: item.is_system === 1 || item.isSystem === true,
            isActive: item.is_active === 1 || item.isActive === true || item.is_active === undefined,
            createdAt: item.created_at || item.createdAt,
            updatedAt: item.updated_at || item.updatedAt,
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to fetch configurations from D1:', e);
    }
    return [];
  },

  createConfiguration: async (
    item: Partial<SystemConfigurationItem> & { category: ConfigurationCategory; nameAr: string }
  ): Promise<{ success: boolean; item?: SystemConfigurationItem; error?: string }> => {
    try {
      const response = await fetch('/api/configurations', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'فشل حفظ عنصر الإعدادات' };
      }

      const raw = data.item;
      const mapped: SystemConfigurationItem = {
        id: raw.id,
        category: raw.category,
        code: raw.code,
        nameAr: raw.name_ar || raw.nameAr,
        nameEn: raw.name_en || raw.nameEn,
        descriptionAr: raw.description_ar || raw.descriptionAr,
        descriptionEn: raw.description_en || raw.descriptionEn,
        colorVar: raw.color_var || raw.colorVar,
        isSystem: raw.is_system === 1 || raw.isSystem === true,
        isActive: raw.is_active === 1 || raw.isActive === true,
        createdAt: raw.created_at || raw.createdAt,
        updatedAt: raw.updated_at || raw.updatedAt,
      };

      return { success: true, item: mapped };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateConfiguration: async (
    id: string,
    updates: Partial<SystemConfigurationItem>
  ): Promise<{ success: boolean; item?: SystemConfigurationItem; error?: string }> => {
    try {
      const response = await fetch('/api/configurations', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'فشل تحديث عنصر الإعدادات' };
      }

      return { success: true, item: data.item };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  deleteConfiguration: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/configurations?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'فشل حذف عنصر الإعدادات' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
