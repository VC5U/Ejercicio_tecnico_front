import React, { useState } from 'react';
import { Sparkles, MessageSquare, BarChart3, Activity, CheckCircle2, Circle, Users, Calendar } from 'lucide-react';

const AnalysisPanel = ({ view, selectedConv, mensajes = [], onAgendar }) => {
  const isEquipo = view === 'grupal';
  const [tareas, setTareas] = useState([
    { id: 1, texto: "Revisar pendientes del chat", completada: false }
  ]);
  const handleAgendarDesdeIA = (texto, fecha) => {
  setTareas([...tareas, { id: Date.now(), texto, fecha, completada: false }]);
};
  const generarTareasConIA = () => {
    const detectadas = mensajes
      .filter(m => (m.contenido.toLowerCase().includes("hacer") || m.contenido.toLowerCase().includes("pendiente") || m.contenido.toLowerCase().includes("enviar")))
      .map((m, i) => ({ 
        id: Date.now() + i, 
        texto: isEquipo ? `[EQUIPO] ${m.contenido}` : m.contenido, 
        completada: false 
      }));
    
    if (detectadas.length > 0) {
      setTareas([...tareas, ...detectadas]);
    }
  };

  const toggleTarea = (id) => {
    setTareas(tareas.map(t => t.id === id ? {...t, completada: !t.completada} : t));
  };

  return (
    <aside className="w-80 p-6 bg-[#111827] space-y-6 overflow-y-auto border-l border-gray-800 custom-scrollbar">
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${isEquipo ? 'text-purple-400' : 'text-yellow-500'}`}>
          {isEquipo ? <Users size={18} /> : <Sparkles size={18} />}
          <h2 className="text-[10px] font-black uppercase tracking-widest">
            {isEquipo ? 'Análisis de Equipo' : 'Office Intelligence'}
          </h2>
        </div>
      </div>

      {/* Widget Tareas */}
      <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-blue-400 text-[10px] font-black uppercase tracking-tighter flex items-center gap-2">
            <Activity size={14} /> Pendientes
          </div>
          <button onClick={generarTareasConIA} className="text-[9px] bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2 py-1 rounded-lg transition-all border border-blue-500/20">
            Scan IA
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {tareas.map(tarea => (
            <div key={tarea.id} className="group relative bg-gray-800/30 border border-transparent hover:border-blue-500/30 rounded-xl p-2 transition-all">
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleTarea(tarea.id)}>
                {tarea.completada ? <CheckCircle2 size={14} className="text-green-500 mt-1" /> : <Circle size={14} className="text-gray-600 mt-1" />}
                <span className={`text-[11px] flex-1 ${tarea.completada ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                  {tarea.texto}
                </span>
              </div>
              
              {/* Botón para agendar al calendario real */}
              {!tarea.completada && (
                <button 
                  onClick={() => onAgendar(tarea.texto)}
                  className="mt-2 flex items-center gap-1 text-[9px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/10 px-2 py-1 rounded-md hover:bg-blue-500 hover:text-white"
                >
                  <Calendar size={10} /> Agendar en Calendario
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

 {/* 2. Widget Resumen / Contexto */}
      <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3 text-blue-400 text-[10px] font-black uppercase tracking-tighter">
          <MessageSquare size={14} /> {isEquipo ? 'Tópico Actual' : 'Resumen del Caso'}
        </div>
        <p className="text-[11px] text-gray-400 italic leading-relaxed">
          {isEquipo 
            ? "La oficina está coordinando tareas generales. Se detecta actividad constante en el canal principal."
            : (selectedConv?.resumenIA || "Analizando flujo de trabajo...")
          }
        </p>
      </section>

      {/* 3. Widget Sentimiento / Salud del Equipo */}
      <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3 text-blue-400 text-[10px] font-black uppercase tracking-tighter">
          <BarChart3 size={14} /> {isEquipo ? 'Ánimo del Equipo' : 'Satisfacción'}
        </div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold">
            {isEquipo ? "Colaborativo" : (selectedConv?.sentimientoLabel || "Neutral")}
          </span>
          <span className="text-lg font-black">
            {isEquipo ? "85%" : (selectedConv?.sentimientoScore || 0) + "%"}
          </span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${isEquipo ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'}`} 
            style={{ width: isEquipo ? '85%' : `${selectedConv?.sentimientoScore || 0}%` }}
          />
        </div>
      </section>
          </aside>
  );
};

export default AnalysisPanel;