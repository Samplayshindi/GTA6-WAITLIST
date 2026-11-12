import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { GalleryImage } from '../data/galleryData';
import { getResponsiveImageUrl } from '../utils/imageUtils';
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
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);

  // Animation lock to prevent rapid clicks from breaking transitions
  const isAnimatingRef = useRef<boolean>(false);

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const activeImage = currentIndex !== null && images[currentIndex] ? images[currentIndex] : null;

  const [showGestureGuide, setShowGestureGuide] = useState<boolean>(true);

  // Reset loading state and show gesture guide (fading out after 3.5s) on image change
  useEffect(() => {
    setImageLoaded(false);
    setHasError(false);
    setShowGestureGuide(true);

    const timer = setTimeout(() => {
      setShowGestureGuide(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Preload adjacent next and previous images only
  useEffect(() => {
    if (currentIndex === null || images.length === 0) return;

    const nextIdx = (currentIndex + 1) % images.length;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;

    const imgNext = new Image();
    imgNext.src = getResponsiveImageUrl(images[nextIdx].url, 1920);

    const imgPrev = new Image();
    imgPrev.src = getResponsiveImageUrl(images[prevIdx].url, 1920);
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

  return (
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
          className={`relative max-w-full max-h-[64vh] sm:max-h-[72vh] w-auto flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-[#090C10] border border-white/10 shadow-2xl ${slideAnimationClass}`}
        >
          {/* Skeleton Loader */}
          {!imageLoaded && !hasError && (
            <div className="w-[85vw] sm:w-[80vw] h-[45vh] sm:h-[55vh] max-w-4xl max-h-[600px] flex flex-col items-center justify-center bg-[#090C10] animate-pulse">
              <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 theme-text-primary mb-3 animate-bounce" />
              <span className="text-[11px] sm:text-xs font-mono text-slate-500 uppercase tracking-widest">
                Loading High-Res Artwork...
              </span>
            </div>
          )}

          {/* Broken Image Fallback */}
          {hasError && (
            <div className="p-8 sm:p-12 text-center bg-[#121318] border border-red-500/30 rounded-2xl">
              <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-bold text-slate-200">Failed to load media asset</p>
            </div>
          )}

          {/* Full-Resolution Image */}
          {!hasError && (
            <img
              src={fullResUrl}
              alt={activeImage.title}
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(true);
                setHasError(true);
              }}
              className={`max-w-full max-h-[64vh] sm:max-h-[72vh] w-auto h-auto object-contain transition-all duration-300 shadow-2xl ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
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
};
