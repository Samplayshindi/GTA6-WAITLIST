import React, { createContext, useContext, useSyncExternalStore } from 'react';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface LaunchStateSnapshot {
  launchState: 'countdown' | 'released';
  releaseRemaining: TimeRemaining;
}

const GLOBAL_RELEASE_DATE = new Date('2026-11-19T00:00:00Z');

function calculateRemaining(): LaunchStateSnapshot {
  const now = new Date();
  const diff = GLOBAL_RELEASE_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      launchState: 'released',
      releaseRemaining: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    launchState: 'countdown',
    releaseRemaining: { days, hours, minutes, seconds },
  };
}

let currentSnapshot: LaunchStateSnapshot = calculateRemaining();
const listeners = new Set<() => void>();
let timerId: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1 && !timerId) {
    timerId = setInterval(() => {
      const next = calculateRemaining();
      if (
        next.releaseRemaining.seconds !== currentSnapshot.releaseRemaining.seconds ||
        next.launchState !== currentSnapshot.launchState
      ) {
        currentSnapshot = next;
        listeners.forEach((l) => l());
      }
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };
}

function getSnapshot(): LaunchStateSnapshot {
  return currentSnapshot;
}

const LaunchStateContext = createContext<LaunchStateSnapshot | undefined>(undefined);

export const LaunchStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <LaunchStateContext.Provider value={currentSnapshot}>{children}</LaunchStateContext.Provider>;
};

export const useLaunchState = (): LaunchStateSnapshot => {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
