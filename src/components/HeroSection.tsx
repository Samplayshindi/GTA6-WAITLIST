import React from 'react';
import { Play, Newspaper, ShieldAlert, ArrowDown } from 'lucide-react';
import { CountdownCard } from './CountdownCard';
import { TimeRemaining } from '../utils/time';

interface HeroSectionProps {
  releaseRemaining: TimeRemaining;
  preloadRemaining: TimeRemaining;
  officialReleaseDate: string;
  preloadDate: string;
  timezoneDisplay: string;
  onNavigate: (sectionId: string) => void;
  onOpenTrailerModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  releaseRemaining,
  preloadRemaining,
  officialReleaseDate,
  preloadDate,
  timezoneDisplay,
  onNavigate,
  onOpenTrailerModal,
}) => {
  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-20 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-bold tracking-[0.25em] uppercase text-pink-400 backdrop-blur-md">
            <span>Rockstar Games</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
            <span>State of Leonida</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic text-white leading-none drop-shadow-[0_0_40px_rgba(255,79,163,0.35)]">
            Grand Theft Auto{' '}
            <span className="gta-gradient-text not-italic">VI</span>
          </h1>

          <p className="text-base sm:text-xl md:text-2xl font-bold tracking-[0.25em] uppercase text-slate-300">
            The Wait Is Almost Over.
          </p>

          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed pt-1">
            Tracking every second until launch. Live launch telemetry, preload timeline, and real-time intelligence for the next chapter in gaming history.
          </p>

          {/* Quick Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={onOpenTrailerModal}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-[0_0_25px_rgba(255,79,163,0.4)] transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Official Trailer</span>
            </button>

            <button
              onClick={() => onNavigate('news')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wider uppercase text-slate-200 bg-white/5 border border-white/15 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all active:scale-95"
            >
              <Newspaper className="w-4 h-4 text-cyan-400" />
              <span>Live News Feed</span>
            </button>
          </div>
        </div>

        {/* Dual Countdown Grids */}
        <div id="countdown" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start scroll-mt-28">
          {/* Global Release Countdown (Prominent - 7 Columns) */}
          <div className="lg:col-span-7">
            <CountdownCard
              title="Global Release Countdown"
              badgeText="Confirmed Window"
              isBadgeAccent={true}
              isProminent={true}
              timeRemaining={releaseRemaining}
              targetDateIso={officialReleaseDate}
              officialTimezoneLabel={timezoneDisplay}
              disclaimer="Target aligned with Take-Two Interactive confirmed Fall 2026 launch window on PlayStation 5 and Xbox Series X|S."
            />
          </div>

          {/* Preload Countdown (Secondary - 5 Columns) */}
          <div className="lg:col-span-5">
            <CountdownCard
              title="Preload Begins In"
              badgeText="Estimated Placeholder"
              isBadgeAccent={false}
              isProminent={false}
              timeRemaining={preloadRemaining}
              targetDateIso={preloadDate}
              officialTimezoneLabel={timezoneDisplay}
              disclaimer="Estimated placeholder date based on historical Rockstar digital preloads. Official preload timing will be confirmed closer to launch."
            />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-14 flex justify-center">
          <button
            onClick={() => onNavigate('news')}
            className="flex flex-col items-center gap-2 text-xs font-medium tracking-widest text-slate-500 hover:text-pink-400 transition-colors focus:outline-none"
          >
            <span>DISCOVER INTELLIGENCE</span>
            <ArrowDown className="w-4 h-4 animate-bounce text-pink-400" />
          </button>
        </div>
      </div>
    </section>
  );
};
