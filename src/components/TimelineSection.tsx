import React from 'react';
import { Calendar, Clock, ExternalLink, Milestone, Sparkles, CheckCircle2 } from 'lucide-react';
import { TIMELINE_DATA, TimelineEvent } from '../data/timelineData';

export const TimelineSection: React.FC = () => {
  return (
    <section id="timeline" className="relative py-16 sm:py-20 md:py-28 bg-[#08090D] border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00F5D4]" />
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#00F5D4]">
              Public Archive &amp; Road to Release
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
            History &amp; <span className="text-[#FF4FA3]">Timeline</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            A chronological public record documenting official Rockstar Games announcements, debut broadcasts, and upcoming launch milestones.
          </p>
        </div>

        {/* Vertical Timeline Tree */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Central Vertical Spine Line */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#00F5D4] via-[#F15A24] to-[#FF4FA3] -translate-x-1/2 opacity-30" />

          <div className="space-y-8 sm:space-y-12">
            {TIMELINE_DATA.map((event, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={event.id}
                  className={`relative flex flex-col md:flex-row items-start gap-4 sm:gap-8 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  
                  {/* Central Node Badge */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#08090D] border-2 border-[#F15A24] flex items-center justify-center z-10 shadow-lg">
                    {event.isUpcoming ? (
                      <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#FF4FA3] animate-ping" />
                    ) : (
                      <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#00F5D4]" />
                    )}
                  </div>

                  {/* Content Card (Left or Right on desktop) */}
                  <div className="ml-10 sm:ml-12 md:ml-0 md:w-1/2 w-[calc(100%-2.5rem)] sm:w-[calc(100%-3rem)] md:px-8">
                    <div
                      className={`rounded-2xl p-4 sm:p-6 md:p-8 border shadow-xl backdrop-blur-md transition-all duration-300 hover:border-white/30 ${
                        event.isUpcoming
                          ? 'bg-[#0B2425]/70 border-[#FF4FA3]/40'
                          : 'bg-[#0B2425]/40 border-white/10'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#00F5D4] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{event.date}</span>
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                            event.isUpcoming
                              ? 'bg-[#FF4FA3]/20 text-[#FF4FA3] border border-[#FF4FA3]/40'
                              : 'bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          {event.badge}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black uppercase text-[#F4F1ED] tracking-tight leading-snug">
                        {event.title}
                      </h3>

                      <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-200">
                        {event.summary}
                      </p>

                      <p className="mt-3 text-xs text-slate-300 leading-relaxed font-normal">
                        {event.details}
                      </p>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">{event.sourceLabel}</span>
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#F15A24] hover:underline"
                        >
                          <span>Verify Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Empty Spacer Column for Desktop Alternate */}
                  <div className="hidden md:block md:w-1/2" />

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
