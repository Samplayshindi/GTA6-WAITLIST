import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Video, Calendar, HelpCircle, Cpu, Music2, ChevronRight } from 'lucide-react';
import { OFFICIAL_VIDEOS } from '../config/countdown';
import { TIMELINE_DATA } from '../data/timelineData';
import { FAQ_DATA } from '../data/faqData';
import { SOUNDTRACK_LIBRARY } from '../config/soundtrack';
import { OptimizedImage } from './OptimizedImage';

interface SearchResultItem {
  id: string;
  title: string;
  category: 'Video' | 'Timeline' | 'FAQ' | 'Specifications' | 'Soundtrack';
  snippet: string;
  imageUrl?: string;
  targetSection: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToSection,
}) => {
  const [query, setQuery] = useState<string>('');

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Aggregate searchable items from authentic sources
  const allSearchableItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Official Videos
    OFFICIAL_VIDEOS.forEach((v) => {
      items.push({
        id: v.id,
        title: v.title,
        category: 'Video',
        snippet: `${v.badge} · Runtime: ${v.runtime} · Released ${v.releaseDate}`,
        imageUrl: v.thumbnailUrl,
        targetSection: 'videos',
      });
    });

    // 2. Timeline Milestones
    TIMELINE_DATA.forEach((t) => {
      items.push({
        id: t.id,
        title: t.title,
        category: 'Timeline',
        snippet: `${t.date} · ${t.summary}`,
        imageUrl: t.imageUrl,
        targetSection: 'timeline',
      });
    });

    // 3. FAQ Entries
    FAQ_DATA.forEach((f) => {
      items.push({
        id: f.id,
        title: f.question,
        category: 'FAQ',
        snippet: `${f.category} — ${f.answer}`,
        targetSection: 'faq',
      });
    });

    // 4. Soundtrack Library
    SOUNDTRACK_LIBRARY.forEach((s) => {
      items.push({
        id: s.id,
        title: `${s.title} — ${s.artist}`,
        category: 'Soundtrack',
        snippet: `${s.sourceLabel} · Duration: ${s.durationText}`,
        imageUrl: s.coverUrl,
        targetSection: 'overview',
      });
    });

    // 5. Production Specifications
    items.push({
      id: 'spec-release',
      title: 'Global Release Date: November 19, 2026',
      category: 'Specifications',
      snippet: 'Reconfirmed worldwide launch date for PlayStation 5 and Xbox Series X|S.',
      targetSection: 'specifications',
    });
    items.push({
      id: 'spec-preload',
      title: 'Digital Pre-Load: Tuesday, November 10, 2026',
      category: 'Specifications',
      snippet: 'PS5 midnight local time; Xbox Series X|S globally at 12:00 AM GMT. Storage requirement: up to 212 GB.',
      targetSection: 'countdown',
    });
    items.push({
      id: 'spec-storage',
      title: 'Storage Requirement: Up to 212 GB',
      category: 'Specifications',
      snippet: 'High-speed NVMe SSD required for installation on PS5 and Xbox Series X|S.',
      targetSection: 'specifications',
    });
    items.push({
      id: 'spec-retail',
      title: 'Code-in-Box Retail Copies: Beginning November 12, 2026',
      category: 'Specifications',
      snippet: 'Physical boxed editions available from retailers prior to release day.',
      targetSection: 'specifications',
    });

    return items;
  }, []);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSearchableItems.slice(0, 10);

    return allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, allSearchableItems]);

  const handleSelect = (targetSection: string) => {
    onNavigateToSection(targetSection);
    onClose();
  };

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'Video':
        return <Video className="w-4 h-4 text-[#F15A24]" />;
      case 'Timeline':
        return <Calendar className="w-4 h-4 text-[#00F5D4]" />;
      case 'FAQ':
        return <HelpCircle className="w-4 h-4 text-[#FF4FA3]" />;
      case 'Soundtrack':
        return <Music2 className="w-4 h-4 text-[#FF4FA3]" />;
      case 'Specifications':
        return <Cpu className="w-4 h-4 text-[#00F5D4]" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-20 bg-black/85 backdrop-blur-xl animate-in fade-in duration-150">
      <div className="bg-[#0B0D14] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center gap-3 bg-[#08090D]">
          <Search className="w-5 h-5 text-[#F15A24] shrink-0 ml-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GTA VI trailers, newswire, timeline, preload dates, soundtrack..."
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm sm:text-base focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Counter */}
        <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{filteredResults.length} matching entries</span>
          <span className="hidden sm:inline">Press ESC to close</span>
        </div>

        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm text-slate-400">No matching intel found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500">Try searching &quot;preload&quot;, &quot;trailer&quot;, &quot;release date&quot;, &quot;soundtrack&quot;, or &quot;212 GB&quot;</p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item.targetSection)}
                className="group p-3 sm:p-3.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3 sm:gap-4"
              >
                {/* Optional Thumbnail or Category Icon */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-black/60 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <OptimizedImage
                      src={item.imageUrl}
                      alt={item.title}
                      maxWidth={375}
                      sizes="48px"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    getCategoryIcon(item.category)
                  )}
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase bg-white/10 text-[#F4F1ED]">
                      {item.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#F15A24] transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate font-normal">
                    {item.snippet}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors shrink-0" />
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 border-t border-white/10 bg-[#08090D] flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="text-[10px]">Grand Theft Auto VI Official Database</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
