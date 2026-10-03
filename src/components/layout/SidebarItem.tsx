import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DepartmentNavCategory, NavSubItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import {
  HardHat,
  Scale,
  ShieldCheck,
  Users,
  Mail,
  BarChart3,
  UserCheck,
  ScrollText,
  Settings,
  Building2,
  ConciergeBell,
  Landmark,
  ChevronDown,
  CircleDot,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  HardHat,
  Scale,
  ShieldCheck,
  Users,
  UserCheck,
  Mail,
  BarChart3,
  ScrollText,
  Settings,
  Building2,
  ConciergeBell,
  Landmark,
};

interface SubItemRowProps {
  sub: NavSubItem;
  categoryId: string;
  isActive: boolean;
  isRtl: boolean;
  onSelect: () => void;
  index: number;
}

const SubItemRow: React.FC<SubItemRowProps> = ({
  sub,
  isActive,
  isRtl,
  onSelect,
}) => {
  const [spotlightY, setSpotlightY] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpotlightY(e.clientY - rect.top);
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: isRtl ? 12 : -12 },
        visible: {
          opacity: 1,
          x: isRtl ? [12, -2, 0] : [-12, 2, 0],
          transition: {
            type: 'spring',
            stiffness: 380,
            damping: 26,
            mass: 0.6,
          },
        },
      }}
      className="relative"
    >
      <button
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setSpotlightY(null);
        }}
        onMouseMove={handleMouseMove}
        className={`group/sub relative w-full flex flex-row items-center justify-start gap-2.5 px-3 py-2 rounded-xl text-xs text-start transition-colors overflow-hidden ${
          isActive
            ? 'text-[#D99B26] dark:text-[#EBB34D] font-bold'
            : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6]'
        }`}
      >
        {/* Floating Liquid Magnetic Pill with Organic Spring Elasticity */}
        {isActive && (
          <motion.div
            layoutId="sidebarActivePill"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D99B26]/18 to-[#D99B26]/08 dark:from-[#EBB34D]/22 dark:to-[#EBB34D]/08 border border-[#D99B26]/35 dark:border-[#EBB34D]/35 shadow-xs shadow-[#D99B26]/10"
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
              mass: 0.8,
            }}
          />
        )}

        {/* Hover Ambient Spotlight - tracks cursor Y */}
        <div
          className={`absolute inset-0 pointer-events-none rounded-xl transition-opacity duration-200 ${
            isHovered && !isActive ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              spotlightY !== null
                ? `radial-gradient(circle 85px at ${isRtl ? 'right 14px' : 'left 14px'} ${spotlightY}px, rgba(217, 155, 38, 0.08), transparent 70%)`
                : undefined,
          }}
        />

        {/* Ignited Bullet Pulse */}
        <motion.span
          initial={false}
          animate={
            isActive
              ? {
                  scale: [0.6, 1.3, 1],
                  boxShadow: [
                    '0 0 0px rgba(217, 155, 38, 0)',
                    '0 0 10px rgba(217, 155, 38, 0.8)',
                    '0 0 4px rgba(217, 155, 38, 0.4)',
                  ],
                }
              : {
                  scale: 1,
                  boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
                }
          }
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={`w-1.5 h-1.5 rounded-full shrink-0 relative z-10 transition-colors ${
            isActive
              ? 'bg-[#D99B26] dark:bg-[#EBB34D]'
              : 'bg-[#5C665E]/40 dark:bg-[#8FA392]/40 group-hover/sub:bg-[#D99B26]/70'
          }`}
        />

        <span className="truncate relative z-10">{isRtl ? sub.titleAr : sub.titleEn}</span>
      </button>
    </motion.div>
  );
};

interface SidebarItemProps {
  category: DepartmentNavCategory;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ category }) => {
  const { isRtl } = useLanguage();
  const {
    isCollapsed,
    activeCategoryId,
    activeSubItemId,
    expandedCategories,
    toggleCategoryExpand,
    selectItem,
  } = useNavigation();

  const [expandedSubItems, setExpandedSubItems] = useState<string[]>(['leg_contracts']);

  // Auto-expand parent sub-item if a nested child is active
  React.useEffect(() => {
    category.subItems.forEach(sub => {
      if (sub.children?.some(c => c.id === activeSubItemId)) {
        setExpandedSubItems(prev => (prev.includes(sub.id) ? prev : [...prev, sub.id]));
      }
    });
  }, [activeSubItemId, category.subItems]);

  const toggleSubItemExpand = (subId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubItems(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const Icon = ICON_MAP[category.iconName] || CircleDot;
  const isExpanded = expandedCategories.includes(category.id);
  const isCategoryActive = activeCategoryId === category.id;

  const categoryTitle = isRtl ? category.titleAr : category.titleEn;
  const categoryBadge = isRtl ? category.badgeAr : category.badgeEn;

  // Render for Mini-Rail (Collapsed) mode
  if (isCollapsed) {
    return (
      <div className="w-full flex items-center justify-center py-1">
        <button
          onClick={() => selectItem(category.id, category.subItems[0]?.id)}
          className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center transition-all duration-200 relative shrink-0 ${
            isCategoryActive
              ? 'bg-[#D99B26]/20 text-[#D99B26] dark:text-[#EBB34D] shadow-xs'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
          }`}
          aria-label={categoryTitle}
          title={categoryBadge ? `${categoryTitle} (${categoryBadge})` : categoryTitle}
        >
          <Icon className="w-5 h-5 shrink-0" style={{ color: isCategoryActive ? '#D99B26' : category.colorVar }} />
          {isCategoryActive && (
            <span
              className={`absolute top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[#D99B26] dark:bg-[#EBB34D] ${
                isRtl ? 'right-0.5' : 'left-0.5'
              }`}
            />
          )}
        </button>
      </div>
    );
  }

  // Render for Expanded Sidebar (Accordion) mode
  return (
    <div className="space-y-1">
      {/* Category Accordion Header */}
      <button
        onClick={() => toggleCategoryExpand(category.id)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-start text-xs font-bold transition-all duration-200 ${
          isCategoryActive
            ? 'bg-[#D99B26]/15 dark:bg-[#EBB34D]/15 text-[#D99B26] dark:text-[#EBB34D]'
            : 'text-[#1A241C] dark:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${category.colorVar}20`,
              color: category.colorVar,
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="truncate tracking-tight">{categoryTitle}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {categoryBadge && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${category.colorVar}15`,
                color: category.colorVar,
              }}
            >
              {categoryBadge}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-[#5C665E] dark:text-[#8FA392] transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Accordion Children / Sub-items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden relative"
          >
            {/* Living Fiber Branch Trace: Dynamic SVG Path with Glowing Laser Pulse */}
            <div
              className={`absolute top-1 bottom-1 ${
                isRtl ? 'right-3' : 'left-3'
              } w-1.5 pointer-events-none z-0`}
            >
              <svg className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`fiberLaser-${category.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D99B26" stopOpacity="1" />
                    <stop offset="50%" stopColor="#EBB34D" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#D99B26" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* Background Track */}
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="100%"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[#E0D9CB]/80 dark:text-[#243628]"
                />
                {/* Active Laser Pulse Line */}
                <motion.line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="100%"
                  stroke={`url(#fiberLaser-${category.id})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(217, 155, 38, 0.7))',
                  }}
                />
              </svg>
            </div>

            {/* Sub-Item Cascading Staggered Container */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.035,
                    delayChildren: 0.03,
                  },
                },
              }}
              className={`space-y-0.5 py-1 ${isRtl ? 'pr-4 pl-1' : 'pl-4 pr-1'}`}
            >
              {category.subItems.map((sub, idx) => {
                const hasChildren = Boolean(sub.children && sub.children.length > 0);
                const isChildActive = Boolean(sub.children?.some(c => c.id === activeSubItemId));
                const isSubActive = (isCategoryActive && activeSubItemId === sub.id) || isChildActive;
                const isSubExpanded = expandedSubItems.includes(sub.id);

                if (hasChildren) {
                  return (
                    <div key={sub.id} className="space-y-0.5">
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: isRtl ? 12 : -12 },
                          visible: {
                            opacity: 1,
                            x: isRtl ? [12, -2, 0] : [-12, 2, 0],
                            transition: {
                              type: 'spring',
                              stiffness: 380,
                              damping: 26,
                              mass: 0.6,
                            },
                          },
                        }}
                      >
                        <button
                          onClick={(e) => {
                            toggleSubItemExpand(sub.id, e);
                            if (!isSubExpanded && sub.children) {
                              selectItem(category.id, sub.children[0].id);
                            }
                          }}
                          className={`w-full flex flex-row items-center justify-between px-3 py-2 rounded-xl text-xs text-start transition-colors ${
                            isSubActive
                              ? 'bg-[#D99B26]/15 text-[#D99B26] dark:text-[#EBB34D] font-bold'
                              : 'text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] hover:bg-[#EAE4D7] dark:hover:bg-[#1F2E23]'
                          }`}
                        >
                          <div className="flex flex-row items-center justify-start gap-2 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                                isSubActive
                                  ? 'bg-[#D99B26] dark:bg-[#EBB34D]'
                                  : 'bg-[#5C665E]/50 dark:bg-[#8FA392]/50'
                              }`}
                            />
                            <span className="truncate">{isRtl ? sub.titleAr : sub.titleEn}</span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                              isSubExpanded ? 'rotate-180 text-[#D99B26] dark:text-[#EBB34D]' : 'opacity-60'
                            }`}
                          />
                        </button>
                      </motion.div>

                      {/* Nested Children */}
                      <AnimatePresence initial={false}>
                        {isSubExpanded && (
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={{
                              hidden: { opacity: 0, height: 0 },
                              visible: {
                                opacity: 1,
                                height: 'auto',
                                transition: {
                                  height: { duration: 0.25, ease: 'easeOut' },
                                  staggerChildren: 0.035,
                                  delayChildren: 0.03,
                                },
                              },
                              exit: {
                                opacity: 0,
                                height: 0,
                                transition: {
                                  height: { duration: 0.15 },
                                  staggerChildren: 0.02,
                                  staggerDirection: -1,
                                },
                              },
                            }}
                            className="overflow-hidden relative"
                          >
                            <div className={`space-y-0.5 py-1 ${isRtl ? 'pr-3 pl-1' : 'pl-3 pr-1'}`}>
                              {sub.children?.map((child, childIdx) => {
                                const isChildItemActive = isCategoryActive && activeSubItemId === child.id;
                                return (
                                  <SubItemRow
                                    key={child.id}
                                    sub={child}
                                    categoryId={category.id}
                                    isActive={isChildItemActive}
                                    isRtl={isRtl}
                                    onSelect={() => selectItem(category.id, child.id)}
                                    index={childIdx}
                                  />
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                // Standard Sub-item with Liquid Magnetic Pill & Ambient Spotlight
                return (
                  <SubItemRow
                    key={sub.id}
                    sub={sub}
                    categoryId={category.id}
                    isActive={isCategoryActive && activeSubItemId === sub.id}
                    isRtl={isRtl}
                    onSelect={() => selectItem(category.id, sub.id)}
                    index={idx}
                  />
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
