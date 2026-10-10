import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  UserRole,
  PRECONFIGURED_SEED_USERS,
  ROLE_CONFIGURATIONS,
  SeedAccount
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
}

const STORAGE_KEY_AUTH = 'eco_auth_session';
const STORAGE_KEY_REMEMBER = 'eco_auth_remember';

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

  // Restore session on initial load
  useEffect(() => {
    try {
      // Check localStorage first, then sessionStorage
      const storedLocal = localStorage.getItem(STORAGE_KEY_AUTH);
      const storedSession = sessionStorage.getItem(STORAGE_KEY_AUTH);
      const activeData = storedLocal || storedSession;

      if (activeData) {
        const parsed = JSON.parse(activeData) as AuthUser;
        if (parsed && parsed.id && parsed.role) {
          // Re-sync allowedModuleIds with master configuration
          const config = ROLE_CONFIGURATIONS[parsed.role];
          setUser({
            ...parsed,
            allowedModuleIds: config?.allowedModuleIds || parsed.allowedModuleIds || [],
          });
        }
      } else {
        // Default seed to C-Suite Admin if running in immediate preview mode
        const defaultAdmin = PRECONFIGURED_SEED_USERS[0].user;
        setUser(defaultAdmin);
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(defaultAdmin));
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

  const login = useCallback(
    async (
      emailOrUsername: string,
      password: string,
      rememberOption?: boolean
    ): Promise<{ success: boolean; error?: string; user?: AuthUser }> => {
      setIsLoading(true);

      // Simulate realistic ultra-fast cryptographic verification delay (450ms)
      await new Promise(resolve => setTimeout(resolve, 450));

      const cleanInput = emailOrUsername.trim().toLowerCase();
      const matchedAccount = PRECONFIGURED_SEED_USERS.find(
        acc =>
          acc.user.email.toLowerCase() === cleanInput ||
          acc.user.username.toLowerCase() === cleanInput
      );

      if (!matchedAccount) {
        setIsLoading(false);
        return {
          success: false,
          error: 'بيانات الاعتماد غير صحيحة. يرجى التحقق من اسم المستخدم أو البريد المؤسسي.',
        };
      }

      if (matchedAccount.passwordHash !== password) {
        setIsLoading(false);
        return {
          success: false,
          error: 'كلمة المرور غير متطابقة. يرجى إعادة المحاولة.',
        };
      }

      const isRemember = rememberOption !== undefined ? rememberOption : rememberMe;
      const authenticatedUser: AuthUser = {
        ...matchedAccount.user,
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };

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

      setIsLoading(false);
      navigate('/');
      return { success: true, user: authenticatedUser };
    },
    [rememberMe, navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    navigate('/login');
  }, [navigate]);

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
      }
    },
    [rememberMe]
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

// Extensible alias requested in specifications: useAuthStore
export const useAuthStore = useAuth;
