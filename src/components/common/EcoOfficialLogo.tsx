import React from 'react';

interface EcoOfficialLogoProps {
  className?: string;
  iconClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'iconOnly';
  glowing?: boolean;
}

export const EcoOfficialLogo: React.FC<EcoOfficialLogoProps> = ({
  className = '',
  iconClassName = '',
  size = 'md',
  variant = 'badge',
  glowing = false,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 rounded-lg',
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
    xl: 'w-16 h-16 rounded-2xl',
  }[size];

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6 sm:w-7 sm:h-7',
    xl: 'w-8 h-8',
  }[size];

  const svgElement = (
    <svg
      className={`${iconSizes} text-[#D99B26] dark:text-[#F59E0B] transition-colors duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_8px_rgba(245,158,11,0.55)] ${iconClassName}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
    </svg>
  );

  if (variant === 'iconOnly') {
    return svgElement;
  }

  return (
    <div
      className={`
        ${sizeClasses}
        group relative overflow-hidden flex items-center justify-center shrink-0
        transition-all duration-300 ease-out select-none
        /* Light Mode Styling: Deep executive royal emerald with gold accents */
        bg-gradient-to-br from-[#1C2B20] via-[#243729] to-[#16221A]
        border border-[#D99B26]/35
        shadow-[0_2px_10px_rgba(217,155,38,0.2),inset_0_1px_1px_rgba(255,255,255,0.18)]
        /* Dark Mode Styling: Deep obsidian dark forest with luminous neon gold aura */
        dark:from-[#08120B] dark:via-[#102015] dark:to-[#050A07]
        dark:border-amber-400/50
        dark:shadow-[0_0_18px_rgba(245,158,11,0.3),inset_0_0_10px_rgba(245,158,11,0.15)]
        /* Glow state */
        ${glowing ? 'shadow-[0_0_25px_rgba(245,158,11,0.5)] dark:shadow-[0_0_30px_rgba(245,158,11,0.65)] ring-1 ring-amber-400/50' : ''}
        hover:scale-105 active:scale-95
        ${className}
      `}
    >
      {/* Subtle Ambient Glass Shimmer on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none bg-gradient-to-r from-transparent via-white/10 dark:via-amber-300/10 to-transparent" />
      
      {/* Centered Golden SVG Emblem */}
      {svgElement}
    </div>
  );
};

export default EcoOfficialLogo;
