import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { d1Client } from '../../services/d1Client';
import { ConfigurationCategory, SystemConfigurationItem } from '../../types/configurations';
import {
  ChevronDown,
  Plus,
  Search,
  Check,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export interface CreatableSelectOption {
  id: string;
  value: string;
  labelAr: string;
  labelEn?: string;
  descriptionAr?: string;
  colorVar?: string;
  isSystem?: boolean;
}

interface CreatableSelectProps {
  category: ConfigurationCategory;
  value: string;
  onChange: (value: string, item?: CreatableSelectOption) => void;
  options?: CreatableSelectOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onCreateOption?: (newItem: SystemConfigurationItem) => void;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  category,
  value,
  onChange,
  options: externalOptions,
  placeholder,
  label,
  required = false,
  disabled = false,
  className = '',
  onCreateOption,
}) => {
  const { isRtl, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [internalOptions, setInternalOptions] = useState<CreatableSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load options from Cloudflare D1 for this category
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const configs = await d1Client.fetchConfigurations(category);
        if (isMounted && configs.length > 0) {
          const mapped: CreatableSelectOption[] = configs.map(c => ({
            id: c.id,
            value: c.code || c.id,
            labelAr: c.nameAr,
            labelEn: c.nameEn,
            descriptionAr: c.descriptionAr,
            colorVar: c.colorVar,
            isSystem: c.isSystem,
          }));
          setInternalOptions(mapped);
        }
      } catch (e) {
        console.warn(`[CreatableSelect] Error loading ${category}:`, e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [category]);

  // Combine external and internal options (deduplicating by value)
  const allOptions = useMemo(() => {
    const combined = [...(externalOptions || []), ...internalOptions];
    const map = new Map<string, CreatableSelectOption>();
    combined.forEach(opt => {
      if (!map.has(opt.value)) {
        map.set(opt.value, opt);
      }
    });
    return Array.from(map.values());
  }, [externalOptions, internalOptions]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return allOptions.find(o => o.value === value || o.id === value);
  }, [allOptions, value]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allOptions;
    const q = searchQuery.toLowerCase().trim();
    return allOptions.filter(
      o =>
        o.labelAr.toLowerCase().includes(q) ||
        (o.labelEn && o.labelEn.toLowerCase().includes(q)) ||
        o.value.toLowerCase().includes(q)
    );
  }, [allOptions, searchQuery]);

  // Check if typed search query already exists exactly
  const hasExactMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return allOptions.some(
      o =>
        o.labelAr.trim().toLowerCase() === q ||
        (o.labelEn && o.labelEn.trim().toLowerCase() === q)
    );
  }, [allOptions, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle inline creation of new configuration item on the fly
  const handleCreateNew = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || isCreating) return;

    setIsCreating(true);
    setErrorMsg(null);

    try {
      const generatedCode = trimmed
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_\u0600-\u06FF]/gi, '');

      const res = await d1Client.createConfiguration({
        category,
        nameAr: trimmed,
        code: generatedCode,
      });

      if (!res.success || !res.item) {
        throw new Error(res.error || 'فشل حفظ العنصر في قاعدة البيانات');
      }

      const created = res.item;
      const newOption: CreatableSelectOption = {
        id: created.id,
        value: created.code || created.id,
        labelAr: created.nameAr,
        labelEn: created.nameEn,
        descriptionAr: created.descriptionAr,
        colorVar: created.colorVar,
        isSystem: false,
      };

      // Append immediately to local state
      setInternalOptions(prev => [newOption, ...prev]);

      // Trigger selection
      onChange(newOption.value, newOption);
      if (onCreateOption) {
        onCreateOption(created);
      }

      // Close dropdown
      setIsOpen(false);
      setSearchQuery('');
    } catch (err: any) {
      console.error('Failed to create configuration inline:', err);
      setErrorMsg(err?.message || 'خطأ أثناء إنشاء العنصر');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-[#1A241C] dark:text-[#E0D9CB] block mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Main Select Button Display */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#F3EFE6] dark:bg-[#121B14] border text-start flex items-center justify-between gap-2 transition-all cursor-pointer ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20'
            : 'border-[#E0D9CB] dark:border-[#243628] hover:border-amber-500/50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <span className="truncate block font-semibold text-[#1A241C] dark:text-[#F3EFE6]">
          {selectedOption ? (
            isRtl ? selectedOption.labelAr : (selectedOption.labelEn || selectedOption.labelAr)
          ) : (
            <span className="text-slate-400 dark:text-[#8FA392] font-normal">
              {placeholder || t('اختر أو أضف عنصراً جديداً...', 'Select or add new...')}
            </span>
          )}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-[#5C665E] dark:text-[#8FA392]">
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute z-[100] mt-1.5 w-full rounded-2xl bg-white dark:bg-[#0E1610] border border-slate-200 dark:border-[#243628] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-[#1F2E23] bg-slate-50/70 dark:bg-[#141F16]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-[#8FA392] absolute inset-y-0 start-3 my-auto pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!hasExactMatch && searchQuery.trim()) {
                      handleCreateNew();
                    } else if (filteredOptions.length > 0) {
                      const first = filteredOptions[0];
                      onChange(first.value, first);
                      setIsOpen(false);
                      setSearchQuery('');
                    }
                  } else if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
                placeholder={t('ابحث أو اكتب لإضافة جديد...', 'Search or type to add new...')}
                className="w-full ps-8 pe-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#07130E] border border-slate-200 dark:border-[#243628] text-slate-900 dark:text-[#F3EFE6] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Error Message if Creation Failed */}
          {errorMsg && (
            <div className="p-2 mx-2 mt-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = selectedOption?.value === option.value;
                return (
                  <button
                    key={option.id || option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value, option);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-start text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                        : 'text-slate-800 dark:text-[#C5D6C9] hover:bg-slate-100 dark:hover:bg-[#1A2E22]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {option.colorVar && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: option.colorVar }}
                        />
                      )}
                      <div className="min-w-0">
                        <span className="block truncate">
                          {isRtl ? option.labelAr : (option.labelEn || option.labelAr)}
                        </span>
                        {option.descriptionAr && (
                          <span className="text-[10px] text-slate-400 dark:text-[#8FA392] truncate block opacity-80">
                            {option.descriptionAr}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-3 px-3 text-center text-xs text-slate-400 dark:text-[#8FA392]">
                {t('لا توجد خيارات مطابقة', 'No matching options found')}
              </div>
            )}
          </div>

          {/* Inline Creatable Button (If typed search query does not match an existing option) */}
          {!hasExactMatch && searchQuery.trim() && (
            <div className="p-2 border-t border-slate-100 dark:border-[#1F2E23] bg-amber-500/5 dark:bg-amber-500/10">
              <button
                type="button"
                disabled={isCreating}
                onClick={handleCreateNew}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('جارٍ الحفظ في التعريفات...', 'Saving to configurations...')}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="truncate">
                      {t(`+ إضافة "${searchQuery.trim()}" وحفظه في التعريفات فوراً`, `+ Add "${searchQuery.trim()}" to configurations`)}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
