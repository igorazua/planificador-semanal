import React, { useState, useEffect } from 'react';
import { Calendar, CalendarDays, Tag, Settings, RotateCcw, Check } from 'lucide-react';
import { DAYS_OF_WEEK, DEFAULT_SETTINGS } from './types';
import type { DayKey, ActivityTemplate, WeekSchedule, ScheduledActivity, AppSettings } from './types';
import { DEFAULT_TEMPLATES, INITIAL_SCHEDULE } from './defaultData';
import { DayView } from './components/DayView';
import { WeekView } from './components/WeekView';
import { AddActivityDrawer } from './components/AddActivityDrawer';
import { CopyDayModal } from './components/CopyDayModal';
import { CatalogModal } from './components/CatalogModal';
import { SettingsModal } from './components/SettingsModal';
import { calculateTotalDayDuration, generateId, resolveCollisions } from './utils';

const STORAGE_KEY_TEMPLATES = 'planificador_actividades_templates_v2';
const STORAGE_KEY_SCHEDULE = 'planificador_actividades_schedule_v2';
const STORAGE_KEY_SETTINGS = 'planificador_actividades_settings_v2';

export const App: React.FC = () => {
  // Load settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Load templates from LocalStorage
  const [templates, setTemplates] = useState<ActivityTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading templates', e);
    }
    return DEFAULT_TEMPLATES;
  });

  // Load schedule from LocalStorage
  const [schedule, setSchedule] = useState<WeekSchedule>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading schedule', e);
    }
    return INITIAL_SCHEDULE;
  });

  // Navigation tab: 'day' | 'week'
  const [currentTab, setCurrentTab] = useState<'day' | 'week'>('day');

  // Selected day in Day View
  const [selectedDay, setSelectedDay] = useState<DayKey>(() => {
    const dayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    const map: Record<number, DayKey> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
    return map[dayIndex] || 'mon';
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDay, setAddModalDay] = useState<DayKey>(selectedDay);
  const [suggestedStartMinute, setSuggestedStartMinute] = useState<number | undefined>(undefined);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<DayKey>(selectedDay);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show brief toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }, [settings]);

  // Save templates to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error('Error saving templates', e);
    }
  }, [templates]);

  // Save schedule to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    } catch (e) {
      console.error('Error saving schedule', e);
    }
  }, [schedule]);

  // Handlers for schedule updates
  const handleUpdateActivities = (day: DayKey, newActivities: ScheduledActivity[]) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: newActivities,
    }));
  };

  const handleAddScheduledActivity = (day: DayKey, activity: ScheduledActivity) => {
    setSchedule((prev) => {
      const current = prev[day] || [];
      const updated = resolveCollisions([...current, activity], activity.instanceId);
      return {
        ...prev,
        [day]: updated,
      };
    });
    showToast(`"${activity.title}" añadida`);
  };

  // Copy plan from one day to others
  const handleCopyDay = (fromDay: DayKey, toDays: DayKey[]) => {
    const sourceActivities = schedule[fromDay] || [];
    setSchedule((prev) => {
      const nextSchedule = { ...prev };
      toDays.forEach((targetDay) => {
        nextSchedule[targetDay] = sourceActivities.map((act) => ({
          ...act,
          instanceId: generateId(),
          completed: false,
        }));
      });
      return nextSchedule;
    });

    const fromName = DAYS_OF_WEEK.find((d) => d.key === fromDay)?.label;
    showToast(`Planificación de ${fromName} copiada con éxito`);
  };

  // Template management
  const handleAddTemplate = (tpl: ActivityTemplate) => {
    setTemplates((prev) => [...prev, tpl]);
    showToast(`"${tpl.title}" guardada en el catálogo`);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('¿Quieres restablecer los datos de ejemplo iniciales?')) {
      setTemplates(DEFAULT_TEMPLATES);
      setSchedule(INITIAL_SCHEDULE);
      setSettings(DEFAULT_SETTINGS);
      showToast('Datos de ejemplo restablecidos');
    }
  };

  // Calculate minutes per day for tab badges
  const weekScheduleSummary: Record<DayKey, number> = React.useMemo(() => {
    const summary: Record<DayKey, number> = {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
      sun: 0,
    };
    DAYS_OF_WEEK.forEach((d) => {
      summary[d.key] = calculateTotalDayDuration(schedule[d.key] || []);
    });
    return summary;
  }, [schedule]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16">
      {/* Top Mobile App Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              PS
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Planificador Semanal
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Día desde las {settings.startHour}:00 • Slots de 15 min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-colors"
              title="Configurar hora de inicio del día"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCatalogModalOpen(true)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-colors"
              title="Catálogo de actividades y colores"
            >
              <Tag className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetData}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Restablecer datos de ejemplo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4">
        {currentTab === 'day' ? (
          <DayView
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            activities={schedule[selectedDay] || []}
            onUpdateActivities={handleUpdateActivities}
            onOpenAddModal={(suggestedMinute) => {
              setAddModalDay(selectedDay);
              setSuggestedStartMinute(suggestedMinute);
              setIsAddModalOpen(true);
            }}
            onOpenCopyModal={(fromDay) => {
              setCopySourceDay(fromDay);
              setIsCopyModalOpen(true);
            }}
            weekScheduleSummary={weekScheduleSummary}
            settings={settings}
          />
        ) : (
          <WeekView
            schedule={schedule}
            onSelectDay={(day) => {
              setSelectedDay(day);
              setCurrentTab('day');
            }}
            onOpenCopyModal={(fromDay) => {
              setCopySourceDay(fromDay);
              setIsCopyModalOpen(true);
            }}
            onOpenAddModal={(day) => {
              setAddModalDay(day);
              setSuggestedStartMinute(undefined);
              setIsAddModalOpen(true);
            }}
            settings={settings}
          />
        )}
      </main>

      {/* Bottom Floating Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-6 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setCurrentTab('day')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs transition-all active:scale-98 ${
              currentTab === 'day'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Vista de Día</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('week')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs transition-all active:scale-98 ${
              currentTab === 'week'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Vista de Semana</span>
          </button>
        </div>
      </nav>

      {/* Modals & Drawers */}
      <AddActivityDrawer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        dayKey={addModalDay}
        templates={templates}
        existingActivities={schedule[addModalDay] || []}
        suggestedStartMinute={suggestedStartMinute}
        settings={settings}
        onAddScheduledActivity={handleAddScheduledActivity}
        onOpenCatalog={() => setIsCatalogModalOpen(true)}
      />

      <CopyDayModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        sourceDay={copySourceDay}
        onCopy={handleCopyDay}
      />

      <CatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        templates={templates}
        onAddTemplate={handleAddTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
