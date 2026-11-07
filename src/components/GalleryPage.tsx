import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, ZoomIn } from 'lucide-react';
import { GALLERY_IMAGES, GALLERY_CATEGORIES, GalleryImage } from '../data/galleryData';
import { ImageLightboxModal } from './ImageLightboxModal';

interface GalleryPageProps {
  onNavigateHome?: () => void;
}

// Utility to generate optimized thumbnail URLs for the grid view
const getThumbnailUrl = (url: string): string => {
  if (url.includes('imwidth=')) {
    return url.replace(/imwidth=\d+/, 'imwidth=640');
  }
  if (url.includes('.jpg') && !url.includes('?')) {
    return `${url}?imwidth=640`;
  }
  return url;
};

export const GalleryPage: React.FC<GalleryPageProps> = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filtered gallery images based on active tab
  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return GALLERY_IMAGES;
    return GALLERY_IMAGES.filter((img) => img.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen py-10 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header & Filter Control Bar */}
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

      {/* 2. Responsive Segmented Category Filter Tabs */}
      <div className="mb-10 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max bg-[#090C10]/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === 'all'
                ? GALLERY_IMAGES.length
                : GALLERY_IMAGES.filter((i) => i.category === cat.id).length;

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

      {/* 3. Clean Responsive Masonry Grid (Category Badges Removed) */}
      {filteredImages.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#090C10]/60 border border-white/10">
          <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-300">No media found in this category.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative rounded-2xl bg-[#090C10] border border-white/10 hover:border-white/40 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer break-inside-avoid block transform hover:-translate-y-1"
            >
              {/* Aspect Ratio Preserved Container with Instant Placeholder & Smooth Load Fade-in */}
              <div className="relative w-full overflow-hidden bg-[#12141C] min-h-[160px] aspect-[16/9]">
                <img
                  src={getThumbnailUrl(img.url)}
                  alt={img.title}
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => {
                    (e.currentTarget as HTMLImageElement).classList.remove('opacity-0');
                    (e.currentTarget as HTMLImageElement).classList.add('opacity-100');
                  }}
                  className="w-full h-full object-cover brightness-95 group-hover:brightness-105 group-hover:scale-105 transition-all duration-500 opacity-0"
                />

                {/* Ambient Subtle Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

                {/* Hover Zoom Icon Affordance */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 pointer-events-none">
                  <div
                    className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-2xl"
                    style={{ backgroundColor: 'var(--theme-primary, #F15A24)' }}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>

                {/* Clean Unobtrusive Title Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10 pointer-events-none">
                  <h3 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                    {img.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Fullscreen Interactive Lightbox Modal */}
      <ImageLightboxModal
        images={filteredImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigateIndex={(newIndex) => setLightboxIndex(newIndex)}
      />
    </div>
  );
};
