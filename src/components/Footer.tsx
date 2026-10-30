import React from 'react';
import { ArrowUp, Play, Heart, ExternalLink } from 'lucide-react';
import { RELEASE_SPECS } from '../config/countdown';

interface FooterProps {
  onReplayIntro: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplayIntro, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#06070a] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#171025] border border-pink-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,79,163,0.3)]">
                <span className="text-base font-black italic tracking-tighter gta-gradient-text">VI</span>
              </div>
              <span className="text-xl font-black tracking-wider uppercase text-white">
                GTA <span className="text-neon-pink">VI</span> COUNTDOWN
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A cinematic countdown and intelligence portal dedicated to Grand Theft Auto VI, celebrating the upcoming return to the neon-drenched streets of Vice City and Leonida.
            </p>
            <div>
              <button
                onClick={onReplayIntro}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500 hover:text-white transition-all duration-300"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay Cinematic Intro</span>
              </button>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-300">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              {['home', 'countdown', 'news', 'release-info', 'trailers'].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="hover:text-pink-400 uppercase tracking-wider transition-colors"
                  >
                    {id.replace('-', ' ')}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-300">
              Official Rockstar Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a
                  href={RELEASE_SPECS.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>Rockstar Games Official</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href={RELEASE_SPECS.newswireUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>Rockstar Newswire Feed</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.take2games.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>Take-Two Interactive</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@RockstarGames"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <span>Rockstar Games YouTube</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Back to Top & Sync telemetry */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-300 mb-2">
                Launch Target Status
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Official Window: Fall 2026<br />
                Target: Nov 19, 2026 EST<br />
                Platforms: PS5 / Xbox Series
              </p>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 border border-white/10 hover:border-pink-500/50 hover:text-white transition-all"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-4 h-4 text-pink-400" />
            </button>
          </div>
        </div>

        {/* Samar Credits Section */}
        <div className="py-10 text-center space-y-2 border-b border-white/10">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-slate-500">
            Designed &amp; Developed By
          </span>
          <h3 className="text-2xl sm:text-3xl font-black italic tracking-widest uppercase gta-gradient-text drop-shadow-[0_0_15px_rgba(255,79,163,0.5)]">
            SAMAR
          </h3>
          <p className="text-xs text-slate-400 tracking-wider">
            A premium fan-made Grand Theft Auto VI countdown &amp; intelligence experience.
          </p>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-500">
          <p className="max-w-2xl leading-relaxed">
            This is an independent fan-made GTA VI countdown website. It is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto and related logos are trademarks of Take-Two Interactive.
          </p>

          <p className="whitespace-nowrap font-mono text-[11px] text-slate-400">
            &copy; 2026 Samar. Fan-made project.
          </p>
        </div>
      </div>
    </footer>
  );
};
