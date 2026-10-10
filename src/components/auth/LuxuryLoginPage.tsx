import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useNavigate } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface LuxuryLoginPageProps {
  onSuccess?: () => void;
}

export const LuxuryLoginPage: React.FC<LuxuryLoginPageProps> = ({ onSuccess }) => {
  const { isRtl, t } = useLanguage();
  const { login, rememberMe, setRememberMe } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('admin@hrsup.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    name: string;
    roleTitle: string;
  } | null>(null);

  // Background Canvas for Interactive Floating Stardust & Ambient Gold Particles
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      alphaSpeed: number;
    }

    const particles: Particle[] = [];
    const colors = [
      'rgba(217, 155, 38, ', // Radiant Gold Amber
      'rgba(235, 179, 77, ', // Soft Glowing Gold
      'rgba(5, 150, 105, ',  // Emerald Green
      'rgba(16, 185, 129, ', // Mint Emerald
    ];

    const particleCount = Math.min(55, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -Math.random() * 0.45 - 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        alphaSpeed: (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaSpeed;

        if (p.alpha > 0.85 || p.alpha < 0.15) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVerifying || isSuccess) return;

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const result = await login(emailOrUsername, password, rememberMe);
      if (!result.success || !result.user) {
        setErrorMessage('اسم المستخدم أو كلمة المرور غير صحيحة');
        setShakeCard(true);
        setTimeout(() => setShakeCard(false), 500);
      } else {
        const displayName = isRtl
          ? (result.user.nameAr || result.user.nameEn)
          : (result.user.nameEn || result.user.nameAr);
        const roleTitle = isRtl
          ? (result.user.roleLabelAr || result.user.role)
          : (result.user.roleLabelEn || result.user.role);

        setAuthenticatedUser({
          name: displayName,
          roleTitle: roleTitle,
        });
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/');
          if (onSuccess) onSuccess();
        }, 2000);
      }
    } catch {
      setErrorMessage('اسم المستخدم أو كلمة المرور غير صحيحة');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#080E0A] text-[#F3EFE6] select-none font-sans"
    >
      {/* 1. Dynamic Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-80"
      />

      {/* 2. Ambient Motion Mesh Gradients (Depth Blur Aura) */}
      <div className="absolute top-1/4 -start-48 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -end-48 w-96 h-96 bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-amber-600/10 via-emerald-800/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* 3. Subtle Luxury Geometric Lattice Background Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #EBB34D 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* 4. Luxury Glassmorphic Login Card */}
      <div
        className={`relative z-10 bg-[#0c1322]/80 backdrop-blur-2xl border border-amber-500/30 shadow-[0_0_50px_-12px_rgba(217,155,38,0.25)] rounded-3xl p-8 max-w-md w-full transition-all duration-300 ${
          isSuccess ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
        } ${
          shakeCard ? 'animate-shake border-red-500/60 shadow-red-500/10' : 'hover:border-amber-500/40'
        }`}
      >
        {/* Subtle Top Card Glowing Highlight Strip */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

        {/* Company Branding & Official Insignia */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center mb-3 group">
            {/* Ambient Aura behind emblem */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-emerald-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all" />

            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-[#17231A] to-[#0E1610] border border-amber-500/30 flex items-center justify-center shadow-xl shadow-black/60">
              <svg
                className="w-9 h-9 text-amber-400 transition-transform duration-500 group-hover:scale-105"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
                <path d="M2 7h20" />
              </svg>
            </div>

            <div className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>

          <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#F3EFE6] leading-snug">
            {isRtl ? 'شركة ترابط للمقاولات والتجارة' : 'Tarabot Contracting & Trading'}
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-xs font-semibold text-amber-400/90 tracking-wide">
            <span>{t('منظومة إدارة الموارد المؤسسية الذكية ECO', 'ECO Enterprise Platform')}</span>
          </div>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} action="#" method="POST" noValidate className="space-y-4">
          {/* Username / Corporate Email Field */}
          <div className="space-y-1.5 text-start">
            <label className="text-xs font-bold text-zinc-300 block ps-1">
              {t('اسم المستخدم أو البريد الإلكتروني', 'Username or Corporate Email')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-amber-400 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={emailOrUsername}
                onChange={e => setEmailOrUsername(e.target.value)}
                required
                disabled={isVerifying || isSuccess}
                dir="ltr"
                placeholder="name@hrsup.com"
                className="w-full ps-10 pe-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 text-sm focus:outline-none transition-all placeholder:text-zinc-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field with Toggle */}
          <div className="space-y-1.5 text-start">
            <div className="flex items-center justify-between ps-1 pe-1">
              <label className="text-xs font-bold text-zinc-300">
                {t('كلمة المرور', 'Password')}
              </label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-amber-400 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isVerifying || isSuccess}
                dir="ltr"
                placeholder="••••••••••••"
                className="w-full ps-10 pe-11 py-3 rounded-xl bg-slate-900/60 border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-100 text-sm focus:outline-none transition-all placeholder:text-zinc-500 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 end-0 pe-3.5 flex items-center text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center justify-between py-1 px-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-zinc-300">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                  rememberMe ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    rememberMe ? (isRtl ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span>{t('تذكرني على هذا الجهاز', 'Remember me on this device')}</span>
            </label>
          </div>

          {/* Informative Error Toast Banner beneath inputs */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-xl text-rose-400 bg-rose-950/40 border border-rose-800/60 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="leading-relaxed flex-1 font-medium">{errorMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isVerifying || isSuccess}
              className="relative w-full py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 shadow-lg shadow-amber-500/20 overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-90 disabled:cursor-wait bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

              {isVerifying ? (
                <div className="relative flex items-center justify-center gap-2.5 z-10">
                  <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                  <span>{t('جاري التحقق من البيانات...', 'Verifying Credentials...')}</span>
                </div>
              ) : (
                <div className="relative flex items-center justify-center gap-2 z-10">
                  <span>{t('تسجيل الدخول', 'Sign In')}</span>
                  {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 5. Welcome Screen Overlay (Post-Login Transition) */}
      {isSuccess && authenticatedUser && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md animate-fade-in text-center p-6">
          <div className="w-20 h-20 rounded-full border-2 border-amber-500/80 bg-amber-500/10 flex items-center justify-center mb-6 animate-pulse">
            <CheckCircle2 className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-amber-400 mb-2">مرحباً بك، {authenticatedUser.name}</h2>
          <p className="text-slate-300 text-sm">جاري تهيئة لوحة التحكم وصلاحيات {authenticatedUser.roleTitle}...</p>
        </div>
      )}
    </div>
  );
};
