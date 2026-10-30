import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';
import { NewsArticle } from '../../server';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const [imgError, setImgError] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(article.publishedAt));

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'rockstar newswire':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'take-two interactive':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'ign':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'gamespot':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      case 'eurogamer':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default:
        return 'text-slate-300 bg-white/5 border-white/10';
    }
  };

  return (
    <article className="group gta-glass gta-glass-hover rounded-2xl overflow-hidden flex flex-col justify-between h-full border border-pink-500/15">
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#171025]">
        {article.thumbnailUrl && !imgError ? (
          <img
            src={article.thumbnailUrl}
            alt={article.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a102b] to-[#0a0d18] p-6 text-center">
            <span className="text-3xl font-black italic text-pink-500/40 tracking-tighter">GTA VI</span>
            <span className="text-xs text-slate-500 font-mono mt-1">{article.source}</span>
          </div>
        )}

        {/* Source & Rumor Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span
            className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border backdrop-blur-md ${getSourceBadgeColor(
              article.source
            )}`}
          >
            {article.source}
          </span>

          {article.isUnconfirmed ? (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-500/90 text-black shadow-lg">
              <AlertTriangle className="w-3 h-3 text-black" />
              <span>Unconfirmed</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/60 text-emerald-400 border border-emerald-400/30 backdrop-blur-md">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Row: quiet typography with bullet separator, zero-pill */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{formattedDate}</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="uppercase text-slate-400 tracking-wider font-sans text-[11px] font-semibold">
              {article.category}
            </span>
          </div>

          {/* Headline */}
          <h4 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h4>

          {/* Summary */}
          <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {article.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-pink-400 hover:text-pink-300 group/link transition-colors"
          >
            <span>Read Full Story</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </article>
  );
};
