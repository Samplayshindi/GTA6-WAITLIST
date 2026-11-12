import React, { useState } from 'react';
import { Play, Share2, Sparkles } from 'lucide-react';
import { useLaunchState } from '../context/LaunchStateContext';
import { useSettings } from '../context/SettingsContext';
import { ShareCountdownModal } from './ShareCountdownModal';

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { releaseRemaining, launchState } = useLaunchState();
  const { selectedCountry } = useSettings();
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  return (
    <section className="relative pt-12 sm:pt-16 pb-16 lg:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header Lockup */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200">
            Target Release Window &middot; November 2026
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tight leading-none">
          Grand Theft Auto <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400">VI</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Welcome to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.
        </p>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('videos')}
            className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-pink-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Watch Official Trailers</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Share Countdown Poster</span>
          </button>
        </div>
      </div>

      {/* Global Release Countdown Box */}
      <div id="countdown" className="mt-12 sm:mt-16 max-w-4xl mx-auto rounded-3xl bg-[#090C10]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-widest block">
              Official Global Release Countdown
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Launch Timeline for {selectedCountry.name}
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold uppercase">
            {selectedCountry.flagEmoji} {selectedCountry.timeZone}
          </span>
        </div>

        {launchState === 'released' ? (
          <div className="py-8 text-center space-y-2">
            <h3 className="text-3xl font-black text-emerald-400 uppercase tracking-wide">
              Grand Theft Auto VI Released!
            </h3>
            <p className="text-sm text-slate-300">
              The game is now live across PlayStation 5 and Xbox Series X|S globally.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            {[
              { label: 'DAYS', val: releaseRemaining.days },
              { label: 'HOURS', val: releaseRemaining.hours },
              { label: 'MINUTES', val: releaseRemaining.minutes },
              { label: 'SECONDS', val: releaseRemaining.seconds },
            ].map((unit) => (
              <div key={unit.label} className="p-3 sm:p-5 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-mono tabular-nums block">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ShareCountdownModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </section>
  );
};
