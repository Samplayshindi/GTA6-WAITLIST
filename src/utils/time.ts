export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
  isTamperProof?: boolean;
}

/**
 * Authoritative Server Time Synchronization State
 * Defeats browser "Time Machine" extensions and local system clock manipulation
 * by synchronizing with the server clock and calculating monotonic elapsed time
 * using window.performance.now() (which cannot be manipulated by Date extensions).
 */
let serverEpochAnchor: number | null = null;
let monotonicPerfAnchor: number | null = null;
let isSyncing = false;
let syncListeners: Array<() => void> = [];

export function subscribeToTimeSync(cb: () => void): () => void {
  syncListeners.push(cb);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== cb);
  };
}

export async function syncAuthoritativeServerTime(): Promise<number> {
  if (typeof window === 'undefined') {
    return Date.now();
  }

  if (isSyncing) {
    return getTamperProofCurrentTime();
  }

  isSyncing = true;
  try {
    const t0 = performance.now();
    const res = await fetch('/api/time', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      const t1 = performance.now();
      const halfRoundTrip = (t1 - t0) / 2;

      // Anchor server epoch with network latency compensation
      serverEpochAnchor = Number(data.epoch) + halfRoundTrip;
      monotonicPerfAnchor = t1;

      // Notify any active timer listeners that authoritative sync succeeded
      syncListeners.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    }
  } catch {
    // If network fails (e.g., offline), fallback to hardware performance origin
    if (serverEpochAnchor === null) {
      serverEpochAnchor = performance.timeOrigin || Date.now();
      monotonicPerfAnchor = performance.now();
    }
  } finally {
    isSyncing = false;
  }

  return getTamperProofCurrentTime();
}

/**
 * Returns the current time in milliseconds, protected from Date spoofing and time machine extensions.
 * Uses monotonic hardware ticks added to the authoritative server anchor.
 */
export function getTamperProofCurrentTime(): number {
  if (typeof window === 'undefined') {
    return Date.now();
  }

  if (serverEpochAnchor !== null && monotonicPerfAnchor !== null) {
    const elapsedMonotonicMs = performance.now() - monotonicPerfAnchor;
    return Math.floor(serverEpochAnchor + elapsedMonotonicMs);
  }

  // Initial fallback before first async sync finishes:
  // Use performance.timeOrigin + performance.now() which is resistant to window.Date monkey-patches
  if (typeof performance !== 'undefined' && performance.timeOrigin) {
    return Math.floor(performance.timeOrigin + performance.now());
  }

  return Date.now();
}

// Automatically initiate server time synchronization on module load in browser
if (typeof window !== 'undefined') {
  syncAuthoritativeServerTime();

  // Re-synchronize periodically and when tab regains focus or un-minimizes
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      syncAuthoritativeServerTime();
    }
  }, 45 * 1000);

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncAuthoritativeServerTime();
    }
  });

  window.addEventListener('focus', () => {
    syncAuthoritativeServerTime();
  });
}

/**
 * Constructs a local midnight Date (00:00:00.000) for a given calendar date
 * in the visitor's exact local timezone.
 */
export function getLocalMidnightDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

// Global Release: November 19, 2026 at 12:00 AM local time (month 10 = November)
export function getGlobalReleaseLocalDate(): Date {
  return getLocalMidnightDate(2026, 10, 19);
}

// Confirmed Digital Preload on PlayStation 5:
// Tuesday, November 10, 2026 at midnight (00:00:00) local time in visitor's respective time zone
export function getPreloadLocalDate(): Date {
  return getLocalMidnightDate(2026, 10, 10);
}

// Confirmed Digital Preload on Xbox Series X|S:
// Tuesday, November 10, 2026 globally at 12:00 AM GMT (UTC)
export function getPreloadXboxGmtDate(): Date {
  return new Date(Date.UTC(2026, 10, 10, 0, 0, 0, 0));
}

// Code-in-box versions available from retailers beginning November 12, 2026
export function getRetailCodeInBoxDate(): Date {
  return getLocalMidnightDate(2026, 10, 12);
}

// Backward-compatible alias
export const getEstimatedPreloadLocalDate = getPreloadLocalDate;

export const PRELOAD_FILE_SIZE_NOTE = 'Up to 212 GB depending on platform & device';

export function calculateTimeRemainingFromDate(targetDate: Date): TimeRemaining {
  const targetTime = targetDate.getTime();
  const now = getTamperProofCurrentTime();
  const totalMs = targetTime - now;

  if (totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
      isTamperProof: true,
    };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / 1000 / 60) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isComplete: false,
    isTamperProof: true,
  };
}

export function getUserLocalTimezoneName(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).formatToParts(new Date());
      const shortCode = parts.find((p) => p.type === 'timeZoneName')?.value;
      const cleanTz = tz.replace(/_/g, ' ');
      return shortCode && !cleanTz.includes(shortCode) ? `${cleanTz} (${shortCode})` : cleanTz;
    }
  } catch {
    // Graceful fallback
  }
  return 'Local Time';
}

export function formatLocalDateString(d: Date): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

export function formatTabTitle(remaining: TimeRemaining): string {
  if (remaining.isComplete) {
    return 'GTA VI | AVAILABLE NOW';
  }
  return `GTA VI | ${remaining.days}d ${remaining.hours}h ${remaining.minutes}m Left`;
}

export function generateCalendarIcs(title: string, date: Date, description: string): void {
  const endTarget = new Date(date.getTime() + 4 * 60 * 60 * 1000);

  const formatIcsDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rockstar Games GTA VI Countdown//Samar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:gtavi-${date.getTime()}@gtavicountdown.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(date)}`,
    `DTEND:${formatIcsDate(endTarget)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    'LOCATION:Worldwide',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
