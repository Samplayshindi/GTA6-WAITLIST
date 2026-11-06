import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ExternalLink } from 'lucide-react';
import { FAQ_DATA } from '../data/faqData';

export const FaqSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_DATA[0].id);

  const categories = [
    'All',
    'Release Information',
    'Platforms',
    'PC Availability',
    'Gameplay & Setting',
    'Music & Audio',
    'Technical & Visuals',
    'Editions & Preorders',
  ];

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchCat = selectedCategory === 'All' || faq.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="relative py-16 sm:py-20 md:py-28 bg-transparent border-t border-white/10 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 rounded-full bg-[#F15A24]" />
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#F15A24]">
                Authoritative Knowledgebase
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
              FAQ &amp; Game <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] to-[#F15A24]">Information</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              Verified answers to the most critical questions regarding GTA VI launch, gameplay, platforms, and technology, authenticated through Rockstar Games disclosures.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B2425]/70 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-[#F15A24] transition-colors min-h-[44px]"
            />
          </div>
        </div>

        {/* Category Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 no-scrollbar w-full max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer min-h-[38px] ${
                selectedCategory === cat
                  ? 'bg-[#F15A24] text-white shadow-lg shadow-[#F15A24]/20'
                  : 'bg-[#0B2425]/60 text-slate-300 hover:text-white hover:bg-[#0B2425] border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 w-full">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[#0B2425]/20 border border-white/10 text-xs font-mono text-slate-400">
              No questions found matching your search. Try another keyword.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden w-full ${
                    isExpanded
                      ? 'bg-[#0B2425]/70 border-[#F15A24]/50 shadow-xl'
                      : 'bg-[#0B2425]/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none min-h-[56px]"
                    aria-expanded={isExpanded}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#FF4FA3] block">
                        {faq.category}
                      </span>
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#F4F1ED] leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className="p-2 rounded-full bg-white/5 text-slate-300 shrink-0 ml-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#F15A24]" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-0 animate-in fade-in duration-200">
                      <div className="pt-3 sm:pt-4 border-t border-white/10">
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                          {faq.answer}
                        </p>

                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-slate-400 text-[11px]">
                            Source: <strong className="text-slate-300">{faq.verifiedSource}</strong>
                          </span>
                          <a
                            href={faq.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#F15A24] hover:text-[#FF4FA3] transition-colors"
                          >
                            <span>Official Reference</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};
