export interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export function calculateTimeRemaining(targetDateIso: string): TimeRemaining {
  const targetTime = new Date(targetDateIso).getTime();
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

export function formatTwoDigits(n: number): string {
  return n.toString().padStart(2, '0');
}

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';
  } catch {
    return 'Local Time';
  }
}

export function formatDateInUserTz(dateIso: string): string {
  try {
    const d = new Date(dateIso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return dateIso;
  }
}

export function formatTabTitle(remaining: TimeRemaining): string {
  if (remaining.isComplete) {
    return 'GTA VI | RELEASE DAY';
  }
  return `GTA VI | ${remaining.days}d ${remaining.hours}h ${remaining.minutes}m Left`;
}

export function generateCalendarIcs(title: string, dateIso: string, description: string): void {
  const target = new Date(dateIso);
  const endTarget = new Date(target.getTime() + 4 * 60 * 60 * 1000); // 4 hours later

  const formatIcsDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GTA VI Countdown//Samar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:gtavi-${target.getTime()}@gtavicountdown.com`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(target)}`,
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
