import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Building2, Briefcase, Award } from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { TypewriterText } from './TypewriterText';
import { EcoOfficialLogo } from '../common/EcoOfficialLogo';

import { companyStorage } from '../modules/companies/companyStorage';

interface CinematicWelcomeSplashProps {
  user: AuthUser | null;
  onComplete: () => void;
  durationMs?: number; // Default 5000ms (5 full seconds)
}

export const CinematicWelcomeSplash: React.FC<CinematicWelcomeSplashProps> = ({
  user,
  onComplete,
  durationMs = 5000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('جاري تهيئة بيئة العمل ثلاثية الأبعاد وتحميل صلاحيات التخصص...');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // User display attributes reflecting exact logged-in user database record
  const displayName = user?.nameAr || (user as any)?.fullName || user?.username || 'المستخدم المصرح به';
  const displayRole = user?.jobTitleAr || (user as any)?.job_title || user?.roleLabelAr || 'إدارة الموارد البشرية';
  const displayDept = user?.departmentAr || (user as any)?.department || 'إدارة الموارد البشرية';

  // Dynamic company context resolution based on user.allowedCompanyIds
  const companyContext = React.useMemo(() => {
    if (!user) return 'مجموعة الشركات المركزية';
    const allowed = user.allowedCompanyIds;
    if (!allowed || allowed.length === 0 || allowed.includes('all')) {
      return 'مجموعة الشركات المركزية (صلاحيات شاملة)';
    }

    try {
      const allCompanies = companyStorage.getCompaniesSync();
      const matched = allCompanies.filter(c =>
        allowed.includes(c.id) ||
        allowed.includes(c.crNumber || '') ||
        allowed.some(a => c.id.toLowerCase().includes(a.toLowerCase()) || c.nameAr.includes(a))
      );
      if (matched.length === 1) {
        return matched[0].nameAr;
      } else if (matched.length > 1) {
        return `${matched[0].nameAr} (+${matched.length - 1} شركات)`;
      }
    } catch {
      // Fallback
    }

    return allowed[0] || 'شركة ترابط للاستثمارات والمشروعات';
  }, [user]);

  // Dynamic time-aware greeting
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour >= 4 && currentHour < 12 ? 'صباح الخير' : 'مساء الخير';

  // Dynamic live Arabic date format
  const formattedArabicDate = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Interactive 3D Mouse Parallax Tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2); // -1 to 1
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2); // -1 to 1
      setTilt({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 5-Second Progress Bar and Auto-Redirect
  useEffect(() => {
    const startTime = Date.now();
    const progressDuration = durationMs - 300; // Finish smoothly at 4.7s and hold for 300ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / progressDuration) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusText('جاري تهيئة بيئة العمل ثلاثية الأبعاد وتحميل صلاحيات التخصص...');
      } else if (pct < 75) {
        setStatusText('تم التحقق من الهوية السحابية واعتماد معايير الأمان...');
      } else {
        setStatusText('مرحباً بك! جاري فتح بوابة الخدمات المركزية...');
      }

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onComplete();
      }
    }, 20);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  // 3D Canvas Perspective Starfield & Golden Floating Core Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Starfield particles moving toward camera (along Z-axis)
    interface Star3D {
      x: number;
      y: number;
      z: number;
      prevZ: number;
      speed: number;
      color: string;
    }

    const starCount = Math.min(140, Math.floor((width * height) / 9500));
    const stars: Star3D[] = [];
    const maxZ = 1200;
    const focalLength = 360;

    const goldPalette = [
      'rgba(245, 158, 11, ', // Amber 500
      'rgba(251, 191, 36, ', // Amber 400
      'rgba(217, 119, 6, ',  // Amber 600
      'rgba(254, 243, 199, ', // Warm Gold Shimmer
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2.2,
        y: (Math.random() - 0.5) * height * 2.2,
        z: Math.random() * maxZ,
        prevZ: Math.random() * maxZ,
        speed: Math.random() * 4.5 + 3.2,
        color: goldPalette[Math.floor(Math.random() * goldPalette.length)],
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(4, 11, 8, 0.28)'; // Subtle persistence trail
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach(star => {
        star.prevZ = star.z;
        star.z -= star.speed;

        if (star.z <= 1) {
          star.z = maxZ;
          star.prevZ = maxZ;
          star.x = (Math.random() - 0.5) * width * 2.2;
          star.y = (Math.random() - 0.5) * height * 2.2;
        }

        const k = focalLength / star.z;
        const px = cx + star.x * k;
        const py = cy + star.y * k;

        const prevK = focalLength / star.prevZ;
        const prevPx = cx + star.x * prevK;
        const prevPy = cy + star.y * prevK;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthRatio = 1 - star.z / maxZ;
          const alpha = Math.min(1, Math.max(0.1, depthRatio * 1.3));
          const size = Math.max(0.8, depthRatio * 2.8);

          // Draw perspective streak toward camera
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `${star.color}${alpha * 0.7})`;
          ctx.lineWidth = size * 0.8;
          ctx.stroke();

          // Draw head dot
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fillStyle = `${star.color}${alpha})`;
          ctx.shadowBlur = 10 * depthRatio;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <motion.div
      data-testid="cinematic-welcome-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      dir="rtl"
      className="fixed inset-0 !m-0 !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen z-[999999] flex flex-col items-center justify-between p-4 sm:p-8 bg-[#040B08] text-[#F3EFE6] overflow-hidden select-none"
    >
      {/* Dynamic Keyframes for 3D Gyroscopic Orbital Rings */}
      <style>{`
        @keyframes gyroRing1 {
          0% { transform: rotateX(65deg) rotateY(0deg) rotateZ(0deg); }
          50% { transform: rotateX(75deg) rotateY(180deg) rotateZ(180deg); }
          100% { transform: rotateX(65deg) rotateY(360deg) rotateZ(360deg); }
        }
        @keyframes gyroRing2 {
          0% { transform: rotateX(45deg) rotateY(45deg) rotateZ(0deg); }
          50% { transform: rotateX(30deg) rotateY(225deg) rotateZ(180deg); }
          100% { transform: rotateX(45deg) rotateY(405deg) rotateZ(360deg); }
        }
        @keyframes gyroRing3 {
          0% { transform: rotateX(80deg) rotateY(-30deg) rotateZ(0deg); }
          50% { transform: rotateX(60deg) rotateY(150deg) rotateZ(-180deg); }
          100% { transform: rotateX(80deg) rotateY(330deg) rotateZ(-360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.6)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 50px rgba(245, 158, 11, 0.95)); }
        }
        @keyframes borderBeamShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* 1. Live 3D Canvas Space */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none w-full h-full" />

      {/* 2. Deep Royal Olive & Obsidian Ambient Fog Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] bg-gradient-to-tr from-[rgba(13,31,23,0.85)] via-[rgba(245,158,11,0.14)] to-[rgba(10,25,18,0.92)] rounded-full blur-[140px] pointer-events-none" />

      {/* 3. 3D Architectural Holographic Grid Floor (Perspective 65deg tilt) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[220vw] h-[55vh] pointer-events-none opacity-20"
        style={{
          transform: 'perspective(1000px) rotateX(65deg)',
          transformOrigin: 'bottom center',
          backgroundImage: `
            linear-gradient(to top, rgba(217, 155, 38, 0.45) 1px, transparent 1px),
            linear-gradient(to right, rgba(217, 155, 38, 0.45) 1px, transparent 1px)
          `,
          backgroundSize: '55px 55px',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
        }}
      />

      {/* Top Bar: Symmetrical Header with Brand Identity & Instant Access CTA */}
      <motion.div
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8"
      >
        {/* Brand System Tag */}
        <div className="flex items-center gap-3">
          <EcoOfficialLogo size="md" />
          <div className="flex flex-col text-right">
            <span className="text-base font-black tracking-wide text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
              ECO
            </span>
            <div className="min-h-[18px] flex items-center">
              <TypewriterText
                text="ERP Company Operations"
                typingSpeed={75}
                deletingSpeed={38}
                pauseMs={2200}
                className="text-[11px] text-amber-300/90 font-bold font-mono tracking-wider"
                cursorClassName="text-amber-400 bg-amber-400 w-1 h-3"
              />
            </div>
          </div>
        </div>

        {/* Skip CTA */}
        <button
          onClick={onComplete}
          className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-stone-900/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-700/80 hover:border-amber-500/50 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer backdrop-blur-md shadow-md"
          title="تخطي الدخول الفوري للخدمات"
        >
          <span>الدخول الفوري للخدمات</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-amber-400" />
        </button>
      </motion.div>

      {/* Center 3D Gyroscopic Emblem & User Identity Presentation */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto w-full max-w-3xl px-4">
        {/* 3D Rotating Gyroscopic Orbital Rings with Interactive Parallax Tilt */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center mb-6"
          style={{
            perspective: 1200,
            transformStyle: 'preserve-3d',
            transform: `perspective(1000px) rotateY(${tilt.x * 16}deg) rotateX(${-tilt.y * 16}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Ring 1 - Outermost Orbit */}
          <div
            className="absolute inset-0 rounded-full border-2 border-amber-500/40 pointer-events-none"
            style={{
              animation: 'gyroRing1 14s linear infinite',
              boxShadow: '0 0 45px rgba(245, 158, 11, 0.35), inset 0 0 25px rgba(245, 158, 11, 0.2)',
            }}
          />

          {/* Ring 2 - Middle Orbit (Dashed Gold) */}
          <div
            className="absolute inset-4 rounded-full border border-dashed border-amber-400/60 pointer-events-none"
            style={{
              animation: 'gyroRing2 9s linear infinite reverse',
              boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)',
            }}
          />

          {/* Ring 3 - Inner Orbit with Accents */}
          <div
            className="absolute inset-8 rounded-full border-2 border-amber-300/70 pointer-events-none"
            style={{
              animation: 'gyroRing3 6s linear infinite',
              boxShadow: '0 0 25px rgba(251, 191, 36, 0.45)',
            }}
          />

          {/* Floating Core Official Brand Emblem */}
          <div
            className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_40px_rgba(245,158,11,0.6)] flex items-center justify-center"
            style={{ animation: 'pulseGlow 3.5s ease-in-out infinite' }}
          >
            <div className="w-full h-full rounded-[22px] bg-[#0A1912] flex flex-col items-center justify-center text-amber-400 border border-amber-400/40 backdrop-blur-md">
              <EcoOfficialLogo variant="iconOnly" size="lg" iconClassName="w-9 h-9 sm:w-10 sm:h-10 !text-amber-400 stroke-[1.8]" />
              <span className="text-[10px] font-black tracking-widest text-amber-200 uppercase mt-1 font-mono">
                ECO
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stage 1: Dynamic Time-Aware Greeting Badge with Arabic Date */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-3.5 backdrop-blur-md shadow-inner"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
          <span>{timeGreeting} • {formattedArabicDate}</span>
        </motion.div>

        {/* Stage 2: User Full Name (Hero 3D Gold Typography - Solid High Luminance No Clipping) */}
        <motion.h1
          data-testid="welcome-splash-username"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black text-amber-400 drop-shadow-[0_4px_24px_rgba(245,158,11,0.4)] leading-[1.6] py-3 px-4 overflow-visible mb-4"
        >
          مرحباً بك، {displayName}
        </motion.h1>

        {/* Stage 3: Job Role, Specialization & Department (3D Glassmorphic Card with Interactive Mouse Tilt) */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="w-full max-w-xl mx-auto rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-xl border border-amber-500/30 shadow-2xl mb-2"
          style={{
            background: 'linear-gradient(135deg, rgba(14,26,18,0.85) 0%, rgba(7,16,11,0.92) 100%)',
            transform: `perspective(1000px) rotateY(${tilt.x * 8}deg) rotateX(${-tilt.y * 8}deg)`,
            transition: 'transform 0.15s ease-out',
          }}
        >
          {/* Animated Golden Border Beam */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-40"
            style={{
              padding: '1.5px',
              background: 'linear-gradient(90deg, transparent, #F59E0B, #FEF3C7, #F59E0B, transparent)',
              backgroundSize: '200% 200%',
              animation: 'borderBeamShimmer 4s ease infinite',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>المسمى الوظيفي والتخصص:</span>
                </div>
                <div data-testid="welcome-splash-specialization" className="text-sm sm:text-base font-black text-white">
                  {displayRole}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs text-stone-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span data-testid="welcome-splash-department">{displayDept}</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-amber-500/15 flex items-center justify-between text-xs text-stone-400">
            {/* Glowing Amber Pulse & Building Icon for Company Context */}
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse" />
              <Building2 className="w-4 h-4 text-amber-400" />
              <span className="text-stone-200 font-bold">{companyContext}</span>
            </span>

            {/* Clean Arabic Metadata without English Jargon */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              <span>نطاق الوصول: صلاحيات معتمدة بالكامل</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stage 4: Cinematic Progress Bar & Status Text Indicator (Zero English Fluff) */}
      <motion.div
        initial={{ y: 25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.5 }}
        className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center pb-4"
      >
        <div className="w-full flex items-center justify-between text-xs font-semibold text-stone-300 mb-2">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
            <span className="text-amber-300">{statusText}</span>
          </span>
          <span data-testid="welcome-splash-progress" className="font-mono text-amber-400 font-bold text-sm">
            {progress}%
          </span>
        </div>

        {/* Progress Track & Bar */}
        <div className="w-full h-2.5 rounded-full bg-stone-900/90 border border-stone-800 overflow-hidden shadow-inner p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.85)]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CinematicWelcomeSplash;
