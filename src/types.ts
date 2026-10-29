export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface ColorDef {
  id: string;
  name: string;
  bgSolid: string; // Tailwind background or hex
  hex: string;
  accent: string;
  textSolid: string; // High contrast text color
  badgeBg: string;
}

export interface ActivityTemplate {
  id: string;
  title: string;
  defaultDuration: number; // in minutes (multiple of 15)
  colorId: string;
}

export interface ScheduledActivity {
  instanceId: string;
  activityId?: string;
  title: string;
  description?: string;
  startMinute: number; // Minutes from 00:00 (e.g. 420 = 07:00)
  duration: number; // Minutes (multiple of 15, min 15)
  colorId: string;
  completed?: boolean;
}

export type WeekSchedule = Record<DayKey, ScheduledActivity[]>;

export interface DayInfo {
  key: DayKey;
  label: string;
  shortLabel: string;
}

export interface AppSettings {
  startHour: number; // e.g. 7 for 07:00
  endHour: number; // e.g. 23 for 23:00
}

export const DEFAULT_SETTINGS: AppSettings = {
  startHour: 7,
  endHour: 23,
};

export const DAYS_OF_WEEK: DayInfo[] = [
  { key: 'mon', label: 'Lunes', shortLabel: 'Lun' },
  { key: 'tue', label: 'Martes', shortLabel: 'Mar' },
  { key: 'wed', label: 'Miércoles', shortLabel: 'Mié' },
  { key: 'thu', label: 'Jueves', shortLabel: 'Jue' },
  { key: 'fri', label: 'Viernes', shortLabel: 'Vie' },
  { key: 'sat', label: 'Sábado', shortLabel: 'Sáb' },
  { key: 'sun', label: 'Domingo', shortLabel: 'Dom' },
];

export const COLOR_PALETTE: ColorDef[] = [
  {
    id: 'orange',
    name: 'Naranja',
    bgSolid: '#ea580c',
    hex: '#ea580c',
    accent: '#ea580c',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'blue',
    name: 'Azul',
    bgSolid: '#2563eb',
    hex: '#2563eb',
    accent: '#2563eb',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'purple',
    name: 'Morado',
    bgSolid: '#9333ea',
    hex: '#9333ea',
    accent: '#9333ea',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'emerald',
    name: 'Verde',
    bgSolid: '#059669',
    hex: '#059669',
    accent: '#059669',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'amber',
    name: 'Ámbar',
    bgSolid: '#d97706',
    hex: '#d97706',
    accent: '#d97706',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'cyan',
    name: 'Cian',
    bgSolid: '#0891b2',
    hex: '#0891b2',
    accent: '#0891b2',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'rose',
    name: 'Rosa',
    bgSolid: '#e11d48',
    hex: '#e11d48',
    accent: '#e11d48',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'indigo',
    name: 'Índigo',
    bgSolid: '#4f46e5',
    hex: '#4f46e5',
    accent: '#4f46e5',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'teal',
    name: 'Turquesa',
    bgSolid: '#0d9488',
    hex: '#0d9488',
    accent: '#0d9488',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
  {
    id: 'slate',
    name: 'Gris Pizarra',
    bgSolid: '#475569',
    hex: '#475569',
    accent: '#475569',
    textSolid: '#ffffff',
    badgeBg: 'rgba(255,255,255,0.22)',
  },
];
