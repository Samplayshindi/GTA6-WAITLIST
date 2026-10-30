import React from 'react';
import { Gamepad2, Building2, Globe, Cpu, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
import { RELEASE_SPECS } from '../config/countdown';

interface ReleaseInformationProps {
  officialReleaseDate: string;
}

export const ReleaseInformation: React.FC<ReleaseInformationProps> = ({ officialReleaseDate }) => {
  const specs = [
    {
      icon: Calendar,
      label: 'TARGET LAUNCH WINDOW',
      value: 'Fall 2026 (November 19, 2026)',
      subtext: 'Reaffirmed in Take-Two Interactive FY26/27 earnings',
      accent: 'pink',
    },
    {
      icon: Gamepad2,
      label: 'CONFIRMED PLATFORMS',
      value: 'PlayStation 5 & Xbox Series X|S',
      subtext: 'Targeting next-generation 4K 60FPS architecture',
      accent: 'cyan',
    },
    {
      icon: Building2,
      label: 'DEVELOPMENT STUDIO',
      value: 'Rockstar North & Worldwide Studios',
      subtext: 'Edinburgh, Scotland / Worldwide Rockstar teams',
      accent: 'orange',
    },
    {
      icon: Globe,
      label: 'WORLD & SETTING',
      value: 'State of Leonida (Vice City)',
      subtext: 'Expanding beyond Vice City into keys, wetlands, and gulf towns',
      accent: 'pink',
    },
    {
      icon: Cpu,
      label: 'PROPRIETARY ENGINE',
      value: 'RAGE 9 (Rockstar Advanced Game Engine)',
      subtext: 'Next-generation physics, atmospheric volumetrics & AI systems',
      accent: 'cyan',
    },
    {
      icon: ShieldCheck,
      label: 'PUBLISHER',
      value: 'Rockstar Games / Take-Two Interactive',
      subtext: 'Global multi-territory digital and retail distribution',
      accent: 'orange',
    },
  ];

  return (
    <section id="release-info" className="relative py-20 border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-xs font-mono font-bold tracking-[0.2em] uppercase text-pink-400 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CONFIRMED INTELLIGENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
            Release <span className="gta-gradient-text">Specifications</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Official confirmed technical specifications, studio allocations, and platform deployments authenticated by Rockstar Games.
          </p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group gta-glass gta-glass-hover rounded-3xl p-6 border border-white/10 hover:border-pink-500/40 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-pink-400 group-hover:scale-110 group-hover:bg-pink-500/15 group-hover:border-pink-500/40 transition-all duration-300 mb-5">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-slate-400 block mb-1">
                    {item.label}
                  </span>

                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-pink-300 transition-colors leading-snug">
                    {item.value}
                  </h3>
                </div>

                <p className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 leading-relaxed font-sans">
                  {item.subtext}
                </p>
              </div>
            );
          })}
        </div>

        {/* Official Direct Links Banner */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-[#171025] via-[#101529] to-[#171025] border border-pink-500/20 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
          <div className="space-y-1 text-center lg:text-left">
            <h4 className="text-xl font-black uppercase text-white tracking-tight">
              Direct Rockstar Games Verification Links
            </h4>
            <p className="text-xs text-slate-400">
              Access the official corporate portals to verify announcement logs and press releases directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href={RELEASE_SPECS.newswireUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase text-white bg-pink-500/20 border border-pink-500/40 hover:bg-pink-500 hover:border-pink-500 transition-all duration-200"
            >
              <span>Rockstar Newswire</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={RELEASE_SPECS.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase text-slate-300 bg-white/5 border border-white/10 hover:border-cyan-400 hover:text-white transition-all duration-200"
            >
              <span>Rockstar Games VI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
