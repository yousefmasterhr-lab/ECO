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
  INITIAL_TAGHREED_USER,
  ALL_COMPANY_PERMISSIONS
} from '../types/auth';
import { cleanArabicTitle, SUBMODULE_VIEW_PERMISSION_MAP } from '../types/rbac';
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
  hasPermission: (userOrKey: any, maybeKey?: string) => boolean;
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
  showWelcomeSplash: boolean;
  completeWelcomeSplash: () => void;
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

  // Top-Level 3D Cinematic Post-Login Welcome Splash State (Two-Lock Persistent Flag)
  const [showWelcomeSplash, setShowWelcomeSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('eco_pending_welcome_splash') === 'true' ||
        sessionStorage.getItem('eco_show_welcome_splash') === 'true'
      );
    }
    return false;
  });

  const completeWelcomeSplash = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eco_pending_welcome_splash');
      sessionStorage.removeItem('eco_show_welcome_splash');
    }
    setShowWelcomeSplash(false);
  }, []);

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
    return [INITIAL_ROOT_ADMIN, INITIAL_TAGHREED_USER];
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
    // Sync with Cloudflare D1 Edge database: fetch users & RBAC matrices
    Promise.all([
      d1Client.fetchUsers(),
      d1Client.fetchRbacMatrices(),
    ]).then(([liveUsers, liveMatrices]) => {
      // Build lookup map for stored matrices
      const matrixMap = new Map<string, string[]>();
      if (Array.isArray(liveMatrices)) {
        liveMatrices.forEach(m => {
          if (m.targetType && m.targetId && Array.isArray(m.permissions)) {
            matrixMap.set(`${m.targetType}:${m.targetId}`, m.permissions);
          }
        });
      }

      if (liveUsers && liveUsers.length > 0) {
        // Hydrate each user with their persisted D1 permissions
        const mergedUsers = liveUsers.map(u => {
          const userPerms = matrixMap.get(`user:${u.id}`);
          const rolePerms = matrixMap.get(`role:${u.role}`);
          const perms = userPerms || u.permissions || rolePerms || [];
          return {
            ...u,
            permissions: perms,
            customPermissions: perms,
          };
        });

        setManagedUsers(mergedUsers);

        // Automatically sync current logged-in user profile & permissions from D1
        setUser(currentUser => {
          if (!currentUser) return null;
          const matched = mergedUsers.find(
            u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase() || (currentUser.username && u.username.toLowerCase() === currentUser.username.toLowerCase())
          );

          if (!matched) return currentUser;

          const isRoot =
            matched.id === INITIAL_ROOT_ADMIN.id ||
            matched.id === 'usr_root_csuite_01' ||
            matched.id === 'usr_root_csuite' ||
            matched.username === 'admin' ||
            matched.email === 'admin@hrsup.com';

          const isTaghreed =
            (matched.nameAr && matched.nameAr.includes('تغريد')) ||
            (matched.username && matched.username.includes('taghreed')) ||
            (matched.email && matched.email.includes('taghreed'));

          const effectiveRole: UserRole = isRoot
            ? 'SUPER_ADMIN'
            : (isTaghreed ? 'HR_MANAGER' : (matched.role === 'SUPER_ADMIN' ? 'HR_MANAGER' : ((matched.role as UserRole) || 'HR_MANAGER')));

          const roleCfg = ROLE_CONFIGURATIONS[effectiveRole] || ROLE_CONFIGURATIONS.HR_MANAGER;

          // Priority: direct user matrix in D1 > matched user permissions > role matrix in D1
          const d1UserPerms = matrixMap.get(`user:${matched.id}`) ||
                              matched.permissions ||
                              matched.customPermissions ||
                              matrixMap.get(`role:${effectiveRole}`);

          const finalPerms = d1UserPerms && Array.isArray(d1UserPerms) && d1UserPerms.length > 0
            ? d1UserPerms
            : (isRoot ? ['*'] : (roleCfg.allowedModuleIds.map(m => `${m}.*`)));

          const finalAllowedModules = isRoot
            ? ROLE_CONFIGURATIONS.SUPER_ADMIN.allowedModuleIds
            : (roleCfg.allowedModuleIds || ['hr', 'companies']);

          // Non-root users can NEVER have 'all' companies
          const finalAllowedCompanies = isRoot
            ? ['all']
            : (matched.allowedCompanyIds && !matched.allowedCompanyIds.includes('all') && matched.allowedCompanyIds.length > 0
                ? matched.allowedCompanyIds
                : ['comp_01']);

          const updated: AuthUser = {
            id: matched.id,
            nameAr: isRoot ? 'يوسف حجازي' : (matched.nameAr || (isTaghreed ? 'تغريد عاطف' : matched.username)),
            nameEn: isRoot ? 'Yousef Hegazy' : (matched.nameEn || (isTaghreed ? 'Taghreed Atef' : matched.username)),
            email: matched.email,
            username: matched.username,
            role: effectiveRole,
            roleLabelAr: isRoot ? 'مدير النظام العام / رئيس مجلس الإدارة' : (isTaghreed ? 'مدير الموارد البشرية (HRMS)' : (matched.roleLabelAr || matched.jobTitleAr || roleCfg.titleAr)),
            roleLabelEn: isRoot ? 'System Administrator / CEO' : roleCfg.titleEn,
            jobTitleAr: isRoot ? 'مدير النظام العام / رئيس مجلس الإدارة' : (isTaghreed ? 'مدير الموارد البشرية (HRMS)' : (matched.jobTitleAr || matched.roleLabelAr || roleCfg.titleAr)),
            jobTitleEn: isRoot ? 'System Administrator / CEO' : (matched.jobTitleEn || roleCfg.titleEn),
            departmentAr: isRoot ? 'الإدارة العليا والاستراتيجية' : (isTaghreed ? 'إدارة الموارد البشرية والرواتب' : (matched.departmentAr || roleCfg.departmentAr)),
            departmentEn: isRoot ? 'Executive Management' : (matched.departmentEn || roleCfg.departmentEn),
            phone: matched.phone || (isRoot ? '+20 100 000 0000' : '+20 100 000 0001'),
            clearanceLevel: isRoot ? 4 : (matched.clearanceLevel || roleCfg.clearanceLevel || 2),
            clearanceNameAr: isRoot ? 'إدارة عليا وحوكمة' : (roleCfg.clearanceNameAr || 'صلاحيات مخصصة'),
            clearanceNameEn: isRoot ? 'Level 4 - C-Suite Governance' : (roleCfg.clearanceNameEn || 'Custom Role'),
            permissions: finalPerms,
            allowedModuleIds: finalAllowedModules,
            allowedCompanyIds: finalAllowedCompanies,
            lastLogin: currentUser.lastLogin || new Date().toISOString().replace('T', ' ').substring(0, 16),
          };

          try {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
            sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
          } catch {}

          return updated;
        });
      } else if (liveMatrices && liveMatrices.length > 0) {
        setUser(currentUser => {
          if (!currentUser) return null;
          const d1UserPerms = matrixMap.get(`user:${currentUser.id}`) || matrixMap.get(`role:${currentUser.role}`);
          if (d1UserPerms && Array.isArray(d1UserPerms)) {
            const updated = { ...currentUser, permissions: d1UserPerms };
            try {
              localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return currentUser;
        });
      }
    }).catch(err => {
      console.warn('Failed to sync users and RBAC matrices on startup:', err);
    });

    d1Client.fetchAuditLogs().then(liveLogs => {
      if (liveLogs && liveLogs.length > 0) {
        setAuditLogs(liveLogs);
      }
    }).catch(() => {});

    // Real-time synchronization event listener for permissions matrix updates
    const handlePermissionsUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ userId?: string; permissions?: string[] }>;
      if (ce.detail?.userId && Array.isArray(ce.detail?.permissions)) {
        const { userId, permissions } = ce.detail;
        setManagedUsers(prev =>
          prev.map(u => (u.id === userId ? { ...u, permissions, customPermissions: permissions } : u))
        );
        setUser(currentUser => {
          if (currentUser && currentUser.id === userId) {
            const updated = { ...currentUser, permissions };
            try {
              localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return currentUser;
        });
      }
    };

    window.addEventListener('eco-permissions-updated', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('eco-permissions-updated', handlePermissionsUpdated);
    };
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
        if (parsed && parsed.id) {
          const isRoot =
            parsed.id === INITIAL_ROOT_ADMIN.id ||
            parsed.id === 'usr_root_csuite_01' ||
            parsed.id === 'usr_root_csuite' ||
            parsed.username === 'admin' ||
            parsed.email === 'admin@hrsup.com';

          const isTaghreed =
            (parsed.nameAr && parsed.nameAr.includes('تغريد')) ||
            (parsed.username && parsed.username.includes('taghreed')) ||
            (parsed.email && parsed.email.includes('taghreed'));

          // Non-root users can NEVER be SUPER_ADMIN
          const effectiveRole: UserRole = isRoot
            ? 'SUPER_ADMIN'
            : (isTaghreed ? 'HR_MANAGER' : (parsed.role === 'SUPER_ADMIN' || (parsed.role as string) === 'admin' ? 'HR_MANAGER' : (parsed.role || 'HR_MANAGER')));

          const config = ROLE_CONFIGURATIONS[effectiveRole] || ROLE_CONFIGURATIONS.HR_MANAGER;

          const allowedModules = isRoot
            ? ROLE_CONFIGURATIONS.SUPER_ADMIN.allowedModuleIds
            : (config.allowedModuleIds || ['hr', 'companies']);

          // Non-root users can NEVER have 'all' companies
          const allowedCompanies = isRoot
            ? ['all']
            : (parsed.allowedCompanyIds && !parsed.allowedCompanyIds.includes('all') && parsed.allowedCompanyIds.length > 0
                ? parsed.allowedCompanyIds
                : ['comp_01']);

          const restoredUser: AuthUser = {
            id: parsed.id,
            email: parsed.email,
            username: parsed.username,
            role: effectiveRole,
            nameAr: isRoot ? 'يوسف حجازي' : (parsed.nameAr || (isTaghreed ? 'تغريد عاطف' : 'مستخدم المنظومة')),
            nameEn: isRoot ? 'Yousef Hegazy' : (parsed.nameEn || (isTaghreed ? 'Taghreed Atef' : 'System User')),
            jobTitleAr: isRoot
              ? 'مدير النظام العام / رئيس مجلس الإدارة'
              : (isTaghreed ? 'مدير الموارد البشرية (HRMS)' : (parsed.jobTitleAr || config.titleAr)),
            roleLabelAr: isRoot ? 'مدير النظام العام / رئيس مجلس الإدارة' : (isTaghreed ? 'مدير الموارد البشرية (HRMS)' : config.titleAr),
            roleLabelEn: isRoot ? 'System Administrator / CEO' : config.titleEn,
            departmentAr: isRoot ? 'الإدارة العليا والاستراتيجية' : (isTaghreed ? 'إدارة الموارد البشرية والرواتب' : (parsed.departmentAr || config.departmentAr)),
            departmentEn: isRoot ? 'Executive Management' : (parsed.departmentEn || config.departmentEn),
            phone: isRoot ? (parsed.phone || '+20 100 000 0000') : (parsed.phone || '+20 100 000 0001'),
            clearanceLevel: isRoot ? 4 : (parsed.clearanceLevel || config.clearanceLevel || 2),
            clearanceNameAr: isRoot ? 'إدارة عليا وحوكمة' : (config.clearanceNameAr || 'صلاحيات مخصصة'),
            clearanceNameEn: isRoot ? 'Level 4 - C-Suite Governance' : (config.clearanceNameEn || 'Custom Role'),
            permissions: isRoot ? ['*'] : (parsed.permissions && !parsed.permissions.includes('*') ? parsed.permissions : config.allowedModuleIds.map(m => `${m}.*`)),
            allowedModuleIds: allowedModules,
            allowedCompanyIds: allowedCompanies,
            lastLogin: parsed.lastLogin || new Date().toISOString().replace('T', ' ').substring(0, 16),
          };

          setUser(restoredUser);
          try {
            localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(restoredUser));
            sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(restoredUser));
          } catch {}
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
          const rawRole = (edgeRes.user.role as string) || (edgeRes.user as any).role_id || 'HR_MANAGER';
          const isRoot =
            edgeRes.user.id === INITIAL_ROOT_ADMIN.id ||
            edgeRes.user.id === 'usr_root_csuite_01' ||
            edgeRes.user.username === 'admin' ||
            edgeRes.user.email === 'admin@hrsup.com';

          const mappedRole: UserRole = isRoot ? 'SUPER_ADMIN' : (rawRole as UserRole);
          const config = ROLE_CONFIGURATIONS[mappedRole] || ROLE_CONFIGURATIONS.HR_MANAGER;

          const allowedCompanies = (edgeRes.user as any).allowedCompanyIds || ['all'];
          const userPermissions = Array.isArray(edgeRes.user.permissions) && edgeRes.user.permissions.length > 0
            ? edgeRes.user.permissions
            : (isRoot ? ['*'] : (config?.allowedModuleIds?.map(m => `${m}.*`) || []));

          const allowedModules = isRoot
            ? ROLE_CONFIGURATIONS.SUPER_ADMIN.allowedModuleIds
            : (config?.allowedModuleIds || []);

          const authenticatedUser: AuthUser = {
            id: edgeRes.user.id,
            email: edgeRes.user.email,
            username: edgeRes.user.username,
            nameAr: isRoot ? 'يوسف حجازي' : (edgeRes.user.nameAr || (edgeRes.user as any).fullName || edgeRes.user.username),
            nameEn: isRoot ? 'Yousef Hegazy' : (edgeRes.user.nameEn || edgeRes.user.username),
            jobTitleAr: edgeRes.user.jobTitleAr || (edgeRes.user as any).job_title || (isRoot ? 'مدير النظام العام / رئيس مجلس الإدارة' : config?.titleAr),
            jobTitleEn: edgeRes.user.jobTitleEn || config?.titleEn,
            phone: edgeRes.user.phone || (isRoot ? '+20 100 000 0000' : undefined),
            role: mappedRole,
            roleLabelAr: edgeRes.user.jobTitleAr || config?.titleAr || mappedRole,
            roleLabelEn: config?.titleEn || mappedRole,
            departmentAr: edgeRes.user.departmentAr || (edgeRes.user as any).department || config?.departmentAr || 'إدارة الموارد البشرية',
            departmentEn: edgeRes.user.departmentEn || config?.departmentEn || 'Human Resources',
            clearanceLevel: (edgeRes.user.clearanceLevel as 1 | 2 | 3 | 4) || (config?.clearanceLevel as 1 | 2 | 3 | 4) || 2,
            clearanceNameAr: config?.clearanceNameAr || 'صلاحيات مخصصة',
            clearanceNameEn: config?.clearanceNameEn || 'Custom Clearance',
            allowedModuleIds: allowedModules,
            allowedCompanyIds: allowedCompanies,
            permissions: userPermissions,
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

          // Activate 3D Cinematic Post-Login Welcome Splash Screen in both localStorage and sessionStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('eco_pending_welcome_splash', 'true');
            sessionStorage.setItem('eco_show_welcome_splash', 'true');
          }
          setShowWelcomeSplash(true);

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
          foundInManaged.id === INITIAL_ROOT_ADMIN.id ||
          foundInManaged.id === 'usr_root_csuite_01' ||
          foundInManaged.username === 'admin' ||
          foundInManaged.email === 'admin@hrsup.com';

        authenticatedUser = {
          id: foundInManaged.id,
          email: foundInManaged.email,
          username: foundInManaged.username,
          nameAr: isRoot ? 'يوسف حجازي' : foundInManaged.nameAr,
          nameEn: isRoot ? 'Yousef Hegazy' : foundInManaged.nameEn,
          jobTitleAr: foundInManaged.jobTitleAr || (isRoot ? 'مدير النظام العام / رئيس مجلس الإدارة' : config?.titleAr),
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
          allowedCompanyIds: foundInManaged.allowedCompanyIds || ['all'],
          permissions: foundInManaged.permissions || foundInManaged.customPermissions || (isRoot ? ['*'] : []),
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

      // Activate 3D Cinematic Post-Login Welcome Splash Screen in both localStorage and sessionStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('eco_pending_welcome_splash', 'true');
        sessionStorage.setItem('eco_show_welcome_splash', 'true');
      }
      setShowWelcomeSplash(true);

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('eco_pending_welcome_splash');
      sessionStorage.removeItem('eco_show_welcome_splash');
    }
    setShowWelcomeSplash(false);
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

  // Granular Action-Level RBAC Checker with live reactive enforcement
  // Supports both hasPermission('perm.key') and hasPermission(user, 'perm.key')
  const hasPermission = useCallback(
    (userOrKey: any, maybeKey?: string): boolean => {
      const targetKey: string = (maybeKey || userOrKey || '') as string;
      const targetUser: AuthUser | null = maybeKey ? userOrKey : user;

      if (!targetUser) return false;
      const isRoot =
        targetUser.id === 'usr_root_csuite_01' ||
        targetUser.id === 'usr_root_csuite' ||
        targetUser.id === INITIAL_ROOT_ADMIN.id ||
        targetUser.username === 'admin' ||
        targetUser.email === 'admin@hrsup.com';
      if (isRoot) return true;

      // If user has an explicit permissions list, enforce it with wildcard support
      if (Array.isArray(targetUser.permissions)) {
        if (targetUser.permissions.includes('*')) return true;
        const parts = targetKey.split('.');
        if (parts.length > 1 && targetUser.permissions.includes(`${parts[0]}.*`)) return true;
        if (parts.length > 2 && targetUser.permissions.includes(`${parts[0]}.${parts[1]}.*`)) return true;
        return targetUser.permissions.includes(targetKey);
      }
      return false;
    },
    [user]
  );

  const checkModuleAccess = useCallback(
    (moduleId: string): boolean => {
      if (!user) return false;
      const isRoot =
        user.id === 'usr_root_csuite_01' ||
        user.id === 'usr_root_csuite' ||
        user.id === INITIAL_ROOT_ADMIN.id ||
        user.username === 'admin' ||
        user.email === 'admin@hrsup.com';
      if (isRoot) return true;

      // Check module-specific permissions in user.permissions
      if (Array.isArray(user.permissions)) {
        if (user.permissions.includes('*')) return true;
        if (user.permissions.includes(`${moduleId}.*`) || user.permissions.includes(moduleId)) return true;
        if (user.permissions.some(p => p.startsWith(`${moduleId}.`))) return true;

        const prefixMap: Record<string, string> = {
          companies: 'companies.',
          executive: 'exec.',
          finance: 'fin.',
          hr: 'hr.',
          engineering: 'eng.',
          cts: 'cts.',
          legal: 'leg.',
          insurance: 'ins.',
          ats: 'ats.',
          decrees: 'dec.',
          reception: 'rec.',
          settings: 'set.',
        };
        const pfx = prefixMap[moduleId];
        if (pfx && user.permissions.some(p => p.startsWith(pfx))) return true;

        // Check if any sub-item mapping matches
        const hasAnySubPerm = Object.entries(SUBMODULE_VIEW_PERMISSION_MAP).some(([, permKey]) => {
          if (permKey.startsWith(`${moduleId}.`) || (pfx && permKey.startsWith(pfx))) {
            return hasPermission(permKey);
          }
          return false;
        });
        if (hasAnySubPerm) return true;
      }

      // Check user's assigned allowedModuleIds
      if (Array.isArray(user.allowedModuleIds) && user.allowedModuleIds.length > 0) {
        return user.allowedModuleIds.includes(moduleId);
      }

      return false;
    },
    [user, hasPermission]
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
        const sanitizedUpdates = {
          ...updates,
          ...(updates.jobTitleAr ? { jobTitleAr: cleanArabicTitle(updates.jobTitleAr) } : {}),
        };
        const updatedUser: AuthUser = {
          ...user,
          ...sanitizedUpdates,
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

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('eco-data-updated'));
          window.dispatchEvent(new CustomEvent('eco-users-updated'));
        }

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

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('eco-data-updated'));
          window.dispatchEvent(new CustomEvent('eco-permissions-updated'));
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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('eco-data-updated'));
        window.dispatchEvent(new CustomEvent('eco-users-updated'));
      }

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

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('eco-data-updated'));
              window.dispatchEvent(new CustomEvent('eco-users-updated'));
            }

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

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('eco-data-updated'));
          window.dispatchEvent(new CustomEvent('eco-users-updated'));
        }

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
        showWelcomeSplash,
        completeWelcomeSplash,
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
