import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useSettings } from '../context/SettingsContext';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  once?: boolean;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.08,
  once = true,
}) => {
  const { motionMode } = useSettings();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If motion mode is set to 'low' or system prefers reduced motion, show content immediately
    if (
      motionMode === 'low' ||
      (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      setIsVisible(true);
      return;
    }

    // Fail-safe for environments without IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && ref.current) {
              observer.unobserve(ref.current);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    const currentEl = ref.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [motionMode, threshold, once]);

  // Immediate visibility fallback if reduced motion is requested
  if (
    motionMode === 'low' ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`reveal-init ${isVisible ? 'reveal-visible' : ''} ${className}`}
      style={{
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
};
