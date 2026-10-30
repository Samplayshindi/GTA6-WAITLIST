import React, { useState } from 'react';
import { Play, Newspaper, Copy, Check, Calendar, DownloadCloud, CheckCircle2 } from 'lucide-react';
import {
  TimeRemaining,
  getUserLocalTimezoneName,
  formatLocalDateString,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  generateCalendarIcs,
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
  const [copied, setCopied] = useState(false);

  const localTzName = getUserLocalTimezoneName();
  const globalReleaseDate = getGlobalReleaseLocalDate();
  const preloadDate = getPreloadLocalDate();

  const formattedLocalRelease = formatLocalDateString(globalReleaseDate);
  const formattedLocalPreload = formatLocalDateString(preloadDate);

  const handleCopyTimeline = () => {
    const text = `Grand Theft Auto VI Local Timeline:\n• Confirmed Preload: Midnight ${formattedLocalPreload} (${preloadRemaining.days}d ${preloadRemaining.hours}h remaining)\n• Global Release: Midnight ${formattedLocalRelease} (${releaseRemaining.days}d ${releaseRemaining.hours}h remaining)\nLocal Timezone: ${localTzName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCalendar = (type: 'launch' | 'preload' = 'launch') => {
    if (type === 'preload') {
      generateCalendarIcs(
        'Grand Theft Auto VI Preload Begins',
        preloadDate,
        `Grand Theft Auto VI confirmed preload unlocks at midnight local time (${localTzName}) on PlayStation 5 and Xbox Series X|S.`
      );
    } else {
      generateCalendarIcs(
        'Grand Theft Auto VI Official Launch',
        globalReleaseDate,
        `Grand Theft Auto VI release at midnight local time (${localTzName}) on PlayStation 5 and Xbox Series X|S.`
      );
    }
  };

  return (
    <section id="overview" className="relative min-h-screen pt-32 pb-24 flex flex-col justify-center">
      {/* Cinematic Full-Width Official Artwork Hero Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src="/official-gta-vi-hero.jpg"
          alt="Grand Theft Auto VI Official Artwork"
          className="w-full h-full object-cover object-center opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/80 to-[#08090D]/60" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center">
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
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase text-black bg-white hover:bg-slate-200 transition-colors shadow-2xl active:scale-95"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Trailers</span>
          </button>

          <button
            onClick={() => onNavigate('newswire')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold tracking-widest uppercase text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-colors active:scale-95"
          >
            <Newspaper className="w-4 h-4" />
            <span>Explore Newswire</span>
          </button>
        </div>

        {/* Primary Release Countdown Centerpiece */}
        <div id="countdown" className="max-w-4xl mx-auto scroll-mt-28">
          <div className="rounded-3xl bg-[#0D0E14]/90 border border-white/10 p-8 sm:p-12 backdrop-blur-md">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="text-left">
                <span className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#36B9E9] block">
                  Your Local Release Time
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mt-1">
                  November 19, 2026 · 12:00 AM
                </h3>
                <span className="text-xs font-mono text-slate-400 mt-0.5 block">
                  {formattedLocalRelease} ({localTzName})
                </span>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  onClick={handleCopyTimeline}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-300 bg-white/5 border border-white/10 hover:border-white/30 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCalendar('launch')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-300 bg-white/5 border border-white/10 hover:border-white/30 hover:text-white transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>.ICS</span>
                </button>
              </div>
            </div>

            {/* Large, Elegant, Readable Countdown Digits */}
            {releaseRemaining.isComplete ? (
              <div className="py-12 space-y-3">
                <h4 className="text-4xl font-black uppercase text-white tracking-tight">
                  Grand Theft Auto VI Is Now Live
                </h4>
                <p className="text-sm text-slate-400">
                  Available now worldwide on PlayStation 5 and Xbox Series X|S.
                </p>
              </div>
            ) : (
              <div className="py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
                <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-white">
                    {releaseRemaining.days}
                  </span>
                  <span className="mt-2 text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                    Days
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-white">
                    {releaseRemaining.hours.toString().padStart(2, '0')}
                  </span>
                  <span className="mt-2 text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                    Hours
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-white">
                    {releaseRemaining.minutes.toString().padStart(2, '0')}
                  </span>
                  <span className="mt-2 text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                    Minutes
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                  <span className="text-5xl sm:text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-white">
                    {releaseRemaining.seconds.toString().padStart(2, '0')}
                  </span>
                  <span className="mt-2 text-xs font-mono font-semibold tracking-[0.2em] uppercase text-slate-400">
                    Seconds
                  </span>
                </div>
              </div>
            )}

            {/* Secondary Preload Countdown strip */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Confirmed Preload:
                </span>
                <span className="text-xs font-mono text-white font-bold">
                  {preloadRemaining.days}d {preloadRemaining.hours}h {preloadRemaining.minutes}m {preloadRemaining.seconds}s
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Confirmed Everywhere
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <button
                  onClick={() => handleCalendar('preload')}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors group"
                  title="Add confirmed preload to calendar"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>Target: Nov 12, 2026 at 12:00 AM local time ({localTzName})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
