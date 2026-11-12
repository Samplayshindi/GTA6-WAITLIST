import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from '../context/LenisContext';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      // Show only after meaningful scrolling (> 400px)
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo(0, { immediate: prefersReducedMotion });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top of page"
      className="fixed right-3 sm:right-6 bottom-[88px] sm:bottom-[96px] z-30 p-2.5 sm:p-3 rounded-full bg-[#121318]/90 hover:bg-[#1C1D24] border border-[#24262B] text-slate-300 hover:text-white shadow-[0_8px_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center group"
    >
      <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
};
