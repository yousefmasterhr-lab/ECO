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
  Clock
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
    <div className="space-y-6 text-[#1A261D] dark:text-[#E8F0E9] font-sans" dir="rtl">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 ${
            statusMessage.isError
              ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
              : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
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

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0C1A12] via-[#102217] to-[#0A160F] border border-emerald-500/30 shadow-xl text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <CloudUpload className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>CLOUDFLARE EDGE DEPLOYMENT CONTROLLER</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              إدارة التحديثات الحية والترقيات السحابية الشاملة
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              تحكم في بث التحديثات لجميع الأجهزة والفروع المتصلة بالنظام. عند تفعيل وضع التحديث تظهر الشاشة السينمائية لجميع المستخدمين، وعند الانتهاء يتم تسجيل الخروج التلقائي وإعادة تحميل الواجهة فوراً.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadStatus}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث الحالة</span>
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-900/30"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>معاينة الشاشة السينمائية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Client Build */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D7D70] dark:text-[#8FA392]">إصدار المتصفح الحالي</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-[#1C291E] dark:text-white font-mono mb-1 truncate">
            {clientVersion || '1.1.0-build'}
          </div>
          <div className="text-[11px] text-[#6D7D70] dark:text-[#8FA392] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>الجلسة الحالية نشطة ومحدثة محلياً</span>
          </div>
        </div>

        {/* Remote D1 Server Version */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D7D70] dark:text-[#8FA392]">إصدار السيرفر السحابي (D1)</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-[#1C291E] dark:text-white font-mono mb-1 truncate">
            {remoteInfo?.version || '1.1.0-build'}
          </div>
          <div className="text-[11px] text-[#6D7D70] dark:text-[#8FA392]">
            طابع الترقية:{' '}
            <span className="font-mono text-emerald-400">
              {remoteInfo?.buildTimestamp ? new Date(remoteInfo.buildTimestamp).toLocaleTimeString('ar-EG') : '—'}
            </span>
          </div>
        </div>

        {/* Maintenance State */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6D7D70] dark:text-[#8FA392]">حالة شاشة التحديث الحالية</span>
            <div className={`p-2 rounded-xl ${remoteInfo?.maintenance?.active ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex w-2.5 h-2.5 rounded-full ${remoteInfo?.maintenance?.active ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-lg font-black">
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

      {/* Control Actions Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121E15] border border-[#E0D9CB] dark:border-[#243628] shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-[#1C291E] dark:text-white mb-1">
            إجراءات البث والترقية المباشرة
          </h3>
          <p className="text-xs text-[#6D7D70] dark:text-[#8FA392]">
            حدد الإجراء المطلوب للتحكم في واجهة كافة المستخدمين المفتوح لديهم الموقع حالياً.
          </p>
        </div>

        {/* Custom Message Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#4D5750] dark:text-[#BAC7BC] mb-1.5">
              عنوان شاشة التحديث (يظهر بالخط العريض)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#0B140E] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#4D5750] dark:text-[#BAC7BC] mb-1.5">
              الوقت التقديري المتوقع (بالدقائق)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="60"
                value={estimatedMin}
                onChange={(e) => setEstimatedMin(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#0B140E] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold focus:outline-none focus:border-emerald-500"
              />
              <Clock className="w-4 h-4 text-[#8FA392] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#4D5750] dark:text-[#BAC7BC] mb-1.5">
              نص رسالة الانتظار المعروضة للمستخدمين
            </label>
            <textarea
              rows={2}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#0B140E] border border-[#E0D9CB] dark:border-[#243628] text-xs font-semibold focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Buttons Action Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E0D9CB] dark:border-[#243628]">
          {/* Button 1: Start Maintenance */}
          <button
            type="button"
            onClick={handleStartMaintenance}
            disabled={isTriggering || remoteInfo?.maintenance?.active}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>بدء رفع تحديث جديد (تفعيل شاشة الانتظار لكل المستخدمين)</span>
          </button>

          {/* Button 2: Finish Maintenance */}
          <button
            type="button"
            onClick={handleFinishMaintenance}
            disabled={isTriggering || !remoteInfo?.maintenance?.active}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>اكتمال التحديث وتحديث جميع الأجهزة (Auto Sign-out & Reload)</span>
          </button>

          {/* Button 3: Force Immediate Broadcast */}
          <button
            type="button"
            onClick={handleForceDeployBroadcast}
            disabled={isTriggering}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1C291E] dark:bg-[#EBB34D] text-[#F3EFE6] dark:text-[#0E1610] font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
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
