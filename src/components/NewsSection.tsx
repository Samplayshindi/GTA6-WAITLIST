import React from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { INITIAL_NEWS_ARTICLES } from '../data/newsData';

export const NewsSection: React.FC = () => {
  return (
    <section id="newswire" className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-2">
        <Newspaper className="w-4 h-4 text-pink-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400">
          Official Rockstar Newswire
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-8">
        Newswire Feed
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INITIAL_NEWS_ARTICLES.map((article) => (
          <div
            key={article.id}
            className="p-6 rounded-2xl bg-[#090C10] border border-white/10 space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{article.source}</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{article.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{article.description}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300 uppercase tracking-wider pt-2"
            >
              <span>Read Article</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};
