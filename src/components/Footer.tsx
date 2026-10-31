import React from 'react';
import { ArrowUp, ExternalLink } from 'lucide-react';
import { RELEASE_SPECS } from '../config/countdown';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#050608] border-t border-white/10 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {/* Official Brand & Description */}
          <div className="space-y-4">
            <img
              src="/gta-vi-logo.svg"
              alt="Grand Theft Auto VI"
              className="h-9 w-auto object-contain"
            />
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              An independent, professionally art-directed countdown and news intelligence portal dedicated to Grand Theft Auto VI and the return to Vice City.
            </p>
          </div>

          {/* Minimal Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#F15A24] block">
              Navigation
            </span>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li>
                <button onClick={() => onNavigate('overview')} className="hover:text-white transition-colors">
                  Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('countdown')} className="hover:text-white transition-colors">
                  Countdown
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('videos')} className="hover:text-white transition-colors">
                  Videos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('newswire')} className="hover:text-white transition-colors">
                  Newswire
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('specifications')} className="hover:text-white transition-colors">
                  Additional Details
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#F15A24] block">
              Official Channels
            </span>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a
                  href={RELEASE_SPECS.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Rockstar Games</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href={RELEASE_SPECS.videoGalleryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Rockstar Video Hub</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href={RELEASE_SPECS.newswireUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Rockstar Newswire</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.take2games.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Take-Two Interactive</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Release Status & Scroll to top */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#F15A24] block mb-2">
                Release Status
              </span>
              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                Preload: Nov 12, 2026 (Midnight Local)<br />
                Launch: Nov 19, 2026 (Midnight Local)<br />
                Platforms: PS5 / Xbox Series X|S
              </p>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#F4F1ED] bg-[#0B2425] border border-[#F15A24]/30 hover:border-[#F15A24] transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#F15A24]" />
            </button>
          </div>
        </div>

        {/* Samar Creator Credits Section */}
        <div className="py-12 text-center space-y-2 border-b border-white/10">
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-slate-400 block">
            Designed &amp; Developed By
          </span>
          <h3 className="text-2xl sm:text-3xl font-black italic tracking-wider uppercase text-[#F4F1ED]">
            SAMAR
          </h3>
          <p className="text-xs text-slate-400 font-normal tracking-wide">
            A fan-made GTA VI countdown experience.
          </p>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-500">
          <p className="max-w-2xl leading-relaxed">
            This is an independent fan-made GTA VI countdown website. It is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto and related marks are trademarks of Take-Two Interactive.
          </p>
          <p className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
            &copy; 2026 Samar. Fan-made project. Not affiliated with Rockstar Games or Take-Two Interactive.
          </p>
        </div>
      </div>
    </footer>
  );
};
