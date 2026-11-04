import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, ArrowRight, Clock, Newspaper, Music2, Disc3 } from 'lucide-react';
import { OFFICIAL_VIDEOS, RELEASE_SPECS } from '../config/countdown';
import { SOUNDTRACK_LIBRARY } from '../config/soundtrack';
import { getNewsArticles, NewsArticle } from '../services/newsService';
import { getDeterministicArticleImage } from '../utils/newsImageMapper';

interface DesktopHomePreviewsProps {
  onNavigate: (sectionId: string) => void;
}

export const DesktopHomePreviews: React.FC<DesktopHomePreviewsProps> = ({ onNavigate }) => {
  const [latestArticles, setLatestArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);

  // Take the 2 featured official videos for compact presentation
  const previewVideos = OFFICIAL_VIDEOS.slice(0, 2);

  // Take top 4 iconic soundtrack tracks
  const previewTracks = SOUNDTRACK_LIBRARY.slice(0, 4);

  useEffect(() => {
    let isMounted = true;
    getNewsArticles(3, 0)
      .then((res) => {
        if (isMounted && res.articles.length > 0) {
          setLatestArticles(res.articles.slice(0, 3));
        }
      })
      .catch((err) => console.error('Failed to load preview news:', err))
      .finally(() => {
        if (isMounted) setLoadingNews(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlaySoundtrackTrack = (index: number) => {
    window.dispatchEvent(new CustomEvent('gta-play-track', { detail: { index } }));
  };

  const handleOpenQueue = () => {
    window.dispatchEvent(new CustomEvent('gta-open-queue'));
  };

  return (
    <div className="space-y-20 py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. COMPACT OFFICIAL VIDEOS PREVIEW */}
      <section className="relative rounded-3xl bg-[#090C10]/80 border border-white/10 p-8 lg:p-10 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#F15A24]" />
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#F15A24]">
                Official Broadcasts
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] to-[#F15A24]">Trailers &amp; Footage</span>
            </h2>
            <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-xl">
              Official reveal broadcasts and in-engine gameplay captured on PlayStation 5 and Xbox Series X|S.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('videos')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-[#F15A24] hover:bg-[#ff6832] transition-colors shadow-lg shadow-[#F15A24]/20 cursor-pointer min-h-[40px]"
            >
              <span>View All Videos (4)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column High Impact 16:9 Video Cards with Uncropped Art */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {previewVideos.map((video) => (
            <a
              key={video.id}
              href={video.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${video.title} - Watch on official YouTube channel`}
              className="group rounded-2xl bg-[#0B2425]/40 border border-white/10 hover:border-[#F15A24]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl block text-left cursor-pointer"
            >
              {/* 16:9 Landscape Artwork with zero artificial cropping or blur layers */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black pointer-events-none">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center brightness-95 group-hover:brightness-105 transition-all duration-300"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#08090D] via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-3 left-3 z-30">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-black/80 text-[#F4F1ED] border border-white/20 backdrop-blur-md">
                    {video.badge}
                  </span>
                </div>

                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#F4F1ED] text-black flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#F15A24] group-hover:text-white transition-all duration-300">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/85 text-[#F4F1ED] text-[11px] font-mono backdrop-blur-md border border-white/10">
                  <Clock className="w-3 h-3 text-[#F15A24]" />
                  <span>{video.runtime}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between pointer-events-none">
                <div>
                  <h3 className="text-base lg:text-lg font-bold text-[#F4F1ED] group-hover:text-white transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F15A24] group-hover:text-[#FF4FA3] transition-colors flex items-center gap-1.5">
                    <span>{video.buttonText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Official Rockstar Video</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 2. COMPACT NEWSWIRE INTELLIGENCE PREVIEW */}
      <section className="relative rounded-3xl bg-[#090C10]/80 border border-white/10 p-8 lg:p-10 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00F5D4]" />
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#00F5D4]">
                Intelligence Feed
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#F15A24]">Newswire Updates</span>
            </h2>
            <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-xl">
              Direct intelligence from Rockstar Games, Take-Two financial disclosures, and verified industry reports.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('newswire')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-[#0B2425] hover:bg-[#102D2A] border border-[#00F5D4]/40 hover:border-[#00F5D4] transition-colors shadow-lg cursor-pointer min-h-[40px]"
            >
              <span>Explore All Newswire</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00F5D4]" />
            </button>
          </div>
        </div>

        {/* 3-Column Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingNews ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 p-5 h-64 animate-pulse" />
            ))
          ) : (
            latestArticles.map((article) => {
              const articleImage = getDeterministicArticleImage(article.id);
              return (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-2xl bg-[#0B2425]/30 border border-white/10 hover:border-[#00F5D4]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl block text-left cursor-pointer"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                    <img
                      src={articleImage}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-black/80 text-[#00F5D4] border border-white/10">
                      {article.source}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                        {new Date(article.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <h3 className="text-sm font-bold text-[#F4F1ED] group-hover:text-white transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#00F5D4]">
                      <span className="font-semibold flex items-center gap-1 group-hover:text-white transition-colors">
                        <span>Read Article</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </section>

      {/* 3. COMPACT SOUNDTRACK PREVIEW */}
      <section className="relative rounded-3xl bg-[#090C10]/80 border border-white/10 p-8 lg:p-10 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4FA3]" />
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#FF4FA3]">
                Vice City Airwaves
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
              Official Soundtrack <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] to-[#F15A24]">&amp; Afrobank</span>
            </h2>
            <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-xl">
              Authentic GTA VI broadcast releases, singles, and radio curation playable right here via the bottom player.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenQueue}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-[#0B2425] hover:bg-[#102D2A] border border-[#FF4FA3]/40 hover:border-[#FF4FA3] transition-colors shadow-lg cursor-pointer min-h-[40px]"
            >
              <Disc3 className="w-3.5 h-3.5 text-[#FF4FA3]" />
              <span>Open Music Queue</span>
            </button>
          </div>
        </div>

        {/* 4-Track High-Density Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewTracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => handlePlaySoundtrackTrack(idx)}
              className="group p-3 rounded-2xl bg-[#0B2425]/20 hover:bg-[#0B2425]/50 border border-white/5 hover:border-[#FF4FA3]/50 transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-md"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-white fill-current" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  {track.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {track.artist}
                </p>
                <span className="text-[10px] font-mono text-[#FF4FA3]">
                  {track.durationText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
