import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { TIMELINE_DATA } from '../data/timelineData';
import { RevealOnScroll } from './RevealOnScroll';

export const TimelineSection: React.FC = () => {
  return (
    <section id="timeline" className="relative py-16 sm:py-20 md:py-28 bg-transparent border-t border-white/10 scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Section Header */}
        <RevealOnScroll immediate>
          <div className="max-w-3xl mb-10 sm:mb-16">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 rounded-full theme-bg-primary" />
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase theme-text-primary">
                Public Archive &amp; Road to Release
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
              History &amp; <span className="theme-gradient-text">Timeline</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              A chronological public record documenting official Rockstar Games announcements, debut broadcasts, earnings reports, and upcoming launch milestones.
            </p>
          </div>
        </RevealOnScroll>

        {/* Vertical Timeline Tree */}
        <div className="relative max-w-5xl mx-auto w-full">
          <div className="absolute left-3 sm:left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-white/30 via-white/10 to-transparent -translate-x-1/2 opacity-25" />

          <div className="space-y-6 sm:space-y-10 w-full">
            {TIMELINE_DATA.map((event, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <RevealOnScroll key={event.id} delayMs={(idx % 4) * 80}>
                  <div
                    className={`relative flex flex-col md:flex-row items-start w-full ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                  
                  {/* Central Node Badge */}
                  <div className="absolute left-3 sm:left-4 md:left-1/2 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#08090D] border-2 border-white/40 flex items-center justify-center z-10 shadow-lg mt-5">
                    {event.isUpcoming ? (
                      <span className="w-2 h-2 rounded-full theme-bg-primary animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div className="w-full pl-8 sm:pl-10 md:pl-0 md:w-1/2 md:px-6 lg:px-8">
                    <div
                      className={`rounded-2xl p-4 sm:p-6 md:p-7 border shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/30 ${
                        event.isUpcoming
                          ? 'bg-[#0B2425]/75 border-white/30'
                          : 'bg-[#0B2425]/40 border-white/10'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase theme-text-primary flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{event.date}</span>
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                            event.isUpcoming
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          {event.badge}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase text-[#F4F1ED] tracking-tight leading-snug">
                        {event.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-200">
                        {event.summary}
                      </p>

                      <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-normal">
                        {event.details}
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 text-[11px] truncate">{event.sourceLabel}</span>
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 theme-text-primary hover:text-white transition-colors shrink-0 ml-2"
                        >
                          <span>Verify Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block md:w-1/2" />
                </div>
              </RevealOnScroll>
            );
          })}
          </div>
        </div>

      </div>
    </section>
  );
};
