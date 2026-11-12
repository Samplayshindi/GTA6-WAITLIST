import React, { useState } from 'react';
import { Play, Video, ExternalLink } from 'lucide-react';
import { getResponsiveImageUrl } from '../utils/imageUtils';

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  description: string;
}

export const OFFICIAL_VIDEOS: VideoItem[] = [
  {
    id: 'preload-trailer',
    title: 'Grand Theft Auto VI: Pre-Load Now',
    youtubeUrl: 'https://www.youtube.com/watch?v=_yl5ELcmugI',
    thumbnailUrl: 'https://img.youtube.com/vi/_yl5ELcmugI/maxresdefault.jpg',
    duration: '0:30',
    category: 'Official Broadcast',
    description: 'Official pre-load launch announcement featuring Lucia and Jason across Vice City.',
  },
  {
    id: 'trailer-1',
    title: 'Grand Theft Auto VI Trailer 1',
    youtubeUrl: 'https://www.youtube.com/watch?v=QdBZY2fkU-0',
    thumbnailUrl: 'https://img.youtube.com/vi/QdBZY2fkU-0/maxresdefault.jpg',
    duration: '1:31',
    category: 'Official Trailer',
    description: 'The record-breaking debut trailer introducing Vice City and the state of Leonida.',
  },
];

export const TrailerGallery: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  return (
    <section id="videos" className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-2">
        <Video className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Official Media Broadcasts
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-8">
        Trailers &amp; Footage
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {OFFICIAL_VIDEOS.map((video) => {
          const thumbSrc = getResponsiveImageUrl(video.thumbnailUrl, 800);
          return (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative rounded-2xl bg-[#090C10] border border-white/10 hover:border-cyan-500/40 overflow-hidden shadow-xl transition-all cursor-pointer"
            >
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
                <img
                  src={thumbSrc}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 text-xs font-mono font-bold text-white border border-white/10">
                  {video.duration}
                </div>
              </div>

              <div className="p-5 space-y-1">
                <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  {video.category}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {video.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#08090D] border border-white/20 rounded-2xl p-4 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{activeVideo.title}</h3>
              <a
                href={activeVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Open on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeUrl.split('v=')[1]}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
