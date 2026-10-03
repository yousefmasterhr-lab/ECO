import React from 'react';
import { motion } from 'framer-motion';

export const HRAmbientBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* Primary Organic Luminescence Aura (North-East) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.18, 0.28, 0.18],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-24 -end-24 w-96 h-96 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--ambient-aura-1, rgba(235, 179, 77, 0.22)) 0%, var(--ambient-aura-2, rgba(31, 46, 35, 0.35)) 50%, transparent 80%)',
        }}
      />

      {/* Secondary Deep Mesh Node (South-West) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.38, 0.25],
          x: [0, -25, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 -start-32 w-[32rem] h-[32rem] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--ambient-aura-2, rgba(45, 66, 51, 0.4)) 0%, var(--bg-surface, rgba(23, 35, 26, 0.3)) 60%, transparent 80%)',
        }}
      />

      {/* Tertiary Core Pulse (Dynamic Accent) */}
      <motion.div
        animate={{
          scale: [0.95, 1.08, 0.95],
          opacity: [0.12, 0.22, 0.12],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute bottom-10 end-1/4 w-80 h-80 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--ambient-aura-3, rgba(217, 155, 38, 0.15)) 0%, var(--bg-hover, rgba(20, 31, 22, 0.3)) 70%, transparent 85%)',
        }}
      />

      {/* Fine Geometric Grid Overlay for Architectural Enterprise Depth */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(rgba(243, 239, 230, 0.8) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};
