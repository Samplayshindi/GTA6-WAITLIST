import React, { useState } from 'react';
import { Play, ExternalLink, X, Clock, Calendar } from 'lucide-react';
import { OFFICIAL_VIDEOS, GtaVideo, RELEASE_SPECS } from '../config/countdown';

interface TrailerGalleryProps {
  activeTrailerModal: string | null;
  onOpenTrailer: (videoId: string) => void;
  onCloseTrailer: () => void;
}

export const TrailerGallery: React.FC<TrailerGalleryProps> = ({
  activeTrailerModal,
  onOpenTrailer,
  onCloseTrailer,
}) => {
  const [selectedVideo, setSelectedVideo] = useState<GtaVideo | null>(null);

  const handlePlayVideo = (video: GtaVideo) => {
    setSelectedVideo(video);
    onOpenTrailer(video.id);
  };

  const handleClose = () => {
    setSelectedVideo(null);
    onCloseTrailer();
  };

  const featuredVideos = OFFICIAL_VIDEOS.filter((v) => v.isFeatured);
  const standardVideos = OFFICIAL_VIDEOS.filter((v) => !v.isFeatured);

  return (
    <section id="videos" className="relative py-28 bg-[#08090D] border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#F15A24]" />
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#F15A24]">
                Rockstar Games Video Gallery
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
              Official <span className="text-[#FF4FA3]">Videos</span>
            </h2>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              Authentic broadcast media and gameplay presentations captured in-engine on PlayStation 5 and Xbox Series X|S.
            </p>
          </div>

          <a
            href={RELEASE_SPECS.videoGalleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-[#F4F1ED] bg-[#0B2425]/80 border border-[#F15A24]/30 hover:border-[#F15A24] transition-colors self-start md:self-auto"
          >
            <span>Rockstar Video Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#F15A24]" />
          </a>
        </div>

        {/* Featured Video Tier: Launch Trailer & Extended Look */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {featuredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handlePlayVideo(video)}
              className="group cursor-pointer rounded-2xl bg-[#0B2425]/40 border border-white/10 hover:border-[#F15A24]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                <img
                  src={video.thumbnailUrl}
                  srcSet={`${video.thumbnailUrl} 3840w`}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2425] via-transparent to-black/30" />

                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-black/80 text-[#F4F1ED] border border-white/20 backdrop-blur-md">
                    {video.badge}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-[#F4F1ED] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#F15A24] group-hover:text-white transition-all duration-300">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 text-[#F4F1ED] text-xs font-mono backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-[#F15A24]" />
                  <span>{video.runtime}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Released {video.releaseDate}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#F4F1ED] group-hover:text-white transition-colors leading-snug">
                    {video.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-300 leading-relaxed font-normal">
                    {video.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider uppercase text-[#F15A24] group-hover:text-[#FF4FA3] transition-colors flex items-center gap-2">
                    <span>PLAY VIDEO</span>
                    <Play className="w-3 h-3 fill-current" />
                  </span>

                  <span className="text-xs font-mono text-slate-500">Official Rockstar Video</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Tier: Trailer 1 & Trailer 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {standardVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handlePlayVideo(video)}
              className="group cursor-pointer rounded-xl bg-[#0B2425]/30 border border-white/10 hover:border-[#F15A24]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                <img
                  src={video.thumbnailUrl}
                  srcSet={`${video.thumbnailUrl} 3840w`}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B2425] via-transparent to-black/30" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-black/80 text-[#F4F1ED] border border-white/20 backdrop-blur-md">
                    {video.badge}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-[#F4F1ED] text-black flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-[#F15A24] group-hover:text-white transition-all duration-300">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 text-[#F4F1ED] text-xs font-mono backdrop-blur-md">
                  <Clock className="w-3 h-3 text-[#F15A24]" />
                  <span>{video.runtime}</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Released {video.releaseDate}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F4F1ED] transition-colors">
                    {video.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-[#F15A24] group-hover:text-[#FF4FA3] transition-colors flex items-center gap-1.5">
                    <span>WATCH NOW</span>
                    <Play className="w-3 h-3 fill-current" />
                  </span>
                  <span className="font-mono">{video.runtime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl aspect-[16/9] bg-[#08090D] rounded-2xl overflow-hidden shadow-2xl border border-white/15">
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
              <a
                href={selectedVideo.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-[#F4F1ED] bg-black/80 border border-white/20 hover:bg-[#F15A24] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>WATCH ON YOUTUBE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleClose}
                aria-label="Close Player"
                className="p-2 rounded-full bg-black/70 text-white hover:bg-[#F15A24] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:block">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-black/80 text-white border border-white/20">
                {selectedVideo.title} · {selectedVideo.runtime}
              </span>
            </div>

            {selectedVideo.canEmbed ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full flex flex-col justify-end p-8 sm:p-12 overflow-hidden bg-black">
                <img
                  src={selectedVideo.thumbnailUrl}
                  alt={selectedVideo.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/70 to-transparent" />

                <div className="relative z-10 max-w-3xl space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#F15A24] text-white">
                    {selectedVideo.badge}
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-black text-[#F4F1ED] uppercase tracking-tight leading-tight">
                    {selectedVideo.title}
                  </h3>

                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
                    {selectedVideo.description}
                  </p>

                  <div className="pt-4 flex items-center gap-4">
                    <a
                      href={selectedVideo.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase text-white bg-[#F15A24] hover:bg-[#FF4FA3] transition-all shadow-2xl cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>WATCH ON YOUTUBE</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
