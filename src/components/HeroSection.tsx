import React from 'react';
import { Play, Newspaper, HardDrive, Gamepad2, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import {
  getUserLocalTimezoneName,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  getPreloadXboxGmtDate,
  PRELOAD_FILE_SIZE_NOTE,
} from '../utils/time';
import { useLaunchState } from '../context/LaunchStateContext';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

interface CountdownTileProps {
  value: number | string;
  label: string;
  accentColor?: 'orange' | 'pink';
}

const CountdownTile: React.FC<CountdownTileProps> = ({ value, label }) => {
  const displayVal = typeof value === 'number' ? value.toString().padStart(2, '0') : value;

  return (
    <div className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl bg-[#08090D]/90 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.6)] relative group overflow-hidden transition-all duration-200 hover:border-white/25">
      <div
        className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-[var(--theme-primary,#FF4FA3)] to-transparent opacity-80"
      />
      <div
        key={displayVal}
        className="animate-digit-tick font-mono font-bold tabular-nums text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#F4F1ED] tracking-tight drop-shadow-sm"
      >
        {displayVal}
      </div>
      <span className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400">
        {label}
      </span>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const {
    launchState,
    releaseRemaining,
    preloadRemaining,
    selectedConsole,
    setSelectedConsole,
  } = useLaunchState();

  const [localTzName, setLocalTzName] = React.useState<string>('Local Time');

  React.useEffect(() => {
    setLocalTzName(getUserLocalTimezoneName());
  }, []);

  const handleWatchTrailers = () => {
    onNavigate('videos');
  };

  const handleExploreNewswire = () => {
    onNavigate('newswire');
  };

  return (
    <section
      id="overview"
      className="relative min-h-[90vh] pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center relative">
        
        {/* Official GTA VI Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <img
            src="/gta-vi-logo.svg"
            alt="Grand Theft Auto VI Logo"
            className="h-20 sm:h-28 md:h-40 max-w-[80vw] sm:max-w-xs md:max-w-md w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* State-Driven Main Headline */}
        {launchState === 'RELEASE_LIVE' ? (
          <div className="space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-widest animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>OFFICIAL GLOBAL LAUNCH &middot; AVAILABLE NOW</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase text-white tracking-tight drop-shadow-md">
              GTA VI IS NOW LIVE
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
              The wait is over. Welcome to the state of Leonida and the neon-soaked streets of Vice City. Available now worldwide on PlayStation 5 and Xbox Series X|S.
            </p>
          </div>
        ) : launchState === 'PRELOAD_LIVE' ? (
          <div className="space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#F4F1ED] text-xs font-mono font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4 theme-text-primary" />
              <span>DIGITAL DOWNLOADS UNLOCKED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
              PRE-LOAD IS LIVE
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Digital pre-loading is now active on PlayStation 5 and Xbox Series X|S. Download the game data now to jump in the second global launch unlocks.
            </p>
          </div>
        ) : (
          /* BEFORE PRELOAD */
          <>
            <h2 className="text-sm sm:text-base md:text-xl font-display font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-[#F4F1ED]/95 mb-3 sm:mb-4 px-2">
              THE WAIT IS ALMOST OVER.
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal mb-6 sm:mb-8 px-4">
              The next chapter in the Grand Theft Auto series arrives on PlayStation 5 and Xbox Series X|S. Returning to the state of Leonida and the neon-soaked streets of Vice City.
            </p>
          </>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0 max-w-md sm:max-w-none mx-auto w-full">
          <button
            onClick={handleWatchTrailers}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs font-bold tracking-widest uppercase text-black bg-[#F4F1ED] hover:bg-white transition-all shadow-2xl active:scale-95 cursor-pointer min-h-[48px]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Trailers</span>
          </button>

          <button
            onClick={handleExploreNewswire}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs font-bold tracking-widest uppercase text-[#F4F1ED] bg-[#0B2425]/90 hover:bg-[#102D2A] border border-white/20 transition-all active:scale-95 cursor-pointer min-h-[48px]"
          >
            <Newspaper className="w-4 h-4 theme-text-primary" />
            <span>Explore Newswire</span>
          </button>
        </div>

        {/* LAUNCH STATE COUNTDOWNS */}
        <div id="countdown" className="max-w-6xl mx-auto scroll-mt-24 sm:scroll-mt-28 w-full text-left">
          {launchState === 'BEFORE_PRELOAD' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
              
              {/* 1. DIGITAL PRELOAD COUNTDOWN CARD */}
              <div className="relative rounded-2xl bg-[#0B2425]/75 border border-white/20 p-4 sm:p-6 md:p-8 backdrop-blur-md transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-white bg-white/10 border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full theme-bg-primary animate-pulse" />
                      Digital Pre-Load
                    </span>
                    
                    {/* Console Toggle */}
                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-[10px] font-mono font-bold">
                      <button
                        onClick={() => setSelectedConsole('ps5')}
                        className={`px-2.5 py-1 rounded transition-colors min-h-[32px] ${selectedConsole === 'ps5' ? 'theme-bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        PS5
                      </button>
                      <button
                        onClick={() => setSelectedConsole('xbox')}
                        className={`px-2.5 py-1 rounded transition-colors min-h-[32px] ${selectedConsole === 'xbox' ? 'theme-bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        Xbox X|S
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                    {selectedConsole === 'ps5' ? 'PS5 Pre-load Begins In' : 'Xbox Pre-load Begins In'}
                  </h3>

                  <p className="text-xs font-mono text-slate-400 mt-1 mb-4 sm:mb-6 leading-relaxed">
                    {selectedConsole === 'ps5' ? (
                      <>Tuesday, Nov 10, 2026 &middot; 12:00 AM Local ({localTzName})</>
                    ) : (
                      <>Tuesday, Nov 10, 2026 &middot; 12:00 AM GMT (Global Unlock)</>
                    )}
                  </p>

                  <div className="py-2 sm:py-4 grid grid-cols-4 gap-2 sm:gap-3 text-center w-full">
                    <CountdownTile value={preloadRemaining.days} label="Days" />
                    <CountdownTile value={preloadRemaining.hours} label="Hours" />
                    <CountdownTile value={preloadRemaining.minutes} label="Mins" />
                    <CountdownTile value={preloadRemaining.seconds} label="Secs" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <HardDrive className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Storage Requirement: {PRELOAD_FILE_SIZE_NOTE}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Code-in-box retail editions start Nov 12</span>
                    <span className="theme-text-primary font-bold">Confirmed</span>
                  </div>
                </div>
              </div>

              {/* 2. GLOBAL RELEASE COUNTDOWN CARD */}
              <div className="relative rounded-2xl bg-[#0B2425]/75 border border-white/20 p-4 sm:p-6 md:p-8 backdrop-blur-md transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-white bg-white/10 border border-white/20">
                      Official Launch Date
                    </span>
                    <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-400">
                      State of Leonida
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                    Global Release
                  </h3>

                  <p className="text-xs font-mono text-slate-400 mt-1 mb-4 sm:mb-6 leading-relaxed">
                    Thursday, Nov 19, 2026 &middot; 12:00 AM Local ({localTzName})
                  </p>

                  <div className="py-2 sm:py-4 grid grid-cols-4 gap-2 sm:gap-3 text-center w-full">
                    <CountdownTile value={releaseRemaining.days} label="Days" />
                    <CountdownTile value={releaseRemaining.hours} label="Hours" />
                    <CountdownTile value={releaseRemaining.minutes} label="Mins" />
                    <CountdownTile value={releaseRemaining.seconds} label="Secs" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 theme-text-primary shrink-0" />
                    <span>PS5 &middot; Xbox Series X|S</span>
                  </span>
                  <span className="theme-text-primary font-bold shrink-0">Worldwide Day One</span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};
