import { subDays, format } from 'date-fns';
import type { DayOfWeek } from './types';

/**
 * Implements the "3 AM rule". If the time is before 3 AM,
 * it's considered to be the previous day.
 * @param date The original date object.
 * @returns A new Date object representing the "functional day".
 */
export function getFunctionalDate(date: Date): Date {
  const newDate = new Date(date);
  if (newDate.getHours() < 3) {
    return subDays(newDate, 1);
  }
  return newDate;
}

/**
 * Converts a Date object to a 'YYYY-MM-DD' string format.
 * @param date The date to format.
 * @returns A string in 'YYYY-MM-DD' format.
 */
export function toYYYYMMDD(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Gets the lowercase English day of the week from a Date object.
 * @param date The date.
 * @returns The day of the week as a DayOfWeek type.
 */
export function getDayOfWeek(date: Date): DayOfWeek {
    // format 'eeee' returns the full day name in lowercase, e.g., 'monday'
    return format(date, 'eeee').toLowerCase() as DayOfWeek;
}
