import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { FAQ_DATA } from '../data/faqData';
import { RevealOnScroll } from './RevealOnScroll';

export const FaqSection: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(FAQ_DATA[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="relative py-16 sm:py-20 md:py-28 bg-transparent border-t border-white/10 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Section Header */}
        <RevealOnScroll>
          <div className="max-w-3xl mb-8 sm:mb-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 rounded-full theme-bg-primary" />
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
                v1.9.0 Expanded Intelligence Hub
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
              FAQ &amp; Game <span className="theme-gradient-text">Information</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              Verified answers covering launch timing, supported platforms, game editions, pre-loading, storage footprints, and region availability—strictly authenticated through Rockstar Games disclosures.
            </p>
          </div>
        </RevealOnScroll>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 w-full">
          {FAQ_DATA.map((faq, idx) => {
            const isExpanded = expandedId === faq.id;
            return (
              <RevealOnScroll key={faq.id} delayMs={(idx % 5) * 50}>
                <div
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden w-full ${
                    isExpanded
                      ? 'bg-[#0B2425]/75 border-white/30 shadow-xl'
                      : 'bg-[#0B2425]/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-left p-4 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer focus:outline-none min-h-[56px]"
                    aria-expanded={isExpanded}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase theme-text-primary">
                          {faq.category}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center gap-1 ${
                            faq.isConfirmed
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {faq.isConfirmed ? (
                            <>
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Confirmed</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>Unannounced</span>
                            </>
                          )}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#F4F1ED] leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className="p-2 rounded-full bg-white/5 text-slate-300 shrink-0 ml-2 mt-1 sm:mt-0">
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
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};
