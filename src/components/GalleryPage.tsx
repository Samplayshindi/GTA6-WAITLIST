import React, { useState, useMemo, useEffect, useRef, Suspense, lazy } from 'react';
import { Image as ImageIcon, ZoomIn, ChevronDown } from 'lucide-react';
import { GALLERY_IMAGES, GALLERY_CATEGORIES, GalleryImage, isCuratedArtworkAsset } from '../data/galleryData';
import { OptimizedImage } from './OptimizedImage';
import { RevealOnScroll } from './RevealOnScroll';
import { useSettings } from '../context/SettingsContext';
import { isImagePreloaded, preloadImageWithFallback } from '../utils/imageUtils';

const ImageLightboxModal = lazy(() =>
  import('./ImageLightboxModal').then((m) => ({ default: m.ImageLightboxModal }))
);

interface GalleryPageProps {
  onNavigateHome?: () => void;
  isPrimaryRoute?: boolean;
  isActive?: boolean;
}

const LOADED_GALLERY_CARD_IDS = new Set<string>();
const galleryCardCallbacks = new WeakMap<Element, () => void>();
let sharedGalleryObserver: IntersectionObserver | null = null;

function getSharedGalleryObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return null;
  if (!sharedGalleryObserver) {
    sharedGalleryObserver = new IntersectionObserver(
      (entries) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (entry.isIntersecting) {
            const cb = galleryCardCallbacks.get(entry.target);
            if (cb) {
              cb();
              sharedGalleryObserver?.unobserve(entry.target);
              galleryCardCallbacks.delete(entry.target);
            }
          }
        }
      },
      { rootMargin: '350px 0px', threshold: 0.01 }
    );
  }
  return sharedGalleryObserver;
}

function filterGalleryByCategory(category: string): GalleryImage[] {
  if (category === 'all') return GALLERY_IMAGES;
  if (category === 'artworks') return GALLERY_IMAGES.filter(isCuratedArtworkAsset);
  return GALLERY_IMAGES.filter((img) => img.category === category);
}

function estimateGalleryThumbWidth(isMobile: boolean): number {
  if (typeof window === 'undefined') return 375;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssWidth = isMobile ? 220 : 290;
  return cssWidth * dpr > 420 ? 768 : 375;
}

interface GalleryGridCardProps {
  img: GalleryImage;
  idx: number;
  eagerMount: boolean;
  prioritizeFirstRow: boolean;
  initiallyLoaded: boolean;
  onSelect: (index: number) => void;
  onCardLoaded: (id: string) => void;
}

const GalleryGridCard: React.FC<GalleryGridCardProps> = React.memo(
  ({ img, idx, eagerMount, prioritizeFirstRow, initiallyLoaded, onSelect, onCardLoaded }) => {
    const cardRef = useRef<HTMLButtonElement | null>(null);
    const [shouldMountImg, setShouldMountImg] = useState<boolean>(
      () => eagerMount || initiallyLoaded || LOADED_GALLERY_CARD_IDS.has(img.id)
    );
    const [isLoaded, setIsLoaded] = useState<boolean>(
      () => initiallyLoaded || LOADED_GALLERY_CARD_IDS.has(img.id)
    );

    useEffect(() => {
      if (shouldMountImg) return;
      if (eagerMount || LOADED_GALLERY_CARD_IDS.has(img.id)) {
        setShouldMountImg(true);
        return;
      }
      const el = cardRef.current;
      const obs = getSharedGalleryObserver();
      if (!el || !obs) {
        setShouldMountImg(true);
        return;
      }
      galleryCardCallbacks.set(el, () => setShouldMountImg(true));
      obs.observe(el);
      return () => {
        obs.unobserve(el);
        galleryCardCallbacks.delete(el);
      };
    }, [eagerMount, img.id, shouldMountImg]);

    const handleLoaded = () => {
      LOADED_GALLERY_CARD_IDS.add(img.id);
      if (!isLoaded) {
        setIsLoaded(true);
        onCardLoaded(img.id);
      }
    };

    const loadingMode: 'eager' | 'lazy' =
      prioritizeFirstRow && idx < 8 ? 'eager' : 'lazy';
    const fetchPriority: 'high' | 'auto' =
      prioritizeFirstRow && idx < 4 ? 'high' : 'auto';

    return (
      <button
        ref={cardRef}
        type="button"
        onClick={() => onSelect(idx)}
        className="gallery-card group relative w-full text-left rounded-2xl bg-[#090C10] border border-white/10 overflow-hidden shadow-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary,#F15A24)]"
      >
        {/* Strict 16:9 Aspect Ratio Cell with GPU-Friendly Hover Zoom */}
        <div className="relative w-full aspect-video overflow-hidden bg-[#12141C]">
          {!isLoaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent animate-pulse pointer-events-none"
            />
          )}
          {shouldMountImg && (
            <OptimizedImage
              src={img.url}
              alt={img.title}
              maxWidth={768}
              sizes="(max-width: 379px) 92vw, (max-width: 1023px) 46vw, (max-width: 1279px) 23vw, 290px"
              loading={loadingMode}
              decoding="async"
              fetchPriority={fetchPriority}
              onLoad={handleLoaded}
              className="gallery-card-media relative z-[1] w-full h-full object-cover brightness-95 group-hover:brightness-105"
            />
          )}

          {/* Ambient Scrim Overlay for Readable Caption Contrast */}
          <div className="gallery-card-scrim absolute inset-0 z-[2] bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-95 pointer-events-none" />

          {/* Hover Zoom Icon Affordance */}
          <div className="gallery-card-zoom absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 pointer-events-none">
            <div
              className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: 'var(--theme-primary, #F15A24)' }}
            >
              <ZoomIn className="w-5 h-5" />
            </div>
          </div>

          {/* Clean Unobtrusive Title Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10 pointer-events-none">
            <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors duration-300 line-clamp-1">
              {img.title}
            </h3>
          </div>
        </div>
      </button>
    );
  }
);

GalleryGridCard.displayName = 'GalleryGridCard';

export const GalleryPage: React.FC<GalleryPageProps> = ({ isPrimaryRoute = true, isActive = true }) => {
  const { motionMode } = useSettings();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [displayedCategory, setDisplayedCategory] = useState<string>('all');
  const [isPreparingCategory, setIsPreparingCategory] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isActive && lightboxIndex !== null) {
      setLightboxIndex(null);
    }
  }, [isActive, lightboxIndex]);
  const [mobileVisibleCount, setMobileVisibleCount] = useState<number>(12);
  const [loadedImageIds, setLoadedImageIds] = useState<Record<string, true>>({});
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 639px)').matches
      : false
  );

  const switchSeqRef = useRef<number>(0);
  const loadedImageIdsRef = useRef<Record<string, true>>(loadedImageIds);
  loadedImageIdsRef.current = loadedImageIds;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const onChange = () => setIsMobileViewport(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: GALLERY_IMAGES.length,
      artworks: 0,
    };
    for (const img of GALLERY_IMAGES) {
      counts[img.category] = (counts[img.category] || 0) + 1;
      if (isCuratedArtworkAsset(img)) {
        counts.artworks += 1;
      }
    }
    return counts;
  }, []);

  // Immediate target count metadata for active tab UI feedback
  const activeFilteredImages = useMemo(
    () => filterGalleryByCategory(activeCategory),
    [activeCategory]
  );

  // Rendered grid images stay on the previous category until the next category's visible row is ready
  const displayedImages = useMemo(
    () => filterGalleryByCategory(displayedCategory),
    [displayedCategory]
  );

  const renderedImages = useMemo(() => {
    if (isMobileViewport && displayedCategory !== 'artworks') {
      return displayedImages.slice(0, mobileVisibleCount);
    }
    return displayedImages;
  }, [isMobileViewport, displayedCategory, displayedImages, mobileVisibleCount]);

  // Keep previous category visible while preloading ONLY the first visible viewport batch of target category
  useEffect(() => {
    if (activeCategory === displayedCategory) {
      setIsPreparingCategory(false);
      return;
    }

    const seq = ++switchSeqRef.current;
    const targetList = filterGalleryByCategory(activeCategory);
    const thumbTargetWidth = estimateGalleryThumbWidth(isMobileViewport);
    const batchCount = isMobileViewport ? 6 : 8;
    const firstBatch = targetList.slice(0, batchCount);

    const allAlreadyReady = firstBatch.every(
      (img) =>
        loadedImageIdsRef.current[img.id] ||
        LOADED_GALLERY_CARD_IDS.has(img.id) ||
        isImagePreloaded(img.url, thumbTargetWidth)
    );

    if (allAlreadyReady) {
      setMobileVisibleCount(12);
      setDisplayedCategory(activeCategory);
      setIsPreparingCategory(false);
      return;
    }

    let cancelled = false;
    setIsPreparingCategory(true);

    const preloadPromises = firstBatch.map((img) =>
      preloadImageWithFallback(img.url, thumbTargetWidth)
    );
    const maxPrepareWindowMs = 650;

    Promise.race([
      Promise.allSettled(preloadPromises),
      new Promise<void>((resolve) => setTimeout(resolve, maxPrepareWindowMs)),
    ]).then(() => {
      if (cancelled || switchSeqRef.current !== seq) return;
      setMobileVisibleCount(12);
      setDisplayedCategory(activeCategory);
      setIsPreparingCategory(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, displayedCategory, isMobileViewport]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleShowMoreMobile = () => {
    setMobileVisibleCount((prev) => Math.min(prev + 12, displayedImages.length));
  };

  const markCardLoaded = useMemo(
    () => (id: string) => {
      LOADED_GALLERY_CARD_IDS.add(id);
      setLoadedImageIds((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    },
    []
  );

  const thumbTargetWidth = estimateGalleryThumbWidth(isMobileViewport);
  const eagerMountLimit = isPrimaryRoute ? (isMobileViewport ? 6 : 12) : 0;

  return (
    <div className="min-h-screen py-10 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header & Filter Control Bar */}
      <RevealOnScroll immediate>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: 'var(--theme-accent, #FF4FA3)' }}
              />
              <span
                className="text-xs font-mono font-bold tracking-[0.25em] uppercase"
                style={{ color: 'var(--theme-accent, #FF4FA3)' }}
              >
                Official Rockstar Media Archive
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
              Grand Theft Auto VI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent,#FF4FA3)] to-[var(--theme-primary,#F15A24)]">Gallery</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              High-resolution in-engine screenshots, official character key art, and environment showcases captured directly from PlayStation 5 and Xbox Series X|S.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#090C10]/80 px-4 py-2 rounded-full border border-white/10 shrink-0 self-start md:self-auto">
            {isPreparingCategory ? (
              <span
                aria-hidden="true"
                className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-[var(--theme-primary,#F15A24)] animate-spin shrink-0"
              />
            ) : (
              <ImageIcon className="w-4 h-4 text-[var(--theme-primary,#F15A24)]" />
            )}
            <span>{activeFilteredImages.length} Official Assets</span>
          </div>
        </div>
      </RevealOnScroll>

      {/* 2. Responsive Segmented Category Filter Tabs */}
      <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max bg-[#090C10]/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 min-h-[40px] whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--theme-primary, #F15A24)' : undefined,
                }}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Consistent Responsive Grid (Desktop 4 cols, Tablet 2 cols, Mobile 2 or 1 col) */}
      {displayedImages.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#090C10]/60 border border-white/10 px-6">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-300">No media found in this category.</p>
        </div>
      ) : (
        <div
          className={`space-y-8 transition-opacity duration-150 ${
            isPreparingCategory ? 'opacity-85' : 'opacity-100'
          } ${motionMode === 'low' ? 'gallery-reduced-motion' : ''}`}
        >
          <div
            data-testid="gallery-grid"
            className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
          >
            {renderedImages.map((img, idx) => (
              <GalleryGridCard
                key={img.id}
                img={img}
                idx={idx}
                eagerMount={idx < eagerMountLimit}
                prioritizeFirstRow={isPrimaryRoute}
                initiallyLoaded={Boolean(
                  loadedImageIds[img.id] ||
                  LOADED_GALLERY_CARD_IDS.has(img.id) ||
                  isImagePreloaded(img.url, thumbTargetWidth)
                )}
                onSelect={setLightboxIndex}
                onCardLoaded={markCardLoaded}
              />
            ))}
          </div>

          {/* Mobile "Show More" Button (only shown when mobile pagination truncates larger categories) */}
          {displayedCategory !== 'artworks' && (
            <div className="sm:hidden pt-4 flex flex-col items-center justify-center text-center">
              {mobileVisibleCount < displayedImages.length ? (
                <button
                  onClick={handleShowMoreMobile}
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#F4F1ED] bg-[#090C10] border border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl cursor-pointer"
                >
                  <span>SHOW MORE ASSETS</span>
                  <ChevronDown className="w-4 h-4 theme-text-primary" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono text-slate-400 bg-white/5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full theme-bg-primary" />
                  <span>Showing all {displayedImages.length} assets</span>
                </div>
              )}
              <p className="mt-2 text-[11px] font-mono text-slate-500">
                Viewing {Math.min(mobileVisibleCount, displayedImages.length)} of {displayedImages.length} items
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Fullscreen Interactive Lightbox Modal (Lazy-loaded on open) */}
      {lightboxIndex !== null && (
        <Suspense fallback={null}>
          <ImageLightboxModal
            images={displayedImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigateIndex={(newIndex) => setLightboxIndex(newIndex)}
          />
        </Suspense>
      )}
    </div>
  );
};
