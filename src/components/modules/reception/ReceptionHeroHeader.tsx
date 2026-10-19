import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { ReceptionStats } from '../../../services/receptionStorage';
import {
  ConciergeBell,
  Users,
  Building2,
  Package,
  PhoneCall,
  HardHat,
  Sparkles,
  Calendar
} from 'lucide-react';

interface ReceptionHeroHeaderProps {
  stats: ReceptionStats;
  activeCompanyId: string;
  activeBranchId: string;
  companyName: string;
  onRefresh: () => void;
  isSyncing?: boolean;
}

export const ReceptionHeroHeader: React.FC<ReceptionHeroHeaderProps> = ({
  stats,
  companyName,
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
    let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 24 }, () => ({
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

      // 1. Moving 3D Grid
      ctx.save();
      ctx.strokeStyle = isDark ? 'rgba(217, 155, 38, 0.08)' : 'rgba(217, 155, 38, 0.13)';
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

      // 2. Orbital 3D Rings
      ctx.save();
      const ringX = isRtl ? width * 0.15 : width * 0.85;
      const ringY = height * 0.5 + parallax.y * 10;
      ctx.translate(ringX + parallax.x * 12, ringY);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.ellipse(0, 0, 55, 18, angle * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 155, 38, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 3. Floating Gold Sparks
      particles.forEach(p => {
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
          : `rgba(217, 155, 38, ${p.alpha * 0.85})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [parallax, isRtl]);

  return (
    <div
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setParallax({
          x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
        });
      }}
      onMouseLeave={() => setParallax({ x: 0, y: 0 })}
      className="relative overflow-hidden rounded-3xl border border-amber-500/25 dark:border-amber-500/35 bg-gradient-to-br from-[#FFFDF9] via-[#FEF9EE] to-[#FDF3DC] dark:from-[#07130E] dark:via-[#0D1F17] dark:to-[#132A1F] p-5 sm:p-7 shadow-[0_12px_35px_rgba(217,155,38,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_25px_rgba(245,158,11,0.12)] transition-all duration-300 select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-80" />
      <div className="absolute -top-24 -end-24 w-80 h-80 bg-gradient-to-bl from-amber-400/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Module Title & Brand Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-mono font-black tracking-widest uppercase text-amber-600 dark:text-amber-400">
              ECO • FRONT DESK & RECEPTION
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              <Building2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>{companyName}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-[#F3EFE6] tracking-tight drop-shadow-xs flex items-center gap-2.5">
            <ConciergeBell className="w-8 h-8 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{t('منظومة الاستقبال والزوار وإدارة المنشأة', 'Front Desk, Visitors & Facility Operations')}</span>
          </h1>

          <p className="text-xs text-slate-600 dark:text-[#8FA392] max-w-xl leading-relaxed">
            {t(
              'إدارة رقمية متكاملة لتدفق الزوار، حجز القاعات ومتابعة الضيافة، قيد الطرود والشحنات، توثيق المكالمات، وإصدار تصاريح المقاولين مع التحقق السحابي الفوري.',
              'Unified digital front desk operations for visitor badges, room bookings, parcel couriers, call logs, and contractor access passes with live Cloudflare D1 verification.'
            )}
          </p>
        </div>

        {/* Live Status Indicators & Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/80 dark:bg-[#0E1610]/80 border border-amber-500/25 dark:border-amber-500/35 shadow-2xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-[#F3EFE6]">
              {t('بوابة المنشأة: متصلة ونشطة', 'Facility Gate: Online')}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t('جاري المزامنة...', 'Syncing...') : t('مزامنة سحابية حية', 'Live Sync')}</span>
          </button>
        </div>
      </div>

      {/* Live 5-KPI Facility Metrics Strip */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5 mt-5 border-t border-amber-500/15">
        {/* 1. Visitors Inside */}
        <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#0E1610]/85 border border-amber-500/20 dark:border-amber-500/30 shadow-2xs backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block font-medium truncate">
              {t('زوار بالمنشأة حالياً', 'Visitors Inside')}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                {stats.visitorsInside}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                / {stats.visitorsTotal} {t('إجمالي', 'total')}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Room Occupancy */}
        <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#0E1610]/85 border border-amber-500/20 dark:border-amber-500/30 shadow-2xs backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block font-medium truncate">
              {t('قاعات اجتماعات نشطة', 'Active Meetings')}
            </span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-[#F3EFE6] block mt-0.5">
              {stats.roomsOccupied} {t('قاعات', 'rooms')}
            </span>
          </div>
        </div>

        {/* 3. Pending Parcels */}
        <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#0E1610]/85 border border-amber-500/20 dark:border-amber-500/30 shadow-2xs backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block font-medium truncate">
              {t('طرود في الاستقبال', 'Pending Parcels')}
            </span>
            <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-400 block mt-0.5">
              {stats.parcelsPending} {t('شحنات', 'parcels')}
            </span>
          </div>
        </div>

        {/* 4. Pending Calls */}
        <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#0E1610]/85 border border-amber-500/20 dark:border-amber-500/30 shadow-2xs backdrop-blur-md flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block font-medium truncate">
              {t('مكالمات بانتظار الرد', 'Pending Inquiries')}
            </span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-[#F3EFE6] block mt-0.5">
              {stats.callsPending} {t('مكالمة', 'calls')}
            </span>
          </div>
        </div>

        {/* 5. Active Contractor Permits */}
        <div className="p-3 rounded-2xl bg-white/85 dark:bg-[#0E1610]/85 border border-amber-500/20 dark:border-amber-500/30 shadow-2xs backdrop-blur-md flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <HardHat className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 dark:text-[#8FA392] block font-medium truncate">
              {t('تصاريح فنية سارية', 'Contractor Permits')}
            </span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-[#F3EFE6] block mt-0.5">
              {stats.permitsActive} {t('تصاريح', 'permits')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
