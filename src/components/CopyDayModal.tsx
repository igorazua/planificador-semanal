import React, { useState } from 'react';
import { Copy, X, Check } from 'lucide-react';
import { DAYS_OF_WEEK } from '../types';
import type { DayKey } from '../types';

interface CopyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDay: DayKey;
  onCopy: (fromDay: DayKey, toDays: DayKey[]) => void;
}

export const CopyDayModal: React.FC<CopyDayModalProps> = ({
  isOpen,
  onClose,
  sourceDay,
  onCopy,
}) => {
  const [fromDay, setFromDay] = useState<DayKey>(sourceDay);
  const [targetDays, setTargetDays] = useState<DayKey[]>([]);

  // Keep fromDay in sync when modal opens
  React.useEffect(() => {
    setFromDay(sourceDay);
    setTargetDays([]);
  }, [sourceDay, isOpen]);

  if (!isOpen) return null;

  const toggleTargetDay = (day: DayKey) => {
    if (day === fromDay) return;
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectAllExceptSource = () => {
    const allExcept = DAYS_OF_WEEK.map((d) => d.key).filter((d) => d !== fromDay);
    if (targetDays.length === allExcept.length) {
      setTargetDays([]);
    } else {
      setTargetDays(allExcept);
    }
  };

  const handleConfirm = () => {
    if (targetDays.length === 0) return;
    onCopy(fromDay, targetDays);
    onClose();
  };

  const sourceDayName = DAYS_OF_WEEK.find((d) => d.key === fromDay)?.label || '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Repetir planificación</h3>
              <p className="text-xs text-slate-500">Copia actividades de un día a otro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Origen */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              1. Copiar desde:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = fromDay === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      setFromDay(d.key);
                      setTargetDays((prev) => prev.filter((td) => td !== d.key));
                    }}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-1'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destino */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                2. Pegar en (uno o varios):
              </label>
              <button
                type="button"
                onClick={handleSelectAllExceptSource}
                className="text-xs text-indigo-600 font-medium hover:underline"
              >
                {targetDays.length === DAYS_OF_WEEK.length - 1 ? 'Deseleccionar todos' : 'Seleccionar resto'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isSource = d.key === fromDay;
                const isSelected = targetDays.includes(d.key);

                if (isSource) {
                  return (
                    <div
                      key={d.key}
                      className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-sm"
                    >
                      <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold">
                        -
                      </span>
                      <span>{d.label} (Origen)</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleTargetDay(d.key)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-sm">{d.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 text-xs text-amber-800">
            <strong>Nota:</strong> Los días seleccionados reemplazarán su planificación actual con las actividades de {sourceDayName}.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={targetDays.length === 0}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-sm transition-all ${
              targetDays.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
            }`}
          >
            Copiar a {targetDays.length} {targetDays.length === 1 ? 'día' : 'días'}
          </button>
        </div>
      </div>
    </div>
  );
};
