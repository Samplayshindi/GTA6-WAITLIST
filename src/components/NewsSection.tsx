import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { getNewsArticles, NewsArticle } from '../services/newsService';
import { getDeterministicArticleImage } from '../utils/newsImageMapper';
import { getResponsiveImageUrl } from '../utils/imageUtils';

export const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Initial load: Fetch first 6 articles
  const loadInitialNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNewsArticles(6, 0);
      setArticles(res.articles);
      setHasMore(res.hasMore);
      setTotalCount(res.totalCount);
    } finally {
      setLoading(false);
    }
  }, []);

  // Show More click: Fetch next 6 articles
  const handleShowMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getNewsArticles(6, articles.length);
      setArticles((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        const newArticles = res.articles.filter((a) => !seen.has(a.id));
        const merged = [...prev, ...newArticles]
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          .slice(0, 50);
        return merged;
      });
      setHasMore(res.hasMore && articles.length + res.articles.length < 50);
      setTotalCount(Math.min(res.totalCount, 50));
    } finally {
      setLoadingMore(false);
    }
  };

  // Background polling every 5 minutes
  useEffect(() => {
    loadInitialNews();

    const interval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        const res = await getNewsArticles(6, 0);
        if (res.articles.length > 0) {
          setArticles((prev) => {
            const seen = new Set(prev.map((a) => a.id));
            const fresh = res.articles.filter((a) => !seen.has(a.id));
            if (fresh.length === 0) return prev;
            const merged = [...fresh, ...prev]
              .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
              .slice(0, 50);
            return merged;
          });
          setTotalCount(Math.min(res.totalCount, 50));
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadInitialNews]);

  const featuredArticle = articles[0];
  const gridArticles = articles.slice(1);

  return (
    <section id="newswire" className="relative py-16 sm:py-20 md:py-28 bg-gradient-to-b from-transparent via-[#0B2425]/20 to-transparent border-t border-white/10 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Hero Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full theme-bg-primary" />
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
              OFFICIAL DISPATCHES
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#F4F1ED]">
            GTA VI <span className="theme-gradient-text">NEWSWIRE</span>
          </h2>

          <p className="mt-2 sm:mt-3 text-xs sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed">
            The latest developments, announcements and coverage surrounding Grand Theft Auto VI.
          </p>
        </div>

        {/* Initial Loading Skeleton */}
        {loading && articles.length === 0 && (
          <div className="space-y-6 sm:space-y-8 animate-pulse">
            <div className="h-72 sm:h-96 rounded-2xl bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 sm:h-72 rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        {!loading && articles.length > 0 && (
          <div className="space-y-10 sm:space-y-16">
            
            {/* 1. Large Featured Lead Story */}
            {featuredArticle && (
              <article className="group relative rounded-2xl bg-[#0B2425]/60 border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
                <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-black min-h-[240px] sm:min-h-[320px]">
                  <img
                    src={getResponsiveImageUrl(featuredArticle.thumbnailUrl || getDeterministicArticleImage(featuredArticle.title, featuredArticle.description), 1080)}
                    alt={featuredArticle.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-95 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B2425] via-transparent to-transparent lg:hidden" />
                </div>

                <div className="lg:col-span-5 p-5 sm:p-8 md:p-10 flex flex-col justify-between">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="font-bold uppercase tracking-wider theme-text-primary">
                        {featuredArticle.source}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>
                        {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(featuredArticle.publishedAt))}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#F4F1ED] leading-tight group-hover:text-white transition-colors">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal line-clamp-3">
                      {featuredArticle.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <a
                      href={featuredArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase theme-text-primary transition-colors"
                    >
                      <span>READ FULL STORY</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-xs font-mono text-slate-500">FEATURED LEAD</span>
                  </div>
                </div>
              </article>
            )}

            {/* 2. Secondary Editorial Grid */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridArticles.map((article) => {
                  const dateStr = new Intl.DateTimeFormat(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }).format(new Date(article.publishedAt));

                  const rawSrc = article.thumbnailUrl || getDeterministicArticleImage(article.title, article.description);
                  const imgSrc = getResponsiveImageUrl(rawSrc, 640);

                  return (
                    <article
                      key={article.id}
                      className="group rounded-xl bg-[#0B2425]/40 border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                        <img
                          src={imgSrc}
                          alt={article.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                        />
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                            <span className="font-semibold text-slate-300">{article.source}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span>{dateStr}</span>
                          </div>

                          <h4 className="text-base font-bold text-[#F4F1ED] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                            {article.title}
                          </h4>

                          <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                            {article.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase theme-text-primary transition-colors"
                          >
                            <span>READ ARTICLE</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* 3. Pagination Controls */}
            <div className="pt-8 flex flex-col items-center justify-center text-center">
              {hasMore ? (
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase text-[#F4F1ED] bg-[#0B2425] border border-white/20 hover:bg-[#102D2A] transition-all duration-300 shadow-xl cursor-pointer disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin theme-text-primary" />
                      <span>LOADING ARTICLES...</span>
                    </>
                  ) : (
                    <span>SHOW MORE ARTICLES</span>
                  )}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono text-slate-400 bg-white/5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full theme-bg-primary" />
                  <span>You've reached the latest available coverage.</span>
                </div>
              )}

              {totalCount > 0 && (
                <p className="mt-3 text-[11px] font-mono text-slate-500">
                  Showing {articles.length} of {totalCount} stored dispatches
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </section>
  );
};
