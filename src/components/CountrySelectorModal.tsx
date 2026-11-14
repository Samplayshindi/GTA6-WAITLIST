import React, { useState, useMemo, useCallback, useEffect, useRef, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
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

interface IndexedCountry {
  country: CountryEntry;
  searchText: string;
  subtitle: string;
}

interface GroupedCountrySection {
  group: string;
  items: IndexedCountry[];
}

// Precompute static lookup maps, search strings, subtitles, and default grouped sections once at module load
const COUNTRY_BY_CODE = new Map<string, CountryEntry>(
  COUNTRIES_DATA.map((c) => [c.code, c])
);

const INDEXED_COUNTRIES: IndexedCountry[] = COUNTRIES_DATA.map((country) => {
  const regionSearch = country.regions
    ? country.regions.map((r) => `${r.name} ${r.abbr} ${r.id}`).join(' ')
    : '';
  const cityPart = country.defaultIana.split('/')[1]?.replace(/_/g, ' ') || country.defaultIana;
  const subtitle = country.multiZone
    ? `${country.regions?.length ?? 0} Time Zones`
    : cityPart;

  return {
    country,
    subtitle,
    searchText: `${country.name} ${country.code} ${country.regionGroup} ${cityPart} ${regionSearch}`.toLowerCase(),
  };
});

const PRECOMPUTED_GROUPS: GroupedCountrySection[] = REGION_GROUPS.map((group) => ({
  group,
  items: INDEXED_COUNTRIES.filter((item) => item.country.regionGroup === group),
})).filter((section) => section.items.length > 0);

const CountryCard = React.memo<{
  item: IndexedCountry;
  isSelected: boolean;
  onSelect: (country: CountryEntry) => void;
}>(({ item, isSelected, onSelect }) => {
  const { country, subtitle } = item;
  return (
    <button
      type="button"
      onClick={() => onSelect(country)}
      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer group ${
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
            {subtitle}
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
});

CountryCard.displayName = 'CountryCard';

const RegionOptionCard = React.memo<{
  region: RegionOption;
  countryCode: string;
  isSelected: boolean;
  onSelect: (countryCode: string, iana: string) => void;
}>(({ region, countryCode, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(countryCode, region.id)}
    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
      isSelected
        ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md'
        : 'bg-[#121318] border-white/5 hover:border-white/20 text-slate-200 hover:bg-white/5'
    }`}
  >
    <div className="space-y-0.5">
      <div className="text-sm font-bold text-white flex items-center gap-2">
        <span>{region.name}</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-cyan-300">
          {region.abbr}
        </span>
      </div>
      <p className="text-[11px] font-mono text-slate-400">{region.id}</p>
    </div>
    {isSelected && <Check className="w-5 h-5 text-cyan-400 shrink-0" />}
  </button>
));

RegionOptionCard.displayName = 'RegionOptionCard';

export const CountrySelectorModal: React.FC<CountrySelectorModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedCountryCode,
    selectedRegionId,
    setCountryAndRegion,
  } = useSettings();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [activeMultiCountry, setActiveMultiCountry] = useState<CountryEntry | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCountry = useMemo(
    () => COUNTRY_BY_CODE.get(selectedCountryCode) || COUNTRIES_DATA[0],
    [selectedCountryCode]
  );

  // Reset local transient state on open/close and manage scroll lock & Escape cleanly
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setActiveMultiCountry(null);
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (activeMultiCountry) {
          setActiveMultiCountry(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    // Focus search input gently on desktop without triggering mobile virtual keyboard layout jumps
    const rafId = window.requestAnimationFrame(() => {
      if (window.innerWidth >= 768 && searchInputRef.current) {
        searchInputRef.current.focus({ preventScroll: true });
      }
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
      window.cancelAnimationFrame(rafId);
    };
  }, [isOpen, activeMultiCountry, onClose]);

  const groupedSections = useMemo(() => {
    const trimmed = deferredSearchTerm.trim().toLowerCase();
    if (!trimmed) return PRECOMPUTED_GROUPS;

    const results: GroupedCountrySection[] = [];
    for (let i = 0; i < PRECOMPUTED_GROUPS.length; i++) {
      const section = PRECOMPUTED_GROUPS[i];
      const matchedItems = section.items.filter((item) => item.searchText.includes(trimmed));
      if (matchedItems.length > 0) {
        results.push({ group: section.group, items: matchedItems });
      }
    }
    return results;
  }, [deferredSearchTerm]);

  const handleSelectCountry = useCallback(
    (country: CountryEntry) => {
      if (country.multiZone && country.regions && country.regions.length > 0) {
        setActiveMultiCountry(country);
      } else {
        setCountryAndRegion(country.code, country.defaultIana);
        onClose();
      }
    },
    [setCountryAndRegion, onClose]
  );

  const handleSelectRegion = useCallback(
    (countryCode: string, iana: string) => {
      setCountryAndRegion(countryCode, iana);
      setActiveMultiCountry(null);
      onClose();
    },
    [setCountryAndRegion, onClose]
  );

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select Country & Region Time Zone"
      onClick={onClose}
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-black/85"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#08090D] border border-[#24262B] text-slate-100 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]"
        style={{ contain: 'layout style' }}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#24262B] flex items-center justify-between bg-[#08090D] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {activeMultiCountry ? (
              <button
                type="button"
                onClick={() => setActiveMultiCountry(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer mr-1"
                title="Back to country list"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 truncate">
                {activeMultiCountry ? (
                  <span>
                    {activeMultiCountry.flagEmoji} Select {activeMultiCountry.name} Region
                  </span>
                ) : (
                  <span>Select Launch Location / Country</span>
                )}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {activeMultiCountry
                  ? 'Choose your specific time zone region'
                  : 'Updates the Global Release countdown to your local midnight release'}
              </p>
            </div>
          </div>

          <button
            type="button"
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
                ref={searchInputRef}
                type="text"
                placeholder="Search country or region (e.g. United States, Japan, UK)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121318] border border-white/10 rounded-xl pl-10 pr-14 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div
          className="p-3 sm:p-5 overflow-y-auto space-y-6 flex-1"
          style={{ contain: 'layout style paint' }}
        >
          {activeMultiCountry ? (
            /* Multi-Zone Region Selection View */
            <div className="space-y-2">
              <p className="text-xs font-mono text-cyan-400 mb-3 px-1">
                {activeMultiCountry.name} has multiple time zones. Select your location:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {activeMultiCountry.regions?.map((reg: RegionOption) => (
                  <RegionOptionCard
                    key={reg.id}
                    region={reg}
                    countryCode={activeMultiCountry.code}
                    isSelected={
                      selectedCountryCode === activeMultiCountry.code &&
                      selectedRegionId === reg.id
                    }
                    onSelect={handleSelectRegion}
                  />
                ))}
              </div>
            </div>
          ) : groupedSections.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-slate-400">
              No countries or regions match &ldquo;{deferredSearchTerm.trim()}&rdquo;.
            </div>
          ) : (
            /* Regional Groups Country List View */
            groupedSections.map(({ group, items }) => (
              <div
                key={group}
                className="space-y-2"
                style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 240px' }}
              >
                <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400/90 px-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{group}</span>
                  <span className="text-[10px] text-slate-500">({items.length})</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <CountryCard
                      key={item.country.code}
                      item={item}
                      isSelected={selectedCountryCode === item.country.code}
                      onSelect={handleSelectCountry}
                    />
                  ))}
                </div>
              </div>
            ))
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
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer shrink-0 ml-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
