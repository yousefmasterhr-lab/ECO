import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  AlertCircle,
  Trash2,
  User,
  Users,
  Maximize2,
  Minimize2,
  GitFork
} from 'lucide-react';
import { DepartmentOrg } from './types';
import { computeHierarchyLevels } from './departmentStorage';
import { useAuth } from '../../../context/AuthContext';

interface OrgMindMapTreeProps {
  departments: DepartmentOrg[];
  searchQuery?: string;
  selectedLevel?: number | 'all';
  selectedCompanyId?: string;
  collapsedNodes: Set<string>;
  onToggleCollapse: (id: string) => void;
  onAddSubDept: (parentId: string | null) => void;
  onEditDept: (dept: DepartmentOrg) => void;
  onViewAudit: (dept: DepartmentOrg) => void;
  onDeleteDept: (dept: DepartmentOrg) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

interface NodeLayoutCoord {
  x: number;
  y: number;
  level: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  dept: DepartmentOrg;
  children: DepartmentOrg[];
}

const NODE_W = 320;
const NODE_H = 92;
const COL_GAP = 140;
const UNIT_H = 118;

export const OrgMindMapTree: React.FC<OrgMindMapTreeProps> = ({
  departments,
  searchQuery = '',
  selectedLevel = 'all',
  selectedCompanyId = 'all',
  collapsedNodes,
  onToggleCollapse,
  onAddSubDept,
  onEditDept,
  onViewAudit,
  onDeleteDept
}) => {
  const { hasPermission } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Direction State: LTR (NotebookLM Left-to-Right) vs RTL
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  // Pan & Zoom State
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 100 });
  const [zoom, setZoom] = useState<number>(0.9);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hovered / Active Node for Action Bar
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Is Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter departments by company
  const companyDepts = useMemo(() => {
    let list = departments;
    if (selectedCompanyId !== 'all') {
      list = departments.filter(d => d.companyId === selectedCompanyId);
    }
    return computeHierarchyLevels(list);
  }, [departments, selectedCompanyId]);

  // Build parent-to-children mapping
  const { childrenMap, roots } = useMemo(() => {
    const cMap = new Map<string, DepartmentOrg[]>();
    const allIds = new Set(companyDepts.map(d => d.id));

    companyDepts.forEach(d => {
      if (d.parentId && allIds.has(d.parentId)) {
        const arr = cMap.get(d.parentId) || [];
        arr.push(d);
        cMap.set(d.parentId, arr);
      }
    });

    const rootList = companyDepts.filter(d => !d.parentId || !allIds.has(d.parentId));
    return { childrenMap: cMap, roots: rootList };
  }, [companyDepts]);

  // Compute Layout Coordinates for all visible nodes
  const { layoutMap, boundingBox } = useMemo(() => {
    const coordsMap = new Map<string, NodeLayoutCoord>();

    function layoutSubtree(
      node: DepartmentOrg,
      level: number,
      topY: number
    ): number {
      const children = childrenMap.get(node.id) || [];
      const hasChildren = children.length > 0;
      const isCollapsed = collapsedNodes.has(node.id);

      let totalUnits = 0;
      let calculatedY = topY;

      if (!hasChildren || isCollapsed) {
        totalUnits = 1;
        calculatedY = topY + (UNIT_H - NODE_H) / 2;
      } else {
        let currentChildTopY = topY;
        const childYs: number[] = [];

        for (const child of children) {
          const units = layoutSubtree(child, level + 1, currentChildTopY);
          const childCoord = coordsMap.get(child.id);
          if (childCoord) {
            childYs.push(childCoord.y);
          }
          currentChildTopY += units * UNIT_H;
          totalUnits += units;
        }

        if (childYs.length > 0) {
          calculatedY = (childYs[0] + childYs[childYs.length - 1]) / 2;
        } else {
          calculatedY = topY + (UNIT_H - NODE_H) / 2;
        }
      }

      const x = direction === 'ltr'
        ? level * (NODE_W + COL_GAP)
        : -level * (NODE_W + COL_GAP);

      coordsMap.set(node.id, {
        x,
        y: calculatedY,
        level,
        hasChildren,
        isCollapsed,
        dept: node,
        children
      });

      return totalUnits;
    }

    let currentRootY = 40;
    roots.forEach(root => {
      const units = layoutSubtree(root, 0, currentRootY);
      currentRootY += units * UNIT_H + 40;
    });

    // Compute bounding box
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    coordsMap.forEach(item => {
      minX = Math.min(minX, item.x);
      maxX = Math.max(maxX, item.x + NODE_W);
      minY = Math.min(minY, item.y);
      maxY = Math.max(maxY, item.y + NODE_H);
    });

    if (coordsMap.size === 0) {
      minX = 0;
      maxX = 400;
      minY = 0;
      maxY = 300;
    }

    return {
      layoutMap: coordsMap,
      boundingBox: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
    };
  }, [roots, childrenMap, collapsedNodes, direction]);

  // Center Tree Action
  const handleCenterTree = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const treeW = boundingBox.width;
    const treeH = boundingBox.height;

    // Calculate optimal zoom to fit comfortably
    const scaleX = (rect.width - 120) / Math.max(treeW, 400);
    const scaleY = (rect.height - 120) / Math.max(treeH, 400);
    const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.55), 1.05);

    setZoom(fitZoom);

    // Center pan
    const centerX = direction === 'ltr'
      ? (rect.width - treeW * fitZoom) / 2 - boundingBox.minX * fitZoom
      : (rect.width + treeW * fitZoom) / 2 - boundingBox.maxX * fitZoom;
    const centerY = (rect.height - treeH * fitZoom) / 2 - boundingBox.minY * fitZoom;

    setPan({ x: centerX, y: centerY });
  }, [boundingBox, direction]);

  // Auto-center on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCenterTree();
    }, 150);
    return () => clearTimeout(timer);
  }, [direction, companyDepts.length]);

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on canvas background
    if ((e.target as HTMLElement).closest('.interactive-tree-node') ||
        (e.target as HTMLElement).closest('.mindmap-controls')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 2.2));
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // SVG Connector Paths
  const connectorPaths = useMemo(() => {
    const paths: { id: string; d: string; stroke: string; strokeWidth: number }[] = [];

    layoutMap.forEach(parentCoord => {
      if (parentCoord.isCollapsed || !parentCoord.hasChildren) return;

      const pX = parentCoord.x;
      const pY = parentCoord.y;

      parentCoord.children.forEach(child => {
        const childCoord = layoutMap.get(child.id);
        if (!childCoord) return;

        const cX = childCoord.x;
        const cY = childCoord.y;

        let startX: number;
        let startY: number;
        let endX: number;
        let endY: number;

        if (direction === 'ltr') {
          startX = pX + NODE_W;
          startY = pY + NODE_H / 2;
          endX = cX;
          endY = cY + NODE_H / 2;
        } else {
          startX = pX;
          startY = pY + NODE_H / 2;
          endX = cX + NODE_W;
          endY = cY + NODE_H / 2;
        }

        const midX = startX + (endX - startX) * 0.5;
        const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

        // Stratified Level Stroke styling
        let stroke = '#d97706'; // Level 0 -> 1 (Rich Amber)
        let strokeWidth = 2.5;

        if (parentCoord.level === 1) {
          stroke = '#0d9488'; // Level 1 -> 2 (Teal-Olive / Bronze)
          strokeWidth = 2;
        } else if (parentCoord.level >= 2) {
          stroke = '#10b981'; // Level 2 -> 3 (Emerald Green)
          strokeWidth = 1.75;
        }

        paths.push({
          id: `${parentCoord.dept.id}->${child.id}`,
          d,
          stroke,
          strokeWidth
        });
      });
    });

    return paths;
  }, [layoutMap, direction]);

  // Search Match Check
  const isNodeMatchingSearch = useCallback((dept: DepartmentOrg) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.trim().toLowerCase();
    return (
      dept.nameAr.toLowerCase().includes(q) ||
      (dept.titleEn && dept.titleEn.toLowerCase().includes(q)) ||
      dept.code.toLowerCase().includes(q) ||
      (dept.headAr && dept.headAr.toLowerCase().includes(q)) ||
      (dept.responsibilities && dept.responsibilities.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Level Match Check
  const isNodeMatchingLevel = useCallback((level: number) => {
    if (selectedLevel === 'all') return true;
    return level === selectedLevel;
  }, [selectedLevel]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full overflow-hidden select-none bg-[#091510] border border-amber-500/20 rounded-2xl shadow-2xl transition-all cursor-grab active:cursor-grabbing ${
        isFullscreen ? 'fixed inset-0 z-[1000] rounded-none' : 'h-[650px] lg:h-[720px]'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.05) 0%, transparent 70%),
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 36px 36px, 36px 36px'
      }}
    >
      {/* 1. Floating Top Indicator Badge */}
      <div className="absolute top-4 start-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-[#0D1F17]/90 backdrop-blur-md border border-amber-500/30 text-stone-200 text-xs font-bold flex items-center gap-2 shadow-lg">
          <GitFork className="w-3.5 h-3.5 text-amber-400" />
          <span>الشجرة الذهنية التفاعلية (NotebookLM Tree)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-amber-300 font-mono">
            {layoutMap.size} عقدة معروضة
          </span>
        </div>
      </div>

      {/* 2. Interactive SVG & Canvas Container */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        {/* SVG Bezier Connecting Lines */}
        <svg
          className="absolute overflow-visible pointer-events-none"
          style={{
            left: 0,
            top: 0,
            width: 1,
            height: 1
          }}
        >
          <defs>
            <linearGradient id="amberGoldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {connectorPaths.map(p => (
            <path
              key={p.id}
              d={p.d}
              fill="none"
              stroke={p.stroke}
              strokeWidth={p.strokeWidth}
              strokeLinecap="round"
              filter="url(#lineGlow)"
              className="transition-all duration-300 opacity-80 hover:opacity-100"
            />
          ))}
        </svg>

        {/* Node Pills Overlay */}
        {Array.from(layoutMap.values()).map(coord => {
          const { dept, x, y, level, hasChildren, isCollapsed, children } = coord;
          const isMatchingSearch = isNodeMatchingSearch(dept);
          const isMatchingLvl = isNodeMatchingLevel(level);
          const isHovered = hoveredNodeId === dept.id;

          // Level theme styling
          const levelBadgeLabel =
            level === 0
              ? 'القيادة التنفيذية'
              : level === 1
              ? 'إدارة تنفيذية'
              : level === 2
              ? 'قسم فرعي'
              : 'مهام واختصاصات';

          const levelBadgeColor =
            level === 0
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : level === 1
              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
              : level === 2
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-stone-500/20 text-stone-300 border-stone-500/40';

          return (
            <div
              key={dept.id}
              className="absolute pointer-events-auto interactive-tree-node"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${NODE_W}px`,
                height: `${NODE_H}px`
              }}
              onMouseEnter={() => setHoveredNodeId(dept.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Node Card Pill */}
              <div
                className={`relative w-full h-full rounded-2xl p-3 flex flex-col justify-between transition-all duration-300 shadow-xl backdrop-blur-md ${
                  isMatchingSearch
                    ? 'bg-[#183627] border-2 border-amber-400 ring-4 ring-amber-500/20'
                    : isMatchingLvl
                    ? 'bg-[#10241A]/95 hover:bg-[#142D21] border border-amber-500/30 hover:border-amber-400'
                    : 'bg-[#0E1B15]/75 border border-stone-800 opacity-60'
                }`}
              >
                {/* Top Row: Code, Cost Center & Level Pill */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dept.code}
                    </span>
                    {dept.costCenterCode && (
                      <span className="px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 truncate">
                        {dept.costCenterCode}
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${levelBadgeColor}`}
                  >
                    {levelBadgeLabel}
                  </span>
                </div>

                {/* Middle Row: Arabic Title & English Subtitle */}
                <div className="my-0.5">
                  <h4
                    className="text-xs font-black text-stone-100 truncate leading-snug"
                    title={dept.nameAr}
                  >
                    {dept.nameAr}
                  </h4>
                  {(dept.titleEn || dept.nameEn) && (
                    <p
                      className="text-[10px] font-mono text-amber-200/70 truncate mt-0.5"
                      title={dept.titleEn || dept.nameEn}
                    >
                      {dept.titleEn || dept.nameEn}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Manager Name & Staff Count */}
                <div className="flex items-center justify-between text-[11px] text-stone-300 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                    <User className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate font-semibold text-stone-200">
                      {dept.headAr || 'غير محدد'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCollapsed && hasChildren && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40 animate-pulse">
                        +{children.length} فروع
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-stone-400">
                      <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="font-mono text-[10px] font-bold text-stone-200">
                        {dept.staffCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Collapse / Expand Circular Toggle Button (< or >) */}
                {hasChildren && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleCollapse(dept.id);
                    }}
                    title={isCollapsed ? 'توسيع الفروع التابعة' : 'طي الفروع التابعة'}
                    className={`absolute z-10 w-6 h-6 rounded-full bg-[#1A3327] border border-amber-500/60 text-amber-400 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center text-xs font-black shadow-lg transition-all transform hover:scale-110 cursor-pointer ${
                      direction === 'ltr'
                        ? 'end-[-12px] top-[calc(50%-12px)]'
                        : 'start-[-12px] top-[calc(50%-12px)]'
                    }`}
                  >
                    {direction === 'ltr' ? (
                      isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                      )
                    ) : isCollapsed ? (
                      <ChevronLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {/* Floating Action Bar on Hover/Selection */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: -14, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute start-1/2 -translate-x-1/2 top-0 -translate-y-full z-30 flex items-center gap-1 p-1 rounded-xl bg-[#07130E]/95 backdrop-blur-md border border-amber-500/40 shadow-2xl"
                    >
                      {hasPermission('companies.org.create') && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onAddSubDept(dept.id);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-colors"
                          title="إضافة فرع / قسم تابع"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {hasPermission('companies.org.edit') && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onEditDept(dept);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 transition-colors"
                          title="تعديل بيانات العقدة"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onViewAudit(dept);
                        }}
                        className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-slate-950 transition-colors"
                        title="سجل التعديلات (Audit Log)"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                      </button>

                      {hasPermission('companies.org.delete') && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteDept(dept);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 transition-colors"
                          title="حذف العقدة وفروعها"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Floating Bottom-Left Canvas Controls (Zoom In/Out, Reset, Center, Direction, Fullscreen) */}
      <div className="absolute bottom-4 start-4 z-20 flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#07130E]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl mindmap-controls">
        {/* Zoom In */}
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.2))}
          className="p-2 rounded-xl text-stone-200 hover:text-amber-400 hover:bg-white/5 transition-colors"
          title="تكبير (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.4))}
          className="p-2 rounded-xl text-stone-200 hover:text-amber-400 hover:bg-white/5 transition-colors"
          title="تصغير (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom Percentage Reset */}
        <button
          onClick={() => setZoom(1.0)}
          className="px-2 py-1 rounded-xl text-stone-200 hover:text-amber-400 hover:bg-white/5 font-mono text-xs font-bold transition-colors"
          title="إعادة التكبير إلى 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        {/* Center Tree */}
        <button
          onClick={handleCenterTree}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition-all shadow-sm"
          title="توسيع وتوسيط الشجرة بالكامل في الشاشة"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>توسيط</span>
        </button>

        {/* Direction Toggle LTR / RTL */}
        <button
          onClick={() => setDirection(prev => (prev === 'ltr' ? 'rtl' : 'ltr'))}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all"
          title={`تبديل اتجاه الشجرة: الحالي (${direction === 'ltr' ? 'يسار ➔ يمين' : 'يمين ➔ يسار'})`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
          <span>{direction === 'ltr' ? 'LTR' : 'RTL'}</span>
        </button>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl text-stone-200 hover:text-amber-400 hover:bg-white/5 transition-colors"
          title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 4. Floating Helper Legend in Bottom-Right Corner */}
      <div className="hidden sm:flex absolute bottom-4 end-4 z-20 items-center gap-3 px-3 py-1.5 rounded-xl bg-[#07130E]/80 backdrop-blur-md border border-white/10 text-[10px] text-stone-300 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-[#d97706] rounded-full" /> المستوى 1 (رئيسي)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-[#0d9488] rounded-full" /> المستوى 2 (إدارات)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-[#10b981] rounded-full" /> المستوى 3 (أقسام)
        </span>
        <span className="text-stone-400 font-mono">اسحب للتحريك • عجلة الماوس للتكبير</span>
      </div>
    </div>
  );
};
