import React, { useState } from 'react';
import { Image, Maximize2, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { GALLERY_IMAGES, GalleryImage } from '../data/galleryData';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ImageLightboxModal } from './ImageLightboxModal';

interface GalleryPageProps {
  onNavigateHome?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Media' },
  { id: 'jason-lucia', label: 'Jason & Lucia' },
  { id: 'characters', label: 'Characters' },
  { id: 'vice-city', label: 'Vice City' },
  { id: 'leonida', label: 'Leonida & Locations' },
];

const GalleryCard: React.FC<{
  item: GalleryImage;
  onOpenLightbox: (index: number) => void;
  index: number;
}> = ({ item, onOpenLightbox, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const optimizedCardUrl = getOptimizedImageUrl(item.url, 'card');

  return (
    <div
      onClick={() => onOpenLightbox(index)}
      className="group relative rounded-2xl overflow-hidden bg-[#0D0F17] border border-white/10 hover:border-pink-500/50 transition-all duration-300 shadow-xl cursor-pointer flex flex-col aspect-video sm:aspect-4/3"
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-800/80 animate-pulse flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-pink-500/40 animate-spin" />
        </div>
      )}

      {/* Fallback Error Display */}
      {hasError ? (
        <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 text-center space-y-2 border border-rose-500/30">
          <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
          <p className="text-xs font-bold text-slate-200">{item.title}</p>
          <span className="text-[10px] text-slate-400 font-mono">Rockstar Games Media</span>
        </div>
      ) : (
        <img
          src={optimizedCardUrl}
          alt={item.title}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Hover overlay details */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
        <div className="flex items-center justify-between text-xs text-pink-400 font-mono font-bold uppercase tracking-wider mb-1">
          <span>{item.category.replace('-', ' ')}</span>
          <span className="bg-pink-500/20 px-2 py-0.5 rounded text-[10px] text-pink-300 border border-pink-500/30">
            {item.tag || '4K UHD'}
          </span>
        </div>
        <h3 className="text-sm font-bold text-white leading-snug">{item.title}</h3>

        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">Click to view 4K</span>
          <div className="p-1.5 rounded-lg bg-pink-500 text-white shadow-lg">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const GalleryPage: React.FC<GalleryPageProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const filteredItems = GALLERY_IMAGES.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <section id="gallery-container" className="relative py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-white/10">
        <Filter className="w-4 h-4 text-pink-400 shrink-0 mr-1" />
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25 border border-pink-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Exactly FOUR columns per row on desktop (lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredItems.map((item, idx) => (
          <GalleryCard
            key={item.id}
            item={item}
            index={idx}
            onOpenLightbox={(i) => setActiveLightboxIndex(i)}
          />
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <ImageLightboxModal
          images={filteredItems}
          currentIndex={activeLightboxIndex}
          onClose={() => setActiveLightboxIndex(null)}
          onNavigateIndex={(index) => setActiveLightboxIndex(index)}
        />
      )}
    </section>
  );
};
