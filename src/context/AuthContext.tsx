import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  UserRole,
  PRECONFIGURED_SEED_USERS,
  ROLE_CONFIGURATIONS,
  SeedAccount,
  ManagedUser,
  AuditLogEntry,
  INITIAL_ROOT_ADMIN
} from '../types/auth';

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
        actorName: 'م. أحمد مصطفى',
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
          setUser({
            ...parsed,
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

      // Fast verification delay (350ms)
      await new Promise(resolve => setTimeout(resolve, 350));

      const cleanInput = emailOrUsername.trim().toLowerCase();

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
        authenticatedUser = {
          id: foundInManaged.id,
          email: foundInManaged.email,
          username: foundInManaged.username,
          nameAr: foundInManaged.nameAr,
          nameEn: foundInManaged.nameEn,
          role: foundInManaged.role,
          roleLabelAr: foundInManaged.roleLabelAr,
          roleLabelEn: foundInManaged.roleLabelEn,
          departmentAr: foundInManaged.departmentAr,
          departmentEn: foundInManaged.departmentEn,
          clearanceLevel: foundInManaged.clearanceLevel,
          clearanceNameAr: foundInManaged.clearanceNameAr,
          clearanceNameEn: foundInManaged.clearanceNameEn,
          allowedModuleIds: config?.allowedModuleIds || [],
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

  // User Management Actions
  const addManagedUser = useCallback(
    (userData: Omit<ManagedUser, 'id' | 'createdAt'>): ManagedUser => {
      const newUser: ManagedUser = {
        ...userData,
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setManagedUsers(prev => [newUser, ...prev]);

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
      if (id === INITIAL_ROOT_ADMIN.id || id === 'usr_root_csuite') {
        return false;
      }

      const target = managedUsers.find(u => u.id === id);
      if (target) {
        setManagedUsers(prev => prev.filter(u => u.id !== id));
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
