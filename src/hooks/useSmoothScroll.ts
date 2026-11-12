import { useEffect } from 'react';

/**
 * Desktop-only fluid mouse-wheel inertia scrolling hook.
 * Preserves native touchpad scrolling, keyboard navigation, anchor clicks,
 * and reduced-motion accessibility settings while providing smooth easing for mouse wheels.
 */
export function useSmoothScroll() {
  useEffect(() => {
    // Only apply on desktop devices with fine pointer and width >= 1024px
    if (typeof window === 'undefined') return;

    const isDesktop = window.innerWidth >= 1024 && window.matchMedia('(pointer: fine)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isDesktop || prefersReduced) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isRunning = false;
    let animFrameId: number | null = null;

    const ease = 0.12; // Smooth easing factor

    const updateScroll = () => {
      const diff = targetY - currentY;
      if (Math.abs(diff) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isRunning = false;
        animFrameId = null;
        return;
      }

      currentY += diff * ease;
      window.scrollTo(0, currentY);
      animFrameId = requestAnimationFrame(updateScroll);
    };

    const startAnimation = () => {
      if (!isRunning) {
        isRunning = true;
        animFrameId = requestAnimationFrame(updateScroll);
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Allow scroll inside scrollable containers (modals, drawers, code blocks)
      let parent = e.target as HTMLElement | null;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        const style = window.getComputedStyle(parent);
        const overflowY = style.overflowY;
        const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight;
        
        if (isScrollable) {
          // If container can scroll in the wheel direction, let browser handle it natively
          const isScrollingUp = e.deltaY < 0;
          const isScrollingDown = e.deltaY > 0;
          const atTop = parent.scrollTop <= 0;
          const atBottom = Math.abs(parent.scrollHeight - parent.clientHeight - parent.scrollTop) <= 2;

          if ((isScrollingUp && !atTop) || (isScrollingDown && !atBottom)) {
            return;
          }
        }
        parent = parent.parentElement;
      }

      // Check if it's a discrete mouse wheel step vs continuous touchpad gesture
      // Touchpad wheel events typically have small, non-integer deltaY or ctrlKey (zoom)
      if (e.ctrlKey) return;

      const delta = e.deltaY;
      const maxScroll = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - window.innerHeight;

      // Update target position
      targetY = Math.max(0, Math.min(maxScroll, targetY + delta));
      e.preventDefault();
      startAnimation();
    };

    const onScroll = () => {
      // Sync targetY when scrolling happens programmatically or via scrollbar drag
      if (!isRunning) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }
    };

    const onResize = () => {
      currentY = window.scrollY;
      targetY = window.scrollY;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, []);
}
