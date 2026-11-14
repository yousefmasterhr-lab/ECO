import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface LuxurySelectOption {
  value: string | number;
  label: string;
  code?: string | number;
  subLabel?: string;
  badge?: string;
}

interface LuxurySelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: LuxurySelectOption[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  icon?: React.ComponentType<{ className?: string }>;
  compact?: boolean;
}

function normalizeSearchText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
    .toLowerCase()
    .trim();
}

export const LuxurySelect: React.FC<LuxurySelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'اختر من القائمة...',
  searchable = true,
  searchPlaceholder = 'بحث...',
  disabled = false,
  className = '',
  menuClassName = '',
  icon: Icon,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Selected Option Lookup
  const selectedOption = useMemo(() => {
    return options.find(o => String(o.value) === String(value));
  }, [options, value]);

  // Filtered Options with Arabic digit normalization
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = normalizeSearchText(searchQuery);
    return options.filter(o => {
      const matchLabel = normalizeSearchText(o.label).includes(q);
      const matchCode = o.code !== undefined && normalizeSearchText(String(o.code)).includes(q);
      const matchSub = o.subLabel !== undefined && normalizeSearchText(o.subLabel).includes(q);
      return matchLabel || matchCode || matchSub;
    });
  }, [options, searchQuery]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[data-select-item]');
      if (items[highlightedIndex]) {
        (items[highlightedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Close on click outside and determine popup position
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);

      // Check if menu would overflow bottom viewport
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUpwards(spaceBelow < 260 && rect.top > 260);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string | number) => {
    onChange(String(val));
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-right ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onKeyDown={handleKeyDown}
      dir="rtl"
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border transition-all cursor-pointer outline-none select-none ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs font-semibold'
        } ${
          isOpen
            ? 'border-[#059669] ring-2 ring-[#059669]/20 bg-white dark:bg-[#17231A]'
            : 'border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#17231A] hover:border-[#059669]/60'
        } text-[#1A241C] dark:text-[#F3EFE6] shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-2 truncate flex-1">
          {Icon && <Icon className="w-4 h-4 shrink-0 text-[#059669] dark:text-[#34D399]" />}
          {selectedOption ? (
            <div className="flex items-center gap-1.5 truncate">
              {selectedOption.code !== undefined && (
                <span className="font-mono font-bold text-[#059669] dark:text-[#34D399] shrink-0">
                  {selectedOption.code}
                </span>
              )}
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-[#EAF3EB] text-[#245E33] dark:bg-[#203325] dark:text-[#A3CFAC]">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[#5C665E]/70 dark:text-[#8FA392]/70 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#5C665E] dark:text-[#8FA392] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#059669]' : ''
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute z-[999] w-full min-w-[240px] max-w-[420px] rounded-2xl border border-[#E0D9CB] dark:border-[#243628] bg-[#FBF9F5] dark:bg-[#141E16] text-[#1A241C] dark:text-[#F3EFE6] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${menuClassName}`}
          style={{ maxHeight: '320px' }}
        >
          {/* Search Header */}
          {searchable && (
            <div className="p-2 border-b border-[#E0D9CB] dark:border-[#243628] bg-white dark:bg-[#121B14] sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute right-2.5 text-[#5C665E] dark:text-[#8FA392]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pr-8 pl-7 py-1.5 text-xs rounded-lg border border-[#E0D9CB] dark:border-[#243628] bg-[#F3EFE6]/50 dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6] outline-none focus:border-[#059669] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2 text-[#5C665E] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-[#E0D9CB]/40 dark:divide-[#243628]/40">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#5C665E] dark:text-[#8FA392]">
                لا توجد عناصر مطابقة للبحث
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={String(opt.value)}
                    data-select-item
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EAF3EB] dark:bg-[#1D2E22] text-[#059669] dark:text-[#34D399] font-bold'
                        : isHighlighted
                          ? 'bg-[#F3EFE6] dark:bg-[#17231A] text-[#1A241C] dark:text-[#F3EFE6]'
                          : 'text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#F3EFE6] dark:hover:bg-[#17231A]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate flex-1">
                      {opt.code !== undefined && (
                        <span className="font-mono font-bold text-[#059669] dark:text-[#34D399] shrink-0">
                          {opt.code}
                        </span>
                      )}
                      <div className="truncate flex-1">
                        <div className="truncate font-semibold">{opt.label}</div>
                        {opt.subLabel && (
                          <div className="text-[10px] text-[#5C665E] dark:text-[#8FA392] truncate">
                            {opt.subLabel}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pr-2">
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#EAF3EB] text-[#245E33] dark:bg-[#203325] dark:text-[#A3CFAC]">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

