import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useNavigate } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { CinematicWelcomeSplash } from './CinematicWelcomeSplash';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Building2,
  Sparkles
} from 'lucide-react';

interface LuxuryLoginPageProps {
  onSuccess?: () => void;
}

export const LuxuryLoginPage: React.FC<LuxuryLoginPageProps> = ({ onSuccess }) => {
  const { isRtl, t } = useLanguage();
  const { login, rememberMe, setRememberMe, showWelcomeSplash, user, completeWelcomeSplash } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('admin@hrsup.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const [updateNotice, setUpdateNotice] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isUpdatedReason = params.get('reason') === 'system_updated';

      const raw = sessionStorage.getItem('eco_update_notice');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUpdateNotice(parsed);
        sessionStorage.removeItem('eco_update_notice');
      } else if (isUpdatedReason) {
        setUpdateNotice({
          title: 'تم تحديث المنظومة بنجاح',
          message: 'تم تحديث المنظومة إلى إصدار جديد — يرجى تسجيل الدخول مجدداً لمواصلة العمل بأحدث التعديلات.'
        });
      }
    } catch {}
  }, []);

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
      'rgba(217, 155, 38, ',  // Radiant Gold Amber
      'rgba(245, 158, 11, ',  // Bright Warm Amber
      'rgba(251, 191, 36, ',  // Soft Glowing Amber
      'rgba(180, 83, 9, ',    // Deep Bronze Amber
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
    if (isVerifying) return;

    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const result = await login(emailOrUsername, password, rememberMe);
      if (!result.success || !result.user) {
        const msg = result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة';
        setErrorMessage(msg);
        setShakeCard(true);
        setTimeout(() => setShakeCard(false), 500);
      } else {
        setErrorMessage(null);
        // Authentication committed: showWelcomeSplash is active and gates entry for 4 full seconds
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
    } finally {
      setIsVerifying(false);
    }
  };

  // Component-Level Guard: When welcome splash is active, render it exclusively
  if (showWelcomeSplash) {
    return (
      <CinematicWelcomeSplash
        user={user}
        durationMs={5000}
        onComplete={() => {
          completeWelcomeSplash();
          navigate('/');
          if (onSuccess) onSuccess();
        }}
      />
    );
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#080d14] text-[#F3EFE6] select-none font-sans"
    >
      {/* 1. Dynamic Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-80"
      />

      {/* 2. Ambient Motion Mesh Gradients (Depth Blur Aura) */}
      <div className="absolute top-1/4 -start-48 w-96 h-96 bg-[rgba(217,155,38,0.08)] rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -end-48 w-96 h-96 bg-[rgba(16,185,129,0.05)] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[rgba(217,155,38,0.08)] via-[rgba(16,185,129,0.05)] to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* 3. Subtle Luxury Geometric Lattice Background Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #EBB34D 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Glassmorphic Executive Login Card */}
      <div className={`relative z-20 w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#0d1520]/85 backdrop-blur-2xl border border-amber-500/25 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7),0_0_30px_rgba(217,155,38,0.15)] mx-auto transition-all duration-300 ${shakeCard ? 'animate-shake border-red-500/60 shadow-red-500/10' : ''}`}>
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_20px_rgba(217,155,38,0.2)]">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-100 text-center tracking-tight">شركة ترابط للمقاولات والتجارة</h2>
            <p className="text-xs font-bold text-amber-400/90 text-center mt-1 tracking-wide">ECO • ERP Company Operations</p>
          </div>

          {/* System Update Notification Banner */}
          {updateNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/90 via-[#1A1208] to-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 shadow-[0_0_25px_rgba(217,155,38,0.25)] animate-in fade-in slide-in-from-top-2 duration-300">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-right">
                <div className="font-bold text-white text-xs mb-1">{updateNotice.title}</div>
                <div className="text-amber-100/90 leading-relaxed text-[11px]">{updateNotice.message}</div>
              </div>
            </div>
          )}

          {/* Form with Explicit Visible Styling */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Corporate Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right">
                {t('اسم المستخدم أو البريد الإلكتروني', 'Username or Corporate Email')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="admin@hrsup.com"
                  className="w-full pr-11 pl-4 py-3 rounded-xl bg-[#090e16]/80 border border-slate-700/70 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field with Dual Icons */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 text-right">
                {t('كلمة المرور', 'Password')}
              </label>
              <div className="relative flex items-center">
                {/* Right: Security Lock Icon */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5"/>
                </div>

                {/* Input Field with bilateral padding */}
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-11 pl-11 py-3 rounded-xl bg-[#090e16]/80 border border-slate-700/70 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all"
                />

                {/* Left: Interactive Eye Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors p-1 focus:outline-none cursor-pointer"
                  title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 my-2 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs font-bold text-center animate-shake shadow-lg shadow-rose-950/50">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#090e16] border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <span>{t('تذكرني على هذا الجهاز', 'Remember me on this device')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-slate-950 animate-spin" />
                  <span>{t('جاري التحقق...', 'Verifying...')}</span>
                </div>
              ) : (
                <span>{t('تسجيل الدخول', 'Sign In')}</span>
              )}
            </button>
          </form>
        </div>
    </div>
  );
};

export const LoginView = LuxuryLoginPage;
export default LuxuryLoginPage;
