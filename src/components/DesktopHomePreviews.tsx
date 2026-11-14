import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Play, ExternalLink, ArrowRight, Clock, Newspaper, Disc3, ZoomIn } from 'lucide-react';
import { OFFICIAL_VIDEOS } from '../config/countdown';
import { SOUNDTRACK_LIBRARY, OFFICIAL_ALBUM_ARTWORK_URL } from '../config/soundtrack';
import { getNewsArticles, getCachedNewsArticles, NewsArticle } from '../services/newsService';
import { getDeterministicArticleImage } from '../utils/newsImageMapper';
import { GALLERY_IMAGES, GalleryImage } from '../data/galleryData';
import { getOptimizedImageData } from '../utils/imageUtils';
import { OptimizedImage } from './OptimizedImage';
import { RevealOnScroll } from './RevealOnScroll';
import { prefetchRoute } from '../utils/routeLoaders';

const ImageLightboxModal = lazy(() =>
  import('./ImageLightboxModal').then((m) => ({ default: m.ImageLightboxModal }))
);

interface DesktopHomePreviewsProps {
  onNavigate: (sectionId: string) => void;
}

let cachedSessionPreviewImages: GalleryImage[] | null = null;

function getHomePreviewGallerySelection(): GalleryImage[] {
  if (cachedSessionPreviewImages && cachedSessionPreviewImages.length === 6) {
    return cachedSessionPreviewImages;
  }
  const optimizedPool = GALLERY_IMAGES.filter((img) => getOptimizedImageData(img.url, 768).isOptimized);
  const pool = optimizedPool.length >= 6 ? [...optimizedPool] : [...GALLERY_IMAGES];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  cachedSessionPreviewImages = pool.slice(0, 6);
  return cachedSessionPreviewImages;
}

export const DesktopHomePreviews: React.FC<DesktopHomePreviewsProps> = ({ onNavigate }) => {
  const initialNews = getCachedNewsArticles(3, 0);
  const [latestArticles, setLatestArticles] = useState<NewsArticle[]>(() => initialNews?.articles || []);
  const [loadingNews, setLoadingNews] = useState<boolean>(() => !initialNews || initialNews.articles.length === 0);
  const [previewLightboxIndex, setPreviewLightboxIndex] = useState<number | null>(null);

  // Featured official videos for compact presentation
  const previewVideos = OFFICIAL_VIDEOS.filter((v) => v.isFeatured);

  // Top 4 iconic soundtrack tracks
  const previewTracks = SOUNDTRACK_LIBRARY.slice(0, 4);

  // Dynamic random 6-image preview selection from verified optimized GALLERY_IMAGES (Desktop Overview only)
  const [curatedPreviewImages] = useState<GalleryImage[]>(getHomePreviewGallerySelection);

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
      
      {/* 1. CURATED GTA VI GALLERY PREVIEW SECTION */}
      <RevealOnScroll>
        <section className="relative rounded-3xl bg-[#090C10]/80 border border-white/10 p-8 lg:p-10 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full theme-bg-primary" />
                <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
                  Rockstar Media Archive
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                Official Artwork &amp; <span className="theme-gradient-text">Screenshots</span>
              </h2>
              <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-xl">
                Curated high-resolution in-engine captures, official key art, and character portraits across Vice City and Leonida.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('gallery')}
                onMouseEnter={() => prefetchRoute('gallery')}
                onFocus={() => prefetchRoute('gallery')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white transition-all duration-200 shadow-lg cursor-pointer min-h-[40px] hover:scale-105 active:scale-95 theme-bg-primary"
              >
                <span>View Full Gallery ({GALLERY_IMAGES.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6-Card Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {curatedPreviewImages.map((img, idx) => (
              <RevealOnScroll key={img.id} delayMs={(idx % 3) * 70}>
                <div
                  onClick={() => setPreviewLightboxIndex(idx)}
                  className="group relative rounded-2xl bg-[#090C10] border border-white/10 hover:border-white/40 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer block transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                    <OptimizedImage
                      src={img.url}
                      alt={img.title}
                      maxWidth={768}
                      sizes="(max-width: 639px) 90vw, (max-width: 1023px) 44vw, (max-width: 1279px) 28vw, 365px"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover brightness-95 group-hover:brightness-105 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 group-hover:opacity-85 transition-opacity" />

                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                      <div className="w-10 h-10 rounded-full theme-bg-primary text-white flex items-center justify-center shadow-2xl">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
                      <h3 className="text-xs lg:text-sm font-bold text-white transition-colors line-clamp-1">
                        {img.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* 2. COMPACT OFFICIAL VIDEOS PREVIEW */}
      <RevealOnScroll>
        <section className="home-section-opt relative rounded-3xl bg-[#090C10]/80 border border-white/10 p-8 lg:p-10 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full theme-bg-primary" />
                <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
                  Official Broadcasts
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                Featured <span className="theme-gradient-text">Trailers &amp; Footage</span>
              </h2>
              <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-xl">
                Official reveal broadcasts and in-engine gameplay captured on PlayStation 5 and Xbox Series X|S.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('videos')}
                onMouseEnter={() => prefetchRoute('videos')}
                onFocus={() => prefetchRoute('videos')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white transition-colors shadow-lg cursor-pointer min-h-[40px] theme-bg-primary"
              >
                <span>View All Videos ({OFFICIAL_VIDEOS.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Adaptive Video Grid */}
          <div
            className={`grid gap-6 ${
              previewVideos.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : previewVideos.length === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {previewVideos.map((video, idx) => (
              <RevealOnScroll key={video.id} delayMs={idx * 100}>
                <a
                  href={video.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${video.title} - Watch on official YouTube channel`}
                  className="group rounded-2xl bg-[#0B2425]/40 border border-white/10 hover:border-white/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl block text-left cursor-pointer h-full"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black pointer-events-none">
                    <OptimizedImage
                      src={video.thumbnailUrl}
                      alt={video.title}
                      maxWidth={768}
                      sizes="(max-width: 639px) 90vw, (max-width: 1023px) 44vw, (max-width: 1279px) 28vw, 365px"
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
                      <div className="w-12 h-12 rounded-full bg-[#F4F1ED] text-black border-2 border-transparent flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#08090D] group-hover:text-white group-hover:border-[var(--theme-primary,#FF4FA3)] transition-all duration-300">
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/85 text-[#F4F1ED] text-[11px] font-mono backdrop-blur-md border border-white/10">
                      <Clock className="w-3 h-3 theme-text-primary" />
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
                      <span className="font-bold theme-text-primary transition-colors flex items-center gap-1.5">
                        <span>{video.buttonText}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">Official Rockstar Video</span>
                    </div>
                  </div>
                </a>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* 3. COMPACT NEWSWIRE INTELLIGENCE PREVIEW */}
      <RevealOnScroll>
        <section className="home-section-opt relative rounded-3xl bg-[#090C10]/80 border border-white/10 p-8 lg:p-10 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full theme-bg-primary" />
                <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
                  Intelligence Feed
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                Latest <span className="theme-gradient-text">Newswire Updates</span>
              </h2>
              <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-xl">
                Direct intelligence from Rockstar Games, Take-Two financial disclosures, and verified industry reports.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('newswire')}
                onMouseEnter={() => prefetchRoute('newswire')}
                onFocus={() => prefetchRoute('newswire')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white transition-colors shadow-lg cursor-pointer min-h-[40px] theme-bg-primary"
              >
                <span>Explore All Newswire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingNews ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 p-5 h-64 animate-pulse" />
              ))
            ) : (
              latestArticles.map((article, idx) => {
                const articleImage =
                  article.thumbnailUrl ||
                  getDeterministicArticleImage(article.title, article.description);
                return (
                  <RevealOnScroll key={article.id} delayMs={idx * 80}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl bg-[#0B2425]/30 border border-white/10 hover:border-white/40 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl block text-left cursor-pointer h-full"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                        <OptimizedImage
                          src={articleImage}
                          secondaryFallbackSrc={getDeterministicArticleImage(
                            article.title,
                            article.description
                          )}
                          alt={article.title}
                          maxWidth={768}
                          sizes="(max-width: 767px) 90vw, (max-width: 1279px) 28vw, 365px"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-transparent" />
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-black/80 text-white border border-white/10">
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

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs theme-text-primary">
                          <span className="font-semibold flex items-center gap-1 group-hover:text-white transition-colors">
                            <span>Read Article</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </a>
                  </RevealOnScroll>
                );
              })
            )}
          </div>
        </section>
      </RevealOnScroll>

      {/* 4. COMPACT SOUNDTRACK PREVIEW */}
      <RevealOnScroll>
        <section className="home-section-opt relative rounded-3xl bg-[#090C10]/80 border border-white/10 p-8 lg:p-10 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full theme-bg-primary" />
                <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
                  Vice City Airwaves
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                Official Soundtrack <span className="theme-gradient-text">Library</span>
              </h2>
              <p className="mt-1 text-xs lg:text-sm text-slate-300 max-w-xl">
                Authentic GTA VI broadcast releases, singles, and radio curation playable right here via the bottom player.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleOpenQueue}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase text-white transition-colors shadow-lg cursor-pointer min-h-[40px] theme-bg-primary"
              >
                <span>Open Music Queue</span>
                <Disc3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {previewTracks.map((track, idx) => (
              <RevealOnScroll key={track.id} delayMs={idx * 60}>
                <div
                  onClick={() => handlePlaySoundtrackTrack(idx)}
                  className="group p-3 rounded-2xl bg-[#0B2425]/20 hover:bg-[#0B2425]/50 border border-white/5 hover:border-white/30 transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-md h-full"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0">
                    <OptimizedImage
                      src={track.coverUrl}
                      secondaryFallbackSrc={OFFICIAL_ALBUM_ARTWORK_URL}
                      alt={track.title}
                      maxWidth={375}
                      sizes="48px"
                      loading="lazy"
                      decoding="async"
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
                    <span className="text-[10px] font-mono theme-text-primary">
                      {track.durationText}
                    </span>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      </RevealOnScroll>

      {/* Lightbox for Overview Preview Section (Lazy-loaded on open) */}
      {previewLightboxIndex !== null && (
        <Suspense fallback={null}>
          <ImageLightboxModal
            images={curatedPreviewImages}
            currentIndex={previewLightboxIndex}
            onClose={() => setPreviewLightboxIndex(null)}
            onNavigateIndex={(newIdx) => setPreviewLightboxIndex(newIdx)}
          />
        </Suspense>
      )}
    </div>
  );
};
