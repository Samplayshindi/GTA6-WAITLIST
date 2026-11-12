import React, { useState, useMemo } from 'react';
import { Search, X, Globe, Check } from 'lucide-react';
import { COUNTRIES_DATA } from '../data/countriesData';
import { useSettings } from '../context/SettingsContext';

interface CountrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({ isOpen, onClose }) => {
  const { selectedCountry, setSelectedCountry } = useSettings();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return COUNTRIES_DATA;
    const term = searchTerm.toLowerCase();
    return COUNTRIES_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.regionGroup.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#08090D] border border-[#24262B] text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="px-5 py-4 border-b border-[#24262B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Select Country / Time Zone</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-[#24262B]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white"
            />
          </div>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredCountries.map((c) => {
            const isSelected = selectedCountry?.code === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  setSelectedCountry(c as any);
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold' : 'bg-white/5 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span>{c.flagEmoji}</span>
                  <span>{c.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
