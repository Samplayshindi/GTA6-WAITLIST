import React from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { GalleryImage } from '../data/galleryData';
import { getResponsiveImageUrl } from '../utils/imageUtils';

interface ImageLightboxModalProps {
  images: GalleryImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigateIndex: (index: number) => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigateIndex,
}) => {
  if (currentIndex === null || !images[currentIndex]) return null;

  const currentImg = images[currentIndex];
  const fullResUrl = getResponsiveImageUrl(currentImg.url, 1920);

  const handlePrev = () => {
    onNavigateIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    onNavigateIndex((currentIndex + 1) % images.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between z-10" onClick={(e) => e.stopPropagation()}>
        <div>
          <h3 className="text-sm font-bold text-white">{currentImg.title}</h3>
          <span className="text-xs font-mono text-cyan-400">
            {currentIndex + 1} of {images.length} &middot; {currentImg.tag}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={currentImg.url}
            target="_blank"
            download
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Download original artwork"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <img
          src={fullResUrl}
          alt={currentImg.title}
          className="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl"
        />

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Footer Tag */}
      <div className="text-center text-xs font-mono text-slate-500 z-10 pointer-events-none">
        Grand Theft Auto VI Official Media Archive &middot; 4K Ultra-HD
      </div>
    </div>
  );
};
