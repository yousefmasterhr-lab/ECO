import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { user, changePassword } = useAuth();
  const { t } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage(t('يرجى إدخال كلمة المرور الحالية', 'Please enter current password'));
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage(t('كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام', 'New password must be at least 6 characters'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t('كلمة المرور الجديدة وتأكيدها غير متطابقين', 'Passwords do not match'));
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(t('كلمة المرور الجديدة لا يمكن أن تطابق كلمة المرور الحالية', 'New password cannot match current password'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccessMessage(t('تم تحديث وتغيير كلمة المرور بنجاح', 'Password changed successfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1300);
      } else {
        setErrorMessage(res.error || t('فشل تغيير كلمة المرور', 'Failed to change password'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t('حدث خطأ غير متوقع', 'Unexpected error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 my-auto text-start"
        style={{ colorScheme: 'light' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <KeyRound className="w-5 h-5 text-[#FBF9F5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('الأمان وتغيير كلمة المرور', 'Security & Password Update')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('تأمين حسابك وحفظ التعديلات في قاعدة بيانات النظام', 'Protect your account credentials')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>{t('كلمة المرور الحالية', 'Current Password')}</span>
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 pe-10 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] text-xs font-medium focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(p => !p)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>{t('كلمة المرور الجديدة', 'New Password')}</span>
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 pe-10 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] text-xs font-medium focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(p => !p)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-[#5C665E] dark:text-[#8FA392]">
              {t('يجب أن لا تقل عن 6 أحرف أو أرقام', 'Minimum 6 alphanumeric characters')}
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>{t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}</span>
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 pe-10 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] text-xs font-medium focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#E0D9CB] dark:border-[#243628]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1C291E] hover:bg-[#283B2B] text-[#FBF9F5] text-xs font-extrabold shadow-sm transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D99B26]" />
                  <span>{t('جاري التحديث...', 'Updating...')}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#D99B26]" />
                  <span>{t('تحديث كلمة المرور', 'Update Password')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
