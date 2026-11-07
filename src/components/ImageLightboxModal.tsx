import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { GalleryImage } from '../data/galleryData';
import { getResponsiveImageUrl } from '../utils/imageUtils';

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
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const activeImage = currentIndex !== null && images[currentIndex] ? images[currentIndex] : null;

  // Reset loading state when active image changes
  useEffect(() => {
    setImageLoaded(false);
    setHasError(false);
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

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex === null || images.length <= 1) return;
    onNavigateIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigateIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null || images.length <= 1) return;
    onNavigateIndex((currentIndex - 1 + images.length) % images.length);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${activeImage.title} Lightbox`}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl transition-all duration-300 ${
        isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-200'
      }`}
    >
      {/* Prominent High Z-Index Close Button (X) - Always visible in viewport top-right */}
      <button
        onClick={handleClose}
        aria-label="Close fullscreen view"
        title="Close (Esc)"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[110] p-3 rounded-full bg-white/10 hover:bg-[#FF4FA3] text-white backdrop-blur-xl shadow-2xl transition-all cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center hover:scale-110 active:scale-95 pointer-events-auto border border-white/20"
      >
        <X className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Top Left Counter & High-Res Link */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[105] flex items-center gap-3 pointer-events-auto"
      >
        <span className="text-xs font-mono text-slate-200 bg-black/80 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </span>
        <a
          href={fullResUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open high-resolution image in new tab"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center border border-white/10"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Interactive Viewer Stage */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-7xl max-h-[85vh] w-full flex flex-col items-center justify-center z-[102] pointer-events-auto"
      >
        {/* Previous Image Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 z-[105] p-3 rounded-full bg-black/80 hover:bg-[#FF4FA3] text-white border border-white/20 shadow-2xl transition-all cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Image Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-2 sm:right-4 z-[105] p-3 rounded-full bg-black/80 hover:bg-[#FF4FA3] text-white border border-white/20 shadow-2xl transition-all cursor-pointer min-w-[48px] min-h-[48px] flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Fullscreen Artwork Container */}
        <div className="relative max-w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-[#090C10] border border-white/10 shadow-2xl">
          {/* Skeleton Loader */}
          {!imageLoaded && !hasError && (
            <div className="w-[80vw] h-[55vh] max-w-4xl max-h-[600px] flex flex-col items-center justify-center bg-[#090C10] animate-pulse">
              <ImageIcon className="w-12 h-12 theme-text-primary mb-3 animate-bounce" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                Loading High-Res Artwork...
              </span>
            </div>
          )}

          {/* Broken Image Fallback */}
          {hasError && (
            <div className="p-12 text-center bg-[#121318] border border-red-500/30 rounded-2xl">
              <ImageIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-200">Failed to load media asset</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{fullResUrl}</p>
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
              className={`max-w-full max-h-[75vh] w-auto h-auto object-contain transition-all duration-300 shadow-2xl ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          )}
        </div>

        {/* Bottom Title Caption */}
        <div className="mt-4 text-center max-w-2xl px-4">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {activeImage.title}
          </h3>
          <p className="mt-1 text-xs font-mono text-slate-400">
            Rockstar Games Official Asset &middot; {activeImage.category.replace('-', ' & ')}
          </p>
        </div>
      </div>
    </div>
  );
};
