import { COLOR_PALETTE } from './types';
import type { ColorDef, DayKey, ScheduledActivity, WeekSchedule } from './types';

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${remainingMinutes} min`;
}

export function minutesToTimeString(totalMinutes: number): string {
  const normalized = Math.max(0, totalMinutes % 1440);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function getColorDef(colorId: string): ColorDef {
  const found = COLOR_PALETTE.find((c) => c.id === colorId);
  return found || COLOR_PALETTE[0];
}

export function calculateTotalDayDuration(items: { duration: number }[]): number {
  return items.reduce((acc, curr) => acc + (curr.duration || 0), 0);
}

export function calculateTotalWeekDuration(schedule: WeekSchedule): number {
  let total = 0;
  for (const day of Object.keys(schedule) as DayKey[]) {
    total += calculateTotalDayDuration(schedule[day] || []);
  }
  return total;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Resolves overlapping activities in a day by displacing colliding activities forward.
 * If movedInstanceId is provided, it retains its desired start time while colliding items are pushed.
 */
export function resolveCollisions(
  activities: ScheduledActivity[],
  movedInstanceId?: string,
  minSnap = 15
): ScheduledActivity[] {
  if (activities.length <= 1) return activities;

  // Snap all start times and durations to multiples of minSnap
  const snapped = activities.map((act) => ({
    ...act,
    startMinute: Math.round(act.startMinute / minSnap) * minSnap,
    duration: Math.max(minSnap, Math.round(act.duration / minSnap) * minSnap),
  }));

  // Sort by startMinute. If tied, the one that was actively moved takes precedence.
  snapped.sort((a, b) => {
    if (a.startMinute === b.startMinute) {
      if (a.instanceId === movedInstanceId) return -1;
      if (b.instanceId === movedInstanceId) return 1;
      return 0;
    }
    return a.startMinute - b.startMinute;
  });

  // Cascade forward: each subsequent activity cannot start before previous ends
  for (let i = 1; i < snapped.length; i++) {
    const prev = snapped[i - 1];
    const prevEnd = prev.startMinute + prev.duration;
    if (snapped[i].startMinute < prevEnd) {
      snapped[i].startMinute = prevEnd;
    }
  }

  return snapped;
}

/**
 * Finds the first free slot with at least durationMinutes starting from startHour.
 */
export function findNextAvailableSlot(
  activities: ScheduledActivity[],
  startHour = 7,
  durationMinutes = 45,
  minSnap = 15
): number {
  let probe = startHour * 60;
  const sorted = [...activities].sort((a, b) => a.startMinute - b.startMinute);

  for (const act of sorted) {
    if (probe + durationMinutes <= act.startMinute) {
      return probe;
    }
    probe = Math.max(probe, act.startMinute + act.duration);
    probe = Math.ceil(probe / minSnap) * minSnap;
  }

  return probe;
}
