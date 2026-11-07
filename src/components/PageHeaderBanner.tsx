import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

interface PageHeaderBannerProps {
  category: string;
  title: string;
  description: string;
  accentColor?: string;
  onNavigateHome: () => void;
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  category,
  title,
  description,
  onNavigateHome,
}) => {
  return (
    <div className="relative pt-24 pb-8 md:pt-28 md:pb-12 bg-gradient-to-b from-[#0B2425]/40 via-[#08090D]/50 to-transparent border-b border-white/10 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-4 text-xs font-mono">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 theme-text-primary" />
            <span>Home</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-white font-bold uppercase tracking-wider">{category}</span>
        </div>

        {/* Back Link */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Overview</span>
        </button>

        {/* Main Title & Description */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
            {title}
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            {description}
          </p>
        </div>

      </div>
    </div>
  );
};
