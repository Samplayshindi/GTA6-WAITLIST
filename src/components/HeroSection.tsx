import React from 'react';
import { Play, Newspaper, ShieldCheck, HardDrive, Gamepad2, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import {
  getUserLocalTimezoneName,
  formatLocalDateString,
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

const CountdownTile: React.FC<CountdownTileProps> = ({ value, label, accentColor = 'orange' }) => {
  const displayVal = typeof value === 'number' ? value.toString().padStart(2, '0') : value;

  return (
    <div className="flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-xl bg-[#08090D]/90 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.6)] relative group overflow-hidden transition-all duration-200 hover:border-white/25">
      <div
        className={`absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent ${
          accentColor === 'pink' ? 'via-[#FF4FA3]' : 'via-[#F15A24]'
        } to-transparent opacity-80`}
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

  const localTzName = getUserLocalTimezoneName();
  const globalReleaseDate = getGlobalReleaseLocalDate();
  const ps5PreloadDate = getPreloadLocalDate();
  const xboxPreloadDate = getPreloadXboxGmtDate();

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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F15A24]/20 border border-[#F15A24]/40 text-[#F15A24] text-xs font-mono font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
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
          /* STATE A: BEFORE PRELOAD */
          <>
            <h2 className="text-sm sm:text-base md:text-xl font-mono font-bold tracking-[0.25em] sm:tracking-[0.35em] uppercase text-[#F4F1ED]/95 mb-3 sm:mb-4 px-2">
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-xs font-bold tracking-widest uppercase text-[#F4F1ED] bg-[#0B2425]/90 hover:bg-[#102D2A] border border-[#F15A24]/30 hover:border-[#F15A24] transition-all active:scale-95 cursor-pointer min-h-[48px]"
          >
            <Newspaper className="w-4 h-4 text-[#F15A24]" />
            <span>Explore Newswire</span>
          </button>
        </div>



        {/* ========================================================
            DYNAMIC LAUNCH STATE PRESENTATION
           ======================================================== */}
        <div id="countdown" className="max-w-6xl mx-auto scroll-mt-24 sm:scroll-mt-28 w-full text-left">
          {launchState === 'RELEASE_LIVE' ? (
            /* STATE C: GTA VI IS NOW LIVE LAUNCH CELEBRATION PRESENTATION */
            <div className="relative rounded-2xl bg-gradient-to-br from-[#121318]/95 via-[#181924]/90 to-[#0A0B10]/95 border-2 border-[#FF4FA3]/50 p-6 sm:p-10 shadow-[0_20px_60px_rgba(255,79,163,0.2)] backdrop-blur-md overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4FA3]/15 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F15A24]/10 rounded-full blur-3xl pointer-events-none -ml-28 -mb-28" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FF4FA3]/20 text-[#FF4FA3] text-[11px] font-mono font-bold tracking-wider uppercase">
                    <span>Worldwide Day One Available</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight">
                    Grand Theft Auto VI Has Officially Released
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    Experience the evolution of open-world entertainment. Available in digital editions on the PlayStation Network and Xbox Store, and at authorized global retailers.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>PlayStation 5 Ready</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Xbox Series X|S Ready</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <HardDrive className="w-4 h-4 shrink-0" />
                      <span>Up to 212 GB storage</span>
                    </span>
                  </div>
                </div>

                {/* Direct Store / Action Cards */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:w-72 shrink-0">
                  <a
                    href="https://store.playstation.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-white text-black hover:bg-slate-200 font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                  >
                    <span>PlayStation Store</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  <a
                    href="https://www.xbox.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-[#107C10] text-white hover:bg-[#139013] font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                  >
                    <span>Xbox Store</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  <button
                    onClick={() => onNavigate('videos')}
                    className="flex items-center justify-between px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs uppercase tracking-wider transition-all border border-white/10"
                  >
                    <span>Watch Launch Trailer</span>
                    <Play className="w-3.5 h-3.5 fill-current ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ) : launchState === 'PRELOAD_LIVE' ? (
            /* STATE B: PRE-LOAD IS LIVE & GLOBAL RELEASE COUNTDOWN */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
              {/* 1. PRE-LOAD LIVE STATUS CARD */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#121318]/95 to-[#1E1208]/90 border border-[#F15A24]/60 p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#F15A24]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#F15A24] bg-[#F15A24]/10 border border-[#F15A24]/30">
                      <span className="w-2 h-2 rounded-full bg-[#F15A24] animate-pulse" />
                      Pre-Load Is Live
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      PS5 &middot; Xbox Series X|S
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                    Digital Pre-Load Unlocked
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                    You can now install the full digital client. Ensure adequate drive space so your platform is 100% prepared to launch the moment servers unlock.
                  </p>

                  <div className="mt-5 space-y-2 text-xs font-mono text-slate-300 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target File Size:</span>
                      <strong className="text-amber-300">{PRELOAD_FILE_SIZE_NOTE}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">PS5 Local Unlock:</span>
                      <strong className="text-slate-200">Active Now ({localTzName})</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Xbox Global Unlock:</span>
                      <strong className="text-slate-200">Active Now (GMT)</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Retail Code-In-Box Editions:</span>
                  <span className="text-[#F15A24] font-bold">Beginning Nov 12</span>
                </div>
              </div>

              {/* 2. REMAINING GLOBAL RELEASE COUNTDOWN CARD */}
              <div className="relative rounded-2xl bg-[#0B2425]/75 border border-[#FF4FA3]/50 p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4FA3]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-[#FF4FA3] bg-[#FF4FA3]/10 border border-[#FF4FA3]/30">
                      Release Countdown
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">State of Leonida</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-[#F4F1ED] tracking-tight">
                    Worldwide Launch
                  </h3>

                  <p className="text-xs font-mono text-slate-400 mt-1 mb-4 sm:mb-6 leading-relaxed">
                    Thursday, Nov 19, 2026 &middot; 12:00 AM Local ({localTzName})
                  </p>

                  <div className="py-2 sm:py-4 grid grid-cols-4 gap-2 sm:gap-3 text-center w-full">
                    <CountdownTile value={releaseRemaining.days} label="Days" accentColor="pink" />
                    <CountdownTile value={releaseRemaining.hours} label="Hours" accentColor="pink" />
                    <CountdownTile value={releaseRemaining.minutes} label="Mins" accentColor="pink" />
                    <CountdownTile value={releaseRemaining.seconds} label="Secs" accentColor="pink" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#FF4FA3] shrink-0" />
                    <span>PlayStation 5 &middot; Xbox Series X|S</span>
                  </span>
                  <span className="text-[#FF4FA3] font-bold">Unlocks At Midnight</span>
                </div>
              </div>
            </div>
          ) : (
            /* STATE A: BEFORE PRELOAD (DUAL REAL-TIME COUNTDOWNS) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
              
              {/* 1. DIGITAL PRELOAD COUNTDOWN CARD */}
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
                        className={`px-2.5 py-1 rounded transition-colors min-h-[32px] ${selectedConsole === 'ps5' ? 'bg-[#F15A24] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                      >
                        PS5
                      </button>
                      <button
                        onClick={() => setSelectedConsole('xbox')}
                        className={`px-2.5 py-1 rounded transition-colors min-h-[32px] ${selectedConsole === 'xbox' ? 'bg-[#F15A24] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
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
                    <CountdownTile value={preloadRemaining.days} label="Days" accentColor="orange" />
                    <CountdownTile value={preloadRemaining.hours} label="Hours" accentColor="orange" />
                    <CountdownTile value={preloadRemaining.minutes} label="Mins" accentColor="orange" />
                    <CountdownTile value={preloadRemaining.seconds} label="Secs" accentColor="orange" />
                  </div>
                </div>

                {/* Preload Storage & Retail Info Banner */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <HardDrive className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Storage Requirement: {PRELOAD_FILE_SIZE_NOTE}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Code-in-box retail editions start Nov 12</span>
                    <span className="text-[#F15A24] font-bold">Confirmed</span>
                  </div>
                </div>
              </div>

              {/* 2. GLOBAL RELEASE COUNTDOWN CARD */}
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

                  <p className="text-xs font-mono text-slate-400 mt-1 mb-4 sm:mb-6 leading-relaxed">
                    Thursday, Nov 19, 2026 &middot; 12:00 AM Local ({localTzName})
                  </p>

                  <div className="py-2 sm:py-4 grid grid-cols-4 gap-2 sm:gap-3 text-center w-full">
                    <CountdownTile value={releaseRemaining.days} label="Days" accentColor="pink" />
                    <CountdownTile value={releaseRemaining.hours} label="Hours" accentColor="pink" />
                    <CountdownTile value={releaseRemaining.minutes} label="Mins" accentColor="pink" />
                    <CountdownTile value={releaseRemaining.seconds} label="Secs" accentColor="pink" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#FF4FA3] shrink-0" />
                    <span>PS5 &middot; Xbox Series X|S</span>
                  </span>
                  <span className="text-[#FF4FA3] font-bold shrink-0">Worldwide Day One</span>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </section>
  );
};
