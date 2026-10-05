import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  headerActions?: React.ReactNode;
  maxWidth?: string; // Default: 'max-w-5xl'
  children: React.ReactNode;
  footer?: React.ReactNode;
  customHeader?: React.ReactNode;
  contentClassName?: string;
  hideCloseButton?: boolean;
  dir?: 'rtl' | 'ltr';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  badge,
  headerActions,
  maxWidth = 'max-w-5xl',
  children,
  footer,
  customHeader,
  contentClassName = '',
  hideCloseButton = false,
  dir = 'rtl',
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Global Viewport Backdrop */}
          <motion.div
            key="modal-portal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm transition-opacity print:hidden"
            aria-hidden="true"
          />

          {/* Modal Dialog Container */}
          <div
            key="modal-portal-container"
            id="erp-modal-container"
            className="fixed inset-0 z-[101] overflow-y-auto flex items-center justify-center p-4 sm:p-6 print:static print:inset-auto print:overflow-visible print:p-0 print:m-0 print:block print:h-auto print:max-h-none print:w-full"
            dir={dir}
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full ${maxWidth} max-h-[92vh] flex flex-col rounded-2xl border border-[#243628] bg-[#17231A] text-[#F3EFE6] shadow-2xl overflow-hidden print:static print:max-h-none print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none print:p-0 print:m-0 print:w-full print:block print:bg-white print:text-black ${className}`}
            >
              {/* Optional Custom Header or Default Header */}
              {customHeader ? (
                customHeader
              ) : title ? (
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#243628] bg-[#121B14] shrink-0 print:hidden">
                  <div className="flex items-center gap-3 min-w-0">
                    {Icon && (
                      <div className="w-10 h-10 rounded-xl bg-[#2A3F30] text-[#A3CFAC] border border-[#3E5C46] flex items-center justify-center shadow-xs shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-[#F3EFE6] truncate">
                          {title}
                        </h3>
                        {badge}
                      </div>
                      {subtitle && (
                        <p className="text-xs text-[#8FA392] mt-0.5 truncate">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {headerActions}
                    {!hideCloseButton && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8FA392] hover:text-[#F3EFE6] hover:bg-[#1F2E23] transition-colors cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Scrollable Content Body */}
              <div className={`flex-1 overflow-y-auto print:overflow-visible print:h-auto print:max-h-none print:block ${contentClassName}`}>
                {children}
              </div>

              {/* Optional Footer */}
              {footer && (
                <div className="p-4 sm:p-5 border-t border-[#243628] bg-[#121B14] shrink-0 flex items-center justify-between gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
