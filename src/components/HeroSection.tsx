import React from 'react';
import { Play, Newspaper } from 'lucide-react';
import {
  TimeRemaining,
  getUserLocalTimezoneName,
  formatLocalDateString,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
} from '../utils/time';

interface HeroSectionProps {
  releaseRemaining: TimeRemaining;
  preloadRemaining: TimeRemaining;
  onNavigate: (sectionId: string) => void;
  onOpenTrailerModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  releaseRemaining,
  preloadRemaining,
  onNavigate,
  onOpenTrailerModal,
}) => {
  const localTzName = getUserLocalTimezoneName();
  const globalReleaseDate = getGlobalReleaseLocalDate();
  const preloadDate = getPreloadLocalDate();

  const formattedLocalRelease = formatLocalDateString(globalReleaseDate);
  const formattedLocalPreload = formatLocalDateString(preloadDate);

  return (
    <section id="overview" className="relative min-h-screen pt-32 pb-24 flex flex-col justify-center">
      {/* Cinematic Full-Width Official 4K Artwork Hero Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="/images/hero-4k.jpg"
          srcSet="/images/hero-4k.jpg 3840w, /official-gta-vi-hero.jpg 1920w"
          sizes="100vw"
          alt="Grand Theft Auto VI Official 4K Artwork"
          className="w-full h-full object-cover object-center opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/80 to-[#08090D]/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center">
        {/* Prominent Official GTA VI Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/gta-vi-logo.svg"
            alt="Grand Theft Auto VI Logo"
            className="h-28 sm:h-36 md:h-48 w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Tagline */}
        <h2 className="text-sm sm:text-base md:text-lg font-mono font-bold tracking-[0.35em] uppercase text-white/90 mb-4">
          The Wait Is Almost Over.
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal mb-8">
          The next chapter in the Grand Theft Auto series arrives on PlayStation 5 and Xbox Series X|S. Returning to the state of Leonida and the neon streets of Vice City.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={onOpenTrailerModal}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase text-black bg-white hover:bg-slate-200 transition-colors shadow-2xl active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Trailers</span>
          </button>

          <button
            onClick={() => onNavigate('newswire')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-colors active:scale-95 cursor-pointer"
          >
            <Newspaper className="w-4 h-4" />
            <span>Explore Newswire</span>
          </button>
        </div>

        {/* Dual Large Prominent Countdown Showcase: Preload on Left (1st on mobile) & Global Release on Right (2nd on mobile) */}
        <div id="countdown" className="max-w-6xl mx-auto scroll-mt-28 w-full text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* 1. PRELOAD COUNTDOWN — Left Panel on Desktop, First on Mobile */}
            <div className="relative rounded-3xl bg-[#0D0E14]/95 border border-[#36B9E9]/35 hover:border-[#36B9E9]/60 p-6 sm:p-10 backdrop-blur-md transition-all duration-300 shadow-[0_0_35px_rgba(54,185,233,0.1)] flex flex-col justify-between overflow-hidden">
              {/* Subtle Ambient Glow for upcoming milestone emphasis */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#36B9E9]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#36B9E9] to-transparent opacity-75" />

              <div>
                {/* Header Badge & Title */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#36B9E9] bg-[#36B9E9]/10 border border-[#36B9E9]/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#36B9E9] animate-pulse" />
                    Preload Available Soon
                  </span>
                  <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400">
                    Estimated Preload Window
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight">
                  Preload Begins In
                </h3>

                <p className="text-xs font-mono text-slate-400 mt-1 mb-6">
                  Target: {formattedLocalPreload} (12:00 AM Local · {localTzName})
                </p>

                {/* Preload Countdown Numbers */}
                {preloadRemaining.isComplete ? (
                  <div className="py-8 text-center space-y-2">
                    <h4 className="text-2xl sm:text-3xl font-black uppercase text-[#36B9E9] tracking-tight">
                      Preload Is Now Live
                    </h4>
                    <p className="text-xs text-slate-400">
                      Download Grand Theft Auto VI now on PlayStation 5 and Xbox Series X|S.
                    </p>
                  </div>
                ) : (
                  <div className="py-4 grid grid-cols-4 gap-2 sm:gap-4 divide-x divide-white/10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {preloadRemaining.days}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Days
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-2 sm:pl-4">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {preloadRemaining.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Hours
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-2 sm:pl-4">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {preloadRemaining.minutes.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Minutes
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-2 sm:pl-4">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {preloadRemaining.seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Seconds
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Informative Footer strip */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>PlayStation 5 &middot; Xbox Series X|S</span>
                <span className="text-slate-500">Estimated Date</span>
              </div>
            </div>

            {/* 2. GLOBAL RELEASE COUNTDOWN — Right Panel on Desktop, Second on Mobile */}
            <div className="relative rounded-3xl bg-[#0D0E14]/95 border border-white/10 hover:border-white/25 p-6 sm:p-10 backdrop-blur-md transition-all duration-300 shadow-[0_0_35px_rgba(255,79,163,0.06)] flex flex-col justify-between overflow-hidden">
              {/* Subtle Ambient Magenta Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4FA3]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF4FA3]/60 to-transparent opacity-70" />

              <div>
                {/* Header Badge & Title */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#FF4FA3] bg-[#FF4FA3]/10 border border-[#FF4FA3]/25">
                    Official Launch Date
                  </span>
                  <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400">
                    State of Leonida
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight">
                  Global Release
                </h3>

                <p className="text-xs font-mono text-slate-400 mt-1 mb-6">
                  Target: {formattedLocalRelease} (12:00 AM Local · {localTzName})
                </p>

                {/* Global Release Countdown Numbers */}
                {releaseRemaining.isComplete ? (
                  <div className="py-8 text-center space-y-2">
                    <h4 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                      Grand Theft Auto VI Is Now Live
                    </h4>
                    <p className="text-xs text-slate-400">
                      Available now worldwide on PlayStation 5 and Xbox Series X|S.
                    </p>
                  </div>
                ) : (
                  <div className="py-4 grid grid-cols-4 gap-2 sm:gap-4 divide-x divide-white/10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {releaseRemaining.days}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Days
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-2 sm:pl-4">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {releaseRemaining.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Hours
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-2 sm:pl-4">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {releaseRemaining.minutes.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Minutes
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-2 sm:pl-4">
                      <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white">
                        {releaseRemaining.seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-2 text-[10px] sm:text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                        Seconds
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Informative Footer strip */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>PlayStation 5 &middot; Xbox Series X|S</span>
                <span className="text-slate-500">Confirmed Release</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
