import React, { createContext, useContext, useState } from 'react';

export interface CountryItem {
  code: string;
  name: string;
  flagEmoji: string;
  timeZone: string;
}

export type ColorPalette = 'vice-city' | 'sunset' | 'neon' | 'ocean';

export interface PaletteItem {
  id: ColorPalette;
  name: string;
  primaryHex: string;
  secondaryHex: string;
  tertiaryHex: string;
}

export const PALETTES: PaletteItem[] = [
  { id: 'vice-city', name: 'Vice City Classic', primaryHex: '#FF4FA3', secondaryHex: '#A855F7', tertiaryHex: '#00F5D4' },
  { id: 'sunset', name: 'Leonida Sunset', primaryHex: '#F15A24', secondaryHex: '#FF4FA3', tertiaryHex: '#FFD166' },
  { id: 'neon', name: 'Downtown Neon', primaryHex: '#00F5D4', secondaryHex: '#3B82F6', tertiaryHex: '#A855F7' },
  { id: 'ocean', name: 'Ocean Drive Dusk', primaryHex: '#06B6D4', secondaryHex: '#3B82F6', tertiaryHex: '#EC4899' },
];

export const COUNTRIES: CountryItem[] = [
  { code: 'US', name: 'United States (Eastern)', flagEmoji: '🇺🇸', timeZone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', flagEmoji: '🇬🇧', timeZone: 'Europe/London' },
  { code: 'DE', name: 'Germany', flagEmoji: '🇩🇪', timeZone: 'Europe/Berlin' },
  { code: 'JP', name: 'Japan', flagEmoji: '🇯🇵', timeZone: 'Asia/Tokyo' },
  { code: 'AU', name: 'Australia (Sydney)', flagEmoji: '🇦🇺', timeZone: 'Australia/Sydney' },
  { code: 'BR', name: 'Brazil', flagEmoji: '🇧🇷', timeZone: 'America/Sao_Paulo' },
  { code: 'CA', name: 'Canada', flagEmoji: '🇨🇦', timeZone: 'America/Toronto' },
];

interface SettingsContextType {
  selectedCountry: CountryItem;
  effectiveTimeZone: string;
  selectedPalette: PaletteItem;
  colorPalette: ColorPalette;
  activePalette: PaletteItem;
  isSlideshowPaused: boolean;
  mobileSlideshowEnabled: boolean;
  motionMode: 'high' | 'low';
  performanceMode: boolean;
  isSettingsOpen: boolean;
  isCountryModalOpen: boolean;
  isResourceInstallerOpen: boolean;
  setSelectedCountry: (c: CountryItem) => void;
  setSelectedPalette: (p: PaletteItem) => void;
  setColorPalette: (cp: ColorPalette) => void;
  setSlideshowPaused: (p: boolean) => void;
  setMobileSlideshowEnabled: (e: boolean) => void;
  setMotionMode: (m: 'high' | 'low') => void;
  setPerformanceMode: (p: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  openCountryModal: () => void;
  closeCountryModal: () => void;
  openResourceInstaller: () => void;
  closeResourceInstaller: () => void;
  resetPreferences: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES[0]);
  const [selectedPalette, setSelectedPalette] = useState<PaletteItem>(PALETTES[0]);
  const [isSlideshowPaused, setSlideshowPaused] = useState<boolean>(false);
  const [mobileSlideshowEnabled, setMobileSlideshowEnabled] = useState<boolean>(false);
  const [motionMode, setMotionMode] = useState<'high' | 'low'>('high');
  const [performanceMode, setPerformanceMode] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState<boolean>(false);
  const [isResourceInstallerOpen, setIsResourceInstallerOpen] = useState<boolean>(false);

  const setColorPalette = (id: ColorPalette) => {
    const found = PALETTES.find((p) => p.id === id);
    if (found) setSelectedPalette(found);
  };

  const resetPreferences = () => {
    setSelectedCountry(COUNTRIES[0]);
    setSelectedPalette(PALETTES[0]);
    setSlideshowPaused(false);
    setMobileSlideshowEnabled(false);
    setMotionMode('high');
    setPerformanceMode(false);
  };

  return (
    <SettingsContext.Provider
      value={{
        selectedCountry,
        effectiveTimeZone: selectedCountry.timeZone,
        selectedPalette,
        colorPalette: selectedPalette.id,
        activePalette: selectedPalette,
        isSlideshowPaused,
        mobileSlideshowEnabled,
        motionMode,
        performanceMode,
        isSettingsOpen,
        isCountryModalOpen,
        isResourceInstallerOpen,
        setSelectedCountry,
        setSelectedPalette,
        setColorPalette,
        setSlideshowPaused,
        setMobileSlideshowEnabled,
        setMotionMode,
        setPerformanceMode,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
        openCountryModal: () => setIsCountryModalOpen(true),
        closeCountryModal: () => setIsCountryModalOpen(false),
        openResourceInstaller: () => setIsResourceInstallerOpen(true),
        closeResourceInstaller: () => setIsResourceInstallerOpen(false),
        resetPreferences,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
