import prisma from '../db';
import { parseISO } from 'date-fns';
import { formatInTimeZone, toDate } from 'date-fns-tz';

export async function getSettings() {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        timezone: 'America/Chicago',
      },
    });
  }
  return settings;
}

// Convert a date string from any timezone to UTC for storage
export async function convertToUTC(dateStr: string | Date) {
  const settings = await getSettings();
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return toDate(date, { timeZone: settings.timezone });
}

// Format a UTC date to the server's timezone
export async function formatLocalTime(date: Date) {
  const settings = await getSettings();
  return formatInTimeZone(date, settings.timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
}

// Convert a UTC date to any timezone
export function convertUTCToTimezone(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
}
