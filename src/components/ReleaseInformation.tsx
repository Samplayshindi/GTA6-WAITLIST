import React from 'react';
import { ExternalLink, Calendar, Gamepad2, Building2, Globe, Cpu, ShieldCheck, DownloadCloud } from 'lucide-react';
import { RELEASE_SPECS } from '../config/countdown';

export const ReleaseInformation: React.FC = () => {
  const specs = [
    {
      icon: Calendar,
      label: 'Official Launch Date',
      value: 'November 19, 2026',
      subtext: 'Reconfirmed by Take-Two Interactive in official earnings filings',
    },
    {
      icon: DownloadCloud,
      label: 'Estimated Preload Window',
      value: 'November 12, 2026 (12:00 AM Local)',
      subtext: 'Expected digital preload unlock window prior to global launch',
    },
    {
      icon: Gamepad2,
      label: 'Target Platforms',
      value: 'PlayStation 5 & Xbox Series X|S',
      subtext: 'Built exclusively for current-generation console hardware',
    },
    {
      icon: Building2,
      label: 'Development Studio',
      value: 'Rockstar North',
      subtext: 'Led by Rockstar North with collaborative worldwide studios',
    },
    {
      icon: ShieldCheck,
      label: 'Publisher',
      value: 'Rockstar Games',
      subtext: 'Parent company: Take-Two Interactive Software, Inc.',
    },
    {
      icon: Globe,
      label: 'Setting & Location',
      value: 'State of Leonida (Vice City)',
      subtext: 'Featuring Vice City, the Gator Keys, and surrounding Florida-inspired biomes',
    },
    {
      icon: Cpu,
      label: 'Proprietary Technology',
      value: 'Rockstar Advanced Game Engine (RAGE)',
      subtext: 'Next-generation physics, volumetric lighting, and dense crowd simulations',
    },
  ];

  return (
    <section id="specifications" className="relative py-28 bg-[#08090D] border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F15A24]" />
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#F15A24]">
              Official Production Information
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
            Additional <span className="text-[#FF4FA3]">Details</span>
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Authoritative production details authenticated through Rockstar Games announcements and Take-Two Interactive investor disclosures.
          </p>
        </div>

        {/* Specifications Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#0B2425]/40 border border-white/10 p-8 flex flex-col justify-between hover:border-[#F15A24]/40 transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-5 h-5 text-[#F15A24]" />
                    <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400">
                      {item.label}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#F4F1ED] tracking-tight leading-snug">
                    {item.value}
                  </h3>
                </div>

                <p className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400 leading-relaxed font-normal">
                  {item.subtext}
                </p>
              </div>
            );
          })}
        </div>

        {/* Official Rockstar Verification Links */}
        <div className="mt-12 p-8 rounded-2xl bg-[#0B2425]/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h4 className="text-lg font-bold uppercase text-[#F4F1ED] tracking-tight">
              Direct Rockstar Games Verification Links
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Verify all release updates and official trailers directly from the official developer portals.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <a
              href={RELEASE_SPECS.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-[#F4F1ED] hover:bg-white transition-colors"
            >
              <span>Rockstar VI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={RELEASE_SPECS.newswireUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#F4F1ED] bg-[#0B2425] border border-[#F15A24]/30 hover:border-[#F15A24] transition-colors"
            >
              <span>Newswire</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F15A24]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
