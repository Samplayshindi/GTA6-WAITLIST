import React from 'react';
import { ExternalLink, Calendar, Gamepad2, Building2, Globe, Cpu, ShieldCheck, DownloadCloud, HardDrive, PackageCheck } from 'lucide-react';
import { RELEASE_SPECS } from '../config/countdown';

export const ReleaseInformation: React.FC = () => {
  const specs = [
    {
      icon: Calendar,
      label: 'Official Launch Date',
      value: 'November 19, 2026',
      subtext: 'Reconfirmed by Take-Two Interactive in official corporate earnings filings',
    },
    {
      icon: DownloadCloud,
      label: 'Digital Pre-Load Schedule',
      value: 'Tuesday, November 10, 2026',
      subtext: 'PS5: Midnight local time in your respective time zone. Xbox Series X|S: Globally at 12:00 AM GMT.',
    },
    {
      icon: HardDrive,
      label: 'Storage Requirement',
      value: 'Up to 212 GB',
      subtext: 'High-speed NVMe SSD required. Ensure ample space available before pre-loading.',
    },
    {
      icon: PackageCheck,
      label: 'Code-in-Box Retail Copies',
      value: 'Beginning November 12, 2026',
      subtext: 'Physical boxed editions with digital redemption codes available from global retailers',
    },
    {
      icon: Gamepad2,
      label: 'Target Platforms',
      value: 'PlayStation 5 & Xbox Series X|S',
      subtext: 'Engineered strictly for current-generation home console hardware',
    },
    {
      icon: Building2,
      label: 'Development Studio',
      value: 'Rockstar North',
      subtext: 'Led by Rockstar North with collaborative worldwide Rockstar studios',
    },
    {
      icon: ShieldCheck,
      label: 'Publisher & Parent',
      value: 'Rockstar Games / Take-Two',
      subtext: 'Published by Rockstar Games. Parent company: Take-Two Interactive Software, Inc.',
    },
    {
      icon: Globe,
      label: 'Setting & Location',
      value: 'State of Leonida (Vice City)',
      subtext: 'Spanning Vice City, the Keys, wetlands, and diverse subtropical regions',
    },
    {
      icon: Cpu,
      label: 'Proprietary Technology',
      value: 'Rockstar Advanced Game Engine (RAGE)',
      subtext: 'Next-generation physics, volumetric atmospheric lighting, and high-density AI simulations',
    },
  ];

  return (
    <section id="specifications" className="relative py-16 sm:py-20 md:py-28 bg-[#08090D] border-t border-white/10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F15A24]" />
            <span className="text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#F15A24]">
              Official Production Information
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F4F1ED] tracking-tight">
            Production <span className="text-[#FF4FA3]">Specifications</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            Authoritative release milestones, digital pre-loading schedules, storage footprints, and technology specifications authenticated through official studio announcements.
          </p>
        </div>

        {/* Specifications Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {specs.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-2xl bg-[#0B2425]/40 border border-white/10 p-5 sm:p-6 md:p-8 flex flex-col justify-between hover:border-[#F15A24]/40 transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#F15A24]" />
                    <span className="text-[10px] sm:text-xs font-mono font-semibold tracking-wider uppercase text-slate-400">
                      {item.label}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#F4F1ED] tracking-tight leading-snug">
                    {item.value}
                  </h3>
                </div>

                <p className="mt-4 pt-3 sm:pt-4 border-t border-white/10 text-xs text-slate-400 leading-relaxed font-normal">
                  {item.subtext}
                </p>
              </div>
            );
          })}
        </div>

        {/* Official Rockstar Verification Links */}
        <div className="mt-8 sm:mt-12 p-6 sm:p-8 rounded-2xl bg-[#0B2425]/60 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div>
            <h4 className="text-base sm:text-lg font-bold uppercase text-[#F4F1ED] tracking-tight">
              Direct Rockstar Games Verification Links
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Verify all release updates, trailers, and news intelligence directly on official studio channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={RELEASE_SPECS.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-[#F4F1ED] hover:bg-white transition-colors w-full sm:w-auto text-center"
            >
              <span>Rockstar VI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={RELEASE_SPECS.newswireUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#F4F1ED] bg-white/10 hover:bg-white/20 transition-colors w-full sm:w-auto text-center"
            >
              <span>Newswire</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
