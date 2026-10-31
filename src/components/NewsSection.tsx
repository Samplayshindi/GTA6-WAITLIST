import React, { useState, useEffect, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { getNewsArticles, NewsArticle, FetchNewsResult } from '../services/newsService';

export const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [newsMeta, setNewsMeta] = useState<FetchNewsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadNews = useCallback(async () => {
    try {
      const res = await getNewsArticles();
      setNewsMeta(res);
      if (res.articles && res.articles.length > 0) {
        setArticles((prev) => {
          // Merge to prevent UI flicker while avoiding duplicates
          const seen = new Set<string>();
          const merged = [...res.articles, ...prev];
          const deduplicated: NewsArticle[] = [];
          for (const item of merged) {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              deduplicated.push(item);
            }
          }
          return deduplicated.sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadNews();
      }
    }, 5 * 60 * 1000); // 5 minutes polling

    return () => clearInterval(interval);
  }, [loadNews]);

  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1);

  // Check if coverage is older than 7 days
  const isCoverageOld = featuredArticle
    ? (Date.now() - new Date(featuredArticle.publishedAt).getTime()) > 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <section id="newswire" className="relative py-24 border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div className="max-w-3xl">
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#36B9E9] block mb-2">
              Exclusive GTA VI Coverage
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              GTA VI <span className="text-[#FF4FA3]">Newswire</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Strictly filtered Grand Theft Auto VI news and editorial dispatches from Rockstar Games, Take-Two Interactive, IGN, GameSpot, Eurogamer, and VGC.
            </p>
          </div>

          {(isCoverageOld || newsMeta?.stale) && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-400 bg-white/5 border border-white/10 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Showing the latest available GTA VI coverage.</span>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && articles.length === 0 && (
          <div className="space-y-8 animate-pulse">
            <div className="h-96 rounded-3xl bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-white/5" />
              ))}
            </div>
          </div>
        )}

        {/* Editorial Layout */}
        {articles.length > 0 && (
          <div className="space-y-12">
            {/* 1. Large Featured Lead Story */}
            {featuredArticle && (
              <article className="group relative rounded-3xl bg-[#0D0E14] border border-white/10 hover:border-white/25 transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-black">
                  <img
                    src={featuredArticle.thumbnailUrl || '/official-gta-vi-hero.jpg'}
                    alt={featuredArticle.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E14] via-transparent to-transparent lg:hidden" />
                </div>

                <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded bg-white/10 text-white">
                        {featuredArticle.source}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs font-mono text-slate-400">
                        {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(featuredArticle.publishedAt))}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {featuredArticle.title}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {featuredArticle.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <a
                      href={featuredArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-white hover:text-[#FF4FA3] transition-colors"
                    >
                      <span>Read Story</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-xs font-mono text-slate-500">Lead Coverage</span>
                  </div>
                </div>
              </article>
            )}

            {/* 2. Grid of Secondary Editorial Stories */}
            {secondaryArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {secondaryArticles.map((article) => {
                  const dateStr = new Intl.DateTimeFormat(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }).format(new Date(article.publishedAt));

                  return (
                    <article
                      key={article.id}
                      className="group rounded-2xl bg-[#0D0E14] border border-white/10 hover:border-white/25 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                        <img
                          src={article.thumbnailUrl || '/official-gta-vi-cover.png'}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-black/80 text-white border border-white/15 backdrop-blur-md">
                            {article.source}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                            <span>{dateStr}</span>
                          </div>

                          <h4 className="text-base font-bold text-white leading-snug line-clamp-2">
                            {article.title}
                          </h4>

                          <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                            {article.description}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white transition-colors"
                          >
                            <span>Read Story</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#36B9E9]" />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
