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
      setReleaseRemaining((prev) =>
        prev.isComplete && rel.isComplete && prev.totalMs === 0 && rel.totalMs === 0 ? prev : rel
      );
      setPreloadRemaining((prev) =>
        prev.isComplete && pre.isComplete && prev.totalMs === 0 && pre.totalMs === 0 ? prev : pre
      );

      // Dynamic browser tab title (only write to DOM when text actually changes)
      let nextTitle: string;
      if (launchState === 'RELEASE_LIVE') {
        nextTitle = 'GTA VI | AVAILABLE NOW WORLDWIDE';
      } else if (launchState === 'PRELOAD_LIVE') {
        nextTitle = `GTA VI | PRE-LOAD LIVE · ${rel.days}d ${rel.hours}h Left`;
      } else {
        nextTitle = formatTabTitle(rel);
      }
      if (document.title !== nextTitle) {
        document.title = nextTitle;
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

  const contextValue = useMemo<LaunchStateContextValue>(
    () => ({
      launchState,
      releaseRemaining,
      preloadRemaining,
      isPreloadLive: launchState === 'PRELOAD_LIVE' || launchState === 'RELEASE_LIVE',
      isReleaseLive: launchState === 'RELEASE_LIVE',
      selectedConsole,
      setSelectedConsole,
    }),
    [launchState, releaseRemaining, preloadRemaining, selectedConsole]
  );

  return (
    <LaunchStateContext.Provider value={contextValue}>
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
