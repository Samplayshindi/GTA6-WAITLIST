export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
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

// Confirmed Preload: November 12, 2026 at 12:00 AM local time everywhere (month 10 = November)
export function getPreloadLocalDate(): Date {
  return getLocalMidnightDate(2026, 10, 12);
}

// Backward-compatible alias
export const getEstimatedPreloadLocalDate = getPreloadLocalDate;

export function calculateTimeRemainingFromDate(targetDate: Date): TimeRemaining {
  const targetTime = targetDate.getTime();
  const now = Date.now();
  const totalMs = targetTime - now;

  if (totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isComplete: true,
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
  };
}

export function getUserLocalTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
  } catch {
    return 'Local Time';
  }
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
    return 'GTA VI | RELEASE DAY';
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
