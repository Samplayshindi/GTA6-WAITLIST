import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Film, Play, Pause } from 'lucide-react';

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

const DEFAULT_STATIC_POSTER = '/images/hero-4k.jpg';
const DISPLAY_DURATION_MS = 12000; // 12 seconds per image display
const FADE_OUT_DURATION_MS = 1500; // 1.5s fade out to black
const BLACK_HOLD_DURATION_MS = 300; // 300ms hold on completely black screen
const FADE_IN_DURATION_MS = 1500; // 1.5s fade in from black
const PRELOAD_LEAD_TIME_MS = 4000; // Preload next image 4s before transition
const PAUSE_STORAGE_KEY = 'gtavi_slideshow_paused';

// Smart per-image object positioning to ensure character faces, heads, and skies are never cropped
const getImageObjectPosition = (url: string): string => {
  if (url.includes('Jason') || url.includes('Lucia') || url.includes('Caminos') || url.includes('Duval')) {
    return 'center 18%'; // Frame character faces and heads cleanly
  }
  if (
    url.includes('Brian') ||
    url.includes('Raul') ||
    url.includes('Dimez') ||
    url.includes('Priest') ||
    url.includes('Boobie') ||
    url.includes('Hampton')
  ) {
    return 'center 20%';
  }
  if (url.includes('Vice_City') || url.includes('Leonida_Keys') || url.includes('Grassrivers')) {
    return 'center 28%';
  }
  return 'center 22%';
};

export const AtmosphericBackground: React.FC = () => {
  const [isDesktopSlideshow, setIsDesktopSlideshow] = useState<boolean>(false);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());

  // Slideshow user play/pause preference
  const [isPaused, setIsPaused] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(PAUSE_STORAGE_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

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

  // Toggle play/pause state
  const togglePlayPause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(PAUSE_STORAGE_KEY, String(next));
      } catch {
        // Fallback
      }
      return next;
    });
  }, []);

  // Pick a next random image index without consecutive repetition or failed images
  const getNextRandomIndex = useCallback(
    (current: number, failedSet: Set<number>): number => {
      const validIndices: number[] = [];
      for (let i = 0; i < SLIDESHOW_IMAGES.length; i++) {
        if (i !== current && !failedSet.has(i)) {
          validIndices.push(i);
        }
      }
      if (validIndices.length === 0) return 0;
      const randomIndex = Math.floor(Math.random() * validIndices.length);
      return validIndices[randomIndex];
    },
    []
  );

  // Viewport detection (Desktop >= 1024px, no reduced motion, no saveData)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDesktopEligibility = () => {
      const isDesktop = window.innerWidth >= 1024;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const connection = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      const isSaveData = connection?.saveData === true;

      setIsDesktopSlideshow(isDesktop && !prefersReducedMotion && !isSaveData);
    };

    checkDesktopEligibility();

    const handleResize = () => checkDesktopEligibility();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preload next image into memory 4 seconds before transition
  const preloadNextImage = useCallback(
    (nextIdx: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const url = SLIDESHOW_IMAGES[nextIdx];
        const img = new Image();
        preloadedImageRef.current = img;

        img.onload = () => {
          resolve(true);
        };

        img.onerror = () => {
          console.warn(`[AtmosphericBackground] Image failed to load: ${url}`);
          setFailedIndices((prev) => new Set(prev).add(nextIdx));
          resolve(false);
        };

        img.src = url;
      });
    },
    []
  );

  // Sequential Fade-to-Black Transition:
  // 1. Fade out active image to black (1.5s)
  // 2. Hold black screen (300ms)
  // 3. Fade in next image from black (1.5s)
  const executeTransition = useCallback(async () => {
    if (isTransitioningRef.current || isPaused) return;
    isTransitioningRef.current = true;

    // Determine next random index
    let nextIdx = getNextRandomIndex(currentIndex, failedIndices);
    let isReady = await preloadNextImage(nextIdx);

    if (!isReady) {
      nextIdx = getNextRandomIndex(currentIndex, failedIndices);
      isReady = await preloadNextImage(nextIdx);
    }

    if (!isReady || isPaused) {
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
      if (isPaused) {
        isTransitioningRef.current = false;
        return;
      }

      // STEP 3: Unmount previous image slot & mount next image in target slot (0 opacity)
      if (activeSlot === 'A') {
        setSlotASrc(null);
        setSlotAZoom(false);

        setSlotBSrc(nextUrl);
        setSlotBZoom(true);
        // Trigger fade in from black
        requestAnimationFrame(() => {
          setSlotBOpacity(1);
        });
      } else {
        setSlotBSrc(null);
        setSlotBZoom(false);

        setSlotASrc(nextUrl);
        setSlotAZoom(true);
        // Trigger fade in from black
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
  }, [activeSlot, currentIndex, failedIndices, getNextRandomIndex, isPaused, preloadNextImage]);

  // Main timer loop for slideshow rotation
  useEffect(() => {
    if (!isDesktopSlideshow || isPaused) return;

    let isTabHidden = document.visibilityState === 'hidden';

    const scheduleNextRotation = () => {
      if (isTabHidden || isPaused) return;

      // 1. Preload lead timer (at t = 8 seconds)
      preloadTimerRef.current = setTimeout(() => {
        const upcomingIndex = getNextRandomIndex(currentIndex, failedIndices);
        preloadNextImage(upcomingIndex);
      }, DISPLAY_DURATION_MS - PRELOAD_LEAD_TIME_MS);

      // 2. Full rotation transition timer (at t = 12 seconds)
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
      } else if (!isPaused) {
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
    isPaused,
    currentIndex,
    failedIndices,
    executeTransition,
    getNextRandomIndex,
    preloadNextImage,
  ]);

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#08090D]"
        aria-hidden="true"
      >
        {/* 1. Mobile & Static Baseline Fallback Layer (Used on Mobile <1024px or Reduced Motion) */}
        <img
          src={DEFAULT_STATIC_POSTER}
          alt=""
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            isDesktopSlideshow && (slotASrc || slotBSrc) ? 'opacity-0' : 'opacity-40 scale-100'
          }`}
        />

        {/* 2. Desktop Sequential Fade-to-Black Slideshow Layers */}
        {isDesktopSlideshow && (
          <>
            {/* Image Slot A */}
            {slotASrc && (
              <img
                src={slotASrc}
                alt=""
                loading="lazy"
                onError={() => {
                  const idx = SLIDESHOW_IMAGES.indexOf(slotASrc);
                  if (idx !== -1) setFailedIndices((prev) => new Set(prev).add(idx));
                }}
                style={{
                  opacity: slotAOpacity * 0.80, // Vibrant 80% opacity
                  objectFit: 'cover',
                  objectPosition: getImageObjectPosition(slotASrc),
                  transform: slotAZoom ? 'scale(1.04)' : 'scale(1.00)',
                  transition: 'opacity 1500ms ease-in-out, transform 12000ms linear',
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            )}

            {/* Image Slot B */}
            {slotBSrc && (
              <img
                src={slotBSrc}
                alt=""
                loading="lazy"
                onError={() => {
                  const idx = SLIDESHOW_IMAGES.indexOf(slotBSrc);
                  if (idx !== -1) setFailedIndices((prev) => new Set(prev).add(idx));
                }}
                style={{
                  opacity: slotBOpacity * 0.80, // Vibrant 80% opacity
                  objectFit: 'cover',
                  objectPosition: getImageObjectPosition(slotBSrc),
                  transform: slotBZoom ? 'scale(1.04)' : 'scale(1.00)',
                  transition: 'opacity 1500ms ease-in-out, transform 12000ms linear',
                }}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            )}
          </>
        )}

        {/* 3. Subtle & Lightened Contrast Gradient Scrims for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/80 via-[#08090D]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090D]/50 via-transparent to-[#08090D]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FF4FA3]/5 via-transparent to-black/25" />
      </div>

      {/* 4. Desktop Slideshow Play/Pause Control (Preserved and active across every tab) */}
      {isDesktopSlideshow && (
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={isPaused ? 'Play background slideshow' : 'Pause background slideshow'}
          title={isPaused ? 'Play background slideshow' : 'Pause background slideshow'}
          className="fixed right-3 sm:right-6 bottom-[124px] sm:bottom-[144px] md:bottom-[92px] md:right-20 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121318]/90 hover:bg-[#1C1D24] border border-[#24262B] hover:border-[#FF4FA3]/50 text-slate-300 hover:text-white shadow-[0_8px_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-xs font-mono select-none pointer-events-auto"
        >
          <Film className="w-3.5 h-3.5 text-[#FF4FA3]" />
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              <span className="hidden xs:inline text-[10px] sm:text-xs tracking-wider text-slate-300 font-medium">
                SLIDESHOW PAUSED
              </span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-[#FF4FA3]" />
              <span className="hidden xs:inline text-[10px] sm:text-xs tracking-wider text-slate-300 font-medium">
                SLIDESHOW
              </span>
            </>
          )}
        </button>
      )}
    </>
  );
};
