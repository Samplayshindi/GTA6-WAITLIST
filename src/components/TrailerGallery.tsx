import React from 'react';
import { Play, ExternalLink, Clock, Calendar } from 'lucide-react';
import { OFFICIAL_VIDEOS, RELEASE_SPECS } from '../config/countdown';
import { getResponsiveImageUrl } from '../utils/imageUtils';

interface TrailerGalleryProps {
  activeTrailerModal?: string | null;
  onOpenTrailer?: (videoId: string) => void;
  onCloseTrailer?: () => void;
}

export const TrailerGallery: React.FC<TrailerGalleryProps> = () => {
  const featuredVideos = OFFICIAL_VIDEOS.filter((v) => v.isFeatured);
  const standardVideos = OFFICIAL_VIDEOS.filter((v) => !v.isFeatured);

  return (
    <section id="videos" className="relative py-16 sm:py-20 md:py-28 bg-transparent border-t border-white/10 scroll-mt-20 overflow-hidden">
      {/* Background ambient flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0B2425]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 rounded-full theme-bg-primary" />
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
                Rockstar Games Official Broadcasts
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
              Official <span className="theme-gradient-text">Videos</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              Authentic broadcast media and gameplay presentations captured in-engine on PlayStation 5 and Xbox Series X|S. All videos link directly to verified Rockstar Games channels.
            </p>
          </div>

          <a
            href={RELEASE_SPECS.videoGalleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-[#F4F1ED] bg-[#0B2425] hover:bg-[#102D2A] border border-white/20 transition-all self-start md:self-auto min-h-[44px] cursor-pointer"
          >
            <span>Rockstar Video Portal</span>
            <ExternalLink className="w-3.5 h-3.5 theme-text-primary" />
          </a>
        </div>

        {/* Featured Video Tier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {featuredVideos.map((video) => (
            <a
              key={video.id}
              href={video.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${video.title} - Watch on official YouTube channel`}
              className="group rounded-2xl bg-[#0B2425]/40 border border-white/10 hover:border-white/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl focus:outline-none cursor-pointer block text-left"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black pointer-events-none">
                <img
                  src={getResponsiveImageUrl(video.thumbnailUrl, 1080)}
                  alt={video.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center brightness-95 group-hover:brightness-105 transition-all duration-300"
                />

                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#08090D] via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-30">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase bg-black/80 text-[#F4F1ED] border border-white/20 backdrop-blur-md">
                    {video.badge}
                  </span>
                </div>

                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F4F1ED] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:text-white transition-all duration-300">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-30 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-black/85 text-[#F4F1ED] text-[11px] sm:text-xs font-mono backdrop-blur-md border border-white/10">
                  <Clock className="w-3.5 h-3.5 theme-text-primary" />
                  <span>{video.runtime}</span>
                </div>
              </div>

              <div className="p-5 sm:p-7 md:p-8 flex-1 flex flex-col justify-between pointer-events-none">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Premiered {video.releaseDate}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#F4F1ED] group-hover:text-white transition-colors leading-snug">
                    {video.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {video.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase theme-text-primary transition-colors min-h-[44px]">
                    <span>{video.buttonText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>

                  <span className="text-[11px] font-mono text-slate-500">Official Rockstar Video</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Standard Video Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {standardVideos.map((video) => (
            <a
              key={video.id}
              href={video.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${video.title} - Watch on official YouTube channel`}
              className="group rounded-xl bg-[#0B2425]/30 border border-white/10 hover:border-white/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl cursor-pointer block text-left"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black pointer-events-none">
                <img
                  src={getResponsiveImageUrl(video.thumbnailUrl, 640)}
                  alt={video.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center brightness-95 group-hover:brightness-105 transition-all duration-300"
                />

                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#08090D] via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-3 left-3 z-30">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-black/80 text-[#F4F1ED] border border-white/20 backdrop-blur-md">
                    {video.badge}
                  </span>
                </div>

                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#F4F1ED] text-black flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:text-white transition-all duration-300">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/85 text-[#F4F1ED] text-[11px] font-mono backdrop-blur-md border border-white/10">
                  <Clock className="w-3.5 h-3.5 theme-text-primary" />
                  <span>{video.runtime}</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between pointer-events-none">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Premiered {video.releaseDate}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#F4F1ED] group-hover:text-white transition-colors">
                    {video.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">
                    {video.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold theme-text-primary transition-colors flex items-center gap-1.5 min-h-[44px]">
                    <span>{video.buttonText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-mono text-slate-500">Official Rockstar Video</span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
