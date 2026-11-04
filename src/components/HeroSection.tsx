import React, { useState } from 'react';
import { Play, Newspaper, ShieldCheck, HardDrive, Gamepad2, Info } from 'lucide-react';
import {
  TimeRemaining,
  getUserLocalTimezoneName,
  formatLocalDateString,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  getPreloadXboxGmtDate,
  calculateTimeRemainingFromDate,
  PRELOAD_FILE_SIZE_NOTE,
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
  const ps5PreloadDate = getPreloadLocalDate(); // Tuesday, Nov 10, 2026 midnight local
  const xboxPreloadDate = getPreloadXboxGmtDate(); // Tuesday, Nov 10, 2026 12:00 AM GMT

  const [selectedConsole, setSelectedConsole] = useState<'ps5' | 'xbox'>('ps5');

  const activePreloadDate = selectedConsole === 'ps5' ? ps5PreloadDate : xboxPreloadDate;
  const activePreloadRemaining = calculateTimeRemainingFromDate(activePreloadDate);

  const formattedLocalRelease = formatLocalDateString(globalReleaseDate);
  const formattedLocalPreload = formatLocalDateString(activePreloadDate);

  return (
    <section id="overview" className="relative min-h-[90vh] pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 flex flex-col justify-center bg-gradient-to-b from-[#08090D] via-[#0B2425]/30 to-[#08090D] overflow-hidden">
      {/* Cinematic Full-Width Official 4K Artwork Hero Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="/images/hero-4k.jpg"
          srcSet="/images/hero-4k.jpg 3840w, /official-gta-vi-hero.jpg 1920w"
          sizes="100vw"
          alt="Grand Theft Auto VI Official Artwork"
          className="w-full h-full object-cover object-center opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/80 to-[#08090D]/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/50 to-black/90" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center">
        
        {/* Prominent Official GTA VI Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <img
            src="/gta-vi-logo.svg"
            alt="Grand Theft Auto VI Logo"
            className="h-24 sm:h-32 md:h-44 max-w-[75vw] sm:max-w-xs md:max-w-md w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Tagline */}
        <h2 className="text-xs sm:text-base md:text-lg font-mono font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-[#F4F1ED]/90 mb-3 sm:mb-4 px-2">
          The Wait Is Almost Over.
        </h2>

        <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal mb-6 sm:mb-8 px-4">
          The next chapter in the Grand Theft Auto series arrives on PlayStation 5 and Xbox Series X|S. Returning to the state of Leonida and the neon streets of Vice City.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 px-4 sm:px-0 max-w-md sm:max-w-none mx-auto">
          <button
            onClick={onOpenTrailerModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs font-bold tracking-widest uppercase text-black bg-[#F4F1ED] hover:bg-white transition-all shadow-2xl active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Trailers</span>
          </button>

          <button
            onClick={() => onNavigate('newswire')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs font-bold tracking-widest uppercase text-[#F4F1ED] bg-[#0B2425]/80 hover:bg-[#102D2A] border border-[#F15A24]/30 hover:border-[#F15A24] transition-all active:scale-95 cursor-pointer"
          >
            <Newspaper className="w-4 h-4 text-[#F15A24]" />
            <span>Explore Newswire</span>
          </button>
        </div>

        {/* Anti-Tamper Security & Authoritative Clock Verification Badge */}
        <div className="flex items-center justify-center gap-2 mb-8 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-1.5 rounded-full max-w-fit mx-auto backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Authoritative Server Time Synchronized &middot; Monotonic Clock Protected</span>
        </div>

        {/* Dual Large Prominent Countdown Showcase */}
        <div id="countdown" className="max-w-6xl mx-auto scroll-mt-24 sm:scroll-mt-28 w-full text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* 1. DIGITAL PRELOAD COUNTDOWN */}
            <div className="relative rounded-2xl bg-[#0B2425]/75 border border-[#F15A24]/40 hover:border-[#F15A24] p-4 sm:p-6 md:p-8 backdrop-blur-md transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F15A24]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#F15A24] bg-[#F15A24]/10 border border-[#F15A24]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F15A24] animate-pulse" />
                    Digital Pre-Load
                  </span>
                  
                  {/* Console Pre-load Toggle */}
                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono font-bold">
                    <button
                      onClick={() => setSelectedConsole('ps5')}
                      className={`px-2.5 py-1 rounded transition-colors ${selectedConsole === 'ps5' ? 'bg-[#F15A24] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      PS5
                    </button>
                    <button
                      onClick={() => setSelectedConsole('xbox')}
                      className={`px-2.5 py-1 rounded transition-colors ${selectedConsole === 'xbox' ? 'bg-[#F15A24] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Xbox X|S
                    </button>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                  {selectedConsole === 'ps5' ? 'PS5 Pre-load Begins In' : 'Xbox Pre-load Begins In'}
                </h3>

                <p className="text-xs font-mono text-slate-400 mt-1 mb-4 sm:mb-6">
                  {selectedConsole === 'ps5' ? (
                    <>Tuesday, Nov 10, 2026 &middot; 12:00 AM Local ({localTzName})</>
                  ) : (
                    <>Tuesday, Nov 10, 2026 &middot; 12:00 AM GMT (Global Unlock)</>
                  )}
                </p>

                {activePreloadRemaining.isComplete ? (
                  <div className="py-6 sm:py-8 text-center space-y-2">
                    <h4 className="text-xl sm:text-2xl font-black uppercase text-[#F15A24] tracking-tight">
                      Preload Is Now Live
                    </h4>
                    <p className="text-xs text-slate-400">
                      Download Grand Theft Auto VI now on {selectedConsole === 'ps5' ? 'PlayStation 5' : 'Xbox Series X|S'}.
                    </p>
                  </div>
                ) : (
                  <div className="py-2 sm:py-4 grid grid-cols-4 gap-1 sm:gap-3 divide-x divide-white/10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {activePreloadRemaining.days}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Days
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1 sm:pl-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {activePreloadRemaining.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Hours
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1 sm:pl-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {activePreloadRemaining.minutes.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Minutes
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1 sm:pl-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {activePreloadRemaining.seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Seconds
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Preload Storage & Retail Info Banner */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <HardDrive className="w-3.5 h-3.5 shrink-0" />
                  <span>Storage Requirement: {PRELOAD_FILE_SIZE_NOTE}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>Code-in-box versions available from retailers beginning Nov 12</span>
                  <span className="text-[#F15A24] font-bold">Confirmed</span>
                </div>
              </div>
            </div>

            {/* 2. GLOBAL RELEASE COUNTDOWN */}
            <div className="relative rounded-2xl bg-[#0B2425]/75 border border-[#FF4FA3]/40 hover:border-[#FF4FA3] p-4 sm:p-6 md:p-8 backdrop-blur-md transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4FA3]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#FF4FA3] bg-[#FF4FA3]/10 border border-[#FF4FA3]/30">
                    Official Launch Date
                  </span>
                  <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400">
                    State of Leonida
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                  Global Release
                </h3>

                <p className="text-xs font-mono text-slate-400 mt-1 mb-4 sm:mb-6">
                  Thursday, Nov 19, 2026 &middot; 12:00 AM Local ({localTzName})
                </p>

                {releaseRemaining.isComplete ? (
                  <div className="py-6 sm:py-8 text-center space-y-2">
                    <h4 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                      Grand Theft Auto VI Is Now Live
                    </h4>
                    <p className="text-xs text-slate-400">
                      Available now worldwide on PlayStation 5 and Xbox Series X|S.
                    </p>
                  </div>
                ) : (
                  <div className="py-2 sm:py-4 grid grid-cols-4 gap-1 sm:gap-3 divide-x divide-white/10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {releaseRemaining.days}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Days
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1 sm:pl-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {releaseRemaining.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Hours
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1 sm:pl-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {releaseRemaining.minutes.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Minutes
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center pl-1 sm:pl-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-black tabular-nums tracking-tighter text-[#F4F1ED]">
                        {releaseRemaining.seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="mt-1 sm:mt-2 text-[9px] sm:text-[10px] md:text-xs font-mono font-semibold tracking-[0.15em] uppercase text-slate-400">
                        Seconds
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-[#FF4FA3]" />
                  <span>PlayStation 5 &middot; Xbox Series X|S</span>
                </span>
                <span className="text-[#FF4FA3] font-bold">Worldwide Day One</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
