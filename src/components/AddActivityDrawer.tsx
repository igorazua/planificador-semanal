import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Clock } from 'lucide-react';
import { COLOR_PALETTE, DAYS_OF_WEEK } from '../types';
import type { ActivityTemplate, DayKey, ScheduledActivity, AppSettings } from '../types';
import {
  formatDuration,
  getColorDef,
  generateId,
  minutesToTimeString,
  findNextAvailableSlot,
} from '../utils';

interface AddActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dayKey: DayKey;
  templates: ActivityTemplate[];
  existingActivities: ScheduledActivity[];
  suggestedStartMinute?: number;
  settings: AppSettings;
  onAddScheduledActivity: (day: DayKey, activity: ScheduledActivity) => void;
  onOpenCatalog: () => void;
}

export const AddActivityDrawer: React.FC<AddActivityDrawerProps> = ({
  isOpen,
  onClose,
  dayKey,
  templates,
  existingActivities,
  suggestedStartMinute,
  settings,
  onAddScheduledActivity,
  onOpenCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customDuration, setCustomDuration] = useState(45);
  const [customColorId, setCustomColorId] = useState('orange');
  const [selectedStartMinute, setSelectedStartMinute] = useState<number>(() => {
    return suggestedStartMinute ?? findNextAvailableSlot(existingActivities, settings.startHour);
  });

  // Keep start time synced when suggestedStartMinute or modal opens
  useEffect(() => {
    if (suggestedStartMinute !== undefined) {
      setSelectedStartMinute(suggestedStartMinute);
    } else {
      setSelectedStartMinute(findNextAvailableSlot(existingActivities, settings.startHour));
    }
  }, [suggestedStartMinute, existingActivities, settings.startHour, isOpen]);

  if (!isOpen) return null;

  const currentDayName = DAYS_OF_WEEK.find((d) => d.key === dayKey)?.label || '';

  const handleAddFromTemplate = (tpl: ActivityTemplate) => {
    const newActivity: ScheduledActivity = {
      instanceId: generateId(),
      activityId: tpl.id,
      title: tpl.title,
      startMinute: selectedStartMinute,
      duration: tpl.defaultDuration,
      colorId: tpl.colorId,
    };
    onAddScheduledActivity(dayKey, newActivity);
    onClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newActivity: ScheduledActivity = {
      instanceId: generateId(),
      title: customTitle.trim(),
      description: customDescription.trim() || undefined,
      startMinute: selectedStartMinute,
      duration: customDuration,
      colorId: customColorId,
    };
    onAddScheduledActivity(dayKey, newActivity);
    setCustomTitle('');
    setCustomDescription('');
    onClose();
  };

  // Generate selectable start times (:00, :15, :30, :45)
  const timeOptions: number[] = [];
  for (let m = settings.startHour * 60; m <= settings.endHour * 60; m += 15) {
    timeOptions.push(m);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Añadir a {currentDayName}</h3>
            <p className="text-xs text-slate-500">
              Inicio previsto:{' '}
              <span className="font-bold text-indigo-600">
                {minutesToTimeString(selectedStartMinute)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Start Time Selector Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hora de inicio:</span>
          </div>
          <select
            value={selectedStartMinute}
            onChange={(e) => setSelectedStartMinute(Number(e.target.value))}
            className="bg-white border border-slate-300 text-slate-800 font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {timeOptions.map((m) => (
              <option key={m} value={m}>
                {minutesToTimeString(m)}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5 pt-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'catalog'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            De tus actividades ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 text-xs font-bold transition-all relative ${
              activeTab === 'custom'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Nueva solo para hoy
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'catalog' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {templates.map((tpl) => {
                  const color = getColorDef(tpl.colorId);
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleAddFromTemplate(tpl)}
                      className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/20 active:scale-98 transition-all text-left shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full shrink-0 shadow-xs group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.bgSolid }}
                        />
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{tpl.title}</div>
                          <div className="text-xs text-slate-400">
                            {formatDuration(tpl.defaultDuration)} • empezando a las{' '}
                            {minutesToTimeString(selectedStartMinute)}
                          </div>
                        </div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-500 transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCatalog();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gestionar actividades habituales
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nombre de la actividad
                </label>
                <input
                  type="text"
                  placeholder="ej. Sesión gym tarde, Visita médica..."
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Descripción o notas <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. Rutina de pierna, llevar documentos..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Duración:{' '}
                  <span className="text-indigo-600 font-bold">{formatDuration(customDuration)}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 30, 45, 60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setCustomDuration(dur)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        customDuration === dur
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {formatDuration(dur)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = customColorId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCustomColorId(c.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                          isSelected ? 'scale-115 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.bgSolid }}
                        title={c.name}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!customTitle.trim()}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                Añadir al {currentDayName}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
