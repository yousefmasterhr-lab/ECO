import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { cleanArabicTitle } from '../../../types/rbac';
import {
  X,
  User,
  Briefcase,
  Mail,
  Phone,
  Shield,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Info
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const { isRtl, t } = useLanguage();

  const [nameAr, setNameAr] = useState(user?.nameAr || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!nameAr.trim()) {
      setErrorMessage(t('يرجى إدخال الاسم الكامل الرسمي', 'Please enter full legal name'));
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(t('يرجى إدخال بريد إلكتروني رسمي صحيح', 'Please enter a valid corporate email'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Strictly passes only user personal contact fields (no jobTitleAr or department)
      const res = await updateUserProfile({
        nameAr: nameAr.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      if (res.success) {
        setSuccessMessage(t('تم حفظ وتحديث بيانات الملف الشخصي بنجاح', 'Profile updated successfully'));
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || t('حدث خطأ أثناء حفظ البيانات', 'Error saving profile'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t('حدث خطأ غير متوقع', 'Unexpected error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const officialJobTitle = cleanArabicTitle(user.jobTitleAr || user.roleLabelAr || user.role);
  const officialDept = isRtl ? (user.departmentAr || 'الإدارة') : (user.departmentEn || 'Management');

  return (
    <div
      className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#FBF9F5] dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 my-auto text-start"
        style={{ colorScheme: 'light' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6] dark:bg-[#17231A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1C291E] to-[#D99B26] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <User className="w-5 h-5 text-[#FBF9F5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1A241C] dark:text-[#F3EFE6]">
                {t('الملف الشخصي وإعدادات الحساب', 'User Profile & Account Settings')}
              </h3>
              <p className="text-xs text-[#5C665E] dark:text-[#8FA392]">
                {t('تحديث بيانات الاتصال المعتمدة للمستخدم', 'Update your verified personal contact details')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Read-only Governance Badges */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#EAE4D7]/70 dark:bg-[#1A261D] border border-[#E0D9CB] dark:border-[#243628]">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-[#D99B26] dark:text-[#EBB34D] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block font-semibold">
                  {t('المستوى والصفة الرقابية', 'Clearance & Role')}
                </span>
                <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate block">
                  {isRtl ? user.roleLabelAr : user.roleLabelEn}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-[#1C291E] dark:text-[#8FA392] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-[#5C665E] dark:text-[#8FA392] block font-semibold">
                  {t('الإدارة / القطاع', 'Department')}
                </span>
                <span className="text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] truncate block">
                  {officialDept}
                </span>
              </div>
            </div>
          </div>

          {/* Locked Official Job Title & Governance Notice */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-transparent dark:from-amber-400/5 dark:via-amber-400/10 border border-amber-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-amber-200">
                  {t('المسمى الوظيفي المعتمد', 'Official Verified Job Title')}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30">
                <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{t('معتمد ومحمي', 'Locked')}</span>
              </span>
            </div>

            <div className="text-sm font-black text-slate-900 dark:text-white ps-1">
              {officialJobTitle}
            </div>

            <div className="pt-2 border-t border-amber-500/15 flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-amber-200/70 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                {t(
                  'المسمى الوظيفي والإدارة معتمدان رسمياً بالهيكل الوظيفي، ولا يمكن تعديلهما إلا من قِبل مسؤول النظام عبر شاشة إدارة المستخدمين.',
                  'Job title and department are officially governed and can only be changed by system administrators via User Management.'
                )}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>{t('الاسم الكامل (الرسمي)', 'Full Legal Name')}</span>
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="text"
              value={nameAr}
              onChange={e => setNameAr(e.target.value)}
              placeholder="مثال: يوسف حجازي"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] text-xs font-medium focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26] transition-all"
            />
          </div>

          {/* Official Email */}
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>{t('البريد الإلكتروني المؤسسي', 'Official Corporate Email')}</span>
                <span className="text-rose-500">*</span>
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@hrsup.com"
              required
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] text-xs font-medium focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26] transition-all text-left"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-[#1A241C] dark:text-[#F3EFE6] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D99B26] dark:text-[#EBB34D]" />
                <span>{t('رقم الهاتف المحمول', 'Mobile Phone Number')}</span>
              </span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+20 100 000 0000"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] placeholder-[#8FA392] text-xs font-medium focus:outline-none focus:border-[#D99B26] dark:focus:border-[#EBB34D] focus:ring-1 focus:ring-[#D99B26] transition-all text-left"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-[#E0D9CB] dark:border-[#243628]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C665E] dark:text-[#8FA392] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23] transition-colors cursor-pointer"
            >
              {t('إلغاء', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-extrabold shadow-sm shadow-amber-500/20 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{t('جاري الحفظ...', 'Saving...')}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>{t('حفظ التعديلات', 'Save Changes')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
