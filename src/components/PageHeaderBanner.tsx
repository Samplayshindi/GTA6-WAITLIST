import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderBannerProps {
  category: string;
  title: string;
  description: string;
  onNavigateHome: () => void;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  category,
  title,
  description,
  onNavigateHome,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onNavigateHome}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Home Overview</span>
        </button>
        <span className="text-slate-600">&middot;</span>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400">
          {category}
        </span>
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-tight">
        {title}
      </h1>
      <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
        {description}
      </p>
    </div>
  );
};
