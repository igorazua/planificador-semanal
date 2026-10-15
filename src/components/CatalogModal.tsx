import React, { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { COLOR_PALETTE } from '../types';
import type { ActivityTemplate } from '../types';
import { formatDuration, getColorDef, generateId } from '../utils';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ActivityTemplate[];
  onAddTemplate: (template: ActivityTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  templates,
  onAddTemplate,
  onDeleteTemplate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(45);
  const [newColorId, setNewColorId] = useState('orange');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const template: ActivityTemplate = {
      id: generateId(),
      title: newTitle.trim(),
      defaultDuration: newDuration,
      colorId: newColorId,
    };

    onAddTemplate(template);
    setNewTitle('');
    setNewDuration(45);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Catálogo de Actividades</h3>
              <p className="text-xs text-slate-500">Colores y duraciones predeterminadas</p>
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
        <div className="p-5 overflow-y-auto space-y-4">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 px-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Plus className="w-5 h-5" />
              <span>Añadir nueva actividad al catálogo</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800">Nueva actividad</h4>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="ej. Estudiar inglés, Meditación..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                />
              </div>

              {/* Duración predeterminada */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Duración habitual: <span className="text-indigo-600 font-bold">{formatDuration(newDuration)}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 30, 45, 60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setNewDuration(dur)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        newDuration === dur
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {formatDuration(dur)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color asignado */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color representativo</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = newColorId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setNewColorId(c.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                          isSelected ? 'scale-115 ring-2 ring-offset-2 ring-indigo-500' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.accent }}
                        title={c.name}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                Guardar en el catálogo
              </button>
            </form>
          )}

          {/* List of existing templates */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Actividades guardadas ({templates.length})
            </h4>
            <div className="space-y-2">
              {templates.map((tpl) => {
                const color = getColorDef(tpl.colorId);
                return (
                  <div
                    key={tpl.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: color.accent }}
                      />
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{tpl.title}</div>
                        <div className="text-xs text-slate-500">{formatDuration(tpl.defaultDuration)}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(tpl.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
