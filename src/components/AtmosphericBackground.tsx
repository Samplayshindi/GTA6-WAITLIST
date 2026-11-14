import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { preloadImageWithFallback, getOptimizedImageData } from '../utils/imageUtils';
import { OptimizedImage } from './OptimizedImage';

export const SLIDESHOW_IMAGES: string[] = [
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_15.0m-_zb~mcy2zr.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Vice_City_13.0iq8ff474tsdx.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Vice_City_15.11tb0mz68edqo.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_11.0j617-ylicowx.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_16.05-d133mx68ku.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_11.019l5gj6~0~0v.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Vice_City_16.16hjjmnxqg9mv.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_17.117_b11r13mg5.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Vice_City_17.0er79m2u3nygs.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Leonida_Keys_07.0z9tb69ssp4rq.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_17.0tp7hiuz.e385.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_19.0r7a1q04n5.7m.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Grassrivers_08.0x-z0h-he35zo.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Vice_City_27.0d2e~w_r93hmh.jpg?akim=1&imdensity=1&imwidth=1920',
  'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_landscape.0a-egj5b8yo1q.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_landscape.11_3hd0fr69~j.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_landscape.0637akp_a5a_q.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_landscape.0_b7hszyze6cy.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_landscape.0ldnbn87k-8mq.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_landscape.17k7bnt3myg.2.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_Motel_landscape.08edvuwtm-20v.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_01_landscape.12x2gvspcm_3m.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_02_landscape.0cosv-uzbpt91.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_Beach_landscape.0419q._86ukpt.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_Robbery_landscape.09c8a~do21h4p.jpg',
  'https://www.rockstargames.com/VI/_next/static/media/Jason_Lucia_Lock_And_Load_landscape.0l9s5w7ih9p~3.jpg',
];

const DEFAULT_STATIC_POSTER = `${import.meta.env.BASE_URL}images/hero-4k.jpg`;
const DISPLAY_DURATION_MS = 12000; // 12 seconds per image display
const FADE_OUT_DURATION_MS = 1500; // 1.5s fade out to black
const BLACK_HOLD_DURATION_MS = 300; // 300ms hold on completely black screen
const FADE_IN_DURATION_MS = 1500; // 1.5s fade in from black
const PRELOAD_LEAD_TIME_MS = 4000; // Preload next image 4s before transition

// Tailored per-image object positioning to ensure character heads, faces, hats, and upper bodies are fully framed without clipping
const getImageObjectPosition = (url: string): string => {
  if (url.includes('Boobie_Ike')) return 'center 5%';
  if (url.includes('Brian_Heder')) return 'center 8%';
  if (url.includes('Raul_Bautista')) return 'center 10%';
  if (url.includes('Real_Dimez')) return 'center 8%';
  if (url.includes('DreQuan_Priest')) return 'center 10%';
  if (url.includes('Cal_Hampton')) return 'center 10%';
  if (url.includes('Lucia_Caminos')) return 'center 10%';
  if (url.includes('Jason_Duval')) return 'center 12%';
  if (url.includes('Motel')) return 'center 12%';
  if (url.includes('Robbery')) return 'center 12%';
  if (url.includes('Lock_And_Load')) return 'center 10%';
  if (url.includes('Beach')) return 'center 15%';
  if (url.includes('Jason_and_Lucia')) return 'center 14%';
  if (url.includes('Vice_City')) return 'center 25%';
  if (url.includes('Leonida_Keys') || url.includes('Grassrivers')) return 'center 30%';
  return 'center 15%';
};

export const AtmosphericBackground: React.FC = () => {
  const { isSlideshowPaused, mobileSlideshowEnabled, motionMode, performanceMode } = useSettings();
  const [isDesktopSlideshow, setIsDesktopSlideshow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = window.innerWidth < 1024;
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
    const isSaveData = connection?.saveData === true;
    return (!isMobile || mobileSlideshowEnabled) && !prefersReducedMotion && !isSaveData && !performanceMode;
  });
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());

  // Memory-optimized dual slots (Slot A and Slot B)
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [slotASrc, setSlotASrc] = useState<string | null>(SLIDESHOW_IMAGES[0]);
  const [slotBSrc, setSlotBSrc] = useState<string | null>(null);

  const [slotAOpacity, setSlotAOpacity] = useState<number>(1);
  const [slotBOpacity, setSlotBOpacity] = useState<number>(0);

  const [slotAZoom, setSlotAZoom] = useState<boolean>(true);
  const [slotBZoom, setSlotBZoom] = useState<boolean>(false);

  const preloadedImageRef = useRef<HTMLImageElement | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const rotationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pick a next random image index preferring locally optimized slideshow images
  const getNextRandomIndex = useCallback(
    (current: number, failedSet: Set<number>): number => {
      const optimizedIndices: number[] = [];
      const fallbackIndices: number[] = [];
      for (let i = 0; i < SLIDESHOW_IMAGES.length; i++) {
        if (i !== current && !failedSet.has(i)) {
          if (getOptimizedImageData(SLIDESHOW_IMAGES[i], 1280).isOptimized) {
            optimizedIndices.push(i);
          } else {
            fallbackIndices.push(i);
          }
        }
      }
      const pool = optimizedIndices.length > 0 ? optimizedIndices : fallbackIndices;
      if (pool.length === 0) return 0;
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    },
    []
  );

  // Viewport & Settings eligibility check (Desktop >= 1024px OR Mobile with mobileSlideshowEnabled)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkEligibility = () => {
      const isMobile = window.innerWidth < 1024;
      const isDesktop = !isMobile;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      const isSaveData = connection?.saveData === true;

      const isAllowed = (isDesktop || (isMobile && mobileSlideshowEnabled)) && !prefersReducedMotion && !isSaveData && !performanceMode;

      setIsDesktopSlideshow(isAllowed);
    };

    checkEligibility();

    const handleResize = () => checkEligibility();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [performanceMode, mobileSlideshowEnabled]);

  // Preload next image into memory 4 seconds before transition
  const preloadNextImage = useCallback(
    (nextIdx: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const rawUrl = SLIDESHOW_IMAGES[nextIdx];
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const targetWidth = Math.min(1920, Math.round(vw * dpr));

        preloadImageWithFallback(rawUrl, targetWidth).then((resolved) => {
          if (resolved) {
            resolve(true);
          } else {
            console.warn(`[AtmosphericBackground] Image failed to load: ${rawUrl}`);
            setFailedIndices((prev) => new Set(prev).add(nextIdx));
            resolve(false);
          }
        });
      });
    },
    []
  );

  // Sequential Fade-to-Black Transition
  const executeTransition = useCallback(async () => {
    if (isTransitioningRef.current || isSlideshowPaused) return;
    isTransitioningRef.current = true;

    // Determine next random index
    let nextIdx = getNextRandomIndex(currentIndex, failedIndices);
    let isReady = await preloadNextImage(nextIdx);

    if (!isReady) {
      nextIdx = getNextRandomIndex(currentIndex, failedIndices);
      isReady = await preloadNextImage(nextIdx);
    }

    if (!isReady || isSlideshowPaused) {
      isTransitioningRef.current = false;
      return;
    }

    const nextUrl = SLIDESHOW_IMAGES[nextIdx];
    const targetSlot = activeSlot === 'A' ? 'B' : 'A';

    // STEP 1: Fade out current image to completely black over 1.5s
    if (activeSlot === 'A') {
      setSlotAOpacity(0);
    } else {
      setSlotBOpacity(0);
    }

    // STEP 2: Hold black screen for 300ms after 1.5s fade out completes
    setTimeout(() => {
      if (isSlideshowPaused) {
        isTransitioningRef.current = false;
        return;
      }

      // STEP 3: Unmount previous image slot & mount next image in target slot (0 opacity)
      if (activeSlot === 'A') {
        setSlotASrc(null);
        setSlotAZoom(false);

        setSlotBSrc(nextUrl);
        setSlotBZoom(true);
        requestAnimationFrame(() => {
          setSlotBOpacity(1);
        });
      } else {
        setSlotBSrc(null);
        setSlotBZoom(false);

        setSlotASrc(nextUrl);
        setSlotAZoom(true);
        requestAnimationFrame(() => {
          setSlotAOpacity(1);
        });
      }

      // STEP 4: After 1.5s fade in finishes, complete transition
      setTimeout(() => {
        setActiveSlot(targetSlot);
        setCurrentIndex(nextIdx);
        isTransitioningRef.current = false;
      }, FADE_IN_DURATION_MS);
    }, FADE_OUT_DURATION_MS + BLACK_HOLD_DURATION_MS);
  }, [activeSlot, currentIndex, failedIndices, getNextRandomIndex, isSlideshowPaused, preloadNextImage]);

  // Main timer loop for slideshow rotation
  useEffect(() => {
    if (!isDesktopSlideshow || isSlideshowPaused) return;

    let isTabHidden = document.visibilityState === 'hidden';

    const scheduleNextRotation = () => {
      if (isTabHidden || isSlideshowPaused) return;

      preloadTimerRef.current = setTimeout(() => {
        const upcomingIndex = getNextRandomIndex(currentIndex, failedIndices);
        preloadNextImage(upcomingIndex);
      }, DISPLAY_DURATION_MS - PRELOAD_LEAD_TIME_MS);

      rotationTimerRef.current = setTimeout(() => {
        executeTransition();
      }, DISPLAY_DURATION_MS);
    };

    scheduleNextRotation();

    const handleVisibilityChange = () => {
      isTabHidden = document.visibilityState === 'hidden';
      if (isTabHidden) {
        if (preloadTimerRef.current) clearTimeout(preloadTimerRef.current);
        if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
      } else if (!isSlideshowPaused) {
        scheduleNextRotation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (preloadTimerRef.current) clearTimeout(preloadTimerRef.current);
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (preloadedImageRef.current) {
        preloadedImageRef.current.onload = null;
        preloadedImageRef.current.onerror = null;
        preloadedImageRef.current = null;
      }
    };
  }, [
    isDesktopSlideshow,
    isSlideshowPaused,
    currentIndex,
    failedIndices,
    executeTransition,
    getNextRandomIndex,
    preloadNextImage,
  ]);

  const useZoomEffect = motionMode === 'high' && !performanceMode;

  return (
    <div
      className="fixed inset-0 w-screen h-screen h-[100dvh] pointer-events-none overflow-hidden z-0 select-none bg-[#08090D] transform-gpu translate-z-0"
      aria-hidden="true"
    >
      {/* 1. Static Baseline Fallback Layer (Mounted only when Paused, on Mobile, or Reduced Motion) */}
      {(!isDesktopSlideshow || isSlideshowPaused || (!slotASrc && !slotBSrc)) && (
        <OptimizedImage
          src={DEFAULT_STATIC_POSTER}
          alt=""
          maxWidth={1920}
          sizes="100vw"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-100 transition-opacity duration-1000"
        />
      )}

      {/* 2. Desktop Sequential Fade-to-Black Slideshow Layers */}
      {isDesktopSlideshow && !isSlideshowPaused && (
        <>
          {/* Image Slot A */}
          {slotASrc && (
            <OptimizedImage
              src={slotASrc}
              alt=""
              maxWidth={1920}
              sizes="100vw"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={() => {
                const idx = SLIDESHOW_IMAGES.indexOf(slotASrc);
                if (idx !== -1) setFailedIndices((prev) => new Set(prev).add(idx));
              }}
              style={{
                opacity: slotAOpacity * 0.80,
                objectFit: 'cover',
                objectPosition: getImageObjectPosition(slotASrc),
                transform: useZoomEffect && slotAZoom ? 'scale(1.015)' : 'scale(1.00)',
                transition: 'opacity 1500ms ease-in-out, transform 12000ms linear',
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          )}

          {/* Image Slot B */}
          {slotBSrc && (
            <OptimizedImage
              src={slotBSrc}
              alt=""
              maxWidth={1920}
              sizes="100vw"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={() => {
                const idx = SLIDESHOW_IMAGES.indexOf(slotBSrc);
                if (idx !== -1) setFailedIndices((prev) => new Set(prev).add(idx));
              }}
              style={{
                opacity: slotBOpacity * 0.80,
                objectFit: 'cover',
                objectPosition: getImageObjectPosition(slotBSrc),
                transform: useZoomEffect && slotBZoom ? 'scale(1.015)' : 'scale(1.00)',
                transition: 'opacity 1500ms ease-in-out, transform 12000ms linear',
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          )}
        </>
      )}

      {/* 3. Gradient Scrims for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/80 via-[#08090D]/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#08090D]/50 via-transparent to-[#08090D]/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--theme-accent,#FF4FA3)]/5 via-transparent to-black/25" />
    </div>
  );
};
