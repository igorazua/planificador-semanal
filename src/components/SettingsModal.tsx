import React from 'react';
import { X, Settings, Clock, Sparkles } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  if (!isOpen) return null;

  const startHourOptions = [5, 6, 7, 8, 9, 10];
  const endHourOptions = [20, 21, 22, 23, 24];

  const handleStartHourChange = (hour: number) => {
    onSaveSettings({
      ...settings,
      startHour: hour,
    });
  };

  const handleEndHourChange = (hour: number) => {
    onSaveSettings({
      ...settings,
      endHour: hour,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Configuración de Horario</h3>
              <p className="text-xs text-slate-500">Límites y cuadrícula del día</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Inicio del día */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Inicio del día (Hora X)
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Define la primera hora que aparece visible en la cuadrícula diaria.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {startHourOptions.map((h) => {
                const isSelected = settings.startHour === h;
                const formatted = `${h.toString().padStart(2, '0')}:00`;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleStartHourChange(h)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-1'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {formatted}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fin del día */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fin del día
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Define la última franja horaria mostrada en la cuadrícula.
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {endHourOptions.map((h) => {
                const isSelected = settings.endHour === h;
                const formatted = h === 24 ? '00:00' : `${h.toString().padStart(2, '0')}:00`;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleEndHourChange(h)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-1'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {formatted}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Intervalos de 15 minutos</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-800">
              Cada hora tiene marcas visuales cada 15 minutos (:00, :15, :30, :45). Puedes arrastrar o mover actividades a cualquier cuarto de hora.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs"
          >
            Guardar y volver
          </button>
        </div>
      </div>
    </div>
  );
};
