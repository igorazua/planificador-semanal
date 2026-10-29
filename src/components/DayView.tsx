import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Clock,
} from 'lucide-react';
import { DAYS_OF_WEEK } from '../types';
import type { DayKey, ScheduledActivity, AppSettings } from '../types';
import {
  formatDuration,
  minutesToTimeString,
  calculateTotalDayDuration,
  resolveCollisions,
  generateId,
} from '../utils';
import { TimelineActivityCard } from './TimelineActivityCard';

interface DayViewProps {
  selectedDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  activities: ScheduledActivity[];
  onUpdateActivities: (day: DayKey, activities: ScheduledActivity[]) => void;
  onOpenAddModal: (suggestedStartMinute?: number) => void;
  onOpenCopyModal: (fromDay: DayKey) => void;
  weekScheduleSummary: Record<DayKey, number>;
  settings: AppSettings;
}

const PIXELS_PER_15_MIN = 24; // 1 hour = 96px, 15 min = 24px, 30 min = 48px

export const DayView: React.FC<DayViewProps> = ({
  selectedDay,
  onSelectDay,
  activities,
  onUpdateActivities,
  onOpenAddModal,
  onOpenCopyModal,
  weekScheduleSummary,
  settings,
}) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragCurrentTopPx, setDragCurrentTopPx] = useState<number | null>(null);
  const [dragTargetMinute, setDragTargetMinute] = useState<number | null>(null);

  const grabOffsetYRef = useRef<number>(20);
  const lastClientYRef = useRef<number>(0);
  const autoScrollRafRef = useRef<number | null>(null);

  const startHour = settings.startHour;
  const endHour = settings.endHour;
  const totalHours = Math.max(1, endHour - startHour + 1);
  const totalGridHeight = totalHours * 4 * PIXELS_PER_15_MIN;

  // Handle duration update +/- 15 min
  const handleUpdateDuration = (instanceId: string, deltaMinutes: number) => {
    const updated = activities.map((act) => {
      if (act.instanceId !== instanceId) return act;
      const newDuration = Math.max(15, act.duration + deltaMinutes);
      return { ...act, duration: newDuration };
    });
    const resolved = resolveCollisions(updated, instanceId);
    onUpdateActivities(selectedDay, resolved);
  };

  // Toggle completed
  const handleToggleCompleted = (instanceId: string) => {
    const updated = activities.map((act) =>
      act.instanceId === instanceId ? { ...act, completed: !act.completed } : act
    );
    onUpdateActivities(selectedDay, updated);
  };

  // Delete activity
  const handleDelete = (instanceId: string) => {
    const updated = activities.filter((act) => act.instanceId !== instanceId);
    onUpdateActivities(selectedDay, updated);
  };

  // Duplicate activity
  const handleDuplicate = (instanceId: string) => {
    const target = activities.find((act) => act.instanceId === instanceId);
    if (!target) return;

    const cloned: ScheduledActivity = {
      ...target,
      instanceId: generateId(),
      startMinute: target.startMinute + target.duration,
      completed: false,
    };

    const resolved = resolveCollisions([...activities, cloned], cloned.instanceId);
    onUpdateActivities(selectedDay, resolved);
  };

  // Update description
  const handleUpdateDescription = (instanceId: string, description: string) => {
    const updated = activities.map((act) =>
      act.instanceId === instanceId ? { ...act, description } : act
    );
    onUpdateActivities(selectedDay, updated);
  };

  // Start drag from long press
  const handleStartDrag = (instanceId: string, clientY: number, grabOffsetY: number) => {
    const act = activities.find((a) => a.instanceId === instanceId);
    if (!act || !gridContainerRef.current) return;

    grabOffsetYRef.current = grabOffsetY;
    lastClientYRef.current = clientY;

    const gridRect = gridContainerRef.current.getBoundingClientRect();
    const initialTopInGrid = clientY - gridRect.top - grabOffsetY;

    setDraggingId(instanceId);
    setDragCurrentTopPx(initialTopInGrid);
    setDragTargetMinute(act.startMinute);
  };

  // Dragging event listeners and Auto-scroll loop
  useEffect(() => {
    if (!draggingId) return;

    // Prevent default body scrolling while dragging
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const draggedAct = activities.find((a) => a.instanceId === draggingId);
    const durationMins = draggedAct ? draggedAct.duration : 45;
    const durationSlots = Math.max(1, durationMins / 15);

    // Update position calculation helper
    const updatePositionFromClientY = (clientY: number) => {
      lastClientYRef.current = clientY;
      if (!gridContainerRef.current) return;

      const gridRect = gridContainerRef.current.getBoundingClientRect();
      const rawTop = clientY - gridRect.top - grabOffsetYRef.current;

      const maxTop = (totalHours * 4 - durationSlots) * PIXELS_PER_15_MIN;
      const clampedTop = Math.max(0, Math.min(maxTop, rawTop));

      setDragCurrentTopPx(clampedTop);

      // Snap to nearest 15-minute slot
      const snappedSlot = Math.round(clampedTop / PIXELS_PER_15_MIN);
      const targetMin = startHour * 60 + snappedSlot * 15;
      setDragTargetMinute(targetMin);
    };

    // Auto-scroll continuous animation frame loop
    const autoScrollLoop = () => {
      const clientY = lastClientYRef.current;
      const edgeThreshold = 95;
      const maxScrollSpeed = 14;

      let scrollDelta = 0;
      if (clientY > window.innerHeight - edgeThreshold) {
        // Dragging near bottom edge -> scroll down
        const intensity = (clientY - (window.innerHeight - edgeThreshold)) / edgeThreshold;
        scrollDelta = Math.max(4, Math.min(maxScrollSpeed, intensity * maxScrollSpeed));
      } else if (clientY < edgeThreshold) {
        // Dragging near top edge -> scroll up
        const intensity = (edgeThreshold - clientY) / edgeThreshold;
        scrollDelta = -Math.max(4, Math.min(maxScrollSpeed, intensity * maxScrollSpeed));
      }

      if (scrollDelta !== 0) {
        window.scrollBy({ top: scrollDelta, behavior: 'instant' });
        // Recalculate target position after scroll
        updatePositionFromClientY(clientY);
      }

      autoScrollRafRef.current = requestAnimationFrame(autoScrollLoop);
    };

    autoScrollRafRef.current = requestAnimationFrame(autoScrollLoop);

    // Event handlers
    const handleMove = (e: MouseEvent | TouchEvent) => {
      // Prevent browser from hijacking the touch with native scroll
      if (e.cancelable) {
        e.preventDefault();
      }
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      updatePositionFromClientY(clientY);
    };

    const handleRelease = () => {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }

      if (draggingId && dragTargetMinute !== null) {
        const updated = activities.map((act) =>
          act.instanceId === draggingId ? { ...act, startMinute: dragTargetMinute } : act
        );
        const resolved = resolveCollisions(updated, draggingId);
        onUpdateActivities(selectedDay, resolved);
      }

      setDraggingId(null);
      setDragCurrentTopPx(null);
      setDragTargetMinute(null);
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleRelease);
    window.addEventListener('touchend', handleRelease);

    return () => {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
      }
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchend', handleRelease);
    };
  }, [
    draggingId,
    dragTargetMinute,
    activities,
    selectedDay,
    onUpdateActivities,
    startHour,
    endHour,
    totalHours,
  ]);

  // Click on empty grid row to add activity directly at that time
  const handleGridClick = (minute: number) => {
    onOpenAddModal(minute);
  };

  const totalMinutes = calculateTotalDayDuration(activities);
  const currentDayInfo = DAYS_OF_WEEK.find((d) => d.key === selectedDay);

  // Generate hour slots
  const hoursArray: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hoursArray.push(h);
  }

  // Calculate snap target placeholder height
  const draggingActivity = activities.find((a) => a.instanceId === draggingId);
  const dropPlaceholderHeight = draggingActivity
    ? Math.max(PIXELS_PER_15_MIN, (draggingActivity.duration / 15) * PIXELS_PER_15_MIN)
    : 48;

  const dropPlaceholderTop =
    dragTargetMinute !== null
      ? ((dragTargetMinute - startHour * 60) / 15) * PIXELS_PER_15_MIN
      : 0;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Day Selector Navigation Pills */}
      <div className="bg-white p-2 rounded-2xl shadow-xs border border-slate-200/80">
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((d) => {
            const isSelected = selectedDay === d.key;
            const dayMins = weekScheduleSummary[d.key] || 0;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => onSelectDay(d.key)}
                className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm font-bold scale-[1.02]'
                    : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="text-xs uppercase tracking-wider">{d.shortLabel}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {dayMins > 0 ? `${Math.round((dayMins / 60) * 10) / 10}h` : '-'}
                </span>
                {dayMins > 0 && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Header Info & Actions */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800">{currentDayInfo?.label}</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Clock className="w-3.5 h-3.5" />
              {totalMinutes > 0 ? formatDuration(totalMinutes) : 'Sin actividades'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'} • Mantén pulsado para arrastrar
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenCopyModal(selectedDay)}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-colors"
            title="Copiar o repetir este día a otro"
          >
            <Copy className="w-4 h-4" />
          </button>
          {activities.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Vaciar todas las actividades de este día?')) {
                  onUpdateActivities(selectedDay, []);
                }
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
              title="Vaciar día"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenAddModal()}
            className="flex items-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </div>
      </div>

      {/* TIMELINE GRID CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-3 pb-8 overflow-x-hidden">
        <div
          ref={gridContainerRef}
          style={{ height: `${totalGridHeight}px` }}
          className="relative w-full select-none"
        >
          {/* Hour Lines & 15-Minute Grid Lines */}
          {hoursArray.map((hour, hIdx) => {
            const hourTopPx = hIdx * 4 * PIXELS_PER_15_MIN;
            const hourStr = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <React.Fragment key={hour}>
                {/* Main Hour Line (:00) */}
                <div
                  style={{ top: `${hourTopPx}px` }}
                  className="absolute left-0 right-0 flex items-center group pointer-events-none"
                >
                  <span className="w-14 text-[11px] font-bold text-slate-500 shrink-0 font-mono">
                    {hourStr}
                  </span>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                {/* Quarter Lines (:15, :30, :45) clickable */}
                {[15, 30, 45].map((min) => {
                  const subTopPx = hourTopPx + (min / 15) * PIXELS_PER_15_MIN;
                  const totalMinute = hour * 60 + min;

                  return (
                    <div
                      key={min}
                      style={{ top: `${subTopPx}px` }}
                      onClick={() => handleGridClick(totalMinute)}
                      className="absolute left-14 right-0 h-[24px] -mt-[12px] flex items-center cursor-pointer hover:bg-indigo-50/30 transition-colors group/sub"
                      title={`Toca para añadir actividad a las ${minutesToTimeString(totalMinute)}`}
                    >
                      <div className="w-full h-[1px] border-b border-dashed border-slate-100 group-hover/sub:border-indigo-300" />
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}

          {/* Snap placeholder target zone when dragging */}
          {draggingId && dragTargetMinute !== null && (
            <div
              style={{
                top: `${dropPlaceholderTop}px`,
                height: `${dropPlaceholderHeight}px`,
              }}
              className="absolute left-16 right-2 rounded-2xl border-2 border-dashed border-indigo-400 bg-indigo-50/50 z-20 transition-all pointer-events-none flex items-center justify-end pr-3"
            >
              <span className="text-[10px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-lg shadow-xs">
                Soltar en {minutesToTimeString(dragTargetMinute)}
              </span>
            </div>
          )}

          {/* Active Activity Cards */}
          {activities.map((act) => (
            <TimelineActivityCard
              key={act.instanceId}
              activity={act}
              startHour={startHour}
              pixelsPer15Min={PIXELS_PER_15_MIN}
              onUpdateDuration={handleUpdateDuration}
              onToggleCompleted={handleToggleCompleted}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onUpdateDescription={handleUpdateDescription}
              onStartDrag={handleStartDrag}
              isDragging={draggingId === act.instanceId}
              draggedTopPx={draggingId === act.instanceId ? dragCurrentTopPx : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
