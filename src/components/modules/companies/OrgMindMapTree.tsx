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
  GitFork,
  UnfoldHorizontal,
  FoldHorizontal
} from 'lucide-react';
import { DepartmentOrg } from './types';
import { computeHierarchyLevels } from './departmentStorage';
import { useAuth } from '../../../context/AuthContext';

interface OrgMindMapTreeProps {
  departments: DepartmentOrg[];
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

// Calibrated Mind Map Dimensions for Optimal Density & Spacing
const NODE_W = 280;
const NODE_H = 130;
const COL_GAP = 120;
const UNIT_H = 160; // Provides 30px vertical gap between siblings (160 - 130 = 30px)

export const OrgMindMapTree: React.FC<OrgMindMapTreeProps> = ({
  departments,
  selectedLevel = 'all',
  selectedCompanyId = 'all',
  collapsedNodes,
  onToggleCollapse,
  onAddSubDept,
  onEditDept,
  onViewAudit,
  onDeleteDept,
  onExpandAll,
  onCollapseAll
}) => {
  const { hasPermission } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Direction State: LTR (NotebookLM Left-to-Right) vs RTL
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');

  // Pan & Zoom State
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 80 });
  const [zoom, setZoom] = useState<number>(0.85);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pan Animation State for Smooth Auto-Centering on Node Expand
  const panRef = useRef(pan);
  panRef.current = pan;
  const animPanRef = useRef<number | null>(null);

  const animatePanTo = useCallback((targetX: number, targetY: number, duration = 400) => {
    if (animPanRef.current) {
      cancelAnimationFrame(animPanRef.current);
    }
    const startX = panRef.current.x;
    const startY = panRef.current.y;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setPan({
        x: startX + (targetX - startX) * ease,
        y: startY + (targetY - startY) * ease
      });
      if (progress < 1) {
        animPanRef.current = requestAnimationFrame(step);
      } else {
        animPanRef.current = null;
      }
    };

    animPanRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    return () => {
      if (animPanRef.current) {
        cancelAnimationFrame(animPanRef.current);
      }
    };
  }, []);

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

    let currentRootY = 30;
    roots.forEach(root => {
      const units = layoutSubtree(root, 0, currentRootY);
      currentRootY += units * UNIT_H + 30;
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
      maxX = 300;
      minY = 0;
      maxY = 200;
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

    // Optimal zoom to fit
    const scaleX = (rect.width - 100) / Math.max(treeW, 300);
    const scaleY = (rect.height - 100) / Math.max(treeH, 300);
    const fitZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.55), 1.05);

    setZoom(fitZoom);

    // Center pan
    const centerX = direction === 'ltr'
      ? (rect.width - treeW * fitZoom) / 2 - boundingBox.minX * fitZoom
      : (rect.width + treeW * fitZoom) / 2 - boundingBox.maxX * fitZoom;
    const centerY = (rect.height - treeH * fitZoom) / 2 - boundingBox.minY * fitZoom;

    setPan({ x: centerX, y: centerY });
  }, [boundingBox, direction]);

  // Smart Toggle with Auto-Pan Centering on Node Expand
  const handleToggleNode = useCallback(
    (nodeId: string) => {
      const isCurrentlyCollapsed = collapsedNodes.has(nodeId);
      const parentCoord = layoutMap.get(nodeId);

      onToggleCollapse(nodeId);

      // When expanding, auto-center viewport towards the newly opened cluster
      if (isCurrentlyCollapsed && parentCoord && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate cluster center
        const clusterMidX =
          direction === 'ltr'
            ? parentCoord.x + (NODE_W + COL_GAP / 2)
            : parentCoord.x - (NODE_W + COL_GAP / 2);
        const clusterMidY = parentCoord.y + NODE_H / 2;

        const viewportMidX = rect.width / 2;
        const viewportMidY = rect.height / 2;

        // Directional bias: offset slightly forward towards the expansion
        const biasX = direction === 'ltr' ? -70 : 70;

        const targetPanX = viewportMidX - clusterMidX * zoom + biasX;
        const targetPanY = viewportMidY - clusterMidY * zoom;

        requestAnimationFrame(() => {
          animatePanTo(targetPanX, targetPanY, 450);
        });
      }
    },
    [collapsedNodes, layoutMap, direction, zoom, onToggleCollapse, animatePanTo]
  );

  // Auto-center on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCenterTree();
    }, 150);
    return () => clearTimeout(timer);
  }, [direction, companyDepts.length]);

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Zoom on wheel (prevent default page scroll inside mindmap)
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 2.2));
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(handleCenterTree, 100);
  };

  // Smooth SVG Bezier Curved Connectors
  const connectorPaths = useMemo(() => {
    const paths: { id: string; d: string; strokeClass: string; strokeWidth: number }[] = [];

    layoutMap.forEach(parentCoord => {
      if (parentCoord.isCollapsed || !parentCoord.hasChildren) return;

      const pX = parentCoord.x;
      const pY = parentCoord.y;

      parentCoord.children.forEach(child => {
        const childCoord = layoutMap.get(child.id);
        if (!childCoord) return;

        const cX = childCoord.x;
        const cY = childCoord.y;

        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

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

        // Level theme strokes supporting Light & Dark modes
        let strokeClass = 'stroke-amber-600 dark:stroke-amber-500';
        let strokeWidth = 2.25;

        if (parentCoord.level === 1) {
          strokeClass = 'stroke-teal-600 dark:stroke-teal-400';
          strokeWidth = 2;
        } else if (parentCoord.level >= 2) {
          strokeClass = 'stroke-emerald-600 dark:stroke-emerald-400';
          strokeWidth = 1.75;
        }

        paths.push({
          id: `${parentCoord.dept.id}->${child.id}`,
          d,
          strokeClass,
          strokeWidth
        });
      });
    });

    return paths;
  }, [layoutMap, direction]);

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
      className={`relative w-full overflow-hidden select-none bg-[#FAF7F0] dark:bg-[#07130E] border border-amber-500/20 dark:border-amber-500/25 rounded-2xl shadow-xl transition-all cursor-grab active:cursor-grabbing ${
        isFullscreen ? 'fixed inset-0 z-[1000] rounded-none' : 'h-[640px] lg:h-[700px]'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.04) 0%, transparent 70%),
          linear-gradient(to right, rgba(160, 140, 100, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(160, 140, 100, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 32px 32px, 32px 32px'
      }}
    >
      {/* 1. Floating Top Indicator Badge */}
      <div className="absolute top-4 start-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-[#0D1F17]/90 backdrop-blur-md border border-slate-200/90 dark:border-amber-500/30 text-slate-800 dark:text-stone-200 text-xs font-bold flex items-center gap-2 shadow-md">
          <GitFork className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>الشجرة الذهنية التفاعلية (Mind Map)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono font-bold">
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
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {connectorPaths.map(p => (
            <path
              key={p.id}
              d={p.d}
              fill="none"
              strokeWidth={p.strokeWidth}
              strokeLinecap="round"
              filter="url(#lineGlow)"
              className={`transition-all duration-500 ease-out opacity-80 hover:opacity-100 ${p.strokeClass}`}
            />
          ))}
        </svg>

        {/* Node Cards Overlay */}
        {Array.from(layoutMap.values()).map(coord => {
          const { dept, x, y, level, hasChildren, isCollapsed, children } = coord;
          const isMatchingLvl = isNodeMatchingLevel(level);
          const isHovered = hoveredNodeId === dept.id;

          // Level theme styling for both Light & Dark
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
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
              : level === 1
              ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-900 dark:text-teal-300 border-teal-300 dark:border-teal-500/40'
              : level === 2
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
              : 'bg-stone-100 dark:bg-stone-500/20 text-stone-900 dark:text-stone-300 border-stone-300 dark:border-stone-500/40';

          return (
            <div
              key={dept.id}
              className="absolute pointer-events-auto interactive-tree-node transition-all duration-500 ease-out"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${NODE_W}px`,
                minHeight: `${NODE_H}px`
              }}
              onMouseEnter={() => setHoveredNodeId(dept.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Node Card Pill */}
              <div
                className={`relative w-full min-w-[270px] max-w-[290px] min-h-[125px] p-3.5 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-md backdrop-blur-md ${
                  dept.isDraft
                    ? 'border-2 border-dashed border-amber-500 bg-amber-50/95 dark:bg-[#1E1908]/95'
                    : isMatchingLvl
                    ? 'bg-white/95 hover:bg-amber-50/40 dark:bg-[#0D1F17]/95 dark:hover:bg-[#142D21] border border-amber-500/25 dark:border-amber-500/35 hover:border-amber-500'
                    : 'bg-white/70 dark:bg-[#0A1610]/75 border border-slate-200 dark:border-stone-800 opacity-60'
                }`}
              >
                {/* Row 1: Code, Cost Center & Level Pill */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] sm:text-[11px] font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                      {dept.code}
                    </span>
                    {dept.costCenterCode && (
                      <span className="px-1.5 py-0.5 rounded-md font-mono text-[9px] sm:text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 truncate">
                        {dept.costCenterCode}
                      </span>
                    )}
                    {dept.isDraft && (
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                        مسودة
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${levelBadgeColor}`}
                  >
                    {levelBadgeLabel}
                  </span>
                </div>

                {/* Row 2: Arabic Title & English Subtitle */}
                <div className="flex-1 flex flex-col justify-center my-1 text-right">
                  <h4
                    className="text-sm font-bold leading-snug text-slate-900 dark:text-stone-100 truncate"
                    title={dept.nameAr}
                  >
                    {dept.nameAr}
                  </h4>
                  {(dept.titleEn || dept.nameEn) && (
                    <p
                      className="text-[11px] font-medium text-amber-700/80 dark:text-amber-400/80 truncate mt-0.5 font-mono"
                      title={dept.titleEn || dept.nameEn}
                    >
                      {dept.titleEn || dept.nameEn}
                    </p>
                  )}
                </div>

                {/* Row 3: Manager Name & Staff/Branch Count - strictly enclosed inside card */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-stone-800/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 truncate max-w-[155px]">
                    <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="truncate font-semibold text-slate-800 dark:text-stone-200 text-xs">
                      {dept.headAr || 'غير محدد'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCollapsed && hasChildren && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-200 border border-amber-400/40 animate-pulse">
                        +{children.length} فروع
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-slate-500 dark:text-stone-400">
                      <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-stone-200">
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
                      handleToggleNode(dept.id);
                    }}
                    title={isCollapsed ? 'توسيع الفروع التابعة' : 'طي الفروع التابعة'}
                    className={`absolute z-10 w-7 h-7 rounded-full bg-white dark:bg-[#1A3327] border border-amber-500/60 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:text-slate-950 flex items-center justify-center text-xs font-black shadow-md transition-all transform hover:scale-110 cursor-pointer top-1/2 -translate-y-1/2 ${
                      direction === 'ltr'
                        ? '-right-3.5'
                        : '-left-3.5'
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
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute start-1/2 -translate-x-1/2 top-0 -translate-y-full z-30 flex items-center gap-1 p-1 rounded-xl bg-white/95 dark:bg-[#07130E]/95 backdrop-blur-md border border-slate-200 dark:border-amber-500/40 shadow-xl"
                    >
                      {hasPermission('companies.org.create') && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onAddSubDept(dept.id);
                          }}
                          className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/20 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white transition-colors cursor-pointer"
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
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white transition-colors cursor-pointer"
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
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-500 text-blue-700 dark:text-blue-300 hover:text-white transition-colors cursor-pointer"
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
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/20 hover:bg-rose-500 text-rose-700 dark:text-rose-300 hover:text-white transition-colors cursor-pointer"
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

      {/* 3. Floating Bottom-Left Canvas Controls (Luxury Rounded-Full Dock) */}
      <div className="absolute bottom-4 start-4 z-20 flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#07130E]/95 backdrop-blur-xl border border-slate-200/90 dark:border-amber-500/30 shadow-2xl mindmap-controls">
        {/* Zoom In */}
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.15, 2.2))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
          title="تكبير (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.4))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
          title="تصغير (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom Percentage Reset */}
        <button
          onClick={() => setZoom(1.0)}
          className="px-2 h-7 rounded-full flex items-center justify-center text-slate-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 font-mono text-xs font-bold transition-colors cursor-pointer"
          title="إعادة التكبير إلى 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-white/10 mx-0.5" />

        {/* Center Tree */}
        <button
          onClick={handleCenterTree}
          className="flex items-center gap-1 px-3 h-7 rounded-full bg-amber-500/15 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-white dark:hover:text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="توسيع وتوسيط الشجرة بالكامل في الشاشة"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>توسيط</span>
        </button>

        {/* Direction Toggle LTR / RTL */}
        <button
          onClick={() => setDirection(prev => (prev === 'ltr' ? 'rtl' : 'ltr'))}
          className="flex items-center gap-1 px-2.5 h-7 rounded-full bg-slate-100 dark:bg-stone-800/80 hover:bg-slate-200 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
          title={`تبديل اتجاه الشجرة: الحالي (${direction === 'ltr' ? 'يسار ➔ يمين' : 'يمين ➔ يسار'})`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{direction === 'ltr' ? 'LTR' : 'RTL'}</span>
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-white/10 mx-0.5" />

        {/* Expand All Branches (Icon-only) */}
        <button
          onClick={onExpandAll}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
          title="فتح وتوسيع كافة الفروع"
        >
          <UnfoldHorizontal className="w-4 h-4" />
        </button>

        {/* Collapse All Branches (Icon-only) */}
        <button
          onClick={onCollapseAll}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
          title="طي كافة الفروع"
        >
          <FoldHorizontal className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-300 dark:bg-white/10 mx-0.5" />

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-stone-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
          title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 4. Floating Helper Legend in Bottom-Right Corner */}
      <div className="hidden sm:flex absolute bottom-4 end-4 z-20 items-center gap-3 px-3 py-1.5 rounded-xl bg-white/85 dark:bg-[#07130E]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-[10px] text-slate-600 dark:text-stone-300 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-[#d97706] rounded-full" /> المستوى 1 (رئيسي)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-[#0d9488] rounded-full" /> المستوى 2 (إدارات)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-[#10b981] rounded-full" /> المستوى 3 (أقسام)
        </span>
        <span className="text-slate-400 dark:text-stone-400 font-mono">اسحب للتحريك • عجلة الماوس للتكبير</span>
      </div>
    </div>
  );
};
