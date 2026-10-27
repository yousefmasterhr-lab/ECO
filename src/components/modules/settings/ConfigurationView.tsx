import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { d1Client } from '../../../services/d1Client';
import {
  ConfigurationCategory,
  SystemConfigurationItem,
} from '../../../types/configurations';
import { cleanArabicTitle } from '../../../types/rbac';
import {
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
  Award,
  Power,
  RotateCcw,
  Sparkles,
  Layers,
  MapPin,
  ConciergeBell,
  Check,
  History,
  AlertTriangle,
} from 'lucide-react';

type PracticalCategoryKey = ConfigurationCategory;

interface PracticalCategoryMeta {
  key: PracticalCategoryKey;
  titleAr: string;
  titleEn: string;
  icon: React.ElementType;
}

const PRACTICAL_CATEGORIES: PracticalCategoryMeta[] = [
  {
    key: 'roles',
    titleAr: 'المسميات والأدوار الوظيفية',
    titleEn: 'Job Roles & Titles',
    icon: Shield,
  },
  {
    key: 'departments',
    titleAr: 'الأقسام والإدارات والتخصصات',
    titleEn: 'Departments & Specializations',
    icon: Network,
  },
  {
    key: 'doc_types',
    titleAr: 'أنواع الوثائق والتراخيص',
    titleEn: 'Document & License Types',
    icon: FileText,
  },
  {
    key: 'branch_types',
    titleAr: 'أنواع المقرات والمواقع',
    titleEn: 'Branch & Site Types',
    icon: MapPin,
  },
  {
    key: 'signatory_titles',
    titleAr: 'صفات التفويض والتوكيلات',
    titleEn: 'Signatory Titles',
    icon: Award,
  },
  {
    key: 'reception_lists',
    titleAr: 'قاعات الاجتماعات والضيافة',
    titleEn: 'Meeting Rooms & Reception',
    icon: ConciergeBell,
  },
];

export const ConfigurationView: React.FC = () => {
  const { isRtl, t } = useLanguage();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<PracticalCategoryKey>('roles');
  const [configurations, setConfigurations] = useState<SystemConfigurationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal State
  const [modalMode, setModalMode] = useState<'NONE' | 'ADD' | 'EDIT'>('NONE');
  const [selectedItem, setSelectedItem] = useState<SystemConfigurationItem | null>(null);

  // Form Fields (Streamlined to 4 clean practical fields)
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [formCategory, setFormCategory] = useState<PracticalCategoryKey>('roles');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Audit Log Modal State
  const [auditItem, setAuditItem] = useState<SystemConfigurationItem | null>(null);

  // Wipe Category Confirmation Modal State
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  // Load live configurations from Cloudflare D1
  const loadConfigurations = async () => {
    setIsLoading(true);
    try {
      const data = await d1Client.fetchConfigurations();
      setConfigurations(data);
    } catch (err) {
      console.error('Failed to load configurations from D1:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();

    // Listen to global sync events across the ERP
    const handleGlobalUpdate = () => {
      loadConfigurations();
    };
    window.addEventListener('eco-configurations-updated', handleGlobalUpdate);
    window.addEventListener('eco-data-updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('eco-configurations-updated', handleGlobalUpdate);
      window.removeEventListener('eco-data-updated', handleGlobalUpdate);
    };
  }, []);

  // Filtered items by current category and search query
  const filteredItems = useMemo(() => {
    return configurations.filter(c => {
      // Support matching reception_lists with meeting_rooms and couriers if any
      const matchesCategory =
        c.category === (activeCategory as any) ||
        (activeCategory === 'reception_lists' && (c.category as string === 'meeting_rooms' || c.category as string === 'couriers'));

      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        c.nameAr.toLowerCase().includes(q) ||
        (c.nameEn && c.nameEn.toLowerCase().includes(q))
      );
    });
  }, [configurations, activeCategory, searchQuery]);

  // Real live counters
  const liveStats = useMemo(() => {
    const total = configurations.length;
    const rolesCount = configurations.filter(c => c.category === 'roles').length;
    const deptsCount = configurations.filter(c => c.category === 'departments').length;
    const docsAndSitesCount = configurations.filter(
      c => c.category === 'doc_types' || c.category === 'branch_types'
    ).length;

    const categoryCounts: Record<string, number> = {};
    configurations.forEach(c => {
      if (c.category === 'meeting_rooms' || c.category === 'couriers') {
        categoryCounts['reception_lists'] = (categoryCounts['reception_lists'] || 0) + 1;
      } else {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      }
    });

    return {
      total,
      rolesCount,
      deptsCount,
      docsAndSitesCount,
      categoryCounts,
    };
  }, [configurations]);

  const activeMeta = useMemo(() => {
    return (
      PRACTICAL_CATEGORIES.find(m => m.key === activeCategory) ||
      PRACTICAL_CATEGORIES[0]
    );
  }, [activeCategory]);

  const resetForm = () => {
    setNameAr('');
    setNameEn('');
    setFormCategory(activeCategory);
    setIsActive(true);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setSelectedItem(null);
    setFormCategory(activeCategory);
    setModalMode('ADD');
  };

  const handleOpenEdit = (item: SystemConfigurationItem) => {
    resetForm();
    setSelectedItem(item);
    setNameAr(item.nameAr);
    setNameEn(item.nameEn || '');
    setFormCategory(item.category as PracticalCategoryKey);
    setIsActive(item.isActive !== false);
    setModalMode('EDIT');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nameAr.trim()) {
      setFormError(t('يرجى إدخال المسمى باللغة العربية.', 'Please enter the name in Arabic.'));
      return;
    }

    setIsSubmitting(true);
    const actorName = user?.nameAr || user?.username || 'مدير النظام';
    const sanitizedNameAr = cleanArabicTitle(nameAr.trim());

    try {
      if (modalMode === 'ADD') {
        const res = await d1Client.createConfiguration({
          category: formCategory as ConfigurationCategory,
          nameAr: sanitizedNameAr,
          nameEn: nameEn.trim() || undefined,
          isActive,
          userName: actorName,
        });

        if (!res.success || !res.item) {
          throw new Error(res.error || 'فشل حفظ العنصر في قاعدة البيانات');
        }

        setConfigurations(prev => [res.item!, ...prev]);
        setFormSuccess(t('تم حفظ العنصر بنجاح وتحديث القوائم المعتمدة.', 'Item saved successfully!'));
        setTimeout(() => {
          setModalMode('NONE');
          resetForm();
        }, 750);
      } else if (modalMode === 'EDIT' && selectedItem) {
        const res = await d1Client.updateConfiguration(selectedItem.id, {
          nameAr: sanitizedNameAr,
          nameEn: nameEn.trim() || undefined,
          category: formCategory as ConfigurationCategory,
          isActive,
          userName: actorName,
        });

        if (!res.success) {
          throw new Error(res.error || 'فشل تحديث بيانات العنصر');
        }

        setConfigurations(prev =>
          prev.map(c =>
            c.id === selectedItem.id
              ? {
                  ...c,
                  nameAr: nameAr.trim(),
                  nameEn: nameEn.trim() || undefined,
                  category: formCategory as ConfigurationCategory,
                  isActive,
                  metadata: res.item?.metadata || c.metadata,
                }
              : c
          )
        );

        setFormSuccess(t('تم تحديث بيانات المسمى بنجاح.', 'Updated successfully!'));
        setTimeout(() => {
          setModalMode('NONE');
          resetForm();
        }, 750);
      }
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: SystemConfigurationItem) => {
    const nextActive = !item.isActive;
    const actorName = user?.nameAr || user?.username || 'مدير النظام';

    // Optimistic UI update
    setConfigurations(prev =>
      prev.map(c => (c.id === item.id ? { ...c, isActive: nextActive } : c))
    );

    try {
      await d1Client.updateConfiguration(item.id, {
        isActive: nextActive,
        userName: actorName,
      });
    } catch (e) {
      console.warn('Failed to toggle active status:', e);
      loadConfigurations();
    }
  };

  const handleDelete = async (item: SystemConfigurationItem) => {
    if (
      confirm(
        t(
          `هل أنت متأكد من حذف "${item.nameAr}" نهائياً وبشكل قطعي من قاعدة البيانات؟`,
          `Are you sure you want to delete "${item.nameAr}" permanently from the database?`
        )
      )
    ) {
      // Optimistic delete
      setConfigurations(prev => prev.filter(c => c.id !== item.id));

      try {
        const res = await d1Client.deleteConfiguration(item.id, item.category);
        if (!res.success) {
          throw new Error(res.error || 'فشل حذف العنصر');
        }
      } catch (err: any) {
        alert(err.message || 'فشل حذف العنصر');
        loadConfigurations();
      }
    }
  };

  const handleWipeCategory = async () => {
    setIsWiping(true);
    try {
      const res = await d1Client.clearCategoryConfigurations(activeCategory as ConfigurationCategory);
      if (!res.success) {
        throw new Error(res.error || 'فشل تصفير القائمة');
      }

      setConfigurations(prev => prev.filter(c => c.category !== (activeCategory as any)));
      setWipeModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تصفير القائمة');
    } finally {
      setIsWiping(false);
    }
  };

  const ActiveIcon = activeMeta.icon;

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* 1. 3D Cinematic Configuration Command Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E0D9CB] dark:border-[#223927] bg-gradient-to-br from-[#FCFBF8] via-[#F8F5EE] to-[#EFE9DC] dark:from-[#0B150E] dark:via-[#102015] dark:to-[#0D1810] shadow-xl p-6 sm:p-7">
        {/* Animated Perspective 3D Geometric Depth Rings */}
        <div className="absolute top-0 end-0 -mt-16 -me-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-1/3 -mb-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Header Title & Branding */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25 border border-amber-300/40">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-[#F3EFE6] tracking-tight">
                {t('التعريفات والقوائم المرنة', 'Dynamic Configuration Engine')}
              </h1>
              <p className="text-xs text-slate-600 dark:text-[#8FA392] mt-1 max-w-xl leading-relaxed">
                {t(
                  'إدارة وضبط المسميات الوظيفية والأقسام والتراخيص والمقرات عبر منظومة مركزية موحدة مع مزامنة فورية لكافة حقول الاختيار بالـ ERP.',
                  'Enterprise-wide lookup tables for job titles, departments, licenses, and branches with instant real-time synchronization.'
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons: Add New & Wipe Category */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer border border-amber-400/40"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t('إضافة عنصر جديد', 'Add New Item')}</span>
            </button>

            <button
              type="button"
              onClick={() => setWipeModalOpen(true)}
              title={t('تصفير وتنظيف القائمة الحالية', 'Clear current category')}
              className="px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-[#152319] hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-[#223927] hover:border-rose-300 dark:hover:border-rose-800 text-slate-600 dark:text-[#8FA392] hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('تصفير القائمة', 'Clear List')}</span>
            </button>
          </div>
        </div>

        {/* Real Live Counters from Cloudflare D1 */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200/80 dark:border-[#223927]">
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">
                {t('إجمالي التعريفات المسجلة', 'Total Registered')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#F3EFE6] font-mono">
                {liveStats.total}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">
                {t('المسميات الوظيفية', 'Job Titles')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#F3EFE6] font-mono">
                {liveStats.rolesCount}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">
                {t('الأقسام والتخصصات', 'Departments')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#F3EFE6] font-mono">
                {liveStats.deptsCount}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Network className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">
                {t('أنواع الوثائق والمقرات', 'Docs & Sites')}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-[#F3EFE6] font-mono">
                {liveStats.docsAndSitesCount}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Crisp Practical Category Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {PRACTICAL_CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.key;
          const Icon = cat.icon;
          const count = liveStats.categoryCounts[cat.key] || 0;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => {
                setActiveCategory(cat.key);
                setSearchQuery('');
              }}
              className={`p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-amber-500/15 border-2 border-amber-500 text-amber-950 dark:text-amber-300 shadow-md ring-2 ring-amber-500/20 font-bold dark:bg-[#172A1F] dark:border-amber-500'
                  : 'bg-white dark:bg-[#0D1F17] border-slate-200 dark:border-[#1A3327] text-slate-700 dark:text-[#8FA392] hover:bg-amber-50/50 hover:border-amber-300 dark:hover:bg-[#13231A]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-[#1A3327] text-slate-600 dark:text-[#8FA392]'
                  }`}
                >
                  {count}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold block truncate leading-tight">
                  {isRtl ? cat.titleAr : cat.titleEn}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Search and Action Sub-Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t(`بحث في ${activeMeta.titleAr}...`, `Search in ${activeMeta.titleEn}...`)}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl text-xs bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 cursor-text caret-amber-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadConfigurations}
            title={t('تحديث البيانات من السحابة', 'Refresh from Cloud')}
            className="p-2.5 rounded-xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] text-slate-500 dark:text-[#8FA392] hover:text-slate-900 dark:hover:text-[#F3EFE6] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#8FA392]">
            {filteredItems.length} {t('عناصر', 'Items')}
          </span>
        </div>
      </div>

      {/* 4. Luxury 3D Cards Grid with Golden Icon-Only Action Bar */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <span className="text-xs font-bold font-mono">
            {t('جارٍ استرجاع القوائم المعتمدة من Cloudflare D1...', 'Loading configurations from D1...')}
          </span>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map(item => {
            const isItemActive = item.isActive !== false;

            return (
              <div
                key={item.id}
                className={`group relative rounded-2xl border p-4.5 transition-all duration-200 text-start flex flex-col justify-between gap-3.5 ${
                  isItemActive
                    ? 'bg-white dark:bg-[#0E1712] border-slate-200 dark:border-[#1E3324] hover:-translate-y-1 hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/50'
                    : 'bg-slate-50/70 dark:bg-[#08120B] border-dashed border-slate-200 dark:border-[#1A2E22] opacity-70'
                }`}
              >
                {/* Card Top: Amber Icon Box + Arabic/English Name + Status Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      <ActiveIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F3EFE6] truncate leading-snug">
                        {cleanArabicTitle(item.nameAr)}
                      </h4>
                      {item.nameEn ? (
                        <span className="text-[11px] text-slate-400 dark:text-[#8FA392] truncate block font-sans mt-0.5">
                          {item.nameEn}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 dark:text-stone-600 block mt-0.5">
                          —
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                      isItemActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-[#1A2E22] text-slate-500 dark:text-[#8FA392] border-slate-200 dark:border-[#1A3327]'
                    }`}
                  >
                    {isItemActive ? t('نشط ومتاح', 'Active') : t('موقوف مؤقتاً', 'Paused')}
                  </span>
                </div>

                {/* Golden Standard Icon-Only Action Bar */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-[#1A2E22] flex items-center justify-end gap-1">
                  {/* ✏️ Edit Item */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    title={t('تعديل المسمى', 'Edit Item')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 transition-all active:scale-90 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {/* ⚡ Toggle Active / Inactive */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    title={isItemActive ? t('إيقاف مؤقتاً', 'Pause') : t('تفعيل المسمى', 'Activate')}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                      isItemActive
                        ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
                        : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1A2E22]'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  {/* ℹ️ Audit Trail Diff Modal */}
                  <button
                    type="button"
                    onClick={() => setAuditItem(item)}
                    title={t('سجل التعديلات والتدقيق', 'Audit Trail')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 transition-all active:scale-90 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                  </button>

                  {/* 🗑️ Permanent Deletion */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    title={t('حذف نهائي من قاعدة البيانات', 'Delete permanently')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-all active:scale-90 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-14 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-[#1E3324] bg-white/50 dark:bg-[#07130E] space-y-3">
          <ActiveIcon className="w-10 h-10 text-slate-300 dark:text-[#1A3327] mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-[#C5D6C9]">
            {t('لا توجد مسميات في هذه القائمة حالياً', 'No items in this category currently')}
          </h4>
          <p className="text-xs text-slate-400 dark:text-[#8FA392] max-w-sm mx-auto">
            {t(
              'يمكنك إضافة مسميات جديدة فوراً وستظهر في كافة حقول الاختيار المرتبطة بها في النظام.',
              'Add new items now and they will immediately sync across all select dropdowns.'
            )}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('إضافة أول مسمى الآن', 'Add First Item Now')}</span>
          </button>
        </div>
      )}

      {/* 5. Streamlined Add / Edit Configuration Modal (4 Practical Fields Only) */}
      {modalMode !== 'NONE' && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 sm:p-7">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#243628] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ActiveIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    {modalMode === 'ADD'
                      ? t('إضافة مسمى جديد', 'Add New Definition')
                      : t('تعديل المسمى المعتمد', 'Edit Configuration Item')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    {t(
                      'إضافة أو تعديل مسمى ضمن القوائم المعتمدة في النظام',
                      'Add or edit an item within the approved system lookup lists.'
                    )}
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
              <div className="mb-3.5 p-3 rounded-xl text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-3.5 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Clean Practical Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              {/* Field 1: المسمى باللغة العربية */}
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                  {t('المسمى باللغة العربية *', 'Name in Arabic *')}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={e => setNameAr(e.target.value)}
                  required
                  placeholder={t(
                    'مثال: محاسب موقع، مهندس تنفيذ، رخصة تشغيل...',
                    'e.g. Site Accountant, Construction Engineer, Operating License...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 cursor-text caret-amber-600"
                />
              </div>

              {/* Field 2: المسمى باللغة الإنجليزية (اختياري) */}
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                  {t('المسمى باللغة الإنجليزية (اختياري)', 'Name in English (Optional)')}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={e => setNameEn(e.target.value)}
                  dir="ltr"
                  placeholder="e.g. Site Accountant"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 font-sans cursor-text caret-amber-600"
                />
              </div>

              {/* Field 3: التصنيف / القائمة التابعة */}
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1">
                  {t('التصنيف / القائمة التابعة', 'Lookup Category')}
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value as ConfigurationCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {PRACTICAL_CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>
                      {isRtl ? cat.titleAr : cat.titleEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 4: حالة العنصر (نشط ومتاح / موقوف مؤقتاً) */}
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-[#E0D9CB] block mb-1.5">
                  {t('حالة العنصر', 'Item Status')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#08120B] border-slate-200 dark:border-[#1E3324] text-slate-500'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                    <span>{t('نشط ومتاح في القوائم', 'Active')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !isActive
                        ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-[#08120B] border-slate-200 dark:border-[#1E3324] text-slate-500'
                    }`}
                  >
                    <Power className={`w-3.5 h-3.5 ${!isActive ? 'opacity-100' : 'opacity-0'}`} />
                    <span>{t('موقوف مؤقتاً', 'Paused')}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode('NONE')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#1A2E22] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span>
                    {modalMode === 'ADD' ? t('حفظ في القوائم', 'Save Item') : t('حفظ التعديلات', 'Save Changes')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Real Field Diff Audit Trail Modal */}
      {auditItem && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#121B14] border border-[#E0D9CB] dark:border-[#243628] shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-[#243628] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <History className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                    {t('سجل التعديلات والتدقيق', 'Audit Trail')}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                    {auditItem.nameAr}
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

            <div className="space-y-3 max-h-80 overflow-y-auto pe-1">
              {auditItem.metadata?.auditLog && auditItem.metadata.auditLog.length > 0 ? (
                auditItem.metadata.auditLog.map((log: any, idx: number) => (
                  <div
                    key={log.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1E3324] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-[#F3EFE6]">
                        {log.action || t('تعديل في البيانات', 'Update')}
                      </span>
                      <span className="text-[10.5px] font-mono text-slate-400 dark:text-[#8FA392]">
                        {log.timestamp ? log.timestamp.substring(0, 19).replace('T', ' ') : '—'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-[#8FA392]">
                      <span>{t('المستخدم:', 'By:')} </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {log.userName || 'مدير النظام'}
                      </span>
                    </div>

                    {log.diffs && log.diffs.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-[#1A2E22] space-y-1.5">
                        {log.diffs.map((d: any, dIdx: number) => (
                          <div
                            key={dIdx}
                            className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-white dark:bg-[#0D1A12] border border-slate-100 dark:border-[#1F3024]"
                          >
                            <span className="font-bold text-slate-600 dark:text-[#C5D6C9]">
                              {d.field}
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="line-through text-rose-500 dark:text-rose-400 opacity-80">
                                {d.from}
                              </span>
                              <span className="text-slate-400">←</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {d.to}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-[#8FA392] rounded-2xl bg-slate-50 dark:bg-[#07130E] border border-slate-200 dark:border-[#1E3324]">
                  {t('السجل معتمد ومحفوظ في قاعدة البيانات.', 'Record is registered in database.')}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-[#243628] flex justify-end">
              <button
                type="button"
                onClick={() => setAuditItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1A2E22] text-xs font-bold text-slate-700 dark:text-[#C5D6C9] hover:bg-slate-200 cursor-pointer"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Wipe Category Confirmation Modal */}
      {wipeModalOpen && (
        <div className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121B14] border border-rose-300 dark:border-rose-900/60 shadow-2xl p-6 sm:p-7 text-start">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-[#F3EFE6]">
                  {t('تأكيد تصفير وتنظيف القائمة', 'Confirm List Wipe')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8FA392] mt-1 leading-relaxed">
                  {t(
                    `هل أنت متأكد من حذف وتصفير جميع عناصر "${activeMeta.titleAr}" نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.`,
                    `Are you sure you want to permanently clear all items from "${activeMeta.titleEn}"? This action cannot be undone.`
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-[#243628] flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isWiping}
                onClick={() => setWipeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#1A2E22] text-slate-600 dark:text-[#8FA392] hover:bg-slate-200 cursor-pointer"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isWiping}
                onClick={handleWipeCategory}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isWiping ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{t('نعم، تصفير القائمة نهائياً', 'Yes, Clear List')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
