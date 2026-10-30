import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Radio, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { NewsArticle } from '../../server';

export const NewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const fetchNews = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const endpoint = isManual ? '/api/news/refresh' : '/api/news';
      const method = isManual ? 'POST' : 'GET';
      const res = await fetch(endpoint, { method });
      
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setArticles(data.articles || []);
      setIsLive(Boolean(data.isLive));
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (err: unknown) {
      console.error('Failed to load news:', err);
      setError('Unable to reach news server. Please try refreshing again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();

    // Auto-refresh news every 15 minutes (900,000 ms)
    const interval = setInterval(() => {
      fetchNews();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchNews]);

  const categories = [
    { id: 'all', label: 'ALL NEWS' },
    { id: 'official', label: 'OFFICIAL NEWS' },
    { id: 'release', label: 'RELEASE UPDATES' },
    { id: 'gameplay', label: 'GAMEPLAY' },
    { id: 'trailers', label: 'TRAILERS' },
    { id: 'leaks', label: 'LEAKS & RUMORS' },
  ];

  const filteredArticles = articles.filter((article) => {
    if (activeCategory === 'all') return true;
    return article.category === activeCategory;
  });

  const relativeTime = lastUpdated
    ? new Intl.DateTimeFormat(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(lastUpdated))
    : '';

  return (
    <section id="news" className="relative py-20 border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-pink-400">
                INTELLIGENCE HUB
              </span>
              <span className="text-slate-600">/</span>
              {/* Live Status Indicator */}
              {isLive ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold uppercase tracking-wider">Live Updates Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
                  <Radio className="w-3 h-3" />
                  <span className="font-semibold uppercase tracking-wider">Verified Archive</span>
                </div>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
              GTA VI <span className="gta-gradient-text">News Wire</span>
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Authentic reports curated from Rockstar Games Newswire, Take-Two Interactive, IGN, GameSpot, and leading gaming outlets.
            </p>
          </div>

          {/* Sync Status & Refresh */}
          <div className="flex items-center gap-3">
            {relativeTime && (
              <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
                Synced at: {relativeTime}
              </span>
            )}
            <button
              onClick={() => fetchNews(true)}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase text-slate-200 bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-pink-400' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs (Segmented functional buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <div className="flex items-center gap-1 p-1 bg-[#171025]/80 rounded-xl border border-white/10 shrink-0">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-lg transition-all whitespace-nowrap focus:outline-none ${
                    active
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-[#171025]/50 border border-white/5 p-4 space-y-4 animate-pulse h-80"
              >
                <div className="aspect-[16/9] w-full bg-white/5 rounded-xl" />
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-5 bg-white/10 rounded w-5/6" />
                <div className="h-3 bg-white/5 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">Feed Connection Issue</h4>
            <p className="text-xs text-slate-300">{error}</p>
            <button
              onClick={() => fetchNews(true)}
              className="px-5 py-2 rounded-lg text-xs font-bold tracking-wider uppercase bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Try Reconnecting
            </button>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="py-16 text-center space-y-3 max-w-md mx-auto">
            <Filter className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-lg font-bold text-white uppercase">No Articles in This Category</h4>
            <p className="text-xs text-slate-400">
              There are currently no items under the &quot;{categories.find((c) => c.id === activeCategory)?.label}&quot; filter.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="mt-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase text-pink-400 border border-pink-400/30 hover:bg-pink-400/10 transition-colors"
            >
              View All News
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
