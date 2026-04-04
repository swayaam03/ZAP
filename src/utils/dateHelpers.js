// FILE: src/utils/dateHelpers.js
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  addMinutes,
  isSameDay,
  isBefore,
  isAfter,
} from "date-fns";

export function getUserTimezone(profile) {
  return (
    profile?.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    "UTC"
  );
}

export function toLocalTime(timestamp) {
  if (!timestamp) return null;
  if (timestamp?.toDate) return timestamp.toDate();
  return parseISO(
    timestamp instanceof Date ? timestamp.toISOString() : timestamp,
  );
}

export function parseDurationToMinutes(timeStr) {
  if (!timeStr) return 30;
  const match = timeStr.match(/(\d+)\s*(min|hour|hours)/i);
  if (!match) return 30;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit === "min") return value;
  if (unit === "hour" || unit === "hours") return value * 60;
  return value;
}

export function formatDateLocal(date) {
  const d = toLocalTime(date);
  if (!d) return "";
  return format(d, "MMM d, yyyy");
}

export function isSameDayLocal(date1, date2) {
  const d1 = toLocalTime(date1);
  const d2 = toLocalTime(date2);
  if (!d1 || !d2) return false;
  return isSameDay(d1, d2);
}
