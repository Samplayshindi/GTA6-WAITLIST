import React from 'react';
import { Play, Newspaper, HardDrive, Gamepad2, CheckCircle2, Sparkles, ExternalLink, Clock, Globe } from 'lucide-react';
import {
  getUserLocalTimezoneName,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  getPreloadXboxGmtDate,
  PRELOAD_FILE_SIZE_NOTE,
  formatLocalDateString,
} from '../utils/time';
import { useLaunchState } from '../context/LaunchStateContext';
import { useSettings } from '../context/SettingsContext';
import { RevealOnScroll } from './RevealOnScroll';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

interface CountdownTileProps {
  value: number | string;
  label: string;
}

const CountdownTile: React.FC<CountdownTileProps> = ({ value, label }) => {
  const displayVal = typeof value === 'number' ? value.toString().padStart(2, '0') : value;

  return (
    <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl bg-[#08090D]/90 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.6)] relative group overflow-hidden transition-all duration-200 hover:border-white/30">
      <div
        className="absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--theme-primary,#FF4FA3)] to-transparent opacity-90"
      />
      <div
        key={displayVal}
        className="animate-digit-tick font-mono font-black tabular-nums text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#F4F1ED] tracking-tight drop-shadow-md"
      >
        {displayVal}
      </div>
      <span className="mt-1 sm:mt-1.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-[0.22em] uppercase text-slate-400">
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

  const { effectiveTimeZone } = useSettings();

  const handleWatchTrailers = () => {
    onNavigate('videos');
  };

  const handleExploreNewswire = () => {
    onNavigate('newswire');
  };

  const tzDisplayName = getUserLocalTimezoneName(effectiveTimeZone);
  const ps5PreloadDateStr = `Nov 10, 2026 · 12:00 AM (${tzDisplayName})`;
  const xboxPreloadDateStr = formatLocalDateString(getPreloadXboxGmtDate(), effectiveTimeZone);
  const globalReleaseDateStr = `Nov 19, 2026 · 12:00 AM (${tzDisplayName})`;

  return (
    <section
      id="overview"
      className="relative min-h-[90vh] pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24 flex flex-col justify-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center relative">
        
        {/* 1. Official GTA VI Logo */}
        <RevealOnScroll delayMs={0}>
          <div className="flex justify-center mb-4 sm:mb-6">
            <img
              src={`${import.meta.env.BASE_URL}gta-vi-logo.svg`}
              alt="Grand Theft Auto VI Logo"
              className="h-20 sm:h-28 md:h-40 max-w-[80vw] sm:max-w-xs md:max-w-md w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
            />
          </div>
        </RevealOnScroll>

        {/* 2. State-Driven Headline & Description */}
        {launchState === 'RELEASE_LIVE' ? (
          <div className="space-y-3 mb-6">
            <RevealOnScroll delayMs={100}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-widest animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>OFFICIAL GLOBAL LAUNCH &middot; AVAILABLE NOW</span>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delayMs={200}>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase text-white tracking-tight drop-shadow-md">
                GTA VI IS NOW LIVE
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delayMs={300}>
              <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
                The wait is over. Welcome to the state of Leonida and the neon-soaked streets of Vice City. Available now worldwide on PlayStation 5 and Xbox Series X|S.
              </p>
            </RevealOnScroll>
          </div>
        ) : launchState === 'PRELOAD_LIVE' ? (
          <div className="space-y-3 mb-6">
            <RevealOnScroll delayMs={100}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#F4F1ED] text-xs font-mono font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 theme-text-primary" />
                <span>DIGITAL DOWNLOADS UNLOCKED</span>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delayMs={200}>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
                PRE-LOAD IS LIVE
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delayMs={300}>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Digital pre-loading is now active on PlayStation 5 and Xbox Series X|S. Download the game data now to jump in the second global launch unlocks.
              </p>
            </RevealOnScroll>
          </div>
        ) : (
          <div className="space-y-3 mb-6 sm:mb-8">
            <RevealOnScroll delayMs={200}>
              <h2 className="text-sm sm:text-base md:text-xl font-display font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-[#F4F1ED]/95 px-2">
                THE WAIT IS ALMOST OVER.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll delayMs={300}>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal px-4">
                The next chapter in the Grand Theft Auto series arrives on PlayStation 5 and Xbox Series X|S. Returning to the state of Leonida and the neon-soaked streets of Vice City.
              </p>
            </RevealOnScroll>
          </div>
        )}

        {/* 3. Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 sm:px-0 max-w-md sm:max-w-none mx-auto w-full">
          <RevealOnScroll delayMs={400} className="w-full sm:w-auto">
            <button
              onClick={handleWatchTrailers}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs font-bold tracking-widest uppercase text-black bg-[#F4F1ED] hover:bg-white transition-all shadow-2xl active:scale-95 cursor-pointer min-h-[48px]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Watch Trailers</span>
            </button>
          </RevealOnScroll>

          <RevealOnScroll delayMs={500} className="w-full sm:w-auto">
            <button
              onClick={handleExploreNewswire}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs font-bold tracking-widest uppercase text-[#F4F1ED] bg-[#0B2425]/90 hover:bg-[#102D2A] border border-white/20 transition-all active:scale-95 cursor-pointer min-h-[48px]"
            >
              <Newspaper className="w-4 h-4 theme-text-primary" />
              <span>Explore Newswire</span>
            </button>
          </RevealOnScroll>
        </div>

        {/* 4. REDESIGNED LAUNCH STATE COUNTDOWNS */}
        <div id="countdown" className="max-w-6xl mx-auto scroll-mt-24 sm:scroll-mt-28 w-full text-left">
          {launchState === 'RELEASE_LIVE' ? (
            <RevealOnScroll delayMs={600}>
              <div className="relative rounded-2xl bg-[#0B2425]/90 border border-emerald-500/40 p-6 sm:p-8 md:p-10 backdrop-blur-lg shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>GLOBAL LAUNCH COMPLETE &middot; AVAILABLE NOW</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight">
                      Grand Theft Auto VI is Live Worldwide
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                      PlayStation 5 and Xbox Series X|S players can jump into the state of Leonida right now. Local launch time was Nov 19, 2026 at 12:00 AM ({tzDisplayName}).
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-bold text-white uppercase tracking-wider">
                      PS5 &amp; Xbox Series X|S
                    </span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
              
              {/* DIGITAL PRE-LOAD CARD */}
              <RevealOnScroll delayMs={600} className="h-full">
                {launchState === 'PRELOAD_LIVE' ? (
                  <div className="relative rounded-2xl bg-[#0B2425]/85 border border-emerald-500/40 p-5 sm:p-7 md:p-8 backdrop-blur-lg transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-emerald-500/60 h-full">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-90" />

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 shadow-sm animate-pulse">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Digital Pre-Load Active
                        </span>

                        <div className="flex items-center gap-1 bg-black/70 p-1 rounded-xl border border-white/15 text-[10px] font-mono font-bold">
                          <button
                            onClick={() => setSelectedConsole('ps5')}
                            className={`px-3 py-1 rounded-lg transition-all min-h-[32px] cursor-pointer ${selectedConsole === 'ps5' ? 'theme-bg-primary text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
                          >
                            PS5
                          </button>
                          <button
                            onClick={() => setSelectedConsole('xbox')}
                            className={`px-3 py-1 rounded-lg transition-all min-h-[32px] cursor-pointer ${selectedConsole === 'xbox' ? 'theme-bg-primary text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
                          >
                            Xbox X|S
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight flex items-center gap-2">
                        {selectedConsole === 'ps5' ? 'PS5 Pre-load Live Now' : 'Xbox Pre-load Live Now'}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-300 mt-1.5 mb-4 sm:mb-6">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>Downloads unlocked for PlayStation 5 &amp; Xbox Series X|S</span>
                      </div>

                      <div className="p-3.5 sm:p-4 rounded-xl bg-black/50 border border-white/10 space-y-2.5 my-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Pre-load Unlocked:</span>
                          <span className="text-emerald-400 font-bold">
                            {selectedConsole === 'ps5' ? ps5PreloadDateStr : xboxPreloadDateStr}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Digital Status:</span>
                          <span className="text-cyan-300 font-bold uppercase tracking-wider">Ready to Install</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-[11px] font-mono text-slate-300">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold">
                        <HardDrive className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Storage Requirement: {PRELOAD_FILE_SIZE_NOTE}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Code-in-box retail copies start Nov 12</span>
                        <span className="theme-text-primary font-bold uppercase tracking-wider">Confirmed</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl bg-[#0B2425]/85 border border-white/25 p-5 sm:p-7 md:p-8 backdrop-blur-lg transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-white/40 h-full">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF4FA3] via-purple-500 to-cyan-400 opacity-80" />

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-white bg-white/10 border border-white/20 shadow-sm">
                          <span className="w-2 h-2 rounded-full theme-bg-primary animate-pulse" />
                          Digital Pre-Load
                        </span>
                        
                        <div className="flex items-center gap-1 bg-black/70 p-1 rounded-xl border border-white/15 text-[10px] font-mono font-bold">
                          <button
                            onClick={() => setSelectedConsole('ps5')}
                            className={`px-3 py-1 rounded-lg transition-all min-h-[32px] cursor-pointer ${selectedConsole === 'ps5' ? 'theme-bg-primary text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
                          >
                            PS5
                          </button>
                          <button
                            onClick={() => setSelectedConsole('xbox')}
                            className={`px-3 py-1 rounded-lg transition-all min-h-[32px] cursor-pointer ${selectedConsole === 'xbox' ? 'theme-bg-primary text-white shadow-md font-black' : 'text-slate-400 hover:text-white'}`}
                          >
                            Xbox X|S
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight flex items-center gap-2">
                        {selectedConsole === 'ps5' ? 'PS5 Pre-load Begins In' : 'Xbox Pre-load Begins In'}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 mt-1.5 mb-4 sm:mb-6">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {selectedConsole === 'ps5' ? ps5PreloadDateStr : xboxPreloadDateStr}
                        </span>
                      </div>

                      <div className="py-2 sm:py-4 grid grid-cols-4 gap-2 sm:gap-3.5 text-center w-full">
                        <CountdownTile value={preloadRemaining.days} label="Days" />
                        <CountdownTile value={preloadRemaining.hours} label="Hours" />
                        <CountdownTile value={preloadRemaining.minutes} label="Mins" />
                        <CountdownTile value={preloadRemaining.seconds} label="Secs" />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 space-y-2 text-[11px] font-mono text-slate-300">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold">
                        <HardDrive className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Storage Requirement: {PRELOAD_FILE_SIZE_NOTE}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>Code-in-box retail copies start Nov 12</span>
                        <span className="theme-text-primary font-bold uppercase tracking-wider">Confirmed</span>
                      </div>
                    </div>
                  </div>
                )}
              </RevealOnScroll>

              {/* GLOBAL RELEASE COUNTDOWN CARD */}
              <RevealOnScroll delayMs={700} className="h-full">
                <div className="relative rounded-2xl bg-[#0B2425]/85 border border-white/25 p-5 sm:p-7 md:p-8 backdrop-blur-lg transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-white/40 h-full">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#FF4FA3] to-purple-500 opacity-80" />

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-white bg-white/10 border border-white/20 shadow-sm">
                        Official Launch Date
                      </span>
                      <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{tzDisplayName}</span>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                      Global Release
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 mt-1.5 mb-4 sm:mb-6">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Nov 19, 2026 &middot; 12:00 AM ({tzDisplayName})</span>
                    </div>

                    <div className="py-2 sm:py-4 grid grid-cols-4 gap-2 sm:gap-3.5 text-center w-full">
                      <CountdownTile value={releaseRemaining.days} label="Days" />
                      <CountdownTile value={releaseRemaining.hours} label="Hours" />
                      <CountdownTile value={releaseRemaining.minutes} label="Mins" />
                      <CountdownTile value={releaseRemaining.seconds} label="Secs" />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 theme-text-primary shrink-0" />
                      <span className="text-slate-200 font-semibold">PS5 &middot; Xbox Series X|S</span>
                    </span>
                    <span className="theme-text-primary font-bold uppercase tracking-wider shrink-0">Worldwide Day One</span>
                  </div>
                </div>
              </RevealOnScroll>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};

