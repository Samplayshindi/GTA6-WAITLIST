import React, { useState } from 'react';
import { Play, ExternalLink, Film, X, Clock, Eye } from 'lucide-react';
import { TRAILERS_DATA } from '../config/countdown';

interface TrailerGalleryProps {
  activeTrailerModal: string | null;
  onOpenTrailer: (youtubeId: string) => void;
  onCloseTrailer: () => void;
}

export const TrailerGallery: React.FC<TrailerGalleryProps> = ({
  activeTrailerModal,
  onOpenTrailer,
  onCloseTrailer,
}) => {
  return (
    <section id="trailers" className="relative py-20 border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold tracking-[0.2em] uppercase text-cyan-400 mb-3">
            <Film className="w-3.5 h-3.5" />
            <span>CINEMATIC VAULT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
            Official <span className="gta-gradient-text">Trailers</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Witness the debut footage of Grand Theft Auto VI, captured in-engine showcasing the next generation of open-world fidelity.
          </p>
        </div>

        {/* Trailer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {TRAILERS_DATA.map((trailer) => {
            const hasVideo = Boolean(trailer.youtubeId);

            return (
              <div
                key={trailer.id}
                className="group gta-glass gta-glass-hover rounded-3xl overflow-hidden border border-pink-500/20 flex flex-col justify-between"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/9] w-full bg-[#120e20] overflow-hidden">
                  {hasVideo ? (
                    <img
                      src={`https://img.youtube.com/vi/${trailer.youtubeId}/maxresdefault.jpg`}
                      alt={trailer.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#1b1229] to-[#0c0f1c] text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                        <Film className="w-8 h-8 text-slate-500" />
                      </div>
                      <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                        Upcoming Premiere
                      </span>
                    </div>
                  )}

                  {/* Play Overlay Button */}
                  {hasVideo && (
                    <button
                      onClick={() => onOpenTrailer(trailer.youtubeId)}
                      aria-label={`Play ${trailer.title}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/25 transition-colors focus:outline-none"
                    >
                      <div className="w-16 h-16 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,79,163,0.7)] group-hover:scale-110 group-hover:bg-pink-500 transition-all duration-300">
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </div>
                    </button>
                  )}

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-black/70 text-pink-400 border border-pink-500/30 backdrop-blur-md">
                      {trailer.isUpcoming ? 'Awaiting Premiere' : 'Official Premiere'}
                    </span>
                  </div>

                  {/* Duration Badge */}
                  {hasVideo && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/80 text-white text-xs font-mono backdrop-blur-md">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{trailer.duration}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                      <span>{trailer.releaseDate}</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Eye className="w-3.5 h-3.5 text-pink-400" />
                        <span>{trailer.viewCount}</span>
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors">
                      {trailer.title}
                    </h3>

                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      {trailer.description}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    {hasVideo ? (
                      <button
                        onClick={() => onOpenTrailer(trailer.youtubeId)}
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-pink-400" />
                        <span>Watch in Cinematic Player</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">
                        Official Trailer 2 date pending announcement
                      </span>
                    )}

                    <a
                      href={trailer.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl aspect-[16/9] bg-black rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(255,79,163,0.3)] border border-pink-500/30">
            <button
              onClick={onCloseTrailer}
              aria-label="Close Trailer Player"
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 text-white hover:bg-pink-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${activeTrailerModal}?autoplay=1&rel=0`}
              title="GTA VI Official Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};
