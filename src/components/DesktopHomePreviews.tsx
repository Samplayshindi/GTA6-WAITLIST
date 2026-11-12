import React from 'react';
import { ImageIcon, Users, ArrowRight } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/galleryData';
import { CHARACTERS_DATA } from '../data/charactersData';
import { getResponsiveImageUrl } from '../utils/imageUtils';

interface DesktopHomePreviewsProps {
  onNavigate: (sectionId: string) => void;
}

export const DesktopHomePreviews: React.FC<DesktopHomePreviewsProps> = ({ onNavigate }) => {
  const featuredGallery = GALLERY_IMAGES.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-8">
      {/* 1. Dynamic Gallery Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400">
                Media Archive Preview
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase text-white tracking-tight">
              Featured Gallery Artwork
            </h2>
          </div>

          <button
            onClick={() => onNavigate('gallery')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
          >
            <span>View All Gallery</span>
            <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredGallery.map((img) => (
            <div
              key={img.id}
              onClick={() => onNavigate('gallery')}
              className="group relative rounded-2xl bg-[#090C10] border border-white/10 hover:border-pink-500/40 overflow-hidden shadow-xl transition-all cursor-pointer aspect-[16/9]"
            >
              <img
                src={getResponsiveImageUrl(img.url, 480)}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                  {img.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Character Dossiers Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Underworld Files
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase text-white tracking-tight">
              Characters &amp; Figures
            </h2>
          </div>

          <button
            onClick={() => onNavigate('characters')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
          >
            <span>View Dossiers</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CHARACTERS_DATA.slice(0, 2).map((char) => (
            <div
              key={char.id}
              onClick={() => onNavigate('characters')}
              className="group p-6 rounded-3xl bg-[#090C10] border border-white/10 hover:border-cyan-500/40 flex items-center gap-5 cursor-pointer transition-all shadow-xl"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-black">
                <img
                  src={getResponsiveImageUrl(char.images[0], 480)}
                  alt={char.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                  {char.subtitle}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5 group-hover:text-cyan-300 transition-colors">
                  {char.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {char.whoAreThey}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
