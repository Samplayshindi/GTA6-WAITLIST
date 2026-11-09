import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

export interface TimeZoneOption {
  value: string;
  label: string;
}

export const TIME_ZONES: TimeZoneOption[] = [
  { value: 'auto', label: 'Auto System Detected' },
  { value: 'America/New_York', label: 'Eastern Time (ET - Miami/NYC)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time / BST (London)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
];

export const PALETTES: PaletteDefinition[] = [
  {
    id: 'vice-city',
    name: 'Vice City Neon',
    primaryHex: '#FF4FA3', // Pink
    secondaryHex: '#A855F7', // Purple
    tertiaryHex: '#00F5D4', // Cyan
  },
  {
    id: 'sunset',
    name: 'Sunset Boulevard',
    primaryHex: '#F15A24', // Orange
    secondaryHex: '#FF6B6B', // Coral
    tertiaryHex: '#FF4FA3', // Warm Pink
  },
  {
    id: 'ocean',
    name: 'Ocean Drive',
    primaryHex: '#00F5D4', // Turquoise
    secondaryHex: '#0D9488', // Teal
    tertiaryHex: '#3B82F6', // Deep Blue
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primaryHex: '#8B5CF6', // Violet
    secondaryHex: '#6366F1', // Indigo
    tertiaryHex: '#3B82F6', // Electric Blue
  },
  {
    id: 'tropical',
    name: 'Tropical',
    primaryHex: '#84CC16', // Lime
    secondaryHex: '#10B981', // Emerald
    tertiaryHex: '#00F5D4', // Turquoise
  },
  {
    id: 'crimson',
    name: 'Crimson',
    primaryHex: '#EF4444', // Red
    secondaryHex: '#B91C1C', // Burgundy
    tertiaryHex: '#F97316', // Warm Orange
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    primaryHex: '#CBD5E1', // High-contrast silver accent (prevents white-on-white text bug)
    secondaryHex: '#94A3B8', // Silver
    tertiaryHex: '#64748B', // Slate grey
  },
];

interface SettingsContextValue {
  isSlideshowPaused: boolean;
  mobileSlideshowEnabled: boolean;
  colorPalette: ColorPalette;
  motionMode: MotionMode;
  performanceMode: boolean;
  selectedTimeZone: string;
  effectiveTimeZone: string;
  isResourceInstallerOpen: boolean;
  activePalette: PaletteDefinition;
  setSlideshowPaused: (paused: boolean) => void;
  setMobileSlideshowEnabled: (enabled: boolean) => void;
  toggleSlideshowPaused: () => void;
  setColorPalette: (palette: ColorPalette) => void;
  setMotionMode: (mode: MotionMode) => void;
  setPerformanceMode: (perf: boolean) => void;
  setSelectedTimeZone: (tz: string) => void;
  openResourceInstaller: () => void;
  closeResourceInstaller: () => void;
  resetPreferences: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  slideshowPaused: 'gtavi_slideshow_paused',
  mobileSlideshowEnabled: 'gtavi_mobile_slideshow_enabled',
  colorPalette: 'gtavi_color_palette_v2',
  motionMode: 'gtavi_motion_mode',
  performanceMode: 'gtavi_performance_mode',
  selectedTimeZone: 'gtavi_selected_timezone',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Background Slideshow Paused preference
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

  // 2. Mobile Background Slideshow Enabled preference (OFF by default)
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

  // 3. Color Palette preference (default: Vice City Neon)
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

  // 6. Time Zone preference (default: 'auto')
  const [selectedTimeZone, setSelectedTimeZoneState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(STORAGE_KEYS.selectedTimeZone) || 'auto';
      } catch {
        return 'auto';
      }
    }
    return 'auto';
  });

  // 7. Resource Installer Modal state
  const [isResourceInstallerOpen, setIsResourceInstallerOpen] = useState<boolean>(false);

  const setSlideshowPaused = (paused: boolean) => {
    setIsSlideshowPausedState(paused);
    try {
      localStorage.setItem(STORAGE_KEYS.slideshowPaused, String(paused));
    } catch {
      // ignore
    }
  };

  const setMobileSlideshowEnabled = (enabled: boolean) => {
    setMobileSlideshowEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.mobileSlideshowEnabled, String(enabled));
    } catch {
      // ignore
    }
  };

  const toggleSlideshowPaused = () => {
    setSlideshowPaused(!isSlideshowPaused);
  };

  const setColorPalette = (palette: ColorPalette) => {
    setColorPaletteState(palette);
    try {
      localStorage.setItem(STORAGE_KEYS.colorPalette, palette);
    } catch {
      // ignore
    }
  };

  const setMotionMode = (mode: MotionMode) => {
    setMotionModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.motionMode, mode);
    } catch {
      // ignore
    }
  };

  const setPerformanceMode = (perf: boolean) => {
    setPerformanceModeState(perf);
    try {
      localStorage.setItem(STORAGE_KEYS.performanceMode, String(perf));
    } catch {
      // ignore
    }
  };

  const setSelectedTimeZone = (tz: string) => {
    setSelectedTimeZoneState(tz);
    try {
      localStorage.setItem(STORAGE_KEYS.selectedTimeZone, tz);
    } catch {
      // ignore
    }
  };

  const openResourceInstaller = () => setIsResourceInstallerOpen(true);
  const closeResourceInstaller = () => setIsResourceInstallerOpen(false);

  const resetPreferences = () => {
    setIsSlideshowPausedState(false);
    setMobileSlideshowEnabledState(false);
    setColorPaletteState('vice-city');
    const defaultMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'low' : 'high';
    setMotionModeState(defaultMotion);
    setPerformanceModeState(false);
    setSelectedTimeZoneState('auto');

    try {
      localStorage.removeItem(STORAGE_KEYS.slideshowPaused);
      localStorage.removeItem(STORAGE_KEYS.mobileSlideshowEnabled);
      localStorage.removeItem(STORAGE_KEYS.colorPalette);
      localStorage.removeItem(STORAGE_KEYS.motionMode);
      localStorage.removeItem(STORAGE_KEYS.performanceMode);
      localStorage.removeItem(STORAGE_KEYS.selectedTimeZone);
    } catch {
      // ignore
    }
  };

  const activePalette = PALETTES.find((p) => p.id === colorPalette) || PALETTES[0];

  const effectiveTimeZone = React.useMemo(() => {
    if (selectedTimeZone !== 'auto') return selectedTimeZone;
    if (typeof window !== 'undefined') {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
      } catch {
        return 'America/New_York';
      }
    }
    return 'America/New_York';
  }, [selectedTimeZone]);

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
        selectedTimeZone,
        effectiveTimeZone,
        isResourceInstallerOpen,
        activePalette,
        setSlideshowPaused,
        setMobileSlideshowEnabled,
        toggleSlideshowPaused,
        setColorPalette,
        setMotionMode,
        setPerformanceMode,
        setSelectedTimeZone,
        openResourceInstaller,
        closeResourceInstaller,
        resetPreferences,
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

