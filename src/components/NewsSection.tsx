import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ExternalLink, AlertTriangle, Radio } from 'lucide-react';
import { getNewsArticles, NewsArticle } from '../services/newsService';

export const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const loadNews = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getNewsArticles(isManual);
      setArticles(res.articles);
      setIsLive(res.isLive);
      setLastUpdated(res.lastUpdated);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    const interval = setInterval(() => {
      loadNews();
    }, 15 * 60 * 1000); // 15 mins

    return () => clearInterval(interval);
  }, [loadNews]);

  const categories = [
    { id: 'all', label: 'ALL' },
    { id: 'official', label: 'OFFICIAL' },
    { id: 'release', label: 'RELEASE UPDATES' },
    { id: 'gameplay', label: 'GAMEPLAY' },
    { id: 'trailers', label: 'TRAILERS' },
    { id: 'leaks', label: 'RUMORS' },
  ];

  const filteredArticles = articles.filter((article) => {
    if (activeCategory === 'all') return true;
    return article.category === activeCategory;
  });

  const featuredArticle = filteredArticles[0];
  const secondaryArticles = filteredArticles.slice(1);

  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(lastUpdated))
    : '';

  return (
    <section id="newswire" className="relative py-24 border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#36B9E9]">
                Exclusive GTA VI Coverage
              </span>
              <span className="text-slate-600">/</span>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Newswire Synchronized</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-300 bg-white/5 border border-white/15">
                  <Radio className="w-3 h-3 text-[#36B9E9]" />
                  <span>Verified GTA VI Intelligence</span>
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              GTA VI <span className="text-[#FF4FA3]">Newswire</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Strictly filtered Grand Theft Auto VI news and editorial dispatches from Rockstar Games Newswire, Take-Two Interactive, IGN, GameSpot, Eurogamer, and VGC.
            </p>
          </div>

          {/* Sync status & Refresh button */}
          <div className="flex items-center gap-3">
            {formattedTime && (
              <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
                Verified: {formattedTime}
              </span>
            )}
            <button
              onClick={() => loadNews(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider text-white bg-white/5 border border-white/15 hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FF4FA3]' : ''}`} />
              <span>{refreshing ? 'Checking...' : 'Refresh Feed'}</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-white/10">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-full transition-all whitespace-nowrap focus:outline-none ${
                  active
                    ? 'bg-white text-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Loading Skeleton */}
        {loading && (
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
        {!loading && filteredArticles.length > 0 && (
          <div className="space-y-12">
            {/* 1. Large Featured Lead Story */}
            {featuredArticle && (
              <article className="group relative rounded-3xl bg-[#0D0E14] border border-white/10 hover:border-white/25 transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto overflow-hidden bg-black">
                  <img
                    src={featuredArticle.thumbnailUrl || '/images/hero-4k.jpg'}
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
                      {featuredArticle.isUnconfirmed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Unconfirmed Rumor</span>
                        </span>
                      )}
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
                          src={article.thumbnailUrl || '/images/vice-city-pack-4k.jpg'}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-black/80 text-white border border-white/15 backdrop-blur-md">
                            {article.source}
                          </span>
                          {article.isUnconfirmed && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500 text-black font-bold">
                              Unconfirmed Rumor
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                            <span>{dateStr}</span>
                            <span>·</span>
                            <span className="uppercase text-slate-500 font-sans">{article.category}</span>
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
