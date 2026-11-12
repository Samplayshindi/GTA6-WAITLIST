import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    { q: 'When is Grand Theft Auto VI scheduled to release?', a: 'Grand Theft Auto VI is scheduled to launch globally in November 2026.' },
    { q: 'Which platforms will GTA VI be available on at launch?', a: 'GTA VI will be available on PlayStation 5 and Xbox Series X|S at launch.' },
    { q: 'Will there be digital pre-loading available?', a: 'Yes, digital pre-loading will begin approximately 48 hours prior to local midnight release.' },
    { q: 'Where does GTA VI take place?', a: 'The game is set in the state of Leonida, encompassing Vice City and surrounding regions.' },
    { q: 'What is the required storage space?', a: 'Approximately 212 GB of high-speed NVMe storage is required.' },
  ];

  return (
    <section id="faq" className="relative py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Knowledgebase &amp; FAQs
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight mb-8">
        Frequently Asked Questions
      </h2>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="rounded-2xl bg-[#090C10] border border-white/10 overflow-hidden">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
