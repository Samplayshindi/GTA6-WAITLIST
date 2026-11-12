import React, { useMemo, useState } from 'react';
import {
  Play,
  Newspaper,
  Gamepad2,
  CheckCircle2,
  Sparkles,
  Clock,
  Globe,
  ChevronDown,
  Flame,
  Zap,
  AlertTriangle,
  Flame as BurnIcon,
  Check,
  Share2,
} from 'lucide-react';
import {
  getUserLocalTimezoneName,
  getTimezoneShortAbbr,
  formatLocalDateString,
  getGlobalReleaseLocalDate,
} from '../utils/time';
import { useLaunchState } from '../context/LaunchStateContext';
import { useSettings } from '../context/SettingsContext';
import { RevealOnScroll } from './RevealOnScroll';
import { CountrySelectorModal } from './CountrySelectorModal';
import { ShareCountdownModal } from './ShareCountdownModal';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

interface CountdownTileProps {
  value: number | string;
  label: string;
  isMilestoneActive?: boolean;
}

const CountdownTile: React.FC<CountdownTileProps> = ({ value, label, isMilestoneActive }) => {
  const displayVal = typeof value === 'number' ? value.toString().padStart(2, '0') : value;

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 rounded-xl bg-[#08090D]/90 border shadow-[0_4px_16px_rgba(0,0,0,0.6)] relative group overflow-hidden transition-all duration-200 ${
        isMilestoneActive
          ? 'border-cyan-400/50 bg-[#0C101A]/95 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
          : 'border-white/10 hover:border-white/30'
      }`}
    >
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
  const { launchState, releaseRemaining } = useLaunchState();
  const {
    selectedCountry,
    effectiveTimeZone,
    isCountryModalOpen,
    openCountryModal,
    closeCountryModal,
    motionMode,
  } = useSettings();

  const handleWatchTrailers = () => {
    onNavigate('videos');
  };

  const handleExploreNewswire = () => {
    onNavigate('newswire');
  };

  const tzDisplayName = getUserLocalTimezoneName(effectiveTimeZone);
  const tzShortAbbr = getTimezoneShortAbbr(effectiveTimeZone);

  const localReleaseDateObj = useMemo(
    () => getGlobalReleaseLocalDate(effectiveTimeZone),
    [effectiveTimeZone]
  );

  const formattedLocalReleaseTimeStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: effectiveTimeZone,
        timeZoneName: 'short',
      }).format(localReleaseDateObj);
    } catch {
      return `Nov 19, 2026 · 12:00 AM (${tzShortAbbr})`;
    }
  }, [localReleaseDateObj, effectiveTimeZone, tzShortAbbr]);

  // Requirement 4: Milestone Animations & Visual Treatments
  const totalMs = releaseRemaining.totalMs;
  const isReleased = launchState === 'RELEASE_LIVE' || releaseRemaining.isComplete;

  const milestoneInfo = useMemo(() => {
    if (isReleased) {
      return {
        level: 'RELEASED',
        badgeText: 'OFFICIAL LAUNCH LIVE WORLDWIDE',
        badgeClass: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
        cardBorderClass: 'border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.3)]',
        icon: Sparkles,
      };
    }

    // Milestone 4: Final 60 Seconds
    if (totalMs > 0 && totalMs <= 60 * 1000) {
      return {
        level: '60_SECONDS',
        badgeText: '💥 FINAL 60 SECONDS · UNLOCK IMMINENT',
        badgeClass: 'bg-rose-500/30 border-rose-500/60 text-rose-300 animate-pulse',
        cardBorderClass:
          motionMode === 'high'
            ? 'border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.5)] animate-pulse'
            : 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]',
        icon: BurnIcon,
      };
    }

    // Milestone 3: 10 Minutes Remaining
    if (totalMs > 0 && totalMs <= 10 * 60 * 1000) {
      return {
        level: '10_MINUTES',
        badgeText: '🚨 10 MINUTES TO LAUNCH · PREPARE FOR UNLOCK',
        badgeClass: 'bg-amber-500/30 border-amber-500/60 text-amber-300 animate-pulse',
        cardBorderClass:
          motionMode === 'high'
            ? 'border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.4)]'
            : 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.2)]',
        icon: AlertTriangle,
      };
    }

    // Milestone 2: 1 Hour Remaining
    if (totalMs > 0 && totalMs <= 60 * 60 * 1000) {
      return {
        level: '1_HOUR',
        badgeText: '⚡ FINAL HOUR UNTIL UNLOCK',
        badgeClass: 'bg-cyan-500/30 border-cyan-500/60 text-cyan-300 animate-pulse',
        cardBorderClass:
          motionMode === 'high'
            ? 'border-cyan-400 shadow-[0_0_45px_rgba(6,182,212,0.35)]'
            : 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]',
        icon: Zap,
      };
    }

    // Milestone 1: 24 Hours Remaining
    if (totalMs > 0 && totalMs <= 24 * 60 * 60 * 1000) {
      return {
        level: '24_HOURS',
        badgeText: '🔥 24 HOURS TO GLOBAL LAUNCH',
        badgeClass: 'bg-orange-500/25 border-orange-500/50 text-orange-300',
        cardBorderClass: 'border-orange-400/80 shadow-[0_0_35px_rgba(251,146,60,0.25)]',
        icon: Flame,
      };
    }

    // Normal State
    return {
      level: 'NORMAL',
      badgeText: 'Official Global Launch Countdown',
      badgeClass: 'bg-white/10 border-white/20 text-white',
      cardBorderClass: 'border-white/25 hover:border-white/40 shadow-2xl',
      icon: Clock,
    };
  }, [totalMs, isReleased, motionMode]);

  const MilestoneIcon = milestoneInfo.icon;

  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  return (
    <>
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
                  <span>OFFICIAL GLOBAL LAUNCH &middot; AVAILABLE NOW WORLDWIDE</span>
                </div>
              </RevealOnScroll>
              <RevealOnScroll delayMs={200}>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase text-white tracking-tight drop-shadow-md">
                  GTA VI IS NOW LIVE
                </h1>
              </RevealOnScroll>
              <RevealOnScroll delayMs={300}>
                <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
                  The wait is over. Welcome to the state of Leonida and the neon-soaked streets of Vice City. Playable now worldwide on PlayStation 5 and Xbox Series X|S.
                </p>
              </RevealOnScroll>
            </div>
          ) : launchState === 'PRELOAD_LIVE' ? (
            <div className="space-y-3 mb-6">
              <RevealOnScroll delayMs={100}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest">
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
                <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                  Digital pre-loading is active on PlayStation 5 and Xbox Series X|S. Download the game data now to jump in the second global launch unlocks.
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

          {/* 4. PRIMARY FOCUS: GLOBAL RELEASE COUNTDOWN CARD WITH COUNTRY SELECTOR */}
          <div id="countdown" className="max-w-4xl mx-auto scroll-mt-24 sm:scroll-mt-28 w-full text-left">
            {launchState === 'RELEASE_LIVE' ? (
              <RevealOnScroll delayMs={600}>
                <div className="relative rounded-2xl bg-[#0B2425]/90 border border-emerald-500/50 p-6 sm:p-8 md:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>GLOBAL LAUNCH COMPLETE &middot; AVAILABLE NOW</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight">
                        Grand Theft Auto VI is Live Worldwide
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                        PlayStation 5 and Xbox Series X|S players can jump into the state of Leonida right now. Local release date was {formattedLocalReleaseTimeStr}.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                      <a
                        href="https://www.rockstargames.com/VI"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold text-xs uppercase tracking-wider transition-all text-center cursor-pointer shadow-lg"
                      >
                        Launch Game Site
                      </a>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ) : (
              <RevealOnScroll delayMs={600}>
                <div
                  className={`relative rounded-2xl bg-[#0B2425]/95 border p-6 sm:p-8 md:p-10 backdrop-blur-xl transition-all duration-300 shadow-2xl flex flex-col justify-between overflow-hidden group ${milestoneInfo.cardBorderClass}`}
                >
                  <div className="space-y-6">
                    {/* Header Row: Milestone Badge + Country & Region Selector Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Milestone / Launch Badge */}
                      <span
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.15em] uppercase border shadow-sm ${milestoneInfo.badgeClass}`}
                      >
                        <MilestoneIcon className="w-4 h-4 shrink-0" />
                        <span>{milestoneInfo.badgeText}</span>
                      </span>

                      {/* Requirement 5D: Country & Region Selector Control Pill */}
                      <button
                        onClick={openCountryModal}
                        className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-200 flex items-center gap-2 bg-black/60 hover:bg-black/90 px-3.5 py-1.5 rounded-full border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer shadow-md group/pill"
                        title="Click to select launch country & time zone"
                      >
                        <span className="text-base">{selectedCountry.flagEmoji}</span>
                        <span className="text-cyan-300 font-bold">{selectedCountry.name}</span>
                        <span className="text-slate-400 text-[10px]">({tzShortAbbr})</span>
                        <ChevronDown className="w-3.5 h-3.5 text-cyan-400 group-hover/pill:translate-y-0.5 transition-transform" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-[#F4F1ED] tracking-tight">
                        Global Release
                      </h3>
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-cyan-300 mt-2">
                        <Clock className="w-4 h-4 shrink-0 text-cyan-400" />
                        <span>
                          {formattedLocalReleaseTimeStr} &middot; {selectedCountry.name} Local Release
                        </span>
                      </div>
                    </div>

                    {/* Countdown Tiles (Clamped to 0) */}
                    <div className="py-3 sm:py-5 grid grid-cols-4 gap-2.5 sm:gap-4 md:gap-5 text-center w-full">
                      <CountdownTile
                        value={releaseRemaining.days}
                        label="Days"
                        isMilestoneActive={milestoneInfo.level !== 'NORMAL'}
                      />
                      <CountdownTile
                        value={releaseRemaining.hours}
                        label="Hours"
                        isMilestoneActive={milestoneInfo.level !== 'NORMAL'}
                      />
                      <CountdownTile
                        value={releaseRemaining.minutes}
                        label="Mins"
                        isMilestoneActive={milestoneInfo.level !== 'NORMAL'}
                      />
                      <CountdownTile
                        value={releaseRemaining.seconds}
                        label="Secs"
                        isMilestoneActive={milestoneInfo.level !== 'NORMAL'}
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 theme-text-primary shrink-0" />
                      <span className="text-slate-200 font-semibold text-xs sm:text-sm">
                        PlayStation 5 &middot; Xbox Series X|S
                      </span>
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold uppercase tracking-wider text-xs transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Share Card</span>
                      </button>

                      <button
                        onClick={openCountryModal}
                        className="theme-text-primary hover:text-white font-bold uppercase tracking-wider text-xs shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <span>{selectedCountry.flagEmoji} {tzDisplayName}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            )}
          </div>

        </div>
      </section>

      {/* Country Selection Modal */}
      <CountrySelectorModal isOpen={isCountryModalOpen} onClose={closeCountryModal} />

      {/* Personalised Countdown Card Generator Modal */}
      <ShareCountdownModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
    </>
  );
};
