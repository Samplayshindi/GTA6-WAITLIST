import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  calculateTimeRemainingFromDate,
  getGlobalReleaseLocalDate,
  getPreloadLocalDate,
  getPreloadXboxGmtDate,
  formatTabTitle,
  subscribeToTimeSync,
  TimeRemaining,
} from '../utils/time';
import { useSettings } from './SettingsContext';

export type LaunchState = 'BEFORE_PRELOAD' | 'PRELOAD_LIVE' | 'RELEASE_LIVE';

interface LaunchStateContextValue {
  launchState: LaunchState;
  releaseRemaining: TimeRemaining;
  preloadRemaining: TimeRemaining;
  isPreloadLive: boolean;
  isReleaseLive: boolean;
  selectedConsole: 'ps5' | 'xbox';
  setSelectedConsole: (c: 'ps5' | 'xbox') => void;
}

const LaunchStateContext = createContext<LaunchStateContextValue | undefined>(undefined);

export const LaunchStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { effectiveTimeZone } = useSettings();

  const globalReleaseDate = useMemo(() => getGlobalReleaseLocalDate(effectiveTimeZone), [effectiveTimeZone]);
  const ps5PreloadDate = useMemo(() => getPreloadLocalDate(effectiveTimeZone), [effectiveTimeZone]);
  const xboxPreloadDate = useMemo(() => getPreloadXboxGmtDate(), []); // Xbox is fixed 00:00 GMT globally

  const [selectedConsole, setSelectedConsole] = useState<'ps5' | 'xbox'>('ps5');
  const activePreloadDate = selectedConsole === 'ps5' ? ps5PreloadDate : xboxPreloadDate;

  // Real-time Countdown states
  const [releaseRemaining, setReleaseRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemainingFromDate(globalReleaseDate)
  );
  const [preloadRemaining, setPreloadRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemainingFromDate(activePreloadDate)
  );

  // Compute launch state strictly from real timestamps
  const launchState: LaunchState = useMemo(() => {
    if (releaseRemaining.isComplete) {
      return 'RELEASE_LIVE';
    }
    if (preloadRemaining.isComplete) {
      return 'PRELOAD_LIVE';
    }
    return 'BEFORE_PRELOAD';
  }, [releaseRemaining.isComplete, preloadRemaining.isComplete]);

  // Update countdown timers and browser tab title every second
  useEffect(() => {
    const updateCountdown = () => {
      const rel = calculateTimeRemainingFromDate(globalReleaseDate);
      const pre = calculateTimeRemainingFromDate(activePreloadDate);
      setReleaseRemaining(rel);
      setPreloadRemaining(pre);

      // Dynamic browser tab title
      if (launchState === 'RELEASE_LIVE') {
        document.title = 'GTA VI | AVAILABLE NOW WORLDWIDE';
      } else if (launchState === 'PRELOAD_LIVE') {
        document.title = `GTA VI | PRE-LOAD LIVE · ${rel.days}d ${rel.hours}h Left`;
      } else {
        document.title = formatTabTitle(rel);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    const unsubscribe = subscribeToTimeSync(() => {
      updateCountdown();
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [globalReleaseDate, activePreloadDate, launchState]);

  return (
    <LaunchStateContext.Provider
      value={{
        launchState,
        releaseRemaining,
        preloadRemaining,
        isPreloadLive: launchState === 'PRELOAD_LIVE' || launchState === 'RELEASE_LIVE',
        isReleaseLive: launchState === 'RELEASE_LIVE',
        selectedConsole,
        setSelectedConsole,
      }}
    >
      {children}
    </LaunchStateContext.Provider>
  );
};

export function useLaunchState(): LaunchStateContextValue {
  const context = useContext(LaunchStateContext);
  if (!context) {
    throw new Error('useLaunchState must be used within a LaunchStateProvider');
  }
  return context;
}
