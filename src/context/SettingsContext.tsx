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
    primaryHex: '#FFFFFF', // White
    secondaryHex: '#94A3B8', // Silver
    tertiaryHex: '#64748B', // Grey
  },
];

interface SettingsContextValue {
  isSlideshowPaused: boolean;
  colorPalette: ColorPalette;
  motionMode: MotionMode;
  performanceMode: boolean;
  activePalette: PaletteDefinition;
  setSlideshowPaused: (paused: boolean) => void;
  toggleSlideshowPaused: () => void;
  setColorPalette: (palette: ColorPalette) => void;
  setMotionMode: (mode: MotionMode) => void;
  setPerformanceMode: (perf: boolean) => void;
  resetPreferences: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  slideshowPaused: 'gtavi_slideshow_paused',
  colorPalette: 'gtavi_color_palette_v2',
  motionMode: 'gtavi_motion_mode',
  performanceMode: 'gtavi_performance_mode',
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

  // 2. Color Palette preference (default: Vice City Neon)
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

  // 3. Motion Mode preference
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

  // 4. Performance Mode preference
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

  const setSlideshowPaused = (paused: boolean) => {
    setIsSlideshowPausedState(paused);
    try {
      localStorage.setItem(STORAGE_KEYS.slideshowPaused, String(paused));
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

  const resetPreferences = () => {
    setIsSlideshowPausedState(false);
    setColorPaletteState('vice-city');
    const defaultMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'low' : 'high';
    setMotionModeState(defaultMotion);
    setPerformanceModeState(false);

    try {
      localStorage.removeItem(STORAGE_KEYS.slideshowPaused);
      localStorage.removeItem(STORAGE_KEYS.colorPalette);
      localStorage.removeItem(STORAGE_KEYS.motionMode);
      localStorage.removeItem(STORAGE_KEYS.performanceMode);
    } catch {
      // ignore
    }
  };

  const activePalette = PALETTES.find((p) => p.id === colorPalette) || PALETTES[0];

  // Apply CSS root variables on colorPalette change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', colorPalette);
    root.style.setProperty('--theme-primary', activePalette.primaryHex);
    root.style.setProperty('--theme-secondary', activePalette.secondaryHex);
    root.style.setProperty('--theme-tertiary', activePalette.tertiaryHex);
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
        colorPalette,
        motionMode,
        performanceMode,
        activePalette,
        setSlideshowPaused,
        toggleSlideshowPaused,
        setColorPalette,
        setMotionMode,
        setPerformanceMode,
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
