import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownDigitProps {
  value: number;
  label: string;
  isAccent?: boolean;
}

export const CountdownDigit: React.FC<CountdownDigitProps> = ({
  value,
  label,
  isAccent = false,
}) => {
  const formatted = value.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      {/* Number Card */}
      <div
        className={`relative w-16 sm:w-24 md:w-28 lg:w-32 h-20 sm:h-28 md:h-32 lg:h-36 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          isAccent
            ? 'bg-[#1a102b]/80 border-pink-500/30 shadow-[0_0_25px_rgba(255,79,163,0.18)] hover:border-pink-500/60'
            : 'bg-[#0f1424]/80 border-cyan-500/25 shadow-[0_0_25px_rgba(54,185,233,0.15)] hover:border-cyan-500/50'
        }`}
      >
        {/* Subtle Horizontal Card Crease */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10 z-10 pointer-events-none" />

        {/* Ambient Top Glow */}
        <div
          className={`absolute inset-x-0 top-0 h-1/2 opacity-25 pointer-events-none ${
            isAccent
              ? 'bg-gradient-to-b from-pink-500/30 to-transparent'
              : 'bg-gradient-to-b from-cyan-400/30 to-transparent'
          }`}
        />

        {/* Animated Number Value */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formatted}
            initial={{ y: -16, opacity: 0.4, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0.3, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`font-mono text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight tabular-nums select-none ${
              isAccent
                ? 'text-white drop-shadow-[0_0_15px_rgba(255,79,163,0.4)]'
                : 'text-white drop-shadow-[0_0_15px_rgba(54,185,233,0.35)]'
            }`}
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Label */}
      <span className="mt-2.5 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-slate-400">
        {label}
      </span>
    </div>
  );
};
