import React from 'react';
import { ArrowUp, ExternalLink, Calendar, Video, Newspaper, HelpCircle, Cpu, Clock } from 'lucide-react';
import { RELEASE_SPECS } from '../config/countdown';
import { PWAInstallButton } from './PWAInstallButton';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#050608]/70 backdrop-blur-md border-t border-white/10 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-12 sm:pb-16 border-b border-white/10">
          
          {/* Brand & Narrative */}
          <div className="space-y-4">
            <img
              src="/gta-vi-logo.svg"
              alt="Grand Theft Auto VI"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              An authoritative GTA VI countdown and intelligence platform delivering verified release timers, digital pre-loading schedules, official broadcasts, and live newswire updates.
            </p>
            <div className="pt-2">
              <PWAInstallButton variant="footer" />
            </div>
          </div>

          {/* Media & Intel Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#F15A24] block">
              Media &amp; Intel
            </span>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('overview')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left py-1"
                >
                  <Clock className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
                  <span>Overview &amp; Launch Timers</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('countdown')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left py-1"
                >
                  <Clock className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
                  <span>Pre-load &amp; Release Countdowns</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('videos')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left py-1"
                >
                  <Video className="w-3.5 h-3.5 text-[#FF4FA3] shrink-0" />
                  <span>Official Videos Hub</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('newswire')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left py-1"
                >
                  <Newspaper className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                  <span>Live Newswire Feed</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Archive & Specs Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#FF4FA3] block">
              Archive &amp; Specs
            </span>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate('timeline')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left py-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
                  <span>Development Timeline</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left py-1"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#FF4FA3] shrink-0" />
                  <span>FAQ &amp; Knowledgebase</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('specifications')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-left py-1"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#F15A24] shrink-0" />
                  <span>Production Details &amp; Storage</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Official Portals & Back to Top */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-[#00F5D4] block mb-2.5">
                Official Portals
              </span>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a
                    href={RELEASE_SPECS.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors py-1"
                  >
                    <span>Rockstar Games VI</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href={RELEASE_SPECS.videoGalleryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors py-1"
                  >
                    <span>Rockstar Video Portal</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href={RELEASE_SPECS.newswireUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors py-1"
                  >
                    <span>Rockstar Newswire</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              </ul>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center justify-between px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#F4F1ED] bg-[#0B2425] border border-[#F15A24]/30 hover:border-[#F15A24] transition-colors cursor-pointer w-full sm:w-auto min-h-[44px]"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5 text-[#F15A24]" />
            </button>
          </div>
        </div>

        {/* Creator Attribution Section (Mandatory SAMAR attribution) */}
        <div className="py-8 sm:py-12 text-center space-y-1.5 border-b border-white/10">
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-slate-400 block">
            Designed &amp; Developed By
          </span>
          <h3 className="text-2xl sm:text-3xl font-black italic tracking-wider uppercase text-[#F4F1ED]">
            SAMAR
          </h3>
          <p className="text-xs text-slate-400 font-normal tracking-wide">
            A comprehensive GTA VI intelligence and countdown platform.
          </p>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs text-slate-500">
          <p className="max-w-2xl leading-relaxed text-[11px]">
            This is an independent fan-made GTA VI media and information platform. It is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto and related marks are trademarks of Take-Two Interactive Software, Inc.
          </p>
          <p className="font-mono text-[10px] sm:text-[11px] text-slate-400 text-center md:text-right whitespace-normal break-words max-w-full leading-relaxed">
            &copy; 2026 Samar. Independent platform. All rights to original media belong to Rockstar Games.
          </p>
        </div>
      </div>
    </footer>
  );
};
