import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ExternalLink, AlertCircle, RotateCcw } from 'lucide-react';
import { GalleryImage } from '../data/galleryData';
import {
  getResponsiveImageUrl,
  getPreferredPreloadUrl,
  estimateLightboxTargetWidth,
} from '../utils/imageUtils';
import { OptimizedImage } from './OptimizedImage';
import { useSettings } from '../context/SettingsContext';

interface ImageLightboxModalProps {
  images: GalleryImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigateIndex: (newIndex: number) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigateIndex,
}) => {
  const { motionMode } = useSettings();
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);

  // Animation lock to prevent rapid clicks from breaking transitions
  const isAnimatingRef = useRef<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const prevIndexRef = useRef<number | null>(currentIndex);

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const activeImage = currentIndex !== null && images[currentIndex] ? images[currentIndex] : null;
  const currentFullResUrl = activeImage ? getResponsiveImageUrl(activeImage.url, 1920) : '';

  const [showGestureGuide, setShowGestureGuide] = useState<boolean>(true);

  // Synchronize loading state immediately before paint (prevents loader flicker for cached/preloaded images)
  useLayoutEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      if (retryCount !== 0) {
        setRetryCount(0);
        return;
      }
    }

    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      setImageLoaded(true);
      setHasError(false);
    } else {
      setImageLoaded(false);
      setHasError(false);
    }
  }, [currentIndex, retryCount, currentFullResUrl]);

  // Show gesture guide (fading out after 3.5s) on image change
  useEffect(() => {
    setShowGestureGuide(true);

    const timer = setTimeout(() => {
      setShowGestureGuide(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Preload adjacent next and previous images using matching format & viewport-appropriate width
  useEffect(() => {
    if (currentIndex === null || images.length === 0) return;

    let cancelled = false;
    const nextIdx = (currentIndex + 1) % images.length;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;
    const targetWidth = estimateLightboxTargetWidth();

    const imgNext = new Image();
    const imgPrev = new Image();

    getPreferredPreloadUrl(images[nextIdx].url, targetWidth).then((url) => {
      if (!cancelled && url) imgNext.src = url;
    });

    getPreferredPreloadUrl(images[prevIdx].url, targetWidth).then((url) => {
      if (!cancelled && url) imgPrev.src = url;
    });

    return () => {
      cancelled = true;
    };
  }, [currentIndex, images]);

  // Handle Close with smooth animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Navigation handlers with debounce & direction locking
  const handleNext = useCallback(() => {
    if (currentIndex === null || images.length <= 1 || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setSlideDirection('next');
    onNavigateIndex((currentIndex + 1) % images.length);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 350);
  }, [currentIndex, images.length, onNavigateIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null || images.length <= 1 || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setSlideDirection('prev');
    onNavigateIndex((currentIndex - 1 + images.length) % images.length);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 350);
  }, [currentIndex, images.length, onNavigateIndex]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setImageLoaded(false);
    setRetryCount((prev) => prev + 1);
  }, []);

  // Keyboard navigation & Escape key listener
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, handleClose, handleNext, handlePrev]);

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Horizontal swipe threshold: 50px
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    } else if (Math.abs(deltaY) > 120 && Math.abs(deltaY) > Math.abs(deltaX)) {
      handleClose();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (currentIndex === null || !activeImage) return null;

  const fullResUrl = getResponsiveImageUrl(activeImage.url, 1920);

  // Check if low motion preference or setting is active
  const isLowMotion =
    motionMode === 'low' ||
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const slideAnimationClass = isLowMotion
    ? ''
    : slideDirection === 'next'
    ? 'animate-slide-in-right'
    : slideDirection === 'prev'
    ? 'animate-slide-in-left'
    : '';

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${activeImage.title} Lightbox`}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-black/95 backdrop-blur-2xl transition-all duration-300 ${
        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in duration-200'
      }`}
    >
      {/* =========================================
          ALWAYS-VISIBLE FLOATING MOBILE TOP-RIGHT (X) BUTTON (< sm)
         ========================================= */}
      <button
        onClick={handleClose}
        aria-label="Close image viewer"
        title="Close viewer"
        className="sm:hidden fixed top-3 right-3 z-[999] p-3 rounded-full bg-[var(--theme-primary,#FF4FA3)] text-white border-2 border-white shadow-2xl backdrop-blur-xl min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95 cursor-pointer pointer-events-auto"
      >
        <X className="w-6 h-6 stroke-[3] text-white" />
      </button>

      {/* =========================================
          MOBILE VIEWER HEADER BAR (< sm)
         ========================================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="sm:hidden w-full pl-4 pr-16 py-3 bg-[#08090D]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-[125] shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono font-bold text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/10 shrink-0">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="text-xs text-slate-300 font-bold truncate max-w-[140px] font-sans">
            {activeImage.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={fullResUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open high-resolution asset"
            className="p-2 rounded-full bg-white/10 text-slate-300 hover:text-white min-w-[38px] min-h-[38px] flex items-center justify-center cursor-pointer border border-white/10"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* =========================================
          DESKTOP TOP CONTROLS (>= sm)
         ========================================= */}
      <button
        onClick={handleClose}
        aria-label="Close fullscreen view"
        title="Close (Esc)"
        className="hidden sm:flex fixed top-20 right-4 sm:top-24 sm:right-6 z-[120] p-3 rounded-full bg-black/80 hover:bg-[var(--theme-primary,#FF4FA3)] text-white backdrop-blur-xl shadow-2xl transition-all cursor-pointer min-w-[48px] min-h-[48px] items-center justify-center hover:scale-110 active:scale-95 pointer-events-auto border border-white/20"
      >
        <X className="w-6 h-6 stroke-[2.5]" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="hidden sm:flex fixed top-20 left-4 sm:top-24 sm:left-6 z-[115] items-center gap-3 pointer-events-auto"
      >
        <span className="text-xs font-mono text-slate-200 bg-black/80 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-lg">
          {currentIndex + 1} / {images.length}
        </span>
        <a
          href={fullResUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open high-resolution image in new tab"
          className="p-2.5 rounded-full bg-black/80 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center border border-white/20 backdrop-blur-md shadow-lg"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* =========================================
          MAIN INTERACTIVE VIEWER STAGE
         ========================================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl flex-1 flex flex-col items-center justify-center px-2 sm:px-6 py-2 sm:py-6 z-[102] pointer-events-auto overflow-hidden sm:mt-16"
      >
        {/* Desktop Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="hidden sm:flex absolute left-2 sm:left-4 z-[105] p-3 rounded-full bg-black/80 hover:bg-[var(--theme-primary,#FF4FA3)] text-white border border-white/20 shadow-2xl transition-all cursor-pointer min-w-[48px] min-h-[48px] items-center justify-center hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Desktop Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="hidden sm:flex absolute right-2 sm:right-4 z-[105] p-3 rounded-full bg-black/80 hover:bg-[var(--theme-primary,#FF4FA3)] text-white border border-white/20 shadow-2xl transition-all cursor-pointer min-w-[48px] min-h-[48px] items-center justify-center hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Fullscreen Artwork Container */}
        <div
          key={currentIndex}
          className={`relative max-w-full max-h-[64vh] sm:max-h-[72vh] flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-[#090C10] border border-white/10 shadow-2xl ${
            imageLoaded && !hasError
              ? 'w-auto'
              : 'w-[90vw] sm:w-[76vw] max-w-4xl h-[46vh] sm:h-[58vh] max-h-[580px]'
          } ${slideAnimationClass}`}
        >
          {/* Centered Loading Experience (only while image has not loaded or errored) */}
          {!imageLoaded && !hasError && (
            <div
              role="status"
              aria-live="polite"
              className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center select-none"
            >
              {/* Subtle ambient radial glow matching active theme */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute w-44 h-44 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: 'var(--theme-primary, #FF4FA3)' }}
              />

              {/* Centered Dual-Ring Theme Spinner */}
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div
                  className={`absolute inset-0 rounded-full border-2 border-transparent ${
                    isLowMotion ? '' : 'animate-spin motion-reduce:animate-none'
                  }`}
                  style={{
                    borderTopColor: 'var(--theme-primary, #FF4FA3)',
                    borderRightColor: 'var(--theme-tertiary, #00F5D4)',
                    animationDuration: '0.95s',
                  }}
                />
                <div
                  className="w-2 h-2 rounded-full opacity-90"
                  style={{ backgroundColor: 'var(--theme-primary, #FF4FA3)' }}
                />
              </div>

              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-[0.28em] text-[#F4F1ED]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                LOADING ARTWORK
              </span>

              {/* Subtle Indeterminate Theme Progress Bar */}
              <div className="mt-3 w-36 sm:w-44 h-0.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/2 rounded-full theme-progress-fill animate-lightbox-progress" />
              </div>
            </div>
          )}

          {/* Clean Error State with Retry */}
          {hasError && (
            <div
              role="alert"
              className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 text-center bg-[#090C10]"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3.5">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p
                className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#F4F1ED]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Failed to load artwork
              </p>
              <p className="mt-1.5 text-xs text-slate-400 max-w-xs">
                Unable to retrieve the high-resolution image.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] text-[#F4F1ED] bg-white/5 hover:bg-white/10 border transition-all duration-200 cursor-pointer min-h-[42px] active:scale-95"
                style={{ borderColor: 'var(--theme-primary, #FF4FA3)' }}
              >
                <RotateCcw className="w-3.5 h-3.5 theme-text-primary" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Full-Resolution Responsive Optimized Image */}
          {!hasError && (
            <OptimizedImage
              key={`${currentIndex}-${retryCount}`}
              imgRef={imgRef}
              src={activeImage.url}
              alt={activeImage.title}
              maxWidth={1920}
              sizes="(max-width: 639px) 94vw, (max-width: 1279px) 90vw, 1440px"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              disableOriginalFallbackOnError
              onLoad={() => {
                setHasError(false);
                setImageLoaded(true);
              }}
              onError={() => {
                setImageLoaded(false);
                setHasError(true);
              }}
              className={`max-w-full max-h-[64vh] sm:max-h-[72vh] w-auto h-auto object-contain shadow-2xl ${
                isLowMotion
                  ? 'transition-opacity duration-200'
                  : 'transition-[opacity,transform] duration-300 ease-out'
              } ${
                imageLoaded
                  ? 'relative opacity-100 scale-100'
                  : 'absolute inset-0 m-auto opacity-0 scale-[0.985] pointer-events-none select-none'
              }`}
            />
          )}
        </div>

        {/* Animated Finger Swipe Gesture Guide Overlay for Mobile (< sm) - Fades out after 3.5s */}
        <div
          className={`sm:hidden mt-3 z-[110] flex items-center justify-center pointer-events-none transition-all duration-700 ${
            showGestureGuide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="bg-[#090C10]/95 backdrop-blur-md border border-white/20 text-[#F4F1ED] px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-3 text-[10px] font-sans">
            {/* Horizontal Finger Swipe */}
            <div className="flex items-center gap-1 text-[var(--theme-primary,#FF4FA3)] font-semibold">
              <span>←</span>
              <svg className="w-3.5 h-3.5 animate-finger-swipe-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-4 0v5" />
                <path d="M14 10V4a2 2 0 0 0-4 0v6" />
                <path d="M10 10.5V2a2 2 0 0 0-4 0v9" />
                <path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              <span>→</span>
              <span className="text-slate-300 font-normal ml-0.5">Swipe left / right</span>
            </div>

            <span className="text-slate-600">|</span>

            {/* Vertical Finger Swipe Down */}
            <div className="flex items-center gap-1 text-[var(--theme-tertiary,#00F5D4)] font-semibold">
              <svg className="w-3.5 h-3.5 animate-finger-swipe-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 11V6a2 2 0 0 0-4 0v5" />
                <path d="M14 10V4a2 2 0 0 0-4 0v6" />
                <path d="M10 10.5V2a2 2 0 0 0-4 0v9" />
                <path d="M18 11a2 2 0 0 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
              </svg>
              <span>↓</span>
              <span className="text-slate-300 font-normal ml-0.5">Swipe down to dismiss</span>
            </div>
          </div>
        </div>

        {/* Desktop Bottom Title Caption */}
        <div className="hidden sm:block mt-4 text-center max-w-2xl px-4">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {activeImage.title}
          </h3>
          <p className="mt-1 text-xs font-mono text-slate-400">
            Rockstar Games Official Asset &middot; {activeImage.category.replace('-', ' & ')}
          </p>
        </div>
      </div>

      {/* =========================================
          MOBILE VIEWER FOOTER BAR (< sm)
         ========================================= */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="sm:hidden w-full px-4 py-3 bg-[#08090D]/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-between z-[125] shrink-0"
      >
        {images.length > 1 ? (
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="p-2.5 rounded-full bg-white/10 text-white min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer border border-white/10 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : <div className="w-[44px]" />}

        <div className="text-center px-2 min-w-0 flex-1">
          <h4 className="text-xs font-bold text-white truncate font-sans">
            {activeImage.title}
          </h4>
          <p className="text-[10px] text-slate-400 font-sans truncate">
            Swipe left / right to navigate
          </p>
        </div>

        {images.length > 1 ? (
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="p-2.5 rounded-full bg-white/10 text-white min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer border border-white/10 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : <div className="w-[44px]" />}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
