import React, { useState } from 'react';
import { Copy, Check, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { CountdownDigit } from './CountdownDigit';
import { TimeRemaining, formatDateInUserTz, generateCalendarIcs } from '../utils/time';

interface CountdownCardProps {
  title: string;
  badgeText: string;
  isBadgeAccent?: boolean;
  isProminent?: boolean;
  timeRemaining: TimeRemaining;
  targetDateIso: string;
  officialTimezoneLabel: string;
  disclaimer?: string;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  title,
  badgeText,
  isBadgeAccent = true,
  isProminent = false,
  timeRemaining,
  targetDateIso,
  officialTimezoneLabel,
  disclaimer,
}) => {
  const [copied, setCopied] = useState(false);

  const localTimeFormatted = formatDateInUserTz(targetDateIso);

  const handleCopy = () => {
    const text = `${title}: ${timeRemaining.days} Days, ${timeRemaining.hours} Hours, ${timeRemaining.minutes} Minutes, ${timeRemaining.seconds} Seconds remaining (Target: ${localTimeFormatted})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCalendar = () => {
    generateCalendarIcs(
      title,
      targetDateIso,
      `Grand Theft Auto VI launch window milestone: ${title}. Official source: Rockstar Games.`
    );
  };

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 ${
        isProminent
          ? 'bg-[#150f22]/85 border-2 border-pink-500/35 shadow-[0_0_50px_rgba(255,79,163,0.18)] hover:border-pink-500/50'
          : 'bg-[#0d1322]/80 border border-cyan-500/25 shadow-[0_0_40px_rgba(54,185,233,0.12)] hover:border-cyan-500/40'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                isBadgeAccent
                  ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                  : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              {badgeText}
            </span>
            {isProminent && (
              <span className="flex items-center gap-1 text-xs font-medium text-amber-400/90">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Primary Milestone</span>
              </span>
            )}
          </div>
          <h3
            className={`mt-2 font-black tracking-tight uppercase text-white ${
              isProminent ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {title}
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:border-pink-500/40 hover:text-white transition-all active:scale-95"
            title="Copy Countdown info to clipboard"
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
            onClick={handleCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:text-white transition-all active:scale-95"
            title="Export calendar event (.ics)"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>.ICS</span>
          </button>
        </div>
      </div>

      {/* Main Countdown Digits or Completed State */}
      {timeRemaining.isComplete ? (
        <div className="py-10 text-center space-y-3">
          <div className="inline-block p-3 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            The Target Has Arrived!
          </h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Grand Theft Auto VI release window has unlocked. Check PlayStation Store and Xbox Live for availability.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 py-4 justify-items-center">
          <CountdownDigit value={timeRemaining.days} label="Days" isAccent={isProminent} />
          <CountdownDigit value={timeRemaining.hours} label="Hours" isAccent={isProminent} />
          <CountdownDigit value={timeRemaining.minutes} label="Minutes" isAccent={isProminent} />
          <CountdownDigit value={timeRemaining.seconds} label="Seconds" isAccent={isProminent} />
        </div>
      )}

      {/* Timezone & Disclaimer Footer */}
      <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          <span className="font-semibold text-slate-300">Your Local Time: </span>
          <span>{localTimeFormatted}</span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          Target Timezone: {officialTimezoneLabel}
        </div>
      </div>

      {disclaimer && (
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <span>{disclaimer}</span>
        </div>
      )}
    </div>
  );
};
