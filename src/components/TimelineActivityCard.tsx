import React, { useState, useRef, useEffect } from 'react';
import {
  Settings2,
  Check,
  Trash2,
  Copy,
  FileText,
  X,
} from 'lucide-react';
import type { ScheduledActivity } from '../types';
import { getColorDef, formatDuration, minutesToTimeString } from '../utils';

interface TimelineActivityCardProps {
  activity: ScheduledActivity;
  startHour: number;
  pixelsPer15Min: number;
  onUpdateDuration: (instanceId: string, deltaMinutes: number) => void;
  onToggleCompleted: (instanceId: string) => void;
  onDelete: (instanceId: string) => void;
  onDuplicate: (instanceId: string) => void;
  onUpdateDescription: (instanceId: string, description: string) => void;
  onStartDrag: (instanceId: string, clientY: number, grabOffsetY: number) => void;
  isDragging?: boolean;
  draggedTopPx?: number | null;
}

export const TimelineActivityCard: React.FC<TimelineActivityCardProps> = ({
  activity,
  startHour,
  pixelsPer15Min,
  onUpdateDuration,
  onToggleCompleted,
  onDelete,
  onDuplicate,
  onUpdateDescription,
  onStartDrag,
  isDragging = false,
  draggedTopPx = null,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [tempDesc, setTempDesc] = useState(activity.description || '');
  const color = getColorDef(activity.colorId);
  const longPressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setTempDesc(activity.description || '');
  }, [activity.description]);

  // Normal calculated position
  const minutesFromStart = Math.max(0, activity.startMinute - startHour * 60);
  const normalTopPx = (minutesFromStart / 15) * pixelsPer15Min;
  const heightPx = Math.max(pixelsPer15Min, (activity.duration / 15) * pixelsPer15Min);

  // Use draggedTopPx if actively dragging, otherwise normalTopPx
  const activeTopPx = isDragging && draggedTopPx !== null ? draggedTopPx : normalTopPx;

  // Time text
  const startStr = minutesToTimeString(activity.startMinute);
  const endStr = minutesToTimeString(activity.startMinute + activity.duration);

  // Long press handler
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('textarea')) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const cardRect = cardRef.current?.getBoundingClientRect();
    const grabOffsetY = cardRect ? clientY - cardRect.top : 20;

    longPressTimerRef.current = window.setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
      onStartDrag(activity.instanceId, clientY, grabOffsetY);
    }, 240);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSaveDescription = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDescription(activity.instanceId, tempDesc.trim());
    setShowDescModal(false);
  };

  const handleClearDescription = () => {
    setTempDesc('');
    onUpdateDescription(activity.instanceId, '');
    setShowDescModal(false);
  };

  const isShortDuration = activity.duration <= 30;
  const hasDescription = Boolean(activity.description && activity.description.trim().length > 0);

  return (
    <>
      <div
        ref={cardRef}
        style={{
          top: `${activeTopPx}px`,
          height: `${heightPx}px`,
          backgroundColor: color.bgSolid,
          color: color.textSolid,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        className={`absolute left-16 right-2 rounded-2xl shadow-md select-none overflow-visible flex items-stretch border border-black/10 ${
          isDragging
            ? 'z-50 shadow-2xl scale-[1.03] opacity-95 ring-4 ring-white/90 cursor-grabbing transition-none'
            : showMenu
            ? 'z-40 ring-2 ring-white/70 shadow-2xl transition-all'
            : 'z-10 hover:shadow-lg transition-all'
        } ${activity.completed ? 'opacity-70 saturate-75' : ''}`}
      >
        {/* SECCIÓN IZQUIERDA: Si dura 15 min -> Solo botón +15. Si dura > 15 min -> Mitad superior -15, mitad inferior +15 */}
        <div className="w-9 flex flex-col border-r border-white/20 shrink-0 bg-black/10 rounded-l-2xl overflow-hidden">
          {activity.duration === 15 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateDuration(activity.instanceId, 15);
              }}
              className="flex-1 w-full flex items-center justify-center text-[10px] font-black text-white hover:bg-white/20 active:bg-white/30 transition-colors"
              title="Sumar 15 minutos (ampliar slot)"
            >
              <span className="text-xs font-black">+15</span>
            </button>
          ) : (
            <>
              {/* Mitad superior: -15 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateDuration(activity.instanceId, -15);
                }}
                className="flex-1 flex flex-col items-center justify-center text-[10px] font-black text-white/90 hover:bg-white/20 active:bg-white/30 transition-colors"
                title="Restar 15 minutos"
              >
                <span className="leading-none text-xs font-black">-</span>
                <span className="text-[8px] font-bold tracking-tighter">15</span>
              </button>

              <div className="h-[1px] bg-white/20 w-full" />

              {/* Mitad inferior: +15 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateDuration(activity.instanceId, 15);
                }}
                className="flex-1 flex flex-col items-center justify-center text-[10px] font-black text-white/90 hover:bg-white/20 active:bg-white/30 transition-colors"
                title="Sumar 15 minutos"
              >
                <span className="leading-none text-xs font-black">+</span>
                <span className="text-[8px] font-bold tracking-tighter">15</span>
              </button>
            </>
          )}
        </div>

        {/* SECCIÓN CENTRAL: Título, duración, hora, icono descripción */}
        <div className="flex-1 px-2.5 py-1 flex flex-col justify-center min-w-0 overflow-hidden cursor-grab active:cursor-grabbing">
          {isShortDuration ? (
            /* Para 15 y 30 min: Disposición en una sola línea horizontal sin colisión */
            <div className="flex items-center gap-1.5 overflow-hidden">
              {activity.completed && (
                <span className="p-0.5 rounded-full bg-white text-emerald-700 shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
              <h4
                className={`font-black text-xs leading-none truncate text-white drop-shadow-xs shrink-0 max-w-[50%] ${
                  activity.completed ? 'line-through opacity-85' : ''
                }`}
              >
                {activity.title}
              </h4>
              {hasDescription && (
                <span
                  title={activity.description}
                  className="p-0.5 rounded bg-white/20 text-white/90 shrink-0"
                >
                  <FileText className="w-2.5 h-2.5" />
                </span>
              )}
              <span className="bg-white/20 px-1 py-0.5 rounded font-bold text-[9px] tracking-tight text-white shrink-0 whitespace-nowrap">
                {startStr} - {endStr}
              </span>
            </div>
          ) : (
            /* Para 45 min o más: Disposición vertical cómoda */
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 overflow-hidden">
                {activity.completed && (
                  <span className="p-0.5 rounded-full bg-white text-emerald-700 shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <h4
                  className={`font-black text-sm leading-tight truncate text-white drop-shadow-xs ${
                    activity.completed ? 'line-through opacity-85' : ''
                  }`}
                >
                  {activity.title}
                </h4>
                {hasDescription && (
                  <span
                    title={activity.description}
                    className="p-0.5 rounded bg-white/20 text-white/90 shrink-0"
                  >
                    <FileText className="w-3 h-3" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-white/90 font-medium">
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md font-bold text-[10px] tracking-tight">
                  {startStr} - {endStr}
                </span>
                <span className="text-[10px] font-semibold opacity-90">
                  {formatDuration(activity.duration)}
                </span>
              </div>

              {/* Si tiene descripción y el slot es amplio (>= 45m), muestra un snippet */}
              {hasDescription && (
                <p className="text-[10px] text-white/80 truncate italic mt-0.5 max-w-full">
                  {activity.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN DERECHA: Botón / Ruedecilla con menú desplegable */}
        <div className="relative flex items-center pr-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className={`p-1.5 rounded-xl text-white/90 hover:text-white hover:bg-white/20 transition-all ${
              showMenu ? 'bg-white/30 text-white' : ''
            }`}
            title="Opciones de actividad"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />

              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-1.5 w-48 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Opciones
                </div>

                {/* Opción Descripción */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setTempDesc(activity.description || '');
                    setShowDescModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-left hover:bg-slate-50 text-indigo-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="truncate">
                    <div>{hasDescription ? 'Editar descripción' : 'Añadir descripción'}</div>
                    {hasDescription && (
                      <div className="text-[10px] font-normal text-slate-400 truncate max-w-[140px]">
                        {activity.description}
                      </div>
                    )}
                  </div>
                </button>

                <div className="h-[1px] bg-slate-100 my-1 w-full" />

                {/* Opción Superior: Completada */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCompleted(activity.instanceId);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                      activity.completed
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {activity.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{activity.completed ? 'Desmarcar' : 'Completada'}</span>
                </button>

                {/* Opción Intermedia: Duplicar */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(activity.instanceId);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-left hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Duplicar slot</span>
                </button>

                <div className="h-[1px] bg-slate-100 my-1 w-full" />

                {/* Opción Inferior: Eliminar */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(activity.instanceId);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-left hover:bg-red-50 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span>Eliminar actividad</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de edición de descripción */}
      {showDescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: color.bgSolid }}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Descripción de la actividad</h3>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                    {activity.title} ({startStr} - {endStr})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDescModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveDescription} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Notas o detalles
                </label>
                <textarea
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  placeholder="Escribe notas, objetivos, ejercicios o detalles de esta actividad..."
                  rows={4}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-slate-50 focus:bg-white transition-all resize-none"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Se guardará junto a la tarea</span>
                  <span>{tempDesc.length} caracteres</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                {hasDescription ? (
                  <button
                    type="button"
                    onClick={handleClearDescription}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-2 rounded-xl transition-colors"
                  >
                    Borrar texto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDescModal(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl"
                  >
                    Cancelar
                  </button>
                )}

                <div className="flex items-center gap-2">
                  {hasDescription && (
                    <button
                      type="button"
                      onClick={() => setShowDescModal(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
