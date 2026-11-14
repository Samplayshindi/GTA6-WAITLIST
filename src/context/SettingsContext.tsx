import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  COUNTRIES_DATA,
  CountryEntry,
  detectUserCountry,
  findCountryByCode,
  findCountryByIana,
} from '../data/countriesData';

export type ColorPalette =
  | 'vice-city'
  | 'sunset'
  | 'ocean'
  | 'midnight'
  | 'tropical'
  | 'crimson'
  | 'monochrome';

export type MotionMode = 'high' | 'low';

export interface PaletteDefinition {
  id: ColorPalette;
  name: string;
  primaryHex: string;
  secondaryHex: string;
  tertiaryHex: string;
}

export const PALETTES: PaletteDefinition[] = [
  {
    id: 'vice-city',
    name: 'Vice City Neon',
    primaryHex: '#FF4FA3',
    secondaryHex: '#A855F7',
    tertiaryHex: '#00F5D4',
  },
  {
    id: 'sunset',
    name: 'Sunset Boulevard',
    primaryHex: '#F15A24',
    secondaryHex: '#FF6B6B',
    tertiaryHex: '#FF4FA3',
  },
  {
    id: 'ocean',
    name: 'Ocean Drive',
    primaryHex: '#00F5D4',
    secondaryHex: '#0D9488',
    tertiaryHex: '#3B82F6',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primaryHex: '#8B5CF6',
    secondaryHex: '#6366F1',
    tertiaryHex: '#3B82F6',
  },
  {
    id: 'tropical',
    name: 'Tropical',
    primaryHex: '#84CC16',
    secondaryHex: '#10B981',
    tertiaryHex: '#00F5D4',
  },
  {
    id: 'crimson',
    name: 'Crimson',
    primaryHex: '#EF4444',
    secondaryHex: '#B91C1C',
    tertiaryHex: '#F97316',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    primaryHex: '#CBD5E1',
    secondaryHex: '#94A3B8',
    tertiaryHex: '#64748B',
  },
];

interface SettingsContextValue {
  isSlideshowPaused: boolean;
  mobileSlideshowEnabled: boolean;
  colorPalette: ColorPalette;
  motionMode: MotionMode;
  performanceMode: boolean;
  selectedCountryCode: string;
  selectedRegionId: string;
  selectedCountry: CountryEntry;
  effectiveTimeZone: string;
  isResourceInstallerOpen: boolean;
  isCountryModalOpen: boolean;
  activePalette: PaletteDefinition;
  setSlideshowPaused: (paused: boolean) => void;
  setMobileSlideshowEnabled: (enabled: boolean) => void;
  toggleSlideshowPaused: () => void;
  setColorPalette: (palette: ColorPalette) => void;
  setMotionMode: (mode: MotionMode) => void;
  setPerformanceMode: (perf: boolean) => void;
  setCountryAndRegion: (countryCode: string, iana: string) => void;
  openResourceInstaller: () => void;
  closeResourceInstaller: () => void;
  openCountryModal: () => void;
  closeCountryModal: () => void;
  resetPreferences: () => void;
  // Backward compatibility
  selectedTimeZone: string;
  setSelectedTimeZone: (tz: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  slideshowPaused: 'gtavi_slideshow_paused',
  mobileSlideshowEnabled: 'gtavi_mobile_slideshow_enabled',
  colorPalette: 'gtavi_color_palette_v2',
  motionMode: 'gtavi_motion_mode',
  performanceMode: 'gtavi_performance_mode',
  selectedCountryCode: 'gtavi_selected_country_code_v19',
  selectedRegionId: 'gtavi_selected_region_id_v19',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Slideshow Paused preference
  const [isSlideshowPaused, setIsSlideshowPausedState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.slideshowPaused) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  // 2. Mobile Background Slideshow Enabled preference
  const [mobileSlideshowEnabled, setMobileSlideshowEnabledState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.mobileSlideshowEnabled) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  // 3. Color Palette preference
  const [colorPalette, setColorPaletteState] = useState<ColorPalette>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.colorPalette) as ColorPalette;
        if (saved && PALETTES.some((p) => p.id === saved)) return saved;
      } catch {
        return 'vice-city';
      }
    }
    return 'vice-city';
  });

  // 4. Motion Mode preference
  const [motionMode, setMotionModeState] = useState<MotionMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.motionMode) as MotionMode;
        if (saved === 'high' || saved === 'low') return saved;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return 'low';
        }
      } catch {
        return 'high';
      }
    }
    return 'high';
  });

  // 5. Performance Mode preference
  const [performanceMode, setPerformanceModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.performanceMode) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  // 6. Country & Region Selection for v1.9.0 Timezone Audit
  const [selectedCountryCode, setSelectedCountryCodeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCode = localStorage.getItem(STORAGE_KEYS.selectedCountryCode);
        if (savedCode && findCountryByCode(savedCode)) return savedCode;
      } catch {}
    }
    return detectUserCountry().country.code;
  });

  const [selectedRegionId, setSelectedRegionIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRegion = localStorage.getItem(STORAGE_KEYS.selectedRegionId);
        if (savedRegion) return savedRegion;
      } catch {}
    }
    return detectUserCountry().iana;
  });

  // 7. Modals
  const [isResourceInstallerOpen, setIsResourceInstallerOpen] = useState<boolean>(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState<boolean>(false);

  const setSlideshowPaused = (paused: boolean) => {
    setIsSlideshowPausedState(paused);
    try {
      localStorage.setItem(STORAGE_KEYS.slideshowPaused, String(paused));
    } catch {}
  };

  const setMobileSlideshowEnabled = (enabled: boolean) => {
    setMobileSlideshowEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.mobileSlideshowEnabled, String(enabled));
    } catch {}
  };

  const toggleSlideshowPaused = () => {
    setSlideshowPaused(!isSlideshowPaused);
  };

  const setColorPalette = (palette: ColorPalette) => {
    setColorPaletteState(palette);
    try {
      localStorage.setItem(STORAGE_KEYS.colorPalette, palette);
    } catch {}
  };

  const setMotionMode = (mode: MotionMode) => {
    setMotionModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.motionMode, mode);
    } catch {}
  };

  const setPerformanceMode = (perf: boolean) => {
    setPerformanceModeState(perf);
    try {
      localStorage.setItem(STORAGE_KEYS.performanceMode, String(perf));
    } catch {}
  };

  const setCountryAndRegion = (countryCode: string, iana: string) => {
    setSelectedCountryCodeState(countryCode);
    setSelectedRegionIdState(iana);
    try {
      localStorage.setItem(STORAGE_KEYS.selectedCountryCode, countryCode);
      localStorage.setItem(STORAGE_KEYS.selectedRegionId, iana);
    } catch {}
  };

  const setSelectedTimeZone = (tz: string) => {
    const found = findCountryByIana(tz);
    if (found) {
      setCountryAndRegion(found.country.code, found.regionId || found.country.defaultIana);
    } else {
      setSelectedRegionIdState(tz);
      try {
        localStorage.setItem(STORAGE_KEYS.selectedRegionId, tz);
      } catch {}
    }
  };

  const openResourceInstaller = () => setIsResourceInstallerOpen(true);
  const closeResourceInstaller = () => setIsResourceInstallerOpen(false);

  const openCountryModal = () => setIsCountryModalOpen(true);
  const closeCountryModal = () => setIsCountryModalOpen(false);

  const resetPreferences = () => {
    setIsSlideshowPausedState(false);
    setMobileSlideshowEnabledState(false);
    setColorPaletteState('vice-city');
    const defaultMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'low'
        : 'high';
    setMotionModeState(defaultMotion);
    setPerformanceModeState(false);

    const detected = detectUserCountry();
    setSelectedCountryCodeState(detected.country.code);
    setSelectedRegionIdState(detected.iana);

    try {
      localStorage.removeItem(STORAGE_KEYS.slideshowPaused);
      localStorage.removeItem(STORAGE_KEYS.mobileSlideshowEnabled);
      localStorage.removeItem(STORAGE_KEYS.colorPalette);
      localStorage.removeItem(STORAGE_KEYS.motionMode);
      localStorage.removeItem(STORAGE_KEYS.performanceMode);
      localStorage.removeItem(STORAGE_KEYS.selectedCountryCode);
      localStorage.removeItem(STORAGE_KEYS.selectedRegionId);
    } catch {}
  };

  const activePalette = PALETTES.find((p) => p.id === colorPalette) || PALETTES[0];

  const selectedCountry = useMemo(
    () => findCountryByCode(selectedCountryCode) || COUNTRIES_DATA[0],
    [selectedCountryCode]
  );

  const effectiveTimeZone = useMemo(() => {
    if (selectedRegionId) return selectedRegionId;
    return selectedCountry.defaultIana;
  }, [selectedRegionId, selectedCountry]);

  // Apply CSS root variables on colorPalette change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', colorPalette);
    root.style.setProperty('--theme-primary', activePalette.primaryHex);
    root.style.setProperty('--theme-secondary', activePalette.secondaryHex);
    root.style.setProperty('--theme-tertiary', activePalette.tertiaryHex);
    root.style.setProperty('--theme-accent', activePalette.primaryHex);
    root.style.setProperty(
      '--theme-gradient',
      `linear-gradient(to right, ${activePalette.primaryHex}, ${activePalette.secondaryHex})`
    );
    root.style.setProperty(
      '--theme-gradient-3',
      `linear-gradient(to right, ${activePalette.primaryHex}, ${activePalette.secondaryHex}, ${activePalette.tertiaryHex})`
    );
  }, [colorPalette, activePalette]);

  return (
    <SettingsContext.Provider
      value={{
        isSlideshowPaused,
        mobileSlideshowEnabled,
        colorPalette,
        motionMode,
        performanceMode,
        selectedCountryCode,
        selectedRegionId,
        selectedCountry,
        effectiveTimeZone,
        isResourceInstallerOpen,
        isCountryModalOpen,
        activePalette,
        setSlideshowPaused,
        setMobileSlideshowEnabled,
        toggleSlideshowPaused,
        setColorPalette,
        setMotionMode,
        setPerformanceMode,
        setCountryAndRegion,
        openResourceInstaller,
        closeResourceInstaller,
        openCountryModal,
        closeCountryModal,
        resetPreferences,
        selectedTimeZone: effectiveTimeZone,
        setSelectedTimeZone,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
