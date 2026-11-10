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
    <div className="flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 rounded-xl bg-[#08090D]/90 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.6)] relative group overflow-hidden transition-all duration-200 hover:border-white/30">
      <div
        key={displayVal}
        className="animate-digit-tick font-mono font-black tabular-nums text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F4F1ED] tracking-tight drop-shadow-md"
      >
        {displayVal}
      </div>
      <span className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-[0.22em] uppercase text-slate-400">
        {label}
      </span>
    </div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const {
    launchState,
    releaseRemaining,
  } = useLaunchState();

  const { effectiveTimeZone } = useSettings();

  const handleWatchTrailers = () => {
    onNavigate('videos');
  };

  const handleExploreNewswire = () => {
    onNavigate('newswire');
  };

  const tzDisplayName = getUserLocalTimezoneName(effectiveTimeZone);

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
                <span>DIGITAL PRE-LOAD ACTIVE</span>
              </div>
            </RevealOnScroll>
            <RevealOnScroll delayMs={200}>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
                PRE-LOAD IS LIVE
              </h1>
            </RevealOnScroll>
            <RevealOnScroll delayMs={300}>
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Digital pre-loading is active on PlayStation 5 and Xbox Series X|S. Game data is unlocked and ready for launch day.
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

        {/* 4. PRIMARY FOCUS: GLOBAL RELEASE COUNTDOWN CARD */}
        <div id="countdown" className="max-w-4xl mx-auto scroll-mt-24 sm:scroll-mt-28 w-full text-left">
          {launchState === 'RELEASE_LIVE' ? (
            <RevealOnScroll delayMs={600}>
              <div className="relative rounded-2xl bg-[#0B2425]/90 border border-emerald-500/40 p-6 sm:p-8 md:p-10 backdrop-blur-lg shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
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
            <RevealOnScroll delayMs={600}>
              <div className="relative rounded-2xl bg-[#0B2425]/90 border border-white/25 p-6 sm:p-8 md:p-10 backdrop-blur-xl transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden group hover:border-white/40">

                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.18em] uppercase text-white bg-white/10 border border-white/20 shadow-sm">
                      <span className="w-2 h-2 rounded-full theme-bg-primary animate-pulse" />
                      Official Launch Countdown
                    </span>
                    <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full border border-white/10">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{tzDisplayName}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-[#F4F1ED] tracking-tight">
                      Global Release
                    </h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-cyan-300 mt-2">
                      <Clock className="w-4 h-4 shrink-0 text-cyan-400" />
                      <span>November 19, 2026 &middot; 12:00 AM ({tzDisplayName})</span>
                    </div>
                  </div>

                  <div className="py-3 sm:py-5 grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 text-center w-full">
                    <CountdownTile value={releaseRemaining.days} label="Days" />
                    <CountdownTile value={releaseRemaining.hours} label="Hours" />
                    <CountdownTile value={releaseRemaining.minutes} label="Mins" />
                    <CountdownTile value={releaseRemaining.seconds} label="Secs" />
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 theme-text-primary shrink-0" />
                    <span className="text-slate-200 font-semibold text-xs sm:text-sm">PlayStation 5 &middot; Xbox Series X|S</span>
                  </span>
                  <span className="theme-text-primary font-bold uppercase tracking-wider text-xs shrink-0">Worldwide Day One</span>
                </div>
              </div>
            </RevealOnScroll>
          )}
        </div>

      </div>
    </section>
  );
};

