import type { ActivityTemplate, WeekSchedule } from './types';

export const DEFAULT_TEMPLATES: ActivityTemplate[] = [
  {
    id: 'gym',
    title: 'Ir al gimnasio',
    defaultDuration: 60,
    colorId: 'orange',
  },
  {
    id: 'job-search',
    title: 'Buscar trabajo',
    defaultDuration: 90,
    colorId: 'blue',
  },
  {
    id: 'research',
    title: 'Investigar un tema',
    defaultDuration: 45,
    colorId: 'purple',
  },
  {
    id: 'sports',
    title: 'Hacer deporte',
    defaultDuration: 45,
    colorId: 'emerald',
  },
  {
    id: 'reading',
    title: 'Leer',
    defaultDuration: 30,
    colorId: 'amber',
  },
  {
    id: 'walk',
    title: 'Dar un paseo',
    defaultDuration: 45,
    colorId: 'cyan',
  },
  {
    id: 'languages',
    title: 'Estudiar idiomas',
    defaultDuration: 30,
    colorId: 'rose',
  },
  {
    id: 'chores',
    title: 'Tareas del hogar',
    defaultDuration: 30,
    colorId: 'slate',
  },
];

// Initial schedule with 15-min snapped times starting at 7:00 AM (420 min)
export const INITIAL_SCHEDULE: WeekSchedule = {
  mon: [
    {
      instanceId: 'demo-1',
      activityId: 'gym',
      title: 'Ir al gimnasio',
      startMinute: 420, // 07:00
      duration: 60,
      colorId: 'orange',
    },
    {
      instanceId: 'demo-2',
      activityId: 'job-search',
      title: 'Buscar trabajo',
      startMinute: 540, // 09:00
      duration: 90,
      colorId: 'blue',
    },
    {
      instanceId: 'demo-3',
      activityId: 'reading',
      title: 'Leer',
      startMinute: 720, // 12:00
      duration: 30,
      colorId: 'amber',
    },
    {
      instanceId: 'demo-3b',
      activityId: 'gym',
      title: 'Ir al gimnasio',
      startMinute: 1140, // 19:00 (segunda sesión del gym!)
      duration: 45,
      colorId: 'orange',
    },
  ],
  tue: [
    {
      instanceId: 'demo-4',
      activityId: 'job-search',
      title: 'Buscar trabajo',
      startMinute: 480, // 08:00
      duration: 90,
      colorId: 'blue',
    },
    {
      instanceId: 'demo-5',
      activityId: 'research',
      title: 'Investigar un tema',
      startMinute: 630, // 10:30
      duration: 45,
      colorId: 'purple',
    },
    {
      instanceId: 'demo-6',
      activityId: 'walk',
      title: 'Dar un paseo',
      startMinute: 1170, // 19:30
      duration: 45,
      colorId: 'cyan',
    },
  ],
  wed: [
    {
      instanceId: 'demo-7',
      activityId: 'gym',
      title: 'Ir al gimnasio',
      startMinute: 450, // 07:30
      duration: 60,
      colorId: 'orange',
    },
    {
      instanceId: 'demo-8',
      activityId: 'research',
      title: 'Investigar un tema',
      startMinute: 600, // 10:00
      duration: 60,
      colorId: 'purple',
    },
  ],
  thu: [],
  fri: [
    {
      instanceId: 'demo-9',
      activityId: 'sports',
      title: 'Hacer deporte',
      startMinute: 480, // 08:00
      duration: 60,
      colorId: 'emerald',
    },
    {
      instanceId: 'demo-10',
      activityId: 'reading',
      title: 'Leer',
      startMinute: 1020, // 17:00
      duration: 45,
      colorId: 'amber',
    },
  ],
  sat: [
    {
      instanceId: 'demo-11',
      activityId: 'walk',
      title: 'Dar un paseo',
      startMinute: 570, // 09:30
      duration: 60,
      colorId: 'cyan',
    },
  ],
  sun: [
    {
      instanceId: 'demo-12',
      activityId: 'reading',
      title: 'Leer',
      startMinute: 660, // 11:00
      duration: 45,
      colorId: 'amber',
    },
  ],
};
