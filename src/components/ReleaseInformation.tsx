import React from 'react';
import { Cpu, HardDrive, ShieldCheck, Check } from 'lucide-react';

export const ReleaseInformation: React.FC = () => {
  const specs = [
    { title: 'Target Resolution', val: '4K Dynamic (2160p)' },
    { title: 'Target Framerate', val: '60 FPS Performance / 30 FPS Fidelity' },
    { title: 'Storage Requirement', val: '212 GB NVMe SSD' },
    { title: 'Supported Platforms', val: 'PlayStation 5, Xbox Series X|S' },
  ];

  return (
    <section id="specifications" className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="w-4 h-4 text-pink-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400">
          Hardware &amp; Platform Specs
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-8">
        Technical Details &amp; Storage Specs
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {specs.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#090C10] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
                {idx === 2 ? <HardDrive className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{item.title}</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{item.val}</span>
              </div>
            </div>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        ))}
      </div>
    </section>
  );
};
