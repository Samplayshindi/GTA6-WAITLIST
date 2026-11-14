import React, { useState, useMemo } from 'react';
import { Search, X, Globe, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import {
  COUNTRIES_DATA,
  REGION_GROUPS,
  CountryEntry,
  RegionOption,
} from '../data/countriesData';
import { useSettings } from '../context/SettingsContext';

interface CountrySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedCountryCode,
    selectedRegionId,
    setCountryAndRegion,
  } = useSettings();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeMultiCountry, setActiveMultiCountry] = useState<CountryEntry | null>(null);

  const selectedCountry = useMemo(
    () => COUNTRIES_DATA.find((c) => c.code === selectedCountryCode) || COUNTRIES_DATA[0],
    [selectedCountryCode]
  );

  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return COUNTRIES_DATA;
    const term = searchTerm.toLowerCase();
    return COUNTRIES_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.regionGroup.toLowerCase().includes(term) ||
        (c.regions && c.regions.some((r) => r.name.toLowerCase().includes(term)))
    );
  }, [searchTerm]);

  const handleSelectCountry = (country: CountryEntry) => {
    if (country.multiZone && country.regions && country.regions.length > 0) {
      setActiveMultiCountry(country);
    } else {
      setCountryAndRegion(country.code, country.defaultIana);
      onClose();
    }
  };

  const handleSelectRegion = (countryCode: string, iana: string) => {
    setCountryAndRegion(countryCode, iana);
    setActiveMultiCountry(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select Country & Region Time Zone"
      onClick={onClose}
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#08090D] border border-[#24262B] text-slate-100 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#24262B] flex items-center justify-between bg-[#08090D] shrink-0">
          <div className="flex items-center gap-3">
            {activeMultiCountry ? (
              <button
                onClick={() => setActiveMultiCountry(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer mr-1"
                title="Back to country list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {activeMultiCountry ? (
                  <span>
                    {activeMultiCountry.flagEmoji} Select {activeMultiCountry.name} Region
                  </span>
                ) : (
                  <span>Select Launch Location / Country</span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {activeMultiCountry
                  ? 'Choose your specific time zone region'
                  : 'Updates the Global Release countdown to your local midnight release'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar (Only shown on primary country view) */}
        {!activeMultiCountry && (
          <div className="p-3 sm:p-4 border-b border-[#24262B] bg-[#0C0D12] shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search country or region (e.g. United States, Japan, UK)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121318] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-6 flex-1">
          {activeMultiCountry ? (
            /* Multi-Zone Region Selection View */
            <div className="space-y-2">
              <p className="text-xs font-mono text-cyan-400 mb-3 px-1">
                {activeMultiCountry.name} has multiple time zones. Select your location:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {activeMultiCountry.regions?.map((reg: RegionOption) => {
                  const isSelected =
                    selectedCountryCode === activeMultiCountry.code && selectedRegionId === reg.id;
                  return (
                    <button
                      key={reg.id}
                      onClick={() => handleSelectRegion(activeMultiCountry.code, reg.id)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md'
                          : 'bg-[#121318] border-white/5 hover:border-white/20 text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{reg.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-cyan-300">
                            {reg.abbr}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">{reg.id}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Regional Groups Country List View */
            REGION_GROUPS.map((group) => {
              const groupCountries = filteredCountries.filter((c) => c.regionGroup === group);
              if (groupCountries.length === 0) return null;

              return (
                <div key={group} className="space-y-2">
                  <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400/90 px-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{group}</span>
                    <span className="text-[10px] text-slate-500">({groupCountries.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupCountries.map((country) => {
                      const isSelected = selectedCountryCode === country.code;
                      return (
                        <button
                          key={country.code}
                          onClick={() => handleSelectCountry(country)}
                          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer group ${
                            isSelected
                              ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md'
                              : 'bg-[#121318] border-white/5 hover:border-white/20 text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl shrink-0">{country.flagEmoji}</span>
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-bold text-white truncate">
                                {country.name}
                              </h5>
                              <p className="text-[10px] font-mono text-slate-400 truncate">
                                {country.multiZone
                                  ? `${country.regions?.length} Time Zones`
                                  : country.defaultIana.split('/')[1]?.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {country.multiZone ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 group-hover:text-cyan-300 flex items-center gap-1">
                                Select <ChevronRight className="w-3 h-3" />
                              </span>
                            ) : isSelected ? (
                              <Check className="w-4 h-4 text-cyan-400" />
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-[#24262B] bg-[#0C0D12] flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span>Currently Selected:</span>
            <span className="text-white font-bold truncate">
              {selectedCountry.flagEmoji} {selectedCountry.name} ({selectedRegionId})
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer shrink-0 ml-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
