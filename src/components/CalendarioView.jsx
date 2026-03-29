import React, { useState } from 'react';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';

const CalendarioView = ({ tareas, setTareas }) => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [nuevaTarea, setNuevaTarea] = useState("");

  // Lógica para generar los días del calendario
  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDiaMes = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    
    // Ajuste para que la semana empiece en Lunes (0 = Dom en JS)
    const offset = primerDiaMes === 0 ? 6 : primerDiaMes - 1;
    const dias = [];

    // Espacios vacíos para el inicio del mes
    for (let i = 0; i < offset; i++) dias.push(null);
    
    // Días del mes
    for (let d = 1; d <= diasEnMes; d++) {
      dias.push(new Date(año, mes, d));
    }
    return dias;
  };

  const cambiarMes = (offset) => {
    setFechaActual(new Date(fechaActual.getFullYear(), fechaActual.getMonth() + offset, 1));
  };

  const formatKey = (date) => date ? date.toISOString().split('T')[0] : null;

  const agregarTareaManual = () => {
    if (!nuevaTarea.trim()) return;
    const tarea = {
      id: Date.now(),
      texto: nuevaTarea,
      fecha: fechaSeleccionada,
      completada: false
    };
    setTareas([...tareas, tarea]);
    setNuevaTarea("");
  };

  const tareasDelDia = tareas.filter(t => t.fecha === fechaSeleccionada);
  const dias = obtenerDiasDelMes();
  const nombreMes = fechaActual.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-full w-full bg-[#0f172a] text-white p-6 gap-6">
      {/* PANEL IZQUIERDO: CALENDARIO VISUAL */}
      <div className="flex-1 bg-gray-900/50 rounded-3xl border border-gray-800 p-8 flex flex-col shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-3 capitalize">
            <CalendarIcon size={24} /> {nombreMes}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => cambiarMes(-1)} className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-white border border-gray-800">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => cambiarMes(1)} className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-white border border-gray-800">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-7 gap-2">
          {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-blue-500/50 pb-4">{d}</div>
          ))}
          
          {dias.map((dia, i) => {
            const esHoy = dia && formatKey(dia) === new Date().toISOString().split('T')[0];
            const esSeleccionado = dia && formatKey(dia) === fechaSeleccionada;
            const tieneTareas = dia && tareas.some(t => t.fecha === formatKey(dia));

            return (
              <div 
                key={i}
                onClick={() => dia && setFechaSeleccionada(formatKey(dia))}
                className={`
                  relative h-20 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1
                  ${!dia ? 'border-transparent' : 'hover:scale-105 active:scale-95'}
                  ${esSeleccionado ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-gray-900/40 border-gray-800 hover:border-gray-600'}
                `}
              >
                {dia && (
                  <>
                    <span className={`text-sm font-bold ${esSeleccionado ? 'text-white' : esHoy ? 'text-blue-400' : 'text-gray-400'}`}>
                      {dia.getDate()}
                    </span>
                    {tieneTareas && !esSeleccionado && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL DERECHO: TAREAS DEL DÍA SELECCIONADO */}
      <div className="w-96 bg-gray-900/80 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl backdrop-blur-md">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
          <Clock size={18} /> Tareas: {fechaSeleccionada}
        </h3>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            placeholder="Escribir pendiente..."
            className="flex-1 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition-all text-white"
            onKeyDown={(e) => e.key === 'Enter' && agregarTareaManual()}
          />
          <button
            onClick={agregarTareaManual}
            className="bg-emerald-600 hover:bg-emerald-500 p-2 rounded-xl transition-colors shadow-lg active:scale-95 text-white"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
          {tareasDelDia.length > 0 ? (
            tareasDelDia.map(tarea => (
              <div key={tarea.id} className="bg-gray-800/40 border border-gray-700/50 p-3 rounded-2xl flex justify-between items-center group hover:bg-gray-800/60 transition-all">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTareas(tareas.map(t => t.id === tarea.id ? { ...t, completada: !t.completada } : t))}
                    className={`transition-colors ${tarea.completada ? 'text-emerald-500' : 'text-gray-600 hover:text-emerald-400'}`}
                  >
                    {tarea.completada ? <CheckCircle size={16} /> : <Circle size={16} />}
                  </button>
                  <span className={`text-[11px] ${tarea.completada ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                    {tarea.texto}
                  </span>
                </div>
                <button
                  onClick={() => setTareas(tareas.filter(t => t.id !== tarea.id))}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <CalendarIcon size={40} className="mb-2" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-black">Sin pendientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarioView;