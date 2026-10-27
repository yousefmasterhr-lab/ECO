import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  ShieldCheck,
  RefreshCw,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Users,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';

interface InsuranceHeroHeaderProps {
  stats: {
    totalOps: number;
    pendingOps: number;
    reviewOps: number;
    completedOps: number;
    rejectedOps: number;
    duplicateOps: number;
    activeEmployees: number;
  };
  companies: Array<{ id: string; nameAr: string; nameEn?: string }>;
  selectedCompanyId: string;
  onSelectCompany: (id: string) => void;
  onRefresh: () => void;
  isSyncing?: boolean;
}

export const InsuranceHeroHeader: React.FC<InsuranceHeroHeaderProps> = ({
  stats,
  companies,
  selectedCompanyId,
  onSelectCompany,
  onRefresh,
  isSyncing = false,
}) => {
  const { isRtl, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 900);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 220);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 26 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -Math.random() * 0.3 - 0.1,
      alpha: Math.random() * 0.5 + 0.2,
      dAlpha: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
    }));

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.classList.contains('dark');
      angle += 0.01;

      // 1. 3D Perspective Grid
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.08)' : 'rgba(217, 119, 6, 0.12)';
      ctx.lineWidth = 1;
      const horizonY = height * 0.65;
      const vpX = width * 0.5 + parallax.x * 35;

      for (let x = -width * 0.3; x <= width * 1.3; x += 65) {
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = horizonY; y <= height; y += (height - horizonY) / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Orbital 3D Shield Rings
      ctx.save();
      const ringX = isRtl ? width * 0.14 : width * 0.86;
      const ringY = height * 0.48 + parallax.y * 10;
      ctx.translate(ringX + parallax.x * 12, ringY);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.ellipse(0, 0, 58, 20, angle * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(217, 119, 6, 0.32)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 3. Floating Amber Sparks
      particles.forEach((p) => {
        p.x += p.vx + parallax.x * 0.1;
        p.y += p.vy;
        p.alpha += p.dAlpha;
        if (p.alpha > 0.75 || p.alpha < 0.15) p.dAlpha = -p.dAlpha;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(245, 158, 11, ${p.alpha})`
          : `rgba(217, 119, 6, ${p.alpha * 0.85})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isRtl, parallax.x, parallax.y]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: nx, y: ny });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#FFFDF9] via-[#FEF9EE] to-[#FDF3DC] dark:from-[#07130E] dark:via-[#0D1F17] dark:to-[#11271D] p-5 md:p-6 shadow-xl transition-all duration-300"
    >
      {/* Interactive 3D Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Top Row: Title + Company Scope Selector + Sync */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300/50 shrink-0">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3" />
                  {t('منظومة التأمينات الاجتماعية المصرية (قانون 148)', 'Egyptian Social Insurance Hub')}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-[#F5F2EB] tracking-tight">
                {t(
                  'منظومة التأمينات الاجتماعية والاستمارات الرسمية (س1 / س2 / س6)',
                  'Social Insurance & Official Forms Hub (S1 / S2 / S6)'
                )}
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-[#9PN3A2] dark:text-stone-300 max-w-3xl">
                {t(
                  'إدارة متكاملة لمركز العمليات التأمينية، طباعة ومعاينة الاستمارات الرسمية (س1، س2، س6) بالإحداثيات القياسية، السجل التأميني للعاملين، وعاء الأجور والاشتراكات، ولوحة الفحص والامتثال الدوري.',
                  'Complete management for insurance operations, pixel-accurate S1/S2/S6 government forms, insured workforce registry, statutory wages, and periodic compliance.'
                )}
              </p>
            </div>
          </div>

          {/* Company Filter & Sync Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 dark:bg-[#13261C]/90 border border-amber-500/30 shadow-xs">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <select
                value={selectedCompanyId}
                onChange={(e) => onSelectCompany(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-stone-100 focus:outline-none cursor-pointer min-w-[165px]"
              >
                <option value="all" className="bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100">
                  {t('جميع الشركات والمنشآت', 'All Companies')}
                </option>
                {companies.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-white dark:bg-[#0D1F17] text-slate-900 dark:text-stone-100"
                  >
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{t('مزامنة فورية', 'Live Sync')}</span>
            </button>
          </div>
        </div>

        {/* Live KPI Strip (7 Real-time Counters Starting at 0) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#13261C]/85 border border-amber-500/25 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
                {t('إجمالي العمليات', 'Total Ops')}
              </span>
              <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                {stats.totalOps}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#13261C]/85 border border-amber-500/25 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
                {t('انتظار', 'Pending')}
              </span>
              <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                {stats.pendingOps}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#13261C]/85 border border-amber-500/25 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
                {t('قيد المراجعة', 'In Review')}
              </span>
              <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-300">
                {stats.reviewOps}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#13261C]/85 border border-amber-500/25 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
                {t('مكتمل', 'Completed')}
              </span>
              <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                {stats.completedOps}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#13261C]/85 border border-amber-500/25 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
                {t('مرفوض', 'Rejected')}
              </span>
              <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                {stats.rejectedOps}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#13261C]/85 border border-amber-500/25 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
                {t('مكرر', 'Duplicate')}
              </span>
              <span className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                {stats.duplicateOps}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#13261C]/85 border border-amber-500/25 shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-stone-400 block">
                {t('المؤمن عليهم', 'Insured Staff')}
              </span>
              <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-400">
                {stats.activeEmployees}
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

