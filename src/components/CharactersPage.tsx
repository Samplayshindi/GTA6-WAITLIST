import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { CHARACTERS_DATA } from '../data/charactersData';
import { getResponsiveImageUrl } from '../utils/imageUtils';

interface CharactersPageProps {
  onNavigateHome?: () => void;
}

export const CharactersPage: React.FC<CharactersPageProps> = () => {
  const [selectedCharIndex, setSelectedCharIndex] = useState<number>(0);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const char = CHARACTERS_DATA[selectedCharIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Character Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CHARACTERS_DATA.map((item, idx) => {
          const isSelected = idx === selectedCharIndex;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedCharIndex(idx);
                setActiveImageIdx(0);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-[#090C10] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {/* Selected Character Dossier Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Gallery Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            <img
              src={getResponsiveImageUrl(char.images[activeImageIdx] || char.images[0], 800)}
              alt={char.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          {char.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {char.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    idx === activeImageIdx ? 'border-cyan-400 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={getResponsiveImageUrl(imgUrl, 240)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Character Details */}
        <div className="lg:col-span-6 space-y-6 bg-[#090C10] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div>
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
              {char.subtitle}
            </span>
            <h2 className="text-3xl font-black uppercase text-white tracking-tight">{char.name}</h2>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono text-slate-400 uppercase font-bold">{char.whoAreTheyTitle}</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{char.whoAreThey}</p>
          </div>

          {char.backstory.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="text-xs font-mono text-pink-400 uppercase font-bold">Key Dossier Entries</h3>
              <div className="space-y-2">
                {char.backstory.map((entry, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs font-bold text-white block">{entry.title}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">{entry.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
