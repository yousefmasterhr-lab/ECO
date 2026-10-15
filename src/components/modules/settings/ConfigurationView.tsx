import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { d1Client } from '../../../services/d1Client';
import {
  ConfigurationCategory,
  SystemConfigurationItem,
  CONFIGURATION_CATEGORIES_META
} from '../../../types/configurations';
import {
  Sliders,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Shield,
  Network,
  FileText,
  Building2,
  Award,
  Sparkles,
  Power,
  RotateCcw
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Network,
  FileText,
  Building2,
  Award,
};

export const ConfigurationView: React.FC = () => {
  const { isRtl, t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<ConfigurationCategory>('roles');
  const [configurations, setConfigurations] = useState<SystemConfigurationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Add / Edit
  const [modalMode, setModalMode] = useState<'NONE' | 'ADD' | 'EDIT'>('NONE');
  const [selectedItem, setSelectedItem] = useState<SystemConfigurationItem | null>(null);

  // Form Fields
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [code, setCode] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [colorVar, setColorVar] = useState('#D99B26');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Audit Log Modal State
  const [auditItem, setAuditItem] = useState<SystemConfigurationItem | null>(null);

  // Load all configurations from Cloudflare D1
  const loadConfigurations = async () => {
    setIsLoading(true);
    try {
      const data = await d1Client.fetchConfigurations();
      setConfigurations(data);
    } catch (err) {
      console.error('Failed to load configurations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  // Filter configurations by active category and search
  const filteredItems = useMemo(() => {
    return configurations.filter(c => {
      if (c.category !== activeCategory) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        c.nameAr.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q)) ||
        c.code.toLowerCase().includes(q) ||
        (c.descriptionAr && c.descriptionAr.toLowerCase().includes(q))
      );
    });
  }, [configurations, activeCategory, searchQuery]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    configurations.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [configurations]);

  const activeMeta = useMemo(() => {
    return (
      CONFIGURATION_CATEGORIES_META.find(m => m.key === activeCategory) ||
      CONFIGURATION_CATEGORIES_META[0]
    );
  }, [activeCategory]);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setCode('');
    setDescriptionAr('');
    setColorVar('#D99B26');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setSelectedItem(null);
    setModalMode('ADD');
  };

  const handleOpenEdit = (item: SystemConfigurationItem) => {
    resetForm();
    setSelectedItem(item);
    setNameAr(item.nameAr);
    setNameEn(item.nameEn || '');
    setCode(item.code);
    setDescriptionAr(item.descriptionAr || '');
    setColorVar(item.colorVar || '#D99B26');
    setModalMode('EDIT');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nameAr.trim()) {
      setFormError(t('يرجى إدخال الاسم باللغة العربية.', 'Please enter name in Arabic.'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === 'ADD') {
        const res = await d1Client.createConfiguration({
          category: activeCategory,
          nameAr: nameAr.trim(),
          nameEn: nameEn.trim() || undefined,
          code: code.trim() || undefined,
          descriptionAr: descriptionAr.trim() || undefined,
          colorVar,
        });

        if (!res.success || !res.item) {
          throw new Error(res.error || 'فشل حفظ الإعداد');
        }

        setConfigurations(prev => [res.item!, ...prev]);
        setFormSuccess(t('تمت إضافة وحفظ العنصر في قاعدة البيانات بنجاح.', 'Added and saved successfully!'));
        setTimeout(() => {
          setModalMode('NONE');
          resetForm();
        }, 1000);
      } else if (modalMode === 'EDIT' && selectedItem) {
        const res = await d1Client.updateConfiguration(selectedItem.id, {
          nameAr: nameAr.trim(),
          nameEn: nameEn.trim() || undefined,
          descriptionAr: descriptionAr.trim() || undefined,
          colorVar,
        });

        if (!res.success) {
          throw new Error(res.error || 'فشل تحديث الإعداد');
        }

        setConfigurations(prev =>
          prev.map(c =>
            c.id === selectedItem.id
              ? {
                  ...c,
                  nameAr: nameAr.trim(),
                  nameEn: nameEn.trim() || undefined,
                  descriptionAr: descriptionAr.trim() || undefined,
                  colorVar,
                }
              : c
          )
        );

        setFormSuccess(t('تم تحديث بيانات العنصر بنجاح.', 'Updated successfully!'));
        setTimeout(() => {
          setModalMode('NONE');
          resetForm();
        }, 1000);
      }
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: SystemConfigurationItem) => {
    const nextActive = !item.isActive;
    try {
      setConfigurations(prev =>
        prev.map(c => (c.id === item.id ? { ...c, isActive: nextActive } : c))
      );
      await d1Client.updateConfiguration(item.id, { isActive: nextActive });
    } catch (e) {
      console.warn('Failed to toggle active status:', e);
    }
  };

  const handleDelete = async (item: SystemConfigurationItem) => {
    if (confirm(t(`هل أنت متأكد من حذف "${item.nameAr}" نهائياً من المنظومة؟`, `Delete "${item.nameAr}" permanently?`))) {
      try {
        setConfigurations(prev => prev.filter(c => c.id !== item.id));
        await d1Client.deleteConfiguration(item.id);
      } catch (err: any) {
        alert(err.message || 'فشل حذف العنصر');
        loadConfigurations();
      }
    }
  };

  const ActiveIcon = ICON_MAP[activeMeta.iconName] || Sliders;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#121B14] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#D99B26] dark:text-[#EBB34D] border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#1A241C] dark:text-[#F3EFE6] tracking-tight">
                {t('التعريفات والقوائم المرنة', 'Dynamic Configuration Engine')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                {t('مزامنة D1 حية', 'Live D1 Synced')}
              </span>
            </div>
            <p className="text-xs text-[#5C665E] dark:text-[#8FA392] mt-0.5">
              {t(
                'إدارة القوائم المعيارية والمسميات الوظيفية والتصنيفات وتوسيعها فورياً عبر شاشات المنظومة.',
                'Manage standard system lookup lists, job roles, departments & document types.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs flex items-center gap-2 transition-all shadow-sm hover:opacity-90 active:scale-95 cursor-pointer self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t(`إضافة في "${activeMeta.titleAr}"`, `Add to ${activeMeta.titleEn}`)}</span>
        </button>
      </div>

      {/* 2. Category Selector Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {CONFIGURATION_CATEGORIES_META.map(cat => {
          const isSelected = activeCategory === cat.key;
          const Icon = ICON_MAP[cat.iconName] || Sliders;
          const count = categoryCounts[cat.key] || 0;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setActiveCategory(cat.key);
                setSearchQuery('');
              }}
              className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-[#1C291E] dark:bg-[#EBB34D] text-white dark:text-slate-950 border-transparent shadow-md ring-2 ring-amber-500/40 font-bold'
                  : 'bg-white dark:bg-[#0D1F17] border-slate-200 dark:border-[#1A3327] text-slate-700 dark:text-[#8FA392] hover:bg-slate-50 dark:hover:bg-[#14261C]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white dark:text-slate-950'
                      : 'bg-amber-500/10 text-[#D99B26] dark:text-[#EBB34D]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-[#1A3327] text-slate-600 dark:text-[#8FA392]'
                  }`}
                >
                  {count}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold block truncate">
                  {isRtl ? cat.titleAr : cat.titleEn}
                </span>
                <span className="text-[10px] block opacity-75 line-clamp-1 mt-0.5">
                  {cat.descriptionAr}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Search and Actions Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5C665E] dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(`بحث في ${activeMeta.titleAr}...`, `Search in ${activeMeta.titleEn}...`)}
            className="w-full ps-9 pe-4 py-2 rounded-xl text-xs bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadConfigurations}
            title={t('تحديث البيانات من السحابة', 'Refresh from Cloud')}
            className="p-2 rounded-xl bg-white dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#8FA392]">
            {filteredItems.length} {t('عناصر', 'Items')}
          </span>
        </div>
      </div>

      {/* 4. Configurations Items Grid */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-xs font-bold font-mono">
            {t('جارٍ تحميل التعريفات من Cloudflare D1...', 'Loading configurations from D1...')}
          </span>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map(item => {
            const isActive = item.isActive !== false;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all text-start flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-white dark:bg-[#0D1F17] border-slate-200 dark:border-[#1A3327] hover:shadow-md'
                    : 'bg-slate-50/60 dark:bg-[#07130E] border-dashed border-slate-200 dark:border-[#1A2E22] opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: item.colorVar || '#D99B26' }}
                      >
                        {item.nameAr.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F3EFE6] truncate">
                            {isRtl ? item.nameAr : (item.nameEn || item.nameAr)}
                          </h4>
                          {item.isSystem && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                              SYSTEM
                            </span>
                          )}
                        </div>
                        {item.nameEn && (
                          <span className="text-[10px] text-slate-400 dark:text-[#8FA392] truncate block font-mono">
                            {item.nameEn}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-[#1A2E22] text-slate-400 border-slate-200 dark:border-[#1A3327]'
                      }`}
                    >
                      {isActive ? t('نشط', 'Active') : t('معطل', 'Inactive')}
                    </span>
                  </div>

                  {item.descriptionAr && (
                    <p className="text-xs text-slate-500 dark:text-[#8FA392] line-clamp-2 leading-relaxed">
                      {item.descriptionAr}
                    </p>
                  )}
                </div>

                {/* Golden Standard Icon-Only Action Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#1A3327] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#8FA392] truncate max-w-[120px]">
                    {item.code}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAuditItem(item)}
                      title={t('سجل تدقيق التغييرات', 'Audit Trail')}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      title={isActive ? t('تعطيل العنصر', 'Deactivate') : t('تفعيل العنصر', 'Activate')}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        isActive
                          ? 'text-emerald-600 hover:bg-emerald-500/10'
                          : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1A2E22]'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title={t('تعديل البيانات', 'Edit Item')}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {!item.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title={t('حذف العنصر', 'Delete Item')}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#1A3327] bg-slate-50/50 dark:bg-[#07130E] space-y-3">
          <ActiveIcon className="w-10 h-10 text-slate-300 dark:text-[#1A3327] mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-[#C5D6C9]">
            {t('لا توجد عناصر في هذا القسم بعد', 'No configuration items in this category yet')}
          </h4>
          <p className="text-xs text-slate-400 dark:text-[#8FA392] max-w-sm mx-auto">
            {t(
              'يمكنك إضافة خيارات مخصصة فوراً واستخدامها في حقول الإدخال عبر المنظومة.',
              'Add custom lookup items immediately to be used in dropdowns across the ERP.'
            )}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('إضافة أول عنصر الآن', 'Add First Item Now')}</span>
          </button>
        </div>
      )}

      {/* 5. Add / Edit Configuration Modal */}
      {modalMode !== 'NONE' && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 sm:p-7">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#243628] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <ActiveIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    {modalMode === 'ADD'
                      ? t(`إضافة عنصر إلى ${activeMeta.titleAr}`, `Add to ${activeMeta.titleEn}`)
                      : t('تعديل عنصر التعريفات', 'Edit Configuration Item')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    {t('حفظ فوري في Cloudflare D1 مع مزامنة الحقول.', 'Instant Cloudflare D1 persistence.')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalMode('NONE')}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2E23] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error / Success Banners */}
            {formError && (
              <div className="mb-3 p-2.5 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-3 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-start">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                  {t('الاسم باللغة العربية *', 'Name in Arabic *')}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  required
                  placeholder={t('أدخل الاسم باللغة العربية', 'Enter name in Arabic')}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                  {t('الاسم باللغة الإنجليزية (اختياري)', 'Name in English (Optional)')}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  dir="ltr"
                  placeholder="Enter official English title"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {modalMode === 'ADD' && (
                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                    {t('الكود البرمجي / الرمز الفريد (اختياري)', 'Unique Code / Slug (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    dir="ltr"
                    placeholder="e.g. cfo_executive or finance_ops"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                  {t('الوصف الإرشادي والتفاصيل', 'Description & Guidance')}
                </label>
                <textarea
                  value={descriptionAr}
                  onChange={e => setDescriptionAr(e.target.value)}
                  rows={2}
                  placeholder={t('أدخل توضيحاً مختصراً لطبيعة هذا العنصر وصلاحياته...', 'Brief guidance note...')}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                  {t('لون التمييز البصري', 'Visual Accent Color')}
                </label>
                <div className="flex items-center gap-2">
                  {['#D99B26', '#059669', '#2563EB', '#7C3AED', '#DC2626', '#0D9488', '#E11D48', '#4F46E5'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorVar(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        colorVar === c ? 'scale-125 ring-2 ring-offset-2 ring-amber-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode('NONE')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#1A2E22] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{modalMode === 'ADD' ? t('حفظ العنصر', 'Save Item') : t('حفظ التعديلات', 'Save Changes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Audit Trail Modal for a Configuration Item */}
      {auditItem && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#243628] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('سجل التدقيق والتعديلات', 'Audit Trail')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    {auditItem.nameAr} ({auditItem.code})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuditItem(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1A3327] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-[#8FA392]">{t('تاريخ الإنشاء:', 'Created At:')}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-[#C5D6C9]">
                    {auditItem.createdAt ? auditItem.createdAt.substring(0, 19).replace('T', ' ') : t('مثبت في نواة النظام', 'System Core Seed')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-[#8FA392]">{t('تاريخ آخر تحديث:', 'Last Updated:')}</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-[#C5D6C9]">
                    {auditItem.updatedAt ? auditItem.updatedAt.substring(0, 19).replace('T', ' ') : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-[#8FA392]">{t('المسؤول عن التعديل:', 'Modified By:')}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {t('يوسف حجازي (مدير النظام)', 'Yousef Hegazy (Admin)')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-[#8FA392]">{t('حالة التخزين:', 'Storage Engine:')}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    Cloudflare D1 (system_configurations)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#243628] flex justify-end">
              <button
                type="button"
                onClick={() => setAuditItem(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1A2E22] text-xs font-bold text-slate-700 dark:text-[#C5D6C9] hover:bg-slate-200 cursor-pointer"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
