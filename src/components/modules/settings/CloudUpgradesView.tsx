import React, { useState, useEffect } from 'react';
import {
  CloudUpload,
  RefreshCw,
  Sparkles,
  Server,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  Lock,
  Eye,
  Radio,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import { systemUpdateService, MaintenanceInfo } from '../../../services/systemUpdateService';
import { CinematicUpdateOverlay } from '../../common/CinematicUpdateOverlay';

export const CloudUpgradesView: React.FC = () => {
  const [clientVersion, setClientVersion] = useState<string>('');
  const [remoteInfo, setRemoteInfo] = useState<{
    version: string;
    buildTimestamp: number;
    maintenance: MaintenanceInfo;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('جاري تحديث وترقية النظام السحابي');
  const [customMessage, setCustomMessage] = useState<string>(
    'برجاء عدم استخدام الموقع الآن لحين رفع التحديث برجاء الانتظار حتى يتم الانتهاء وإعادة تحميل الصفحة'
  );
  const [estimatedMin, setEstimatedMin] = useState<number>(3);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    setClientVersion(systemUpdateService.getClientVersion());
    loadStatus();

    const unsubscribe = systemUpdateService.subscribe((state) => {
      setRemoteInfo({
        version: state.remoteVersion,
        buildTimestamp: state.remoteTimestamp,
        maintenance: state.maintenanceInfo,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      await systemUpdateService.checkForUpdates();
      const state = systemUpdateService.getState();
      setRemoteInfo({
        version: state.remoteVersion,
        buildTimestamp: state.remoteTimestamp,
        maintenance: state.maintenanceInfo,
      });
    } catch (err: any) {
      console.warn('Error checking version:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleStartMaintenance = async () => {
    setIsTriggering(true);
    const success = await systemUpdateService.setMaintenanceMode(true, {
      title: customTitle,
      message: customMessage,
      estimatedMinutes: estimatedMin,
      targetVersion: `1.2.0-build.${Date.now().toString().slice(-6)}`,
    });
    setIsTriggering(false);

    if (success) {
      showToast('تم تفعيل وضع التحديث بنجاح! ستظهر الشاشة السينمائية لجميع المستخدمين فوراً.');
    } else {
      showToast('تعذر تفعيل وضع التحديث، تأكد من اتصال Cloudflare D1.', true);
    }
  };

  const handleFinishMaintenance = async () => {
    setIsTriggering(true);
    const nextVersion = `1.2.0-build.${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.${Date.now().toString().slice(-4)}`;
    const success = await systemUpdateService.setMaintenanceMode(false, {
      targetVersion: nextVersion,
    });
    setIsTriggering(false);

    if (success) {
      showToast('تم إنهاء وضع التحديث! سيتم تسجيل خروج وإعادة تحميل كافة الأجهزة المتصلة تلقائياً.');
    } else {
      showToast('تعذر إنهاء وضع التحديث، يرجى إعادة المحاولة.', true);
    }
  };

  const handleForceDeployBroadcast = async () => {
    if (!confirm('هل أنت متأكد من بث أمر التحديث الإجباري؟ سيقوم النظام بتسجيل خروج كافة المستخدمين فوراً وإعادة تحميل الواجهة.')) {
      return;
    }

    setIsTriggering(true);
    const nextVer = `1.2.0-deploy.${Date.now()}`;
    const success = await systemUpdateService.broadcastDeployUpdate(nextVer);
    setIsTriggering(false);

    if (success) {
      showToast('تم إرسال إشعار التحديث الإجباري بنجاح لكافة الأجهزة!');
    } else {
      showToast('فشل إرسال البث، يرجى مراجعة الاتصال.', true);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-[#E8F0E9] font-sans animate-in fade-in duration-200" dir="rtl">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 border ${
            statusMessage.isError
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. 3D Cinematic Command Hero Banner for Edge Deployments */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FCFBF8] via-[#F8F5EE] to-[#EFE9DC] dark:from-[#0B150E] dark:via-[#102015] dark:to-[#0D1810] border border-[#E0D9CB] dark:border-[#223927] shadow-xl text-slate-900 dark:text-white">
        {/* Animated Perspective 3D Geometric Depth Rings */}
        <div className="absolute top-0 end-0 -mt-16 -me-16 w-80 h-80 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-1/3 -mb-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold">
              <CloudUpload className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>CLOUDFLARE EDGE DEPLOYMENT CONTROLLER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              إدارة التحديثات الحية والترقيات السحابية الشاملة
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8FA392] leading-relaxed">
              تحكم في بث التحديثات لجميع الأجهزة والفروع المتصلة بالنظام. عند تفعيل وضع التحديث تظهر الشاشة السينمائية لجميع المستخدمين، وعند الانتهاء يتم تسجيل الخروج التلقائي وإعادة تحميل الواجهة فوراً.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={loadStatus}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-[#152319] hover:bg-amber-50/70 dark:hover:bg-amber-500/10 border border-slate-200 dark:border-[#223927] hover:border-amber-400 dark:hover:border-amber-500 text-slate-700 dark:text-[#8FA392] hover:text-amber-700 dark:hover:text-amber-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
              <span>تحديث الحالة</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 border border-amber-400/40 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة الشاشة السينمائية</span>
            </button>
          </div>
        </div>

        {/* Real-time Edge Status and Active Node Metrics */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-5 border-t border-slate-200/80 dark:border-[#223927]">
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">شبكة التوزيع الطرفية (Edge)</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloudflare Workers • نشطة</span>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">العقد السحابية المتصلة</span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5 block">100% متزامنة ومحمية</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-[#142319]/80 border border-slate-200/60 dark:border-[#1E3324] backdrop-blur-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-[#8FA392] block">طريقة البث والتحديث</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                <span>تحديث صامت وتزامن فوري</span>
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Radio className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Upgraded 3D Glassmorphic Deployment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Current Client Build */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-xs hover:-translate-y-0.5 hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D7D70] dark:text-[#8FA392]">إصدار المتصفح الحالي</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono mb-1 truncate">
            {clientVersion || '1.2.0-build'}
          </div>
          <div className="text-[11px] text-[#6D7D70] dark:text-[#8FA392] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>الجلسة الحالية نشطة ومحدثة محلياً</span>
          </div>
        </div>

        {/* Card 2: Remote D1 Server Version */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-xs hover:-translate-y-0.5 hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D7D70] dark:text-[#8FA392]">إصدار السيرفر السحابي (D1)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white font-mono mb-1 truncate">
            {remoteInfo?.version || '1.2.0-build'}
          </div>
          <div className="text-[11px] text-[#6D7D70] dark:text-[#8FA392] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              طابع الترقية:{' '}
              <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                {remoteInfo?.buildTimestamp ? new Date(remoteInfo.buildTimestamp).toLocaleTimeString('ar-EG') : '—'}
              </span>
            </span>
          </div>
        </div>

        {/* Card 3: Maintenance State */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-xs hover:-translate-y-0.5 hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D7D70] dark:text-[#8FA392]">حالة شاشة التحديث الحالية</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex w-2.5 h-2.5 rounded-full ${
                remoteInfo?.maintenance?.active
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {remoteInfo?.maintenance?.active ? 'وضع التحديث مفعّل الآن' : 'النظام متاح للجميع'}
            </span>
          </div>
          <div className="text-[11px] text-[#6D7D70] dark:text-[#8FA392]">
            {remoteInfo?.maintenance?.active
              ? 'المستخدمون يرون الآن الشاشة السينمائية المقفلة'
              : 'لا توجد عمليات رفع جارية حالياً'}
          </div>
        </div>
      </div>

      {/* 3. Control Actions Panel */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            إجراءات البث والترقية المباشرة
          </h3>
          <p className="text-xs text-[#6D7D70] dark:text-[#8FA392]">
            حدد الإجراء المطلوب للتحكم في واجهة كافة المستخدمين المفتوح لديهم الموقع حالياً.
          </p>
        </div>

        {/* Custom Message Inputs with Clean Amber Focus Rings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#BAC7BC] mb-1.5">
              عنوان شاشة التحديث (يظهر بالخط العريض)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#0B140E] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-[#BAC7BC] mb-1.5">
              الوقت التقديري المتوقع (بالدقائق)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="60"
                value={estimatedMin}
                onChange={(e) => setEstimatedMin(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#0B140E] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-[#BAC7BC] mb-1.5">
              نص رسالة الانتظار المعروضة للمستخدمين
            </label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#0B140E] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Buttons Action Bar (Harmonized Brand Amber Palette: No Off-brand Orange/Green/Black) */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E0D9CB] dark:border-[#243628]">
          {/* Button 1: Start Maintenance (Primary Brand Amber Gradient) */}
          <button
            type="button"
            onClick={handleStartMaintenance}
            disabled={isTriggering || remoteInfo?.maintenance?.active}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 border border-amber-400/40 transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>بدء رفع تحديث جديد (تفعيل شاشة الانتظار لكل المستخدمين)</span>
          </button>

          {/* Button 2: Finish Maintenance (Refined Royal Olive / Amber Glass Style) */}
          <button
            type="button"
            onClick={handleFinishMaintenance}
            disabled={isTriggering || !remoteInfo?.maintenance?.active}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/15 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 font-bold text-xs transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>اكتمال التحديث وتحديث جميع الأجهزة (Auto Sign-out & Reload)</span>
          </button>

          {/* Button 3: Force Immediate Broadcast (Primary Brand Amber Gradient) */}
          <button
            type="button"
            onClick={handleForceDeployBroadcast}
            disabled={isTriggering}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 border border-amber-400/40 transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>بث أمر تحديث فوري لكافة الأجهزة (Force Refresh)</span>
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <CinematicUpdateOverlay forcePreview={true} onClosePreview={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export const CloudflareDeployView = CloudUpgradesView;
export default CloudUpgradesView;
