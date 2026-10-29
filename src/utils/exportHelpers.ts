/**
 * ECO ERP - Comprehensive Organizational Structure Export Suite
 * Supports:
 * 1. 🖼️ Ultra-HD High-Resolution PNG (4K Poster Export)
 * 2. 📊 Executive PowerPoint Presentation (.pptx)
 * 3. 📄 Certified Vector PDF (A3/A2 Architectural Blueprint)
 */

import { DepartmentOrg } from '../components/modules/companies/types';
import { computeHierarchyLevels } from '../components/modules/companies/departmentStorage';
import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export interface OrgExportOptions {
  departments: DepartmentOrg[];
  companyName?: string;
  isDark?: boolean;
  onProgress?: (status: string) => void;
}

// Tree Dimension Standards for Export
const NODE_W = 280;
const NODE_H = 130;
const COL_GAP = 120;
const UNIT_H = 160;

interface ExportLayoutNode {
  x: number;
  y: number;
  level: number;
  dept: DepartmentOrg;
  children: DepartmentOrg[];
}

/**
 * Builds deterministic full-tree coordinates with 100% of branches expanded
 */
function computeFullTreeLayout(departments: DepartmentOrg[], direction: 'ltr' | 'rtl' = 'ltr') {
  const fullLevels = computeHierarchyLevels(departments);
  const allIds = new Set(fullLevels.map(d => d.id));
  const childrenMap = new Map<string, DepartmentOrg[]>();

  fullLevels.forEach(d => {
    if (d.parentId && allIds.has(d.parentId)) {
      const arr = childrenMap.get(d.parentId) || [];
      arr.push(d);
      childrenMap.set(d.parentId, arr);
    }
  });

  const roots = fullLevels.filter(d => !d.parentId || !allIds.has(d.parentId));
  const coordsMap = new Map<string, ExportLayoutNode>();

  function layoutSubtree(node: DepartmentOrg, level: number, topY: number): number {
    const children = childrenMap.get(node.id) || [];
    const hasChildren = children.length > 0;

    let totalUnits = 0;
    let calculatedY = topY;

    if (!hasChildren) {
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

      calculatedY = childYs.length > 0
        ? (childYs[0] + childYs[childYs.length - 1]) / 2
        : topY + (UNIT_H - NODE_H) / 2;
    }

    const x = direction === 'ltr'
      ? level * (NODE_W + COL_GAP)
      : -level * (NODE_W + COL_GAP);

    coordsMap.set(node.id, {
      x,
      y: calculatedY,
      level,
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
    coordsMap,
    roots,
    childrenMap,
    boundingBox: {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  };
}

/**
 * Escapes XML / SVG entities safely
 */
function escapeXml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates razor-sharp SVG source string for the full Mind Map poster
 */
export function generateOrgStructureSVG(options: OrgExportOptions): {
  svgString: string;
  width: number;
  height: number;
} {
  const { departments, companyName = 'المؤسسة', isDark = true } = options;
  const layout = computeFullTreeLayout(departments, 'ltr');
  const { coordsMap, boundingBox } = layout;

  const headerH = 180;
  const footerH = 140;
  const padX = 100;
  const padY = 50;

  const totalW = Math.max(boundingBox.width + padX * 2, 2800);
  const totalH = boundingBox.height + headerH + footerH + padY * 2;

  const originX = padX - boundingBox.minX;
  const originY = headerH + padY - boundingBox.minY;

  const bgFill = isDark ? '#07130E' : '#FAF7F0';
  const cardBg = isDark ? '#0D1F17' : '#FFFFFF';
  const textTitleColor = isDark ? '#F3EFE6' : '#0F172A';
  const textSubColor = isDark ? '#D97706' : '#B45309';
  const textMutedColor = isDark ? '#9CA3AF' : '#64748B';
  const cardBorderBase = isDark ? 'rgba(217, 119, 6, 0.35)' : 'rgba(217, 119, 6, 0.25)';
  const gridDotColor = isDark ? 'rgba(217, 119, 6, 0.08)' : 'rgba(160, 140, 100, 0.12)';

  const dateStr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build SVG connector paths
  let connectorPathsSvg = '';
  coordsMap.forEach(parent => {
    if (parent.children.length === 0) return;
    const pX = parent.x + originX + NODE_W;
    const pY = parent.y + originY + NODE_H / 2;

    parent.children.forEach(child => {
      const childCoord = coordsMap.get(child.id);
      if (!childCoord) return;
      const cX = childCoord.x + originX;
      const cY = childCoord.y + originY + NODE_H / 2;

      const midX = pX + (cX - pX) * 0.5;
      const d = `M ${pX} ${pY} C ${midX} ${pY}, ${midX} ${cY}, ${cX} ${cY}`;

      let strokeColor = '#D97706';
      let strokeW = 2.5;
      if (parent.level === 1) {
        strokeColor = '#0D9488';
        strokeW = 2.2;
      } else if (parent.level >= 2) {
        strokeColor = '#059669';
        strokeW = 1.8;
      }

      connectorPathsSvg += `
        <path d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${strokeW}" stroke-linecap="round" opacity="0.85" />
      `;
    });
  });

  // Build SVG Node Cards
  let nodesSvg = '';
  coordsMap.forEach(item => {
    const { dept, level } = item;
    const nX = item.x + originX;
    const nY = item.y + originY;

    let levelBadgeBg = isDark ? 'rgba(217, 119, 6, 0.2)' : 'rgba(217, 119, 6, 0.12)';
    let levelBadgeText = isDark ? '#F59E0B' : '#B45309';
    let levelBorder = isDark ? 'rgba(217, 119, 6, 0.4)' : 'rgba(217, 119, 6, 0.3)';
    let levelLabel = 'المستوى 1: القيادة';

    if (level === 1) {
      levelBadgeBg = isDark ? 'rgba(13, 148, 136, 0.2)' : 'rgba(13, 148, 136, 0.12)';
      levelBadgeText = isDark ? '#2DD4BF' : '#0F766E';
      levelBorder = isDark ? 'rgba(13, 148, 136, 0.4)' : 'rgba(13, 148, 136, 0.3)';
      levelLabel = 'المستوى 2: إدارات عامة';
    } else if (level === 2) {
      levelBadgeBg = isDark ? 'rgba(5, 150, 105, 0.2)' : 'rgba(5, 150, 105, 0.12)';
      levelBadgeText = isDark ? '#34D399' : '#047857';
      levelBorder = isDark ? 'rgba(5, 150, 105, 0.4)' : 'rgba(5, 150, 105, 0.3)';
      levelLabel = 'المستوى 3: أقسام فرعية';
    } else if (level >= 3) {
      levelBadgeBg = isDark ? 'rgba(120, 113, 108, 0.2)' : 'rgba(120, 113, 108, 0.12)';
      levelBadgeText = isDark ? '#D6D3D1' : '#57534E';
      levelBorder = isDark ? 'rgba(120, 113, 108, 0.4)' : 'rgba(120, 113, 108, 0.3)';
      levelLabel = 'المستوى 4: مهام ووحدات';
    }

    const titleAr = escapeXml(dept.nameAr || '');
    const titleEn = escapeXml(dept.titleEn || dept.nameEn || '');
    const headAr = escapeXml(dept.headAr || 'غير محدد');
    const code = escapeXml(dept.code || 'DEPT');
    const costCenter = escapeXml(dept.costCenterCode || '');
    const staff = dept.staffCount || 0;

    nodesSvg += `
      <g transform="translate(${nX}, ${nY})">
        <!-- Card Background -->
        <rect width="${NODE_W}" height="${NODE_H}" rx="16" ry="16" fill="${cardBg}" stroke="${levelBorder}" stroke-width="1.5" />
        
        <!-- Top Badges -->
        <g transform="translate(14, 16)">
          <!-- Code Pill -->
          <rect width="65" height="20" rx="5" fill="${levelBadgeBg}" stroke="${levelBorder}" stroke-width="1" />
          <text x="32" y="14" fill="${levelBadgeText}" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">${code}</text>

          ${costCenter ? `
            <g transform="translate(72, 0)">
              <rect width="60" height="20" rx="5" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
              <text x="30" y="14" fill="#10B981" font-size="9" font-weight="bold" font-family="monospace" text-anchor="middle">${costCenter}</text>
            </g>
          ` : ''}

          <!-- Level Badge -->
          <g transform="translate(150, 0)">
            <rect width="102" height="20" rx="10" fill="${levelBadgeBg}" stroke="${levelBorder}" stroke-width="1" />
            <text x="51" y="14" fill="${levelBadgeText}" font-size="9.5" font-weight="bold" font-family="sans-serif" text-anchor="middle">${levelLabel}</text>
          </g>
        </g>

        <!-- Department Arabic Name -->
        <text x="${NODE_W - 14}" y="62" fill="${textTitleColor}" font-size="13" font-weight="bold" font-family="sans-serif" text-anchor="end">${titleAr}</text>

        <!-- Department English Title -->
        ${titleEn ? `
          <text x="${NODE_W - 14}" y="80" fill="${textSubColor}" font-size="10" font-family="sans-serif" text-anchor="end">${titleEn}</text>
        ` : ''}

        <!-- Divider Line -->
        <line x1="14" y1="92" x2="${NODE_W - 14}" y2="92" stroke="${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}" stroke-width="1" />

        <!-- Footer Row: Manager Name & Staff Count -->
        <g transform="translate(14, 114)">
          <!-- Manager -->
          <text x="${NODE_W - 28}" y="0" fill="${textMutedColor}" font-size="10.5" font-family="sans-serif" text-anchor="end">👤 ${headAr}</text>
          
          <!-- Staff Count -->
          <text x="0" y="0" fill="${textTitleColor}" font-size="11" font-weight="bold" font-family="monospace">👥 ${staff}</text>
        </g>
      </g>
    `;
  });

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
      <defs>
        <!-- Background Dot Grid Pattern -->
        <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.2" fill="${gridDotColor}" />
        </pattern>
        <!-- Gold Glow Filter -->
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      <!-- Main Background -->
      <rect width="${totalW}" height="${totalH}" fill="${bgFill}" />
      <rect width="${totalW}" height="${totalH}" fill="url(#gridPattern)" />

      <!-- Top Executive Header Banner -->
      <g transform="translate(${padX}, 40)">
        <!-- Emblem / Brand Ribbon -->
        <rect width="${totalW - padX * 2}" height="100" rx="20" fill="${isDark ? '#0D1F17' : '#FFFFFF'}" stroke="${cardBorderBase}" stroke-width="1.5" />
        
        <!-- Right Side: Company & System Title -->
        <text x="${totalW - padX * 2 - 30}" y="42" fill="${isDark ? '#F59E0B' : '#D97706'}" font-size="22" font-weight="black" font-family="sans-serif" text-anchor="end">${escapeXml(companyName)}</text>
        <text x="${totalW - padX * 2 - 30}" y="72" fill="${textTitleColor}" font-size="15" font-weight="bold" font-family="sans-serif" text-anchor="end">الهيكل التنظيمي المعتمد والإدارات التنفيذية • المخطط العام</text>

        <!-- Left Side: Metadata Badges -->
        <g transform="translate(30, 28)">
          <rect width="180" height="42" rx="12" fill="${levelBadgeBgFallback(isDark)}" stroke="${cardBorderBase}" stroke-width="1" />
          <text x="90" y="26" fill="${isDark ? '#F59E0B' : '#B45309'}" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">📊 ${departments.length} وحدة إدارية معتمدة</text>
        </g>
        <g transform="translate(225, 28)">
          <rect width="170" height="42" rx="12" fill="${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}" stroke="${cardBorderBase}" stroke-width="1" />
          <text x="85" y="26" fill="${textMutedColor}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">📅 ${dateStr}</text>
        </g>
        <g transform="translate(410, 28)">
          <rect width="210" height="42" rx="12" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
          <text x="105" y="26" fill="#10B981" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">🛡️ منظومة ECO ERP المؤسسية</text>
        </g>
      </g>

      <!-- Connecting SVG Bezier Lines -->
      <g>
        ${connectorPathsSvg}
      </g>

      <!-- Department Node Cards -->
      <g>
        ${nodesSvg}
      </g>

      <!-- Bottom Accreditation & Signature Block -->
      <g transform="translate(${padX}, ${totalH - 110})">
        <rect width="${totalW - padX * 2}" height="80" rx="16" fill="${isDark ? '#0D1F17' : '#FFFFFF'}" stroke="${cardBorderBase}" stroke-width="1.5" />
        
        <!-- Box 1: Owner / CEO Approval -->
        <g transform="translate(${totalW - padX * 2 - 320}, 20)">
          <text x="150" y="16" fill="${textMutedColor}" font-size="11" font-family="sans-serif" text-anchor="middle">اعتماد رئيس مجلس الإدارة / المالك</text>
          <line x1="20" y1="36" x2="280" y2="36" stroke="${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}" stroke-width="1" stroke-dasharray="4 4" />
        </g>

        <!-- Box 2: Official System Stamp -->
        <g transform="translate(${(totalW - padX * 2) / 2 - 130}, 16)">
          <rect width="260" height="48" rx="10" fill="${isDark ? 'rgba(217, 119, 6, 0.12)' : 'rgba(217, 119, 6, 0.08)'}" stroke="${isDark ? '#F59E0B' : '#D97706'}" stroke-width="1.5" stroke-dasharray="6 3" />
          <text x="130" y="24" fill="${isDark ? '#F59E0B' : '#D97706'}" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">خاتم الاعتماد والرقابة المؤسسية</text>
          <text x="130" y="40" fill="${textMutedColor}" font-size="9" font-family="monospace" text-anchor="middle">ECO CERTIFIED • VERIFIED</text>
        </g>

        <!-- Box 3: HR Director Approval -->
        <g transform="translate(40, 20)">
          <text x="150" y="16" fill="${textMutedColor}" font-size="11" font-family="sans-serif" text-anchor="middle">مدير عام الموارد البشرية والشؤون الإدارية</text>
          <line x1="20" y1="36" x2="280" y2="36" stroke="${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}" stroke-width="1" stroke-dasharray="4 4" />
        </g>
      </g>
    </svg>
  `;

  return {
    svgString,
    width: totalW,
    height: totalH
  };
}

function levelBadgeBgFallback(isDark: boolean) {
  return isDark ? 'rgba(217, 119, 6, 0.2)' : 'rgba(217, 119, 6, 0.12)';
}

/**
 * 1. 🖼️ Ultra-HD High-Resolution PNG (4K Poster Export)
 * Renders full hierarchy tree into a 4K ultra-sharp raster poster
 */
export async function exportOrgStructureAs4KPNG(options: OrgExportOptions): Promise<void> {
  const { onProgress, companyName = 'المؤسسة' } = options;
  if (onProgress) onProgress('جاري معالجة وتجهيز الصورة فائقة الدقة (4K)...');

  const { svgString, width, height } = generateOrgStructureSVG(options);

  // Compute 4K Ultra-HD Scaling
  // Standard 4K width is 3840px
  const targetWidth = Math.max(width * 1.5, 3840);
  const scale = targetWidth / width;
  const targetHeight = Math.round(height * scale);

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = (err) => reject(new Error('فشل تحميل مسار الرسم الشعاعي لتحويله لصورة 4K: ' + String(err)));
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error('تعذر إنشاء سياق رسم ثنائي الأبعاد Canvas 2D');
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  URL.revokeObjectURL(url);

  if (onProgress) onProgress('جاري تحويل الصورة وضغط ملف الـ PNG عالي الجودة...');

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('فشل توليد ملف الـ Blob للصورة'));
          return;
        }
        const cleanName = companyName.trim().replace(/\s+/g, '_');
        saveAs(blob, `الهيكل_التنظيمي_المعتمد_${cleanName}_4K.png`);
        resolve();
      },
      'image/png',
      1.0
    );
  });
}

/**
 * 2. 📊 Executive PowerPoint Presentation (.pptx)
 * Multi-slide presentation: Title slide, Executive overview, and Sector deep-dives
 */
export async function exportOrgStructureAsPPTX(options: OrgExportOptions): Promise<void> {
  const { departments, companyName = 'المؤسسة', onProgress } = options;
  if (onProgress) onProgress('جاري إنشاء العرض التقديمي التنفيذي (PowerPoint)...');

  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE'; // 16:9 widescreen
  pptx.rtlMode = true;

  const fullLevels = computeHierarchyLevels(departments);
  const rootDept = fullLevels.find(d => !d.parentId) || fullLevels[0];
  const level1Depts = fullLevels.filter(d => d.parentId === rootDept?.id || Number(d.level) === 1);

  const dateStr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // SLIDE 1: Title Slide (Dark Royal Olive & Amber Gold)
  const slide1 = pptx.addSlide();
  slide1.background = { color: '07130E' };

  // Decorative Border Box
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 0.6,
    w: 11.73,
    h: 6.3,
    fill: { color: '0D1F17' },
    line: { color: 'D97706', width: 2 }
  });

  // Top Tag
  slide1.addText('ECO ERP • ENTERPRISE OPERATIONS & GOVERNANCE', {
    x: 1.5,
    y: 1.2,
    w: 10.33,
    h: 0.4,
    fontSize: 12,
    color: 'D97706',
    bold: true,
    align: 'center',
    fontFace: 'Arial'
  });

  // Company Name
  slide1.addText(companyName, {
    x: 1.5,
    y: 2.0,
    w: 10.33,
    h: 1.1,
    fontSize: 32,
    color: 'F59E0B',
    bold: true,
    align: 'center',
    fontFace: 'Arial'
  });

  // Presentation Subtitle
  slide1.addText('الهيكل التنظيمي المعتمد والإدارات التنفيذية', {
    x: 1.5,
    y: 3.2,
    w: 10.33,
    h: 0.7,
    fontSize: 22,
    color: 'F3EFE6',
    bold: true,
    align: 'center',
    fontFace: 'Arial'
  });

  // Gold Separator Line
  slide1.addShape(pptx.ShapeType.line, {
    x: 4.66,
    y: 4.1,
    w: 4.0,
    h: 0,
    line: { color: 'F59E0B', width: 2 }
  });

  // Metadata Summary Badges
  slide1.addText(`إجمالي الوحدات الإدارية: ${departments.length} وحدة معتمدة  •  تاريخ الإصدار: ${dateStr}`, {
    x: 1.5,
    y: 4.4,
    w: 10.33,
    h: 0.5,
    fontSize: 13,
    color: '9CA3AF',
    align: 'center',
    fontFace: 'Arial'
  });

  slide1.addText('وثيقة حوكمة إدارية سرية معتمدة صادرة آلياً عن المنظومة', {
    x: 1.5,
    y: 5.6,
    w: 10.33,
    h: 0.4,
    fontSize: 10,
    color: '6B7280',
    align: 'center',
    fontFace: 'Arial'
  });

  // SLIDE 2: Executive Overview (Owner/CEO & Level 1 Directors)
  const slide2 = pptx.addSlide();
  slide2.background = { color: '07130E' };

  // Slide Header
  slide2.addText('نظرة عامة على القيادة العليا والإدارات التنفيذية', {
    x: 0.8,
    y: 0.5,
    w: 11.73,
    h: 0.5,
    fontSize: 20,
    color: 'F59E0B',
    bold: true,
    align: 'right',
    fontFace: 'Arial'
  });

  slide2.addText(`${companyName} • المستوى 1 و 2 من الهيكل المؤسسي`, {
    x: 0.8,
    y: 1.0,
    w: 11.73,
    h: 0.35,
    fontSize: 11,
    color: '9CA3AF',
    align: 'right',
    fontFace: 'Arial'
  });

  // Root Node (CEO / Owner) Top Card
  if (rootDept) {
    slide2.addShape(pptx.ShapeType.roundRect, {
      x: 4.16,
      y: 1.5,
      w: 5.0,
      h: 1.1,
      fill: { color: '1A3327' },
      line: { color: 'F59E0B', width: 2 }
    });
    slide2.addText(rootDept.nameAr, {
      x: 4.26,
      y: 1.6,
      w: 4.8,
      h: 0.4,
      fontSize: 14,
      color: 'F59E0B',
      bold: true,
      align: 'center',
      fontFace: 'Arial'
    });
    slide2.addText(`المدير المسؤول: ${rootDept.headAr || 'غير محدد'}  |  الكود: ${rootDept.code || 'EXEC-001'}`, {
      x: 4.26,
      y: 2.05,
      w: 4.8,
      h: 0.35,
      fontSize: 10,
      color: 'F3EFE6',
      align: 'center',
      fontFace: 'Arial'
    });
  }

  // 8 Level-1 Executive Departments in a 4x2 Grid
  const gridDepts = level1Depts.slice(0, 8);
  const cols = 4;
  const cardW = 2.75;
  const cardH = 1.6;
  const startX = 0.8;
  const startY = 2.9;
  const gapX = 0.24;
  const gapY = 0.3;

  gridDepts.forEach((dept, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);
    const x = startX + colIdx * (cardW + gapX);
    const y = startY + rowIdx * (cardH + gapY);

    slide2.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: '0D1F17' },
      line: { color: '0D9488', width: 1.5 }
    });

    // Code & CC Header
    slide2.addText(`${dept.code || 'DEPT'} ${dept.costCenterCode ? '• ' + dept.costCenterCode : ''}`, {
      x: x + 0.1,
      y: y + 0.12,
      w: cardW - 0.2,
      h: 0.25,
      fontSize: 9,
      color: '2DD4BF',
      fontFace: 'Arial',
      align: 'center'
    });

    // Dept Name
    slide2.addText(dept.nameAr, {
      x: x + 0.1,
      y: y + 0.4,
      w: cardW - 0.2,
      h: 0.45,
      fontSize: 11,
      color: 'FFFFFF',
      bold: true,
      fontFace: 'Arial',
      align: 'center'
    });

    // Manager & Staff
    slide2.addText(`👤 ${dept.headAr || 'غير محدد'}`, {
      x: x + 0.1,
      y: y + 0.9,
      w: cardW - 0.2,
      h: 0.25,
      fontSize: 9.5,
      color: 'D97706',
      fontFace: 'Arial',
      align: 'center'
    });

    slide2.addText(`👥 ${dept.staffCount || 0} موظف`, {
      x: x + 0.1,
      y: y + 1.2,
      w: cardW - 0.2,
      h: 0.25,
      fontSize: 9.5,
      color: '9CA3AF',
      fontFace: 'Arial',
      align: 'center'
    });
  });

  // SLIDES 3 to 10: Department Deep-Dives
  level1Depts.slice(0, 8).forEach((secDept, secIdx) => {
    const subUnits = fullLevels.filter(d => d.parentId === secDept.id);

    const slideSec = pptx.addSlide();
    slideSec.background = { color: '07130E' };

    // Slide Header
    slideSec.addText(`القطاع ${secIdx + 1}: ${secDept.nameAr}`, {
      x: 0.8,
      y: 0.5,
      w: 11.73,
      h: 0.5,
      fontSize: 20,
      color: 'F59E0B',
      bold: true,
      align: 'right',
      fontFace: 'Arial'
    });

    slideSec.addText(`التفاصيل التنظيمية، الوحدات التابعة، ونطاق الاختصاصات`, {
      x: 0.8,
      y: 1.0,
      w: 11.73,
      h: 0.3,
      fontSize: 11,
      color: '9CA3AF',
      align: 'right',
      fontFace: 'Arial'
    });

    // Sector Overview Bar
    slideSec.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.45,
      w: 11.73,
      h: 0.85,
      fill: { color: '0D1F17' },
      line: { color: 'D97706', width: 1.5 }
    });

    slideSec.addText(
      `المدير التنفيذي: ${secDept.headAr || 'غير محدد'}   |   الكود: ${secDept.code || 'DEPT'}   |   مركز التكلفة: ${secDept.costCenterCode || 'غير محدد'}   |   إجمالي الكادر: ${secDept.staffCount || 0} موظف`,
      {
        x: 1.0,
        y: 1.6,
        w: 11.33,
        h: 0.5,
        fontSize: 12,
        color: 'F3EFE6',
        bold: true,
        align: 'center',
        fontFace: 'Arial'
      }
    );

    // Sub-units Cards Grid
    if (subUnits.length === 0) {
      slideSec.addText('لا توجد إدارات أو أقسام فرعية مسجلة حالياً تحت هذا القطاع', {
        x: 1.0,
        y: 3.2,
        w: 11.33,
        h: 0.8,
        fontSize: 14,
        color: '9CA3AF',
        align: 'center',
        fontFace: 'Arial'
      });
    } else {
      const subCols = Math.min(subUnits.length, 3);
      const subCardW = (11.73 - (subCols - 1) * 0.3) / subCols;
      const subCardH = 3.8;
      const subStartY = 2.6;

      subUnits.slice(0, 6).forEach((sub, sIdx) => {
        const cCol = sIdx % 3;
        const cRow = Math.floor(sIdx / 3);
        const sX = 0.8 + cCol * (subCardW + 0.3);
        const sY = subStartY + cRow * (subCardH / 2 + 0.2);

        const currentH = subUnits.length > 3 ? 1.8 : 3.8;

        slideSec.addShape(pptx.ShapeType.roundRect, {
          x: sX,
          y: sY,
          w: subCardW,
          h: currentH,
          fill: { color: '0D1F17' },
          line: { color: '10B981', width: 1 }
        });

        slideSec.addText(sub.nameAr, {
          x: sX + 0.15,
          y: sY + 0.15,
          w: subCardW - 0.3,
          h: 0.35,
          fontSize: 12,
          color: 'FFFFFF',
          bold: true,
          align: 'right',
          fontFace: 'Arial'
        });

        slideSec.addText(`الكود: ${sub.code}  |  المسؤول: ${sub.headAr || 'غير محدد'}  |  الكادر: ${sub.staffCount || 0} موظف`, {
          x: sX + 0.15,
          y: sY + 0.55,
          w: subCardW - 0.3,
          h: 0.3,
          fontSize: 9.5,
          color: 'D97706',
          align: 'right',
          fontFace: 'Arial'
        });

        if (sub.responsibilities) {
          slideSec.addText(`المهام: ${sub.responsibilities}`, {
            x: sX + 0.15,
            y: sY + 0.9,
            w: subCardW - 0.3,
            h: currentH - 1.0,
            fontSize: 9,
            color: '9CA3AF',
            align: 'right',
            fontFace: 'Arial'
          });
        }
      });
    }
  });

  if (onProgress) onProgress('جاري تصدير وحفظ ملف العرض التقديمي (.pptx)...');

  const cleanName = companyName.trim().replace(/\s+/g, '_');
  await pptx.writeFile({ fileName: `عرض_تقديمي_الهيكل_التنظيمي_${cleanName}.pptx` });
}

/**
 * 3. 📄 Certified Vector PDF (A3/A2 Architectural Blueprint)
 * Generates an executive A3 Landscape blueprint PDF with complete tree, headers & signatures
 */
export async function exportOrgStructureAsPDF(options: OrgExportOptions): Promise<void> {
  const { onProgress, companyName = 'المؤسسة' } = options;
  if (onProgress) onProgress('جاري إعداد وثيقة المخطط الهندسي المعتمد (PDF A3)...');

  // Generate High-Res SVG & Rasterize for crisp embedding in jsPDF
  const { svgString, width, height } = generateOrgStructureSVG(options);

  const targetWidth = Math.max(width, 3200);
  const scale = targetWidth / width;
  const targetHeight = Math.round(height * scale);

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = (err) => reject(new Error('فشل معالجة المخطط لتضمينه في ملف الـ PDF: ' + String(err)));
    image.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error('تعذر إنشاء سياق رسم ثنائي الأبعاد Canvas 2D');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  URL.revokeObjectURL(url);

  const pngDataUrl = canvas.toDataURL('image/png', 0.95);

  if (onProgress) onProgress('جاري بناء صفحات وتنسيق وثيقة الـ PDF الرسمية...');

  // Create A3 Landscape PDF (420mm x 297mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  const pageW = 420;
  const pageH = 297;
  const margin = 10;

  // Background
  doc.setFillColor(7, 19, 14); // Deep Royal Olive #07130E
  doc.rect(0, 0, pageW, pageH, 'F');

  // Gold Outer Border
  doc.setDrawColor(217, 119, 6); // Amber #D97706
  doc.setLineWidth(1.2);
  doc.roundedRect(margin, margin, pageW - margin * 2, pageH - margin * 2, 4, 4, 'S');

  // Embed Hierarchy Blueprint Image
  // Fit within the available space between header and footer
  const imgAreaH = pageH - 28;
  const imgAreaW = pageW - margin * 2 - 8;

  // Calculate proportional dimensions
  const imgAspect = targetWidth / targetHeight;
  let drawW = imgAreaW;
  let drawH = drawW / imgAspect;

  if (drawH > imgAreaH) {
    drawH = imgAreaH;
    drawW = drawH * imgAspect;
  }

  const drawX = (pageW - drawW) / 2;
  const drawY = (pageH - drawH) / 2;

  doc.addImage(pngDataUrl, 'PNG', drawX, drawY, drawW, drawH, undefined, 'FAST');

  const cleanName = companyName.trim().replace(/\s+/g, '_');
  doc.save(`الهيكل_التنظيمي_المعتمد_${cleanName}_A3.pdf`);
}
