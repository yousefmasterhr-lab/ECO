import React, { useState, useEffect } from 'react';
import {
  CloudUpload,
  RefreshCw,
  Sparkles,
  Server,
  Database,
  Lock,
  CheckCircle2,
  Cpu,
  Radio
} from 'lucide-react';
import { systemUpdateService, MaintenanceInfo } from '../../services/systemUpdateService';

interface CinematicUpdateOverlayProps {
  forcePreview?: boolean;
  onClosePreview?: () => void;
}

export const CinematicUpdateOverlay: React.FC<CinematicUpdateOverlayProps> = ({
  forcePreview = false,
  onClosePreview,
}) => {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(false);
  const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenanceInfo>({
    active: false,
    title: 'جاري تحديث وترقية النظام السحابي',
    message: 'برجاء عدم استخدام الموقع الآن لحين رفع التحديث برجاء الانتظار حتى يتم الانتهاء وإعادة تحميل الصفحة',
    estimatedMinutes: 3,
  });
  const [hasNewVersion, setHasNewVersion] = useState<boolean>(false);
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(68);
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    // Subscribe to live maintenance & version updates
    const unsubscribe = systemUpdateService.subscribe((state) => {
      setIsMaintenance(state.isMaintenance);
      setMaintenanceInfo(state.maintenanceInfo);
      setHasNewVersion(state.hasNewVersion);

      // If a new version was detected while not in maintenance, trigger the reload sequence
      if (state.hasNewVersion && !state.isMaintenance && !forcePreview) {
        handleTriggerSignOutAndReload();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [forcePreview]);

  // Simulate smooth progress pulse during maintenance
  useEffect(() => {
    if (!isMaintenance && !forcePreview) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 94) return 72;
        return prev + 2;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isMaintenance, forcePreview]);

  // Recheck countdown timer
  useEffect(() => {
    if (!isMaintenance && !forcePreview) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          systemUpdateService.checkForUpdates();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMaintenance, forcePreview]);

  const handleTriggerSignOutAndReload = () => {
    setIsReloading(true);
    setProgressPercent(100);
    setTimeout(() => {
      systemUpdateService.performAutoSignOutAndReload();
    }, 1800);
  };

  const isVisible = forcePreview || isMaintenance || hasNewVersion;
  if (!isVisible) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden select-none"
      style={{
        backgroundColor: '#030805',
      }}
    >
      {/* Cinematic Ambient Backdrop Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle Cyber Grid */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.25) 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />

        {/* Dynamic Glowing Nebulae */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/15 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[120px]" />

        {/* Ambient Orbit Rays */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <div className="w-[850px] h-[850px] rounded-full border border-emerald-500/20 animate-[spin_60s_linear_infinite]" />
          <div className="absolute w-[680px] h-[680px] rounded-full border border-dashed border-amber-500/25 animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-emerald-400/30 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        </div>
      </div>

      {/* Main Glassmorphic Hero Modal */}
      <div className="relative w-full max-w-2xl mx-4 sm:mx-6 p-6 sm:p-10 rounded-3xl bg-[#07130C]/85 backdrop-blur-3xl border border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.25)] text-[#F3EFE6] z-10 transition-all duration-500">
        
        {/* Top Status Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 border-b border-emerald-950/80">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>ECO CLOUD ENGINE • LIVE DEPLOYMENT</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400/80 bg-[#0E1E14] px-3 py-1.5 rounded-xl border border-emerald-900/60">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>فحص الحالة: {countdown}ث</span>
          </div>
        </div>

        {/* Central Visual Icon & Rings */}
        <div className="flex flex-col items-center text-center mt-6 mb-6">
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            {/* Concentric Rotating Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-[spin_8s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400/40 animate-[spin_12s_linear_infinite_reverse]" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-600/30 via-emerald-500/20 to-amber-500/20 backdrop-blur-md" />
            
            {/* Icon */}
            {isReloading ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            ) : (
              <CloudUpload className="w-12 h-12 text-amber-400 animate-pulse drop-shadow-[0_0_15px_rgba(235,179,77,0.6)]" />
            )}
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3 font-sans">
            {isReloading
              ? 'تم اكتمال رفع التحديث بنجاح!'
              : (maintenanceInfo.title || 'برجاء عدم استخدام الموقع الآن لحين رفع التحديث')}
          </h1>

          {/* Subtitle / Explanations */}
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-lg mb-2">
            {isReloading
              ? 'جاري حفظ الجلسات وتأمين البيانات... ستتم إعادة تحميل الصفحة تلقائياً لتسجيل الدخول بأحدث إصدار.'
              : (maintenanceInfo.message || 'يتم حالياً تثبيت وترقية الإصدار الجديد من النظام السحابي لضمان كفاءة وأمان بيانات المؤسسة.')}
          </p>

          <p className="text-xs sm:text-sm text-amber-300/90 font-medium">
            {isReloading
              ? 'شكراً لانتظاركم • لحظات ويتم التحميل'
              : 'برجاء الانتظار حتى يتم الانتهاء وإعادة تحميل الصفحة تلقائياً.'}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-300/80 px-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isReloading ? 'اكتملت المزامنة بنجاح 100%' : 'جاري مزامنة وترقية الحزم السحابية...'}</span>
            </span>
            <span className="font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-[#0A1810] border border-emerald-950 overflow-hidden relative p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700 relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Live Diagnostics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-950/80 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#091A11]/60 border border-emerald-900/40">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div className="text-right overflow-hidden">
              <div className="text-[11px] text-emerald-400/70 font-mono">سيرفر كلاودفلير</div>
              <div className="text-xs font-bold text-white truncate">متصل ومستقر</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#091A11]/60 border border-emerald-900/40">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="text-right overflow-hidden">
              <div className="text-[11px] text-amber-400/70 font-mono">قاعدة البيانات D1</div>
              <div className="text-xs font-bold text-white truncate">مزامنة وترقية الجداول</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#091A11]/60 border border-emerald-900/40">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="text-right overflow-hidden">
              <div className="text-[11px] text-cyan-400/70 font-mono">تأمين الجلسات</div>
              <div className="text-xs font-bold text-white truncate">تسجيل خروج إجباري</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-emerald-500/70 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>نظام إيكو الشامل • التحديث موحد لكافة الفروع والأجهزة</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {forcePreview ? (
              <button
                type="button"
                onClick={onClosePreview}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-all cursor-pointer"
              >
                إغلاق المعاينة
              </button>
            ) : (
              <button
                type="button"
                onClick={handleTriggerSignOutAndReload}
                disabled={isReloading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                <span>{isReloading ? 'جاري التحديث...' : 'إعادة التحميل الآن'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
