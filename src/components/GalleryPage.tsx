import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { Image as ImageIcon, ZoomIn, ChevronDown } from 'lucide-react';
import { GALLERY_IMAGES, GALLERY_CATEGORIES, isCuratedArtworkAsset } from '../data/galleryData';
import { OptimizedImage } from './OptimizedImage';
import { RevealOnScroll } from './RevealOnScroll';
import { useSettings } from '../context/SettingsContext';

const ImageLightboxModal = lazy(() =>
  import('./ImageLightboxModal').then((m) => ({ default: m.ImageLightboxModal }))
);

interface GalleryPageProps {
  onNavigateHome?: () => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = () => {
  const { motionMode } = useSettings();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mobileVisibleCount, setMobileVisibleCount] = useState<number>(12);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 639px)').matches
      : false
  );

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

  // Filtered gallery images based on active tab
  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return GALLERY_IMAGES;
    if (activeCategory === 'artworks') return GALLERY_IMAGES.filter(isCuratedArtworkAsset);
    return GALLERY_IMAGES.filter((img) => img.category === activeCategory);
  }, [activeCategory]);

  const renderedImages = useMemo(() => {
    if (isMobileViewport && activeCategory !== 'artworks') {
      return filteredImages.slice(0, mobileVisibleCount);
    }
    return filteredImages;
  }, [isMobileViewport, activeCategory, filteredImages, mobileVisibleCount]);

  // Reset mobile visible count when category changes
  useEffect(() => {
    setMobileVisibleCount(12);
  }, [activeCategory]);

  const handleShowMoreMobile = () => {
    setMobileVisibleCount((prev) => Math.min(prev + 12, filteredImages.length));
  };

  return (
    <div className="min-h-screen py-10 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header & Filter Control Bar */}
      <RevealOnScroll>
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
            <ImageIcon className="w-4 h-4 text-[var(--theme-primary,#F15A24)]" />
            <span>{filteredImages.length} Official Assets</span>
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
                onClick={() => setActiveCategory(cat.id)}
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
      {filteredImages.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#090C10]/60 border border-white/10 px-6">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-300">No media found in this category.</p>
        </div>
      ) : (
        <div className={`space-y-8 ${motionMode === 'low' ? 'gallery-reduced-motion' : ''}`}>
          <div
            data-testid="gallery-grid"
            className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5"
          >
            {renderedImages.map((img, idx) => {
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="gallery-card group relative w-full text-left rounded-2xl bg-[#090C10] border border-white/10 overflow-hidden shadow-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary,#F15A24)]"
                >
                  {/* Strict 16:9 Aspect Ratio Cell with GPU-Friendly Hover Zoom */}
                  <div className="relative w-full aspect-video overflow-hidden bg-[#12141C]">
                    <OptimizedImage
                      src={img.url}
                      alt={img.title}
                      maxWidth={768}
                      sizes="(max-width: 379px) 92vw, (max-width: 1023px) 46vw, (max-width: 1279px) 23vw, 290px"
                      loading="lazy"
                      decoding="async"
                      className="gallery-card-media w-full h-full object-cover brightness-95 group-hover:brightness-105"
                    />

                    {/* Ambient Scrim Overlay for Readable Caption Contrast */}
                    <div className="gallery-card-scrim absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-75 group-hover:opacity-95 pointer-events-none" />

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
            })}
          </div>

          {/* Mobile "Show More" Button (only shown when mobile pagination truncates larger categories) */}
          {activeCategory !== 'artworks' && (
            <div className="sm:hidden pt-4 flex flex-col items-center justify-center text-center">
              {mobileVisibleCount < filteredImages.length ? (
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
                  <span>Showing all {filteredImages.length} assets</span>
                </div>
              )}
              <p className="mt-2 text-[11px] font-mono text-slate-500">
                Viewing {Math.min(mobileVisibleCount, filteredImages.length)} of {filteredImages.length} items
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Fullscreen Interactive Lightbox Modal (Lazy-loaded on open) */}
      {lightboxIndex !== null && (
        <Suspense fallback={null}>
          <ImageLightboxModal
            images={filteredImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigateIndex={(newIndex) => setLightboxIndex(newIndex)}
          />
        </Suspense>
      )}
    </div>
  );
};
