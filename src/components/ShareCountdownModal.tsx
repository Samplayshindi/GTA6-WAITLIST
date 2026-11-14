import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Share2,
  Check,
  Palette as PaletteIcon,
  Layers,
  Image as ImageIcon,
  LayoutGrid,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSettings, PALETTES, ColorPalette } from '../context/SettingsContext';
import { useLaunchState } from '../context/LaunchStateContext';
import { GALLERY_IMAGES, GalleryImage } from '../data/galleryData';
import { detectAvifSupport, getResponsiveImageUrl } from '../utils/imageUtils';
import { OptimizedImage } from './OptimizedImage';
import { apiUrl } from '../services/api';

interface ShareCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type CardAspect = '16:9' | '1:1' | '4:5';

const DEFAULT_VICE_CITY_BG_ID = '__default_vice_city__';
const DEFAULT_VICE_CITY_BG_URL =
  'https://www.rockstargames.com/VI/_next/static/media/VINTAGE_VICE_CITY_WEAPON_PATTERN_01.0gybtumgwdcoi.jpg';
const MAX_CACHED_BG_IMAGES = 24;
const BG_GALLERY_PAGE_SIZE = 15;

interface LoadedBgRecord {
  id: string;
  img: HTMLImageElement;
}

// Persistent module-level decoded caches so reopening the modal or switching back never re-fetches/re-decodes
const sharedBgImageCache = new Map<string, HTMLImageElement>();
const sharedBgInFlightLoads = new Map<string, Promise<HTMLImageElement>>();
let sharedLogoImageCache: HTMLImageElement | null = null;
let sharedLogoLoadPromise: Promise<HTMLImageElement | null> | null = null;

function setCachedBgImage(key: string, img: HTMLImageElement): void {
  if (sharedBgImageCache.has(key)) {
    sharedBgImageCache.delete(key);
  } else if (sharedBgImageCache.size >= MAX_CACHED_BG_IMAGES) {
    for (const oldestKey of sharedBgImageCache.keys()) {
      if (oldestKey !== DEFAULT_VICE_CITY_BG_ID) {
        sharedBgImageCache.delete(oldestKey);
        break;
      }
    }
  }
  sharedBgImageCache.set(key, img);
}

function getCachedBgImage(key: string): HTMLImageElement | null {
  const cached = sharedBgImageCache.get(key);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    // Touch LRU position
    sharedBgImageCache.delete(key);
    sharedBgImageCache.set(key, cached);
    return cached;
  }
  return null;
}

function loadAndDecodeImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img
          .decode()
          .catch(() => {})
          .finally(() => resolve(img));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    img.src = src;
  });
}

function loadBackgroundArtwork(cacheKey: string, rawUrl: string): Promise<HTMLImageElement> {
  const cached = getCachedBgImage(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inFlight = sharedBgInFlightLoads.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const loadPromise = (async () => {
    const supportsAvif = await detectAvifSupport();
    const preferredFormat: 'avif' | 'webp' = supportsAvif ? 'avif' : 'webp';
    const primaryTarget = getResponsiveImageUrl(rawUrl, 1280, preferredFormat);
    const primarySrc = primaryTarget.startsWith('/')
      ? primaryTarget
      : apiUrl(`/api/proxy-image?url=${encodeURIComponent(primaryTarget)}`);

    try {
      const img = await loadAndDecodeImage(primarySrc);
      setCachedBgImage(cacheKey, img);
      return img;
    } catch {
      // If AVIF variant failed, try local WebP before falling back to proxied original source
      if (supportsAvif) {
        const webpTarget = getResponsiveImageUrl(rawUrl, 1280, 'webp');
        if (webpTarget.startsWith('/') && webpTarget !== primaryTarget) {
          try {
            const webpImg = await loadAndDecodeImage(webpTarget);
            setCachedBgImage(cacheKey, webpImg);
            return webpImg;
          } catch {
            // Continue to original source proxy fallback below
          }
        }
      }

      const fallbackSrc = primaryTarget.startsWith('/')
        ? apiUrl(`/api/proxy-image?url=${encodeURIComponent(rawUrl)}`)
        : rawUrl;
      const fallbackImg = await loadAndDecodeImage(fallbackSrc);
      setCachedBgImage(cacheKey, fallbackImg);
      return fallbackImg;
    }
  })().finally(() => {
    sharedBgInFlightLoads.delete(cacheKey);
  });

  sharedBgInFlightLoads.set(cacheKey, loadPromise);
  return loadPromise;
}

function loadOfficialLogoOnce(): Promise<HTMLImageElement | null> {
  if (sharedLogoImageCache && sharedLogoImageCache.complete && sharedLogoImageCache.naturalWidth > 0) {
    return Promise.resolve(sharedLogoImageCache);
  }
  if (sharedLogoLoadPromise) {
    return sharedLogoLoadPromise;
  }

  sharedLogoLoadPromise = loadAndDecodeImage(`${import.meta.env.BASE_URL}gta-vi-logo.svg`)
    .then((img) => {
      sharedLogoImageCache = img;
      return img;
    })
    .catch(() => null)
    .finally(() => {
      sharedLogoLoadPromise = null;
    });

  return sharedLogoLoadPromise;
}

function getCardDimensions(aspectRatio: CardAspect): { width: number; height: number } {
  if (aspectRatio === '1:1') return { width: 1080, height: 1080 };
  if (aspectRatio === '4:5') return { width: 1080, height: 1350 };
  return { width: 1200, height: 675 };
}

function getCountdownLayout(aspectRatio: CardAspect, width: number, height: number) {
  const countdownCenterY = aspectRatio === '16:9' ? height * 0.70 : height * 0.72;
  const tileWidth = aspectRatio === '16:9' ? width * 0.17 : width * 0.19;
  const tileHeight = aspectRatio === '16:9' ? height * 0.26 : height * 0.18;
  const gap = width * 0.025;
  const totalWidth = 4 * tileWidth + 3 * gap;
  const startX = (width - totalWidth) / 2;
  return { countdownCenterY, tileWidth, tileHeight, gap, startX };
}

function drawCountdownTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number,
  canvasWidth: number,
  primaryHex: string,
  val: string,
  label: string
) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 10, 18, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = canvasWidth * 0.0025;
  ctx.beginPath();
  ctx.roundRect(x, y, tileWidth, tileHeight, canvasWidth * 0.015);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = primaryHex;
  ctx.lineWidth = canvasWidth * 0.004;
  ctx.beginPath();
  ctx.moveTo(x + canvasWidth * 0.015, y);
  ctx.lineTo(x + tileWidth - canvasWidth * 0.015, y);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(tileHeight * 0.48)}px 'Space Grotesk', system-ui, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(val, x + tileWidth / 2, y + tileHeight * 0.42);

  ctx.font = `600 ${Math.round(tileHeight * 0.15)}px 'Inter', system-ui, sans-serif`;
  ctx.fillStyle = '#94A3B8';
  ctx.fillText(label, x + tileWidth / 2, y + tileHeight * 0.80);
  ctx.restore();
}

interface BackgroundGalleryPickerProps {
  isOpen: boolean;
  isDesktop: boolean;
  isDesktopGalleryOpen: boolean;
  onOpenDesktopGallery: () => void;
  onCloseDesktopGallery: () => void;
  selectedBgImage: GalleryImage | null;
  onSelectBgImage: (item: GalleryImage | null) => void;
}

const BackgroundGalleryPicker: React.FC<BackgroundGalleryPickerProps> = React.memo(
  ({
    isOpen,
    isDesktop,
    isDesktopGalleryOpen,
    onOpenDesktopGallery,
    onCloseDesktopGallery,
    selectedBgImage,
    onSelectBgImage,
  }) => {
    const [visibleCount, setVisibleCount] = useState<number>(BG_GALLERY_PAGE_SIZE);
    const [visibleBgIds, setVisibleBgIds] = useState<Set<string>>(
      () => new Set(GALLERY_IMAGES.slice(0, 6).map((item) => item.id))
    );
    const [desktopVisibleBgIds, setDesktopVisibleBgIds] = useState<Set<string>>(() => new Set());

    const galleryStripRef = useRef<HTMLDivElement | null>(null);
    const desktopGridRef = useRef<HTMLDivElement | null>(null);

    // Reset visible batch size when modal closes so opening stays compact and fast
    useEffect(() => {
      if (!isOpen) {
        setVisibleCount(BG_GALLERY_PAGE_SIZE);
      }
    }, [isOpen]);

    const displayedImages = useMemo(
      () => GALLERY_IMAGES.slice(0, visibleCount),
      [visibleCount]
    );

    const remainingCount = GALLERY_IMAGES.length - displayedImages.length;
    const hasMore = remainingCount > 0;
    const nextBatchCount = Math.min(BG_GALLERY_PAGE_SIZE, remainingCount);
    const canShowLess = visibleCount > BG_GALLERY_PAGE_SIZE;

    const handleShowMore = useCallback(() => {
      setVisibleCount((prev) => Math.min(prev + BG_GALLERY_PAGE_SIZE, GALLERY_IMAGES.length));
    }, []);

    const handleShowLess = useCallback(() => {
      setVisibleCount(BG_GALLERY_PAGE_SIZE);
      if (desktopGridRef.current) {
        desktopGridRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (galleryStripRef.current) {
        galleryStripRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, []);

    // Observe mobile horizontal background thumbnail strip so only visible/nearby thumbnails load
    useEffect(() => {
      if (!isOpen || isDesktop) return;
      const container = galleryStripRef.current;
      if (!container) return;

      if (!('IntersectionObserver' in window)) {
        setVisibleBgIds(new Set(displayedImages.map((item) => item.id)));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const newlyVisible: string[] = [];
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('data-bg-id');
              if (id) {
                newlyVisible.push(id);
                observer.unobserve(entry.target);
              }
            }
          });
          if (newlyVisible.length > 0) {
            setVisibleBgIds((prev) => {
              const next = new Set(prev);
              newlyVisible.forEach((id) => next.add(id));
              return next;
            });
          }
        },
        {
          root: container,
          rootMargin: '0px 240px 0px 240px',
          threshold: 0.01,
        }
      );

      const targets = container.querySelectorAll('[data-bg-id]');
      targets.forEach((el) => observer.observe(el));

      return () => {
        observer.disconnect();
      };
    }, [isOpen, isDesktop, displayedImages]);

    // Observe desktop expanded gallery grid so thumbnails lazy-load as they approach visibility
    useEffect(() => {
      if (!isOpen || !isDesktop || !isDesktopGalleryOpen) return;
      const container = desktopGridRef.current;
      if (!container) return;

      if (!('IntersectionObserver' in window)) {
        setDesktopVisibleBgIds(new Set(displayedImages.map((item) => item.id)));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const newlyVisible: string[] = [];
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute('data-desktop-bg-id');
              if (id) {
                newlyVisible.push(id);
                observer.unobserve(entry.target);
              }
            }
          });
          if (newlyVisible.length > 0) {
            setDesktopVisibleBgIds((prev) => {
              const next = new Set(prev);
              newlyVisible.forEach((id) => next.add(id));
              return next;
            });
          }
        },
        {
          root: container,
          rootMargin: '160px 0px 160px 0px',
          threshold: 0.01,
        }
      );

      const targets = container.querySelectorAll('[data-desktop-bg-id]');
      targets.forEach((el) => observer.observe(el));

      return () => {
        observer.disconnect();
      };
    }, [isOpen, isDesktop, isDesktopGalleryOpen, displayedImages]);

    const selectedId = selectedBgImage?.id ?? null;

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Select Background Artwork ({GALLERY_IMAGES.length} Available):</span>
          </label>
          <span className="text-[10px] font-mono text-cyan-400 font-bold truncate max-w-[200px]">
            {selectedBgImage ? selectedBgImage.title : 'Default Vice City'}
          </span>
        </div>

        {isDesktop ? (
          isDesktopGalleryOpen ? (
            <div className="rounded-xl bg-[#07090F] border border-white/15 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <LayoutGrid className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs font-mono font-bold uppercase text-slate-200">
                    GTA VI Gallery ({displayedImages.length} of {GALLERY_IMAGES.length})
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    Click any artwork to preview immediately
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onCloseDesktopGallery}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-mono font-bold uppercase text-slate-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  aria-label="Close expanded gallery"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
              </div>

              <div
                ref={desktopGridRef}
                className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto pr-1"
              >
                {/* Default Vice City Tile */}
                <button
                  type="button"
                  onClick={() => onSelectBgImage(null)}
                  className={`group relative aspect-video rounded-xl border overflow-hidden transition-all cursor-pointer bg-black/50 ${
                    selectedBgImage === null
                      ? 'border-cyan-400 ring-2 ring-cyan-400/50 opacity-100 shadow-lg'
                      : 'border-white/10 hover:border-white/30 opacity-85 hover:opacity-100'
                  }`}
                  title="Default Vice City"
                >
                  <OptimizedImage
                    src={DEFAULT_VICE_CITY_BG_URL}
                    alt="Default Vice City"
                    maxWidth={375}
                    sizes="160px"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex items-end p-1.5 text-left">
                    <span className="text-[10px] font-mono font-bold text-white leading-tight truncate w-full">
                      Default Vice City
                    </span>
                  </div>
                  {selectedBgImage === null && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md z-10">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Paginated Gallery Image Choices (First 15, +15 per Show More, lazy-loaded via IntersectionObserver) */}
                {displayedImages.map((item) => {
                  const isSelected = selectedId === item.id;
                  const shouldLoad = desktopVisibleBgIds.has(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      data-desktop-bg-id={item.id}
                      onClick={() => onSelectBgImage(item)}
                      className={`group relative aspect-video rounded-xl border overflow-hidden transition-all cursor-pointer bg-black/50 ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-400/50 opacity-100 shadow-lg'
                          : 'border-white/10 hover:border-white/30 opacity-85 hover:opacity-100'
                      }`}
                      title={item.title}
                    >
                      {shouldLoad ? (
                        <OptimizedImage
                          src={item.url}
                          alt={item.title}
                          maxWidth={375}
                          sizes="160px"
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5" aria-hidden="true" />
                      )}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="block text-[10px] font-mono text-white truncate text-left">
                          {item.title}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md z-10">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pagination Controls (Show More / Show Less) */}
              {(hasMore || canShowLess) && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-mono text-slate-400">
                    Showing {displayedImages.length} of {GALLERY_IMAGES.length} backgrounds
                  </span>
                  <div className="flex items-center gap-2">
                    {canShowLess && (
                      <button
                        type="button"
                        onClick={handleShowLess}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Show Less</span>
                      </button>
                    )}
                    {hasMore && (
                      <button
                        type="button"
                        onClick={handleShowMore}
                        className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>
                          Show More (+{nextBatchCount} &middot; {remainingCount} left)
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0 w-24 h-14 rounded-lg overflow-hidden border border-cyan-400/60 ring-1 ring-cyan-400/30 bg-black/50 shadow-md">
                  <OptimizedImage
                    src={selectedBgImage ? selectedBgImage.url : DEFAULT_VICE_CITY_BG_URL}
                    alt={selectedBgImage ? selectedBgImage.title : 'Default Vice City'}
                    maxWidth={375}
                    sizes="96px"
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                    {selectedBgImage ? selectedBgImage.tag : 'Default Background'}
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {selectedBgImage ? selectedBgImage.title : 'Default Vice City'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {selectedBgImage
                      ? 'Selected from GTA VI Gallery'
                      : 'Vintage Vice City pattern'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenDesktopGallery}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 hover:text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>SHOW ALL</span>
              </button>
            </div>
          )
        ) : (
          <div className="space-y-2">
            <div
              ref={galleryStripRef}
              className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar p-1"
            >
              {/* Default Vice City Option */}
              <button
                type="button"
                onClick={() => onSelectBgImage(null)}
                className={`relative shrink-0 w-24 h-16 rounded-xl border overflow-hidden transition-all cursor-pointer bg-black/50 ${
                  selectedBgImage === null
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 opacity-100 shadow-lg'
                    : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                }`}
                title="Default Vice City"
              >
                <OptimizedImage
                  src={DEFAULT_VICE_CITY_BG_URL}
                  alt="Default Vice City"
                  maxWidth={375}
                  sizes="96px"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center p-1 text-center">
                  <span className="text-[10px] font-mono font-bold text-white leading-tight drop-shadow">
                    Default Vice City
                  </span>
                </div>
                {selectedBgImage === null && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md z-10">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* Paginated Gallery Image Choices (First 15, +15 per Show More, lazy-loaded on horizontal scroll) */}
              {displayedImages.map((item) => {
                const isSelected = selectedId === item.id;
                const shouldLoad = visibleBgIds.has(item.id);
                return (
                  <button
                    type="button"
                    key={item.id}
                    data-bg-id={item.id}
                    onClick={() => onSelectBgImage(item)}
                    className={`relative shrink-0 w-24 h-16 rounded-xl border overflow-hidden transition-all cursor-pointer bg-black/50 ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-105 opacity-100 shadow-lg'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                    title={item.title}
                  >
                    {shouldLoad ? (
                      <OptimizedImage
                        src={item.url}
                        alt={item.title}
                        maxWidth={375}
                        sizes="96px"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5" aria-hidden="true" />
                    )}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-md z-10">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Mobile Horizontal Strip Show More Control */}
              {hasMore && (
                <button
                  type="button"
                  onClick={handleShowMore}
                  className="shrink-0 h-16 px-3.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 hover:text-white transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                >
                  <span>Show More</span>
                  <span className="text-[10px] text-cyan-400/90">+{nextBatchCount}</span>
                </button>
              )}
            </div>

            {(hasMore || canShowLess) && (
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span>
                  Showing {displayedImages.length} of {GALLERY_IMAGES.length}
                </span>
                <div className="flex items-center gap-3">
                  {canShowLess && (
                    <button
                      type="button"
                      onClick={handleShowLess}
                      className="text-slate-300 hover:text-white uppercase font-bold cursor-pointer"
                    >
                      Show Less
                    </button>
                  )}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={handleShowMore}
                      className="text-cyan-300 hover:text-cyan-200 uppercase font-bold cursor-pointer"
                    >
                      Show More (+{nextBatchCount})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

BackgroundGalleryPicker.displayName = 'BackgroundGalleryPicker';

export const ShareCountdownModal: React.FC<ShareCountdownModalProps> = ({ isOpen, onClose }) => {
  const { selectedCountry, effectiveTimeZone } = useSettings();
  const { releaseRemaining, launchState } = useLaunchState();

  const [selectedPaletteId, setSelectedPaletteId] = useState<ColorPalette>('vice-city');
  const [aspectRatio, setAspectRatio] = useState<CardAspect>('16:9');

  // Background artwork selection state
  const [selectedBgImage, setSelectedBgImage] = useState<GalleryImage | null>(null);
  const [loadedBgRecord, setLoadedBgRecord] = useState<LoadedBgRecord | null>(() => {
    const cached = getCachedBgImage(DEFAULT_VICE_CITY_BG_ID);
    return cached ? { id: DEFAULT_VICE_CITY_BG_ID, img: cached } : null;
  });
  const [isBgLoading, setIsBgLoading] = useState<boolean>(false);
  const [bgError, setBgError] = useState<string | null>(null);

  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(() =>
    sharedLogoImageCache && sharedLogoImageCache.complete && sharedLogoImageCache.naturalWidth > 0
      ? sharedLogoImageCache
      : null
  );
  const [fontsReady, setFontsReady] = useState<boolean>(() =>
    typeof document === 'undefined' || !document.fonts
      ? true
      : document.fonts.status === 'loaded'
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Desktop-only compact selector & expandable gallery grid state
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 768px)').matches
      : true
  );
  const [isDesktopGalleryOpen, setIsDesktopGalleryOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenBgRef = useRef<HTMLCanvasElement | null>(null);
  const lastStaticKeyRef = useRef<string>('');
  const lastFrameKeyRef = useRef<string>('');
  const lastUnitsRef = useRef<string[] | null>(null);
  const lastReleasedRef = useRef<boolean | null>(null);

  const activePalette = PALETTES.find((p) => p.id === selectedPaletteId) || PALETTES[0];

  const handleOpenDesktopGallery = useCallback(() => setIsDesktopGalleryOpen(true), []);
  const handleCloseDesktopGallery = useCallback(() => setIsDesktopGalleryOpen(false), []);

  const handleSelectBgImage = useCallback((item: GalleryImage | null) => {
    const cacheKey = item ? item.id : DEFAULT_VICE_CITY_BG_ID;
    const cached = getCachedBgImage(cacheKey);
    setSelectedBgImage(item);
    setBgError(null);
    if (cached) {
      setLoadedBgRecord({ id: cacheKey, img: cached });
      setIsBgLoading(false);
    }
  }, []);

  // Track desktop (>= 768px) vs mobile viewport cleanly
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const updateMatch = () => setIsDesktop(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener('change', updateMatch);
    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, []);

  // Reset desktop expanded gallery when modal closes so opening stays compact
  useEffect(() => {
    if (!isOpen) {
      setIsDesktopGalleryOpen(false);
    }
  }, [isOpen]);

  // Lock body scroll & handle Escape key while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isDesktop && isDesktopGalleryOpen) {
          setIsDesktopGalleryOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDesktop, isDesktopGalleryOpen, onClose]);

  // Wait for custom fonts once without causing extra redraws when already loaded
  useEffect(() => {
    if (!isOpen || fontsReady) return;
    let cancelled = false;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) setFontsReady(true);
      });
    } else {
      setFontsReady(true);
    }
    return () => {
      cancelled = true;
    };
  }, [isOpen, fontsReady]);

  // Pre-load and decode official GTA VI logo once across modal sessions
  useEffect(() => {
    if (!isOpen || logoImage) return;
    let cancelled = false;
    loadOfficialLogoOnce().then((img) => {
      if (!cancelled && img) {
        setLogoImage(img);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, logoImage]);

  // Cached, deduplicated, decoded background image loader
  useEffect(() => {
    if (!isOpen) return;

    const cacheKey = selectedBgImage ? selectedBgImage.id : DEFAULT_VICE_CITY_BG_ID;
    const rawUrl = selectedBgImage ? selectedBgImage.url : DEFAULT_VICE_CITY_BG_URL;
    const errorLabel = selectedBgImage ? selectedBgImage.title : 'Default Vice City';

    const cached = getCachedBgImage(cacheKey);
    if (cached) {
      if (loadedBgRecord?.id !== cacheKey || loadedBgRecord.img !== cached) {
        setLoadedBgRecord({ id: cacheKey, img: cached });
      }
      setIsBgLoading(false);
      setBgError(null);
      return;
    }

    let cancelled = false;
    setIsBgLoading(true);
    setBgError(null);

    loadBackgroundArtwork(cacheKey, rawUrl)
      .then((img) => {
        if (cancelled) return;
        setLoadedBgRecord({ id: cacheKey, img });
        setIsBgLoading(false);
        setBgError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setIsBgLoading(false);
        setBgError(`Unable to load background "${errorLabel}". Try selecting another image.`);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedBgImage, loadedBgRecord?.id, loadedBgRecord?.img]);

  // Programmatic Vector Palm Trees & Skyline (for Default Vice City Background)
  const drawPalmTree = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    angleOffset: number = 0
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate((angleOffset * Math.PI) / 180);

    ctx.strokeStyle = '#04050A';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-25, -120, -50, -220);
    ctx.stroke();

    const topX = -50;
    const topY = -220;
    const leafAngles = [-140, -100, -60, -20, 20, 60, 100, 140];

    ctx.fillStyle = '#04050A';
    leafAngles.forEach((angle) => {
      ctx.save();
      ctx.translate(topX, topY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(40, -20, 90, 15);
      ctx.quadraticCurveTo(40, 5, 0, 0);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  };

  const drawSkylineSilhouettes = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.fillStyle = '#04050A';
    const baseY = height * 0.95;

    const buildings = [
      { x: width * 0.04, w: width * 0.08, h: height * 0.16 },
      { x: width * 0.11, w: width * 0.06, h: height * 0.22 },
      { x: width * 0.16, w: width * 0.05, h: height * 0.14 },
      { x: width * 0.79, w: width * 0.07, h: height * 0.20 },
      { x: width * 0.85, w: width * 0.06, h: height * 0.15 },
      { x: width * 0.90, w: width * 0.07, h: height * 0.23 },
    ];

    buildings.forEach((b) => {
      ctx.fillRect(b.x, baseY - b.h, b.w, b.h + height * 0.1);
      ctx.fillRect(b.x + b.w * 0.45, baseY - b.h - height * 0.03, b.w * 0.1, height * 0.03);
    });
  };

  // Render static background, vignette, framing, and logo onto offscreen canvas
  const renderStaticLayer = useCallback(
    (width: number, height: number): HTMLCanvasElement | null => {
      let offscreen = offscreenBgRef.current;
      if (!offscreen) {
        offscreen = document.createElement('canvas');
        offscreenBgRef.current = offscreen;
      }

      if (offscreen.width !== width || offscreen.height !== height) {
        offscreen.width = width;
        offscreen.height = height;
      }

      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;

      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // 1. BACKGROUND LAYER (Default Vice City Artwork OR Custom Selected Image)
      // ==========================================
      const loadedBgImgEl = loadedBgRecord?.img ?? null;
      if (loadedBgImgEl && loadedBgImgEl.complete && loadedBgImgEl.naturalWidth > 0) {
        // Intelligent Aspect-Fill Cover (no stretching or distortion)
        const imgAspect = loadedBgImgEl.naturalWidth / loadedBgImgEl.naturalHeight;
        const canvasAspect = width / height;

        let renderW = width;
        let renderH = height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > canvasAspect) {
          renderW = height * imgAspect;
          offsetX = (width - renderW) / 2;
        } else {
          renderH = width / imgAspect;
          offsetY = (height - renderH) / 2;
        }

        ctx.drawImage(loadedBgImgEl, offsetX, offsetY, renderW, renderH);

        // Dark Overlay Gradient for maximum contrast
        const darkOverlay = ctx.createLinearGradient(0, 0, 0, height);
        darkOverlay.addColorStop(0, 'rgba(6, 8, 14, 0.58)');
        darkOverlay.addColorStop(0.5, 'rgba(6, 8, 14, 0.65)');
        darkOverlay.addColorStop(1, 'rgba(6, 8, 14, 0.88)');
        ctx.fillStyle = darkOverlay;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Default Vice City Sunset Sky
        ctx.fillStyle = '#060810';
        ctx.fillRect(0, 0, width, height);

        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#060812');
        skyGrad.addColorStop(0.35, '#0E0F1D');
        skyGrad.addColorStop(0.68, activePalette.secondaryHex + '48');
        skyGrad.addColorStop(0.9, activePalette.primaryHex + '68');
        skyGrad.addColorStop(1, '#06070B');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.85;
        const sunGrad = ctx.createRadialGradient(
          width / 2,
          horizonY,
          10,
          width / 2,
          horizonY,
          width * 0.55
        );
        sunGrad.addColorStop(0, activePalette.primaryHex + '90');
        sunGrad.addColorStop(0.4, activePalette.tertiaryHex + '40');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, width, height);

        drawSkylineSilhouettes(ctx, width, height);
        if (aspectRatio === '16:9') {
          drawPalmTree(ctx, width * 0.05, height * 0.98, width * 0.0018, 15);
          drawPalmTree(ctx, width * 0.12, height * 1.02, width * 0.0014, 5);
          drawPalmTree(ctx, width * 0.94, height * 0.98, width * 0.0018, -15);
          drawPalmTree(ctx, width * 0.88, height * 1.02, width * 0.0014, -8);
        } else {
          drawPalmTree(ctx, width * 0.06, height * 0.98, width * 0.002, 12);
          drawPalmTree(ctx, width * 0.94, height * 0.98, width * 0.002, -12);
        }
      }

      // Vignette
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.35,
        width / 2,
        height / 2,
        width * 0.72
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(4, 5, 10, 0.82)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // ==========================================
      // 2. ELEGANT FRAMING
      // ==========================================
      const margin = width * 0.035;
      ctx.strokeStyle = activePalette.primaryHex + '66';
      ctx.lineWidth = width * 0.002;
      ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

      const cornerLength = width * 0.025;
      ctx.strokeStyle = activePalette.primaryHex;
      ctx.lineWidth = width * 0.004;

      ctx.beginPath();
      ctx.moveTo(margin, margin + cornerLength);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + cornerLength, margin);

      ctx.moveTo(width - margin - cornerLength, margin);
      ctx.lineTo(width - margin, margin);
      ctx.lineTo(width - margin, margin + cornerLength);

      ctx.moveTo(margin, height - margin - cornerLength);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(margin + cornerLength, height - margin);

      ctx.moveTo(width - margin - cornerLength, height - margin);
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(width - margin, height - margin - cornerLength);
      ctx.stroke();

      // ==========================================
      // 3. ELEMENT 1: PROMINENT OFFICIAL GTA VI LOGO ONLY
      // ==========================================
      let logoCenterY = height * 0.32;
      let logoHeight = height * 0.24;

      if (aspectRatio === '1:1') {
        logoCenterY = height * 0.33;
        logoHeight = height * 0.22;
      } else if (aspectRatio === '4:5') {
        logoCenterY = height * 0.32;
        logoHeight = height * 0.20;
      }

      if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
        const aspect = logoImage.naturalWidth / logoImage.naturalHeight;
        const drawWidth = logoHeight * aspect;
        ctx.drawImage(logoImage, width / 2 - drawWidth / 2, logoCenterY - logoHeight / 2, drawWidth, logoHeight);
      } else {
        ctx.font = `700 ${Math.round(width * 0.07)}px 'Space Grotesk', system-ui, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = activePalette.primaryHex;
        ctx.shadowBlur = 25;
        ctx.fillText('GRAND THEFT AUTO VI', width / 2, logoCenterY);
        ctx.shadowBlur = 0;
      }

      return offscreen;
    },
    [aspectRatio, activePalette, logoImage, loadedBgRecord]
  );

  // Primitive countdown tokens so canvas effects only respond to actual displayed text changes
  const isReleased = launchState === 'RELEASE_LIVE' || releaseRemaining.isComplete;
  const days = releaseRemaining.days.toString().padStart(2, '0');
  const hours = releaseRemaining.hours.toString().padStart(2, '0');
  const mins = releaseRemaining.minutes.toString().padStart(2, '0');
  const secs = releaseRemaining.seconds.toString().padStart(2, '0');

  // Main Canvas Render Engine: caches static layer & uses dirty-rect partial updates on 1s ticks
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = getCardDimensions(aspectRatio);

    const staticKey = [
      aspectRatio,
      selectedPaletteId,
      loadedBgRecord?.id ?? 'default',
      loadedBgRecord?.img.src ?? 'none',
      logoImage ? 'logo1' : 'logo0',
      fontsReady ? 'fonts1' : 'fonts0',
    ].join('|');

    const frameKey = `${staticKey}|${isReleased ? 'LIVE' : `${days}:${hours}:${mins}:${secs}`}`;
    const dimensionsMatch = canvas.width === width && canvas.height === height;
    if (dimensionsMatch && lastFrameKeyRef.current === frameKey) {
      return;
    }

    if (!dimensionsMatch) {
      canvas.width = width;
      canvas.height = height;
    }

    let bgCanvas = offscreenBgRef.current;
    const staticChanged =
      !bgCanvas || !dimensionsMatch || lastStaticKeyRef.current !== staticKey;

    if (staticChanged) {
      bgCanvas = renderStaticLayer(width, height);
      lastStaticKeyRef.current = staticKey;
      lastUnitsRef.current = null;
      lastReleasedRef.current = null;
    }

    const { countdownCenterY, tileWidth, tileHeight, gap, startX } = getCountdownLayout(
      aspectRatio,
      width,
      height
    );

    // Dirty-rect partial update: on 1s countdown ticks where static layer & released state did not change,
    // restore & redraw ONLY the countdown tiles whose value actually changed (typically just SECONDS).
    if (
      bgCanvas &&
      !staticChanged &&
      !isReleased &&
      lastReleasedRef.current === false &&
      lastUnitsRef.current
    ) {
      const nextVals = [days, hours, mins, secs];
      const labels = ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'];
      const pad = Math.ceil(width * 0.01);
      const y = countdownCenterY - tileHeight / 2;

      for (let idx = 0; idx < 4; idx++) {
        if (lastUnitsRef.current[idx] !== nextVals[idx]) {
          const x = startX + idx * (tileWidth + gap);
          const rx = Math.max(0, Math.floor(x - pad));
          const ry = Math.max(0, Math.floor(y - pad));
          const rw = Math.min(width - rx, Math.ceil(tileWidth + pad * 2));
          const rh = Math.min(height - ry, Math.ceil(tileHeight + pad * 2));

          ctx.drawImage(bgCanvas, rx, ry, rw, rh, rx, ry, rw, rh);
          drawCountdownTile(
            ctx,
            x,
            y,
            tileWidth,
            tileHeight,
            width,
            activePalette.primaryHex,
            nextVals[idx],
            labels[idx]
          );
        }
      }

      lastUnitsRef.current = nextVals;
      lastFrameKeyRef.current = frameKey;
      return;
    }

    if (bgCanvas) {
      ctx.drawImage(bgCanvas, 0, 0);
    }

    // ==========================================
    // 4. ELEMENT 2: COUNTDOWN VALUES ONLY (DAYS, HOURS, MINUTES, SECONDS)
    // ==========================================
    if (isReleased) {
      ctx.save();
      ctx.font = `700 ${Math.round(width * 0.05)}px 'Space Grotesk', system-ui, sans-serif`;
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 25;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AVAILABLE NOW', width / 2, countdownCenterY);
      ctx.restore();
      lastUnitsRef.current = null;
      lastReleasedRef.current = true;
    } else {
      const units = [
        { val: days, label: 'DAYS' },
        { val: hours, label: 'HOURS' },
        { val: mins, label: 'MINUTES' },
        { val: secs, label: 'SECONDS' },
      ];
      const y = countdownCenterY - tileHeight / 2;

      units.forEach((u, idx) => {
        const x = startX + idx * (tileWidth + gap);
        drawCountdownTile(
          ctx,
          x,
          y,
          tileWidth,
          tileHeight,
          width,
          activePalette.primaryHex,
          u.val,
          u.label
        );
      });

      lastUnitsRef.current = [days, hours, mins, secs];
      lastReleasedRef.current = false;
    }

    lastFrameKeyRef.current = frameKey;
    // STRICT: NO OTHER TEXT ELEMENTS ARE DRAWN ON THE CARD!
  }, [
    aspectRatio,
    selectedPaletteId,
    isReleased,
    days,
    hours,
    mins,
    secs,
    activePalette.primaryHex,
    logoImage,
    loadedBgRecord,
    fontsReady,
    renderStaticLayer,
  ]);

  // Draw canvas when modal is open and dependencies update; reset frame tracking on close
  useEffect(() => {
    if (!isOpen) {
      lastFrameKeyRef.current = '';
      lastUnitsRef.current = null;
      lastReleasedRef.current = null;
      return;
    }
    renderCanvas();
  }, [isOpen, renderCanvas]);

  // Separate non-blocking export helper (ensures latest rendered frame & async PNG encoding via toBlob)
  const exportPosterToBlob = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (!fontsReady && document.fonts?.ready) {
      await document.fonts.ready;
    }
    renderCanvas();
    return new Promise<Blob | null>((resolve) => {
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      } else {
        resolve(null);
      }
    });
  }, [fontsReady, renderCanvas]);

  // Download Image PNG asynchronously when available (avoids main-thread base64 stall)
  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      const fileName = `gtavi-countdown-${aspectRatio.replace(':', 'x')}.png`;
      const blob = await exportPosterToBlob();
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = objectUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Share Card via Web Share API or Copy Clipboard Text
  const handleShare = async () => {
    const shareText = `Counting down to Grand Theft Auto VI in ${selectedCountry.name} (${effectiveTimeZone})! 🎮🔥 Check your local launch time: ${window.location.origin}`;

    if (navigator.share && navigator.canShare) {
      try {
        const blob = await exportPosterToBlob();
        if (blob) {
          const file = new File([blob], `gtavi-countdown.png`, {
            type: 'image/png',
          });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'GTA VI Countdown Poster',
              text: shareText,
              url: window.location.origin,
            });
            return;
          }
        }
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generate & Share Personalised GTA VI Countdown Poster"
      onClick={onClose}
      className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#08090D] border border-[#24262B] text-slate-100 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#24262B] flex items-center justify-between bg-[#08090D] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: activePalette.primaryHex }}
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">
                Simplified Countdown Poster
              </h3>
              <p className="text-xs text-slate-400">
                Official GTA VI logo and live countdown values with custom background artwork
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#0A0C12]">
          {/* Live Canvas Preview Box */}
          <div className="flex flex-col items-center justify-center bg-[#05060A] rounded-xl p-3 sm:p-5 border border-white/10 relative shadow-inner">
            {isBgLoading && (
              <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl text-cyan-300 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-mono">Loading selected artwork...</span>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="max-w-full h-auto max-h-[420px] object-contain rounded-lg shadow-2xl border border-white/15"
            />

            {bgError && (
              <div className="mt-2 text-xs font-mono text-rose-400 flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bgError}</span>
              </div>
            )}
          </div>

          {/* CUSTOM BACKGROUND IMAGE SELECTION (Isolated & 15-item paginated) */}
          <BackgroundGalleryPicker
            isOpen={isOpen}
            isDesktop={isDesktop}
            isDesktopGalleryOpen={isDesktopGalleryOpen}
            onOpenDesktopGallery={handleOpenDesktopGallery}
            onCloseDesktopGallery={handleCloseDesktopGallery}
            selectedBgImage={selectedBgImage}
            onSelectBgImage={handleSelectBgImage}
          />

          {/* Controls: Aspect Ratio & Theme Palette Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Aspect Ratio Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Card Format:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: 'Landscape 16:9', sub: 'X / Twitter' },
                  { id: '1:1', label: 'Square 1:1', sub: 'Instagram Post' },
                  { id: '4:5', label: 'Portrait 4:5', sub: 'Instagram / Story' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAspectRatio(item.id as CardAspect)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      aspectRatio === item.id
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-white font-bold ring-1 ring-cyan-500/30'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colour Palette Picker */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <PaletteIcon className="w-4 h-4 theme-text-primary" />
                <span>Theme Accent Glow:</span>
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-[110px] overflow-y-auto pr-1">
                {PALETTES.map((p) => {
                  const isSelected = selectedPaletteId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPaletteId(p.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 border-white/60 ring-1 ring-white/40 shadow-md'
                          : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                      title={p.name}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: p.primaryHex }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: p.secondaryHex }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-300 truncate w-full text-center">
                        {p.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="px-5 sm:px-6 py-4 border-t border-[#24262B] bg-[#08090D] flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied Link to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Card / Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black bg-[#F4F1ED] hover:bg-white transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Rendering Card...' : 'Download High-Res PNG'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
