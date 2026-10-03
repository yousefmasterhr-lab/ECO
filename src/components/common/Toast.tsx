import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  success: (title: React.ReactNode, description?: React.ReactNode, duration?: number) => string;
  error: (title: React.ReactNode, description?: React.ReactNode, duration?: number) => string;
  warning: (title: React.ReactNode, description?: React.ReactNode, duration?: number) => string;
  info: (title: React.ReactNode, description?: React.ReactNode, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global dispatcher for non-React contexts or fast utility calls
type ToastListener = (toast: ToastItem) => void;
type DismissListener = (id: string) => void;

const addListeners = new Set<ToastListener>();
const dismissListeners = new Set<DismissListener>();

export const toast = {
  show: (type: ToastType, title: React.ReactNode, description?: React.ReactNode, duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const item: ToastItem = { id, type, title, description, duration };
    addListeners.forEach(fn => fn(item));
    return id;
  },
  success: (title: React.ReactNode, description?: React.ReactNode, duration = 4000) => {
    return toast.show('success', title, description, duration);
  },
  error: (title: React.ReactNode, description?: React.ReactNode, duration = 5000) => {
    return toast.show('error', title, description, duration);
  },
  warning: (title: React.ReactNode, description?: React.ReactNode, duration = 4500) => {
    return toast.show('warning', title, description, duration);
  },
  info: (title: React.ReactNode, description?: React.ReactNode, duration = 4000) => {
    return toast.show('info', title, description, duration);
  },
  dismiss: (id: string) => {
    dismissListeners.forEach(fn => fn(id));
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newItem: ToastItem = { ...item, id };
    setToasts(prev => [newItem, ...prev.slice(0, 4)]); // max 5 concurrent toasts
    return id;
  }, []);

  // Connect global helper to provider state
  useEffect(() => {
    const onAdd: ToastListener = (item) => {
      setToasts(prev => [item, ...prev.slice(0, 4)]);
    };
    const onDismiss: DismissListener = (id) => {
      dismissToast(id);
    };

    addListeners.add(onAdd);
    dismissListeners.add(onDismiss);
    return () => {
      addListeners.delete(onAdd);
      dismissListeners.delete(onDismiss);
    };
  }, [dismissToast]);

  const success = useCallback((title: React.ReactNode, description?: React.ReactNode, duration = 4000) => {
    return showToast({ type: 'success', title, description, duration });
  }, [showToast]);

  const error = useCallback((title: React.ReactNode, description?: React.ReactNode, duration = 5000) => {
    return showToast({ type: 'error', title, description, duration });
  }, [showToast]);

  const warning = useCallback((title: React.ReactNode, description?: React.ReactNode, duration = 4500) => {
    return showToast({ type: 'warning', title, description, duration });
  }, [showToast]);

  const info = useCallback((title: React.ReactNode, description?: React.ReactNode, duration = 4000) => {
    return showToast({ type: 'info', title, description, duration });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}

      {mounted && typeof document !== 'undefined' && createPortal(
        <div
          dir="rtl"
          aria-live="polite"
          className="fixed bottom-6 left-6 z-[300] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-3rem)] pointer-events-none"
        >
          <AnimatePresence mode="popLayout">
            {toasts.map((item) => (
              <ToastCard key={item.id} item={item} onDismiss={() => dismissToast(item.id)} />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-[#A3CFAC]',
    badgeBg: 'bg-[#2A3F30] border-[#3E5C46]',
    borderGlow: 'border-[#3E5C46]',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-[#EFA3A3]',
    badgeBg: 'bg-[#3F2A2A] border-[#5C3E3E]',
    borderGlow: 'border-[#5C3E3E]',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-[#EBB34D]',
    badgeBg: 'bg-[#3A3322] border-[#5E4E2C]',
    borderGlow: 'border-[#5E4E2C]',
  },
  info: {
    icon: Info,
    iconColor: 'text-[#EBB34D]',
    badgeBg: 'bg-[#1F2E23] border-[#243628]',
    borderGlow: 'border-[#243628]',
  },
};

const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  useEffect(() => {
    if (!item.duration || item.duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`pointer-events-auto rounded-2xl border ${cfg.borderGlow} bg-[#17231A]/95 backdrop-blur-md text-[#F3EFE6] shadow-2xl p-4 flex items-start gap-3.5 select-none font-cairo`}
    >
      {/* Icon Badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${cfg.badgeBg}`}>
        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-[#F3EFE6] leading-tight">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-[11px] sm:text-xs text-[#8FA392] mt-1 leading-relaxed">
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            onClick={() => {
              item.action?.onClick();
              onDismiss();
            }}
            className="mt-2 text-xs font-bold text-[#EBB34D] hover:text-[#F5C76D] underline underline-offset-2 transition-colors cursor-pointer"
          >
            {item.action.label}
          </button>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={onDismiss}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#1F2E23] transition-colors shrink-0 cursor-pointer"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
