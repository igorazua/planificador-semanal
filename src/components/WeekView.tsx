import React from 'react';
import { Copy, ChevronRight, Clock } from 'lucide-react';
import { DAYS_OF_WEEK } from '../types';
import type { DayKey, WeekSchedule, AppSettings } from '../types';
import {
  formatDuration,
  getColorDef,
  calculateTotalDayDuration,
  calculateTotalWeekDuration,
  minutesToTimeString,
} from '../utils';

interface WeekViewProps {
  schedule: WeekSchedule;
  onSelectDay: (day: DayKey) => void;
  onOpenCopyModal: (fromDay: DayKey) => void;
  onOpenAddModal?: (day: DayKey) => void;
  settings: AppSettings;
}

export const WeekView: React.FC<WeekViewProps> = ({
  schedule,
  onSelectDay,
  onOpenCopyModal,
  settings,
}) => {
  const totalWeekMinutes = calculateTotalWeekDuration(schedule);
  const startHour = settings.startHour;
  const endHour = settings.endHour;
  const totalDayMinutes = Math.max(60, (endHour - startHour + 1) * 60);

  // Hours for horizontal scale
  const hoursScale: number[] = [];
  for (let h = startHour; h <= endHour; h += 2) {
    hoursScale.push(h);
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Week Summary Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold">
            Resumen Semanal
          </span>
          <h2 className="text-2xl font-black mt-0.5">Línea Temporal</h2>
          <div className="flex items-center gap-1.5 text-xs text-indigo-200 mt-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Total semanal: <strong>{formatDuration(totalWeekMinutes)}</strong>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-indigo-400">
            {DAYS_OF_WEEK.reduce((acc, d) => acc + (schedule[d.key]?.length || 0), 0)}
          </span>
          <div className="text-[11px] text-indigo-200">actividades</div>
        </div>
      </div>

      {/* HORIZONTAL TIMELINE CONTAINER */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-slate-800 text-sm">
            Cronograma horizontal ({startHour}:00 a {endHour}:00)
          </h3>
          <span className="text-[11px] text-slate-400">Desplaza horizontalmente →</span>
        </div>

        {/* Scrollable Track */}
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="min-w-[620px]">
            {/* Horizontal Hours Axis Header */}
            <div className="flex items-center mb-2 pl-24 pr-2">
              <div className="relative w-full h-5 flex justify-between text-[10px] font-mono font-bold text-slate-400 border-b border-slate-200 pb-1">
                {hoursScale.map((h) => {
                  const leftPercent = ((h * 60 - startHour * 60) / totalDayMinutes) * 100;
                  return (
                    <div
                      key={h}
                      style={{ left: `${leftPercent}%` }}
                      className="absolute -translate-x-1/2 flex flex-col items-center"
                    >
                      <span>{h.toString().padStart(2, '0')}:00</span>
                      <div className="w-[1px] h-1.5 bg-slate-300 mt-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day Rows */}
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((d) => {
                const items = schedule[d.key] || [];
                const dayMinutes = calculateTotalDayDuration(items);

                return (
                  <div
                    key={d.key}
                    className="flex items-center group/row rounded-2xl hover:bg-slate-50/80 p-1.5 transition-all"
                  >
                    {/* Left Sticky Day Pill */}
                    <div
                      onClick={() => onSelectDay(d.key)}
                      className="w-22 shrink-0 flex items-center justify-between pr-2 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-black text-xs text-slate-800 group-hover/row:text-indigo-600 transition-colors">
                            {d.shortLabel}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover/row:text-indigo-600" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {dayMinutes > 0 ? `${Math.round((dayMinutes / 60) * 10) / 10}h` : '0h'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCopyModal(d.key);
                        }}
                        className="p-1 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title={`Copiar ${d.label}`}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Timeline Horizontal Bar */}
                    <div
                      onClick={() => onSelectDay(d.key)}
                      className="relative flex-1 h-9 bg-slate-100 rounded-xl overflow-hidden cursor-pointer border border-slate-200/80 group-hover/row:border-slate-300 transition-all"
                    >
                      {/* Hour guide lines in background */}
                      {hoursScale.map((h) => {
                        const leftPercent = ((h * 60 - startHour * 60) / totalDayMinutes) * 100;
                        return (
                          <div
                            key={h}
                            style={{ left: `${leftPercent}%` }}
                            className="absolute top-0 bottom-0 w-[1px] bg-slate-200/60 pointer-events-none"
                          />
                        );
                      })}

                      {/* Scheduled Activity Blocks with Solid Real Colors */}
                      {items.map((act) => {
                        const color = getColorDef(act.colorId);
                        const leftPercent = Math.max(
                          0,
                          ((act.startMinute - startHour * 60) / totalDayMinutes) * 100
                        );
                        const widthPercent = Math.max(
                          1.5,
                          (act.duration / totalDayMinutes) * 100
                        );

                        return (
                          <div
                            key={act.instanceId}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                              backgroundColor: color.bgSolid,
                              color: color.textSolid,
                            }}
                            className="absolute top-1 bottom-1 rounded-lg shadow-xs flex items-center px-1.5 overflow-hidden transition-transform hover:scale-[1.02] hover:z-20 border border-black/10"
                            title={`${act.title} (${minutesToTimeString(act.startMinute)} - ${minutesToTimeString(
                              act.startMinute + act.duration
                            )} • ${formatDuration(act.duration)})`}
                          >
                            <span className="text-[10px] font-bold truncate leading-tight">
                              {act.title}
                            </span>
                          </div>
                        );
                      })}

                      {/* Empty state prompt */}
                      {items.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                          Libre
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
