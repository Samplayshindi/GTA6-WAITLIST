import React from 'react';
import { Calendar } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const milestones = [
    { year: '2023', title: 'Trailer 1 Debut', desc: 'First official trailer revealed globally.' },
    { year: '2024', title: 'Take-Two Confirmation', desc: 'Fall 2025/2026 launch window reconfirmed.' },
    { year: '2025', title: 'Pre-Orders & Key Art', desc: 'Character dossiers and pre-order dates revealed.' },
    { year: '2026', title: 'Global Launch Window', desc: 'Target release across PS5 & Xbox Series X|S.' },
  ];

  return (
    <section id="timeline" className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
          Chronological Development
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-8">
        Development Timeline
      </h2>

      <div className="space-y-4">
        {milestones.map((m, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#090C10] border border-white/10 flex items-start gap-4">
            <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-bold text-xs uppercase border border-purple-500/40 shrink-0">
              {m.year}
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">{m.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
