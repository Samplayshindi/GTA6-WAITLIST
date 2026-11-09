import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { FAQ_DATA } from '../data/faqData';

export const FaqSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_DATA[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="relative py-16 sm:py-20 md:py-28 bg-transparent border-t border-white/10 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full theme-bg-primary" />
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
              Authoritative Knowledgebase
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
            FAQ &amp; Game <span className="theme-gradient-text">Information</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            Verified answers to the most critical questions regarding GTA VI launch, gameplay, platforms, and technology, authenticated through Rockstar Games disclosures.
          </p>
        </div>

        {/* FAQ Accordion List (All Questions Displayed Together) */}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 w-full">
          {FAQ_DATA.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden w-full ${
                  isExpanded
                    ? 'bg-[#0B2425]/70 border-white/30 shadow-xl'
                    : 'bg-[#0B2425]/30 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-4 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none min-h-[56px]"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase theme-text-primary block">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#F4F1ED] leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="p-2 rounded-full bg-white/5 text-slate-300 shrink-0 ml-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 theme-text-primary" />
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
                          className="inline-flex items-center gap-1 theme-text-primary hover:text-white transition-colors"
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
          })}
        </div>

      </div>
    </section>
  );
};
