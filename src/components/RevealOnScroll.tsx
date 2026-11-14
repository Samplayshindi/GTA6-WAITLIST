import React, { useEffect, useLayoutEffect, useRef, useState, ReactNode } from 'react';
import { useSettings } from '../context/SettingsContext';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  once?: boolean;
  immediate?: boolean;
}

type RevealCallback = (isIntersecting: boolean) => void;

interface SharedObserverEntry {
  observer: IntersectionObserver;
  callbacks: WeakMap<Element, RevealCallback>;
}

const sharedObservers = new Map<string, SharedObserverEntry>();

function getSharedObserver(threshold: number, rootMargin: string): SharedObserverEntry {
  const key = `${threshold}|${rootMargin}`;
  let entry = sharedObservers.get(key);
  if (!entry) {
    const callbacks = new WeakMap<Element, RevealCallback>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const item = entries[i];
          const cb = callbacks.get(item.target);
          if (cb) {
            cb(item.isIntersecting);
          }
        }
      },
      { threshold, rootMargin }
    );
    entry = { observer, callbacks };
    sharedObservers.set(key, entry);
  }
  return entry;
}

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.08,
  once = true,
  immediate = false,
}) => {
  const { motionMode } = useSettings();
  const isReducedMotion = immediate || motionMode === 'low' || prefersReducedMotion();
  const [isVisible, setIsVisible] = useState<boolean>(isReducedMotion);
  const ref = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (isReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const currentEl = ref.current;
    if (!currentEl) return;

    // If element is already within or above the viewport at mount (including during route switches),
    // reveal immediately without waiting for async IntersectionObserver or smooth-scroll completion.
    const rect = currentEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight - 20) {
      setIsVisible(true);
      if (once) return;
    }

    const { observer, callbacks } = getSharedObserver(threshold, '0px 0px -40px 0px');

    callbacks.set(currentEl, (intersecting) => {
      if (intersecting) {
        setIsVisible(true);
        if (once) {
          observer.unobserve(currentEl);
          callbacks.delete(currentEl);
        }
      } else if (!once) {
        setIsVisible(false);
      }
    });

    observer.observe(currentEl);

    return () => {
      observer.unobserve(currentEl);
      callbacks.delete(currentEl);
    };
  }, [isReducedMotion, threshold, once]);

  if (isReducedMotion) {
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
