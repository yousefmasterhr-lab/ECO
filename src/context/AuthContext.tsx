import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  UserRole,
  PRECONFIGURED_SEED_USERS,
  ROLE_CONFIGURATIONS,
  SeedAccount,
  ManagedUser,
  AuditLogEntry,
  INITIAL_ROOT_ADMIN,
  ALL_COMPANY_PERMISSIONS
} from '../types/auth';
import { d1Client, clearSessionToken, setSessionToken } from '../services/d1Client';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  login: (
    emailOrUsername: string,
    password: string,
    rememberOption?: boolean
  ) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  checkModuleAccess: (moduleId: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (key: string) => boolean;
  updateUserProfile: (updates: {
    nameAr?: string;
    jobTitleAr?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateUserPermissions: (
    userId: string,
    permissions: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  currentPath: string;
  navigate: (path: string) => void;
  seedUsers: SeedAccount[];
  managedUsers: ManagedUser[];
  addManagedUser: (userData: Omit<ManagedUser, 'id' | 'createdAt'>) => ManagedUser;
  updateManagedUser: (id: string, updates: Partial<ManagedUser>) => void;
  deleteManagedUser: (id: string) => boolean;
  auditLogs: AuditLogEntry[];
  logAuditEvent: (
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorName' | 'actorEmail' | 'actorRole'>
  ) => void;
}

const STORAGE_KEY_AUTH = 'eco_auth_session';
const STORAGE_KEY_REMEMBER = 'eco_auth_remember';
const STORAGE_KEY_USERS = 'eco_managed_users';
const STORAGE_KEY_AUDIT = 'eco_audit_logs';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_REMEMBER) === 'true';
  });

  // Track client path for route guards & seamless browser history
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path !== '' ? path : '/';
    }
    return '/';
  });

  // 1. Managed Users State (Initialized with Root Administrator only, zero dummy mock clutter)
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse managed users from localStorage', e);
    }
    return [INITIAL_ROOT_ADMIN];
  });

  // 2. Real Dynamic Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse audit logs from localStorage', e);
    }
    return [
      {
        id: 'log_boot_01',
        timestamp: '2026-10-10 08:30:15',
        actorName: 'يوسف حجازي',
        actorEmail: 'admin@hrsup.com',
        actorRole: 'SUPER_ADMIN',
        actionAr: 'إعدادات النظام',
        actionEn: 'System Settings',
        category: 'SECURITY',
        detailsAr: 'إنشاء حساب الإدارة وتفعيل الصلاحيات',
        detailsEn: 'Admin account created and permissions enabled',
        status: 'SUCCESS',
      },
    ];
  });

  // Persist managed users changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(managedUsers));
    } catch (e) {
      console.error('Failed to save managed users to localStorage', e);
    }
  }, [managedUsers]);

  // Persist audit logs changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed to save audit logs to localStorage', e);
    }
  }, [auditLogs]);

  // Sync with Cloudflare D1 Edge database
  useEffect(() => {
    d1Client.fetchUsers().then(liveUsers => {
      if (liveUsers && liveUsers.length > 0) {
        setManagedUsers(liveUsers);
        // Automatically sync current logged-in user profile & permissions if updated in D1
        setUser(currentUser => {
          if (!currentUser) return null;
          const matched = liveUsers.find(
            u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
          );
          if (matched) {
            return {
              ...currentUser,
              nameAr: matched.nameAr || currentUser.nameAr,
              nameEn: matched.nameEn || currentUser.nameEn,
              jobTitleAr: matched.jobTitleAr || currentUser.jobTitleAr,
              phone: matched.phone || currentUser.phone,
              permissions: matched.permissions || currentUser.permissions,
            };
          }
          return currentUser;
        });
      }
    }).catch(() => {});

    d1Client.fetchAuditLogs().then(liveLogs => {
      if (liveLogs && liveLogs.length > 0) {
        setAuditLogs(liveLogs);
      }
    }).catch(() => {});
  }, []);

  // Dynamic audit event logger
  const logAuditEvent = useCallback(
    (
      entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorName' | 'actorEmail' | 'actorRole'>
    ) => {
      const now = new Date();
      const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19);
      const newLog: AuditLogEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: formattedTimestamp,
        actorName: user ? user.nameAr : 'النظام المركزي (System)',
        actorEmail: user ? user.email : 'system@hrsup.com',
        actorRole: user ? user.role : 'SUPER_ADMIN',
        actionAr: entry.actionAr,
        actionEn: entry.actionEn,
        category: entry.category,
        detailsAr: entry.detailsAr,
        detailsEn: entry.detailsEn,
        ipAddress: entry.ipAddress || '10.0.4.12 (Internal VPN)',
        status: entry.status,
      };

      setAuditLogs(prev => [newLog, ...prev.slice(0, 249)]); // Keep recent 250 records

      // Persist to Cloudflare D1 asynchronously
      d1Client.insertAuditLog({
        id: newLog.id,
        user_id: user ? user.id : 'system',
        user_name: newLog.actorName,
        category: newLog.category,
        actionAr: newLog.actionAr,
        detailsAr: newLog.detailsAr,
      }).catch(() => {});
    },
    [user]
  );

  // Restore session on initial load
  useEffect(() => {
    try {
      const storedLocal = localStorage.getItem(STORAGE_KEY_AUTH);
      const storedSession = sessionStorage.getItem(STORAGE_KEY_AUTH);
      const activeData = storedLocal || storedSession;

      if (activeData) {
        const parsed = JSON.parse(activeData) as AuthUser;
        if (parsed && parsed.id && parsed.role) {
          const config = ROLE_CONFIGURATIONS[parsed.role];
          const isRoot =
            parsed.id === INITIAL_ROOT_ADMIN.id ||
            parsed.id === 'usr_root_csuite_01' ||
            parsed.id === 'usr_root_csuite' ||
            parsed.role === 'SUPER_ADMIN';

          setUser({
            ...parsed,
            nameAr: isRoot ? 'يوسف حجازي' : (parsed.nameAr || 'يوسف حجازي'),
            nameEn: isRoot ? 'Yousef Hegazy' : (parsed.nameEn || 'Yousef Hegazy'),
            jobTitleAr: isRoot
              ? (parsed.jobTitleAr || 'مدير النظام العام / رئيس مجلس الإدارة')
              : parsed.jobTitleAr,
            phone: isRoot ? (parsed.phone || '+20 100 000 0000') : parsed.phone,
            permissions: isRoot
              ? (parsed.permissions && parsed.permissions.length > 0
                  ? parsed.permissions
                  : [...ALL_COMPANY_PERMISSIONS])
              : (parsed.permissions || []),
            allowedModuleIds: config?.allowedModuleIds || parsed.allowedModuleIds || [],
          });
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.history.replaceState({}, '', '/login');
          setCurrentPath('/login');
        }
      }
    } catch (e) {
      console.warn('Failed to parse active auth session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to browser popstate for backward/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
      }
      setCurrentPath(path);
    }
  }, []);

  // Authenticate against managed users and pre-configured seeds
  const login = useCallback(
    async (
      emailOrUsername: string,
      password: string,
      rememberOption?: boolean
    ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
      setIsLoading(true);

      const cleanInput = emailOrUsername.trim().toLowerCase();

      // 1. Attempt Cloudflare D1 Edge Authentication
      try {
        const edgeRes = await d1Client.login(cleanInput, password);
        if (edgeRes.success && edgeRes.user) {
          const config = ROLE_CONFIGURATIONS[edgeRes.user.role as UserRole];
          const isRoot =
            edgeRes.user.role === 'SUPER_ADMIN' ||
            edgeRes.user.id === INITIAL_ROOT_ADMIN.id ||
            edgeRes.user.id === 'usr_root_csuite_01';

          const authenticatedUser: AuthUser = {
            id: edgeRes.user.id,
            email: edgeRes.user.email,
            username: edgeRes.user.username,
            nameAr: isRoot ? 'يوسف حجازي' : (edgeRes.user.nameAr || (edgeRes.user as any).fullName || edgeRes.user.nameEn),
            nameEn: isRoot ? 'Yousef Hegazy' : (edgeRes.user.nameEn || edgeRes.user.username),
            jobTitleAr: edgeRes.user.jobTitleAr || (edgeRes.user as any).job_title || (isRoot ? 'مدير النظام العام / رئيس مجلس الإدارة' : undefined),
            jobTitleEn: edgeRes.user.jobTitleEn,
            phone: edgeRes.user.phone || (isRoot ? '+20 100 000 0000' : undefined),
            role: (edgeRes.user.role as UserRole) || 'SUPER_ADMIN',
            roleLabelAr: config?.titleAr || edgeRes.user.role,
            roleLabelEn: config?.titleEn || edgeRes.user.role,
            departmentAr: edgeRes.user.departmentAr || (edgeRes.user as any).department || 'الإدارة العليا والاستراتيجية',
            departmentEn: edgeRes.user.departmentEn || (edgeRes.user as any).department || 'Executive Management',
            clearanceLevel: (edgeRes.user.clearanceLevel as 1 | 2 | 3 | 4) || 4,
            clearanceNameAr: config?.clearanceNameAr || 'إدارة عليا وحوكمة',
            clearanceNameEn: config?.clearanceNameEn || 'Level 4 - C-Suite Governance',
            allowedModuleIds: config?.allowedModuleIds || [],
            permissions: edgeRes.user.permissions || (edgeRes.user as any).permissions_json || (isRoot ? [...ALL_COMPANY_PERMISSIONS] : []),
            lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
          };

          const isRemember = rememberOption !== undefined ? rememberOption : rememberMe;
          setUser(authenticatedUser);
          setRememberMe(isRemember);
          localStorage.setItem(STORAGE_KEY_REMEMBER, String(isRemember));

          if (isRemember) {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authenticatedUser));
            sessionStorage.removeItem(STORAGE_KEY_AUTH);
          } else {
            sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authenticatedUser));
            localStorage.removeItem(STORAGE_KEY_AUTH);
          }

          if (edgeRes.token) {
            setSessionToken(edgeRes.token, isRemember);
          }

          setIsLoading(false);
          return { success: true, user: authenticatedUser };
        } else if (edgeRes.error && !edgeRes.error.includes('خطأ في الاتصال') && !edgeRes.error.includes('fetch')) {
          setIsLoading(false);
          return { success: false, error: edgeRes.error };
        }
      } catch {
        // Fallback to local evaluation
      }

      // Fast verification delay for local fallback (350ms)
      await new Promise(resolve => setTimeout(resolve, 350));

      // Check managed users first
      const foundInManaged = managedUsers.find(
        u =>
          u.email.toLowerCase() === cleanInput ||
          u.username.toLowerCase() === cleanInput
      );

      // Check pre-configured seed accounts
      const foundInSeed = PRECONFIGURED_SEED_USERS.find(
        acc =>
          acc.user.email.toLowerCase() === cleanInput ||
          acc.user.username.toLowerCase() === cleanInput
      );

      let authenticatedUser: AuthUser | null = null;

      if (foundInManaged) {
        if (foundInManaged.status === 'SUSPENDED') {
          setIsLoading(false);
          logAuditEvent({
            actionAr: 'محاولة دخول بحساب معطل',
            actionEn: 'Login Attempt to Suspended Account',
            category: 'SECURITY',
            detailsAr: `تم رفض محاولة تسجيل الدخول للحساب المعطل: ${foundInManaged.email}`,
            detailsEn: `Blocked login attempt for suspended user ${foundInManaged.email}`,
            status: 'FAILED',
          });
          return {
            success: false,
            error: 'هذا الحساب معطل حالياً من قبل الإدارة العليا. يرجى مراجعة المسؤول.',
          };
        }

        if (foundInManaged.passwordHash !== password) {
          setIsLoading(false);
          logAuditEvent({
            actionAr: 'فشل في التحقق من كلمة المرور',
            actionEn: 'Failed Password Verification',
            category: 'SECURITY',
            detailsAr: `محاولة دخول فاشلة للمستخدم ${foundInManaged.email}`,
            detailsEn: `Invalid password attempt for ${foundInManaged.email}`,
            status: 'FAILED',
          });
          return {
            success: false,
            error: 'بيانات الاعتماد غير صحيحة، يرجى التحقق من اسم المستخدم وكلمة المرور.',
          };
        }

        const config = ROLE_CONFIGURATIONS[foundInManaged.role];
        const isRoot =
          foundInManaged.role === 'SUPER_ADMIN' ||
          foundInManaged.id === INITIAL_ROOT_ADMIN.id ||
          foundInManaged.id === 'usr_root_csuite_01';

        authenticatedUser = {
          id: foundInManaged.id,
          email: foundInManaged.email,
          username: foundInManaged.username,
          nameAr: isRoot ? 'يوسف حجازي' : foundInManaged.nameAr,
          nameEn: isRoot ? 'Yousef Hegazy' : foundInManaged.nameEn,
          jobTitleAr: foundInManaged.jobTitleAr || (isRoot ? 'مدير النظام العام / رئيس مجلس الإدارة' : undefined),
          jobTitleEn: foundInManaged.jobTitleEn,
          phone: foundInManaged.phone || (isRoot ? '+20 100 000 0000' : undefined),
          role: foundInManaged.role,
          roleLabelAr: foundInManaged.roleLabelAr,
          roleLabelEn: foundInManaged.roleLabelEn,
          departmentAr: foundInManaged.departmentAr,
          departmentEn: foundInManaged.departmentEn,
          clearanceLevel: foundInManaged.clearanceLevel,
          clearanceNameAr: foundInManaged.clearanceNameAr,
          clearanceNameEn: foundInManaged.clearanceNameEn,
          allowedModuleIds: config?.allowedModuleIds || [],
          permissions: foundInManaged.permissions || foundInManaged.customPermissions || (isRoot ? [...ALL_COMPANY_PERMISSIONS] : []),
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      } else if (foundInSeed) {
        if (foundInSeed.passwordHash !== password) {
          setIsLoading(false);
          logAuditEvent({
            actionAr: 'فشل في التحقق من كلمة المرور',
            actionEn: 'Failed Password Verification',
            category: 'SECURITY',
            detailsAr: `محاولة دخول فاشلة للمستخدم ${foundInSeed.user.email}`,
            detailsEn: `Invalid password attempt for ${foundInSeed.user.email}`,
            status: 'FAILED',
          });
          return {
            success: false,
            error: 'بيانات الاعتماد غير صحيحة، يرجى التحقق من اسم المستخدم وكلمة المرور.',
          };
        }

        authenticatedUser = {
          ...foundInSeed.user,
          permissions: foundInSeed.user.permissions || (foundInSeed.user.role === 'SUPER_ADMIN' ? [...ALL_COMPANY_PERMISSIONS] : []),
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
      }

      if (!authenticatedUser) {
        setIsLoading(false);
        logAuditEvent({
          actionAr: 'محاولة دخول باسم مستخدم غير مسجل',
          actionEn: 'Unknown User Login Attempt',
          category: 'SECURITY',
          detailsAr: `محاولة تسجيل دخول لبريد غير مسجل: ${cleanInput}`,
          detailsEn: `Failed login attempt for unknown credential ${cleanInput}`,
          status: 'FAILED',
        });
        return {
          success: false,
          error: 'بيانات الاعتماد غير صحيحة، يرجى التحقق من اسم المستخدم وكلمة المرور.',
        };
      }

      const isRemember = rememberOption !== undefined ? rememberOption : rememberMe;
      setUser(authenticatedUser);
      setRememberMe(isRemember);
      localStorage.setItem(STORAGE_KEY_REMEMBER, String(isRemember));

      if (isRemember) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authenticatedUser));
        sessionStorage.removeItem(STORAGE_KEY_AUTH);
      } else {
        sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authenticatedUser));
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }

      // Record successful login in audit log
      logAuditEvent({
        actionAr: 'تسجيل دخول ناجح',
        actionEn: 'Successful Authentication',
        category: 'AUTH',
        detailsAr: `تم تسجيل دخول ${authenticatedUser.nameAr} (${authenticatedUser.roleLabelAr}) بنجاح`,
        detailsEn: `Authenticated session initiated for ${authenticatedUser.nameEn}`,
        status: 'SUCCESS',
      });

      setIsLoading(false);
      return { success: true, user: authenticatedUser };
    },
    [rememberMe, managedUsers, logAuditEvent]
  );

  const logout = useCallback(() => {
    if (user) {
      logAuditEvent({
        actionAr: 'تسجيل خروج',
        actionEn: 'Sign Out',
        category: 'AUTH',
        detailsAr: `قام المستخدم ${user.nameAr} بتسجيل الخروج`,
        detailsEn: `User ${user.nameEn} signed out`,
        status: 'SUCCESS',
      });
    }
    setUser(null);
    clearSessionToken();
    localStorage.removeItem(STORAGE_KEY_AUTH);
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    navigate('/login');
  }, [user, logAuditEvent, navigate]);

  const switchUserRole = useCallback(
    (role: UserRole) => {
      const seed = PRECONFIGURED_SEED_USERS.find(acc => acc.user.role === role);
      if (seed) {
        const updated = {
          ...seed.user,
          lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        setUser(updated);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
        } else {
          sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
        }

        logAuditEvent({
          actionAr: 'تبديل الدور الوظيفي',
          actionEn: 'Switch User Role',
          category: 'RBAC',
          detailsAr: `تم التبديل إلى دور: ${updated.roleLabelAr}`,
          detailsEn: `Role switched to ${updated.role}`,
          status: 'SUCCESS',
        });
      }
    },
    [rememberMe, logAuditEvent]
  );

  const checkModuleAccess = useCallback(
    (moduleId: string): boolean => {
      if (!user) return false;
      if (user.role === 'SUPER_ADMIN') return true;
      return user.allowedModuleIds.includes(moduleId);
    },
    [user]
  );

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    },
    [user]
  );

  // Granular Action-Level RBAC Checker
  const hasPermission = useCallback(
    (key: string): boolean => {
      if (!user) return false;
      // Super Admin and System Owner have full unrestricted permissions
      if (
        user.role === 'SUPER_ADMIN' ||
        user.id === INITIAL_ROOT_ADMIN.id ||
        user.id === 'usr_root_csuite_01' ||
        user.id === 'usr_root_csuite'
      ) {
        return true;
      }
      if (!user.permissions || !Array.isArray(user.permissions)) {
        return false;
      }
      return (
        user.permissions.includes(key) ||
        user.permissions.includes('*') ||
        user.permissions.includes('companies.*')
      );
    },
    [user]
  );

  // Real User Profile Editor (Syncs to Cloudflare D1 & Local Storage)
  const updateUserProfile = useCallback(
    async (updates: {
      nameAr?: string;
      jobTitleAr?: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'المستخدم غير مسجل الدخول' };
      try {
        const updatedUser: AuthUser = {
          ...user,
          ...updates,
        };
        setUser(updatedUser);

        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updatedUser));
        }

        // Update in managedUsers collection
        setManagedUsers(prev =>
          prev.map(u => (u.id === user.id ? { ...u, ...updates } : u))
        );

        // Sync with Cloudflare D1
        await d1Client.updateUser(user.id, updates);

        logAuditEvent({
          actionAr: 'تحديث بيانات الملف الشخصي',
          actionEn: 'Update Profile Information',
          category: 'USER_MGMT',
          detailsAr: `قام المستخدم ${updatedUser.nameAr} بتحديث بياناته الشخصية`,
          detailsEn: `User ${updatedUser.nameEn || updatedUser.username} updated profile information`,
          status: 'SUCCESS',
        });

        return { success: true };
      } catch (err: any) {
        console.error('Failed to update user profile in D1', err);
        return { success: false, error: err?.message || 'فشل تحديث البيانات في الخادم' };
      }
    },
    [user, rememberMe, logAuditEvent]
  );

  // Real Password Change Handler (Syncs to Cloudflare D1 & Local Storage)
  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user) return { success: false, error: 'المستخدم غير مسجل الدخول' };
      try {
        // Validate current password against known records
        const found = managedUsers.find(u => u.id === user.id);
        if (found && found.passwordHash && found.passwordHash !== currentPassword) {
          return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
        }

        // Sync new password to D1
        await d1Client.updateUser(user.id, { password: newPassword });

        // Update local state
        setManagedUsers(prev =>
          prev.map(u => (u.id === user.id ? { ...u, passwordHash: newPassword } : u))
        );

        logAuditEvent({
          actionAr: 'تغيير كلمة المرور',
          actionEn: 'Change Security Password',
          category: 'SECURITY',
          detailsAr: `قام المستخدم ${user.nameAr} بتغيير كلمة المرور بنجاح`,
          detailsEn: `Security password changed for ${user.nameEn || user.username}`,
          status: 'SUCCESS',
        });

        return { success: true };
      } catch (err: any) {
        console.error('Failed to change password in D1', err);
        return { success: false, error: err?.message || 'فشل تغيير كلمة المرور' };
      }
    },
    [user, managedUsers, logAuditEvent]
  );

  // Granular RBAC Permissions Matrix Updater (Syncs to D1 /api/permissions)
  const updateUserPermissions = useCallback(
    async (
      userId: string,
      permissions: string[]
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const target = managedUsers.find(u => u.id === userId);
        const targetName = target ? target.nameAr : userId;

        // Update managedUsers in state
        setManagedUsers(prev =>
          prev.map(u =>
            u.id === userId
              ? { ...u, permissions, customPermissions: permissions }
              : u
          )
        );

        // If the updated user is currently logged in, update active user state immediately
        if (user && user.id === userId) {
          const updatedActive: AuthUser = {
            ...user,
            permissions,
          };
          setUser(updatedActive);
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updatedActive));
          } else {
            sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updatedActive));
          }
        }

        // Persist to Cloudflare D1
        const res = await d1Client.saveUserPermissions(userId, permissions, targetName);
        if (!res.success) {
          throw new Error(res.error || 'Failed to save permissions to D1');
        }

        logAuditEvent({
          actionAr: 'تعديل مصفوفة الصلاحيات',
          actionEn: 'Update Permissions Matrix',
          category: 'RBAC',
          detailsAr: `تم تحديث صلاحيات المستخدم (${targetName}) بعدد ${permissions.length} صلاحية`,
          detailsEn: `Updated permissions matrix for ${userId} (${permissions.length} permissions assigned)`,
          status: 'SUCCESS',
        });

        return { success: true };
      } catch (err: any) {
        console.error('Failed to update permissions in D1', err);
        return { success: false, error: err?.message || 'فشل حفظ الصلاحيات في قاعدة البيانات' };
      }
    },
    [user, managedUsers, rememberMe, logAuditEvent]
  );

  // User Management Actions (Synced with Cloudflare D1)
  const addManagedUser = useCallback(
    (userData: Omit<ManagedUser, 'id' | 'createdAt'>): ManagedUser => {
      const newUser: ManagedUser = {
        ...userData,
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setManagedUsers(prev => [newUser, ...prev]);

      // Async sync to Cloudflare D1
      d1Client.createUser({
        ...newUser,
        password: newUser.passwordHash,
      }).catch(e => console.warn('D1 user creation sync error:', e));

      logAuditEvent({
        actionAr: 'إضافة مستخدم جديد',
        actionEn: 'Create New User Account',
        category: 'USER_MGMT',
        detailsAr: `تم إنشاء حساب مستخدم جديد: ${newUser.nameAr} (${newUser.roleLabelAr} - ${newUser.departmentAr})`,
        detailsEn: `Created user account for ${newUser.nameEn} (${newUser.role})`,
        status: 'SUCCESS',
      });

      return newUser;
    },
    [logAuditEvent]
  );

  const updateManagedUser = useCallback(
    (id: string, updates: Partial<ManagedUser>) => {
      setManagedUsers(prev =>
        prev.map(u => {
          if (u.id === id) {
            const updated = { ...u, ...updates };

            // Async sync to Cloudflare D1
            d1Client.updateUser(id, updates).catch(e => console.warn('D1 user update sync error:', e));

            logAuditEvent({
              actionAr: 'تعديل بيانات وصلاحيات مستخدم',
              actionEn: 'Update User Profile & Permissions',
              category: 'USER_MGMT',
              detailsAr: `تم تحديث بيانات المستخدم ${updated.nameAr} (${updated.roleLabelAr})`,
              detailsEn: `Updated credentials and role for ${updated.nameEn}`,
              status: 'SUCCESS',
            });
            return updated;
          }
          return u;
        })
      );
    },
    [logAuditEvent]
  );

  const deleteManagedUser = useCallback(
    (id: string): boolean => {
      // Disallow deleting root admin
      if (id === INITIAL_ROOT_ADMIN.id || id === 'usr_root_csuite_01' || id === 'usr_root_csuite') {
        return false;
      }

      const target = managedUsers.find(u => u.id === id);
      if (target) {
        setManagedUsers(prev => prev.filter(u => u.id !== id));

        // Async sync to Cloudflare D1
        d1Client.deleteUser(id).catch(e => console.warn('D1 user delete sync error:', e));

        logAuditEvent({
          actionAr: 'حذف حساب مستخدم',
          actionEn: 'Delete User Account',
          category: 'USER_MGMT',
          detailsAr: `تم حذف حساب المستخدم: ${target.nameAr} (${target.email})`,
          detailsEn: `Deleted account for ${target.nameEn}`,
          status: 'WARNING',
        });
        return true;
      }
      return false;
    },
    [managedUsers, logAuditEvent]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        rememberMe,
        setRememberMe,
        login,
        logout,
        switchUserRole,
        checkModuleAccess,
        hasRole,
        hasPermission,
        updateUserProfile,
        changePassword,
        updateUserPermissions,
        currentPath,
        navigate,
        seedUsers: PRECONFIGURED_SEED_USERS,
        managedUsers,
        addManagedUser,
        updateManagedUser,
        deleteManagedUser,
        auditLogs,
        logAuditEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthStore = useAuth;

export const useNavigate = () => {
  const { navigate } = useAuth();
  return navigate;
};
