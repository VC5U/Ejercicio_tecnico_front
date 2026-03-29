import React, { useState } from 'react';
import { Bot, Users, PlusCircle, MessageSquare, Edit2, Trash2, Search, Calendar } from 'lucide-react';

const Sidebar = ({ view, setView, conversaciones, selectedId, setSelectedId, onNuevoChat, onBorrar, onEditar }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const ETIQUETAS = {
    URGENTE: 'bg-red-500/20 text-red-400 border-red-500/50',
    PROCESADO: 'bg-green-500/20 text-green-400 border-green-500/50',
    PENDIENTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
  };

  const filteredConvs = conversaciones.filter(c => 
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-80 h-full bg-[#111827] flex flex-col border-r border-gray-800/50 transition-all duration-300">
      {/* NAVEGACIÓN PRINCIPAL: 3 PESTAÑAS */}
      <div className="p-4 pt-6">
        <div className="flex p-1 bg-gray-900/80 border border-gray-800 rounded-2xl shadow-inner gap-1">
          <button 
            onClick={() => setView('ia')} 
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
              view === 'ia' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Bot size={14} />
            <span className="text-[8px] font-black uppercase mt-1 tracking-widest">IA Chat</span>
          </button>

          <button 
            onClick={() => setView('grupal')} 
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
              view === 'grupal' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Users size={14} />
            <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Equipo</span>
          </button>

          <button 
            onClick={() => setView('calendario')} 
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 ${
              view === 'calendario' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Calendar size={14} />
            <span className="text-[8px] font-black uppercase mt-1 tracking-widest">Agenda</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO DINÁMICO SEGÚN LA VISTA */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'ia' && (
          <>
            <div className="px-4 mb-4">
              <button 
                onClick={onNuevoChat}
                className="w-full bg-blue-600/10 hover:bg-blue-600 border border-blue-600/20 hover:border-blue-500 text-blue-400 hover:text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-tighter transition-all active:scale-95 group"
              >
                <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                Nuevo Registro
              </button>
            </div>

            <div className="px-4 mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Buscar en la oficina..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-900/40 border border-gray-800/50 rounded-xl py-2 pl-9 pr-4 text-[11px] outline-none focus:border-blue-500/30 transition-all placeholder:text-gray-700 text-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1.5 custom-scrollbar">
              {filteredConvs.length > 0 ? (
                filteredConvs.map((conv) => (
                  <div 
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`group relative p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 ${
                      selectedId === conv.id 
                        ? 'bg-blue-600/5 border-blue-500/30 shadow-sm' 
                        : 'hover:bg-gray-800/40 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col gap-1">
                        <p className={`text-[12px] font-bold truncate max-w-[140px] ${
                          selectedId === conv.id ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {conv.titulo}
                        </p>
                        {conv.etiqueta && (
                          <span className={`w-fit px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-tighter ${ETIQUETAS[conv.etiqueta]}`}>
                            {conv.etiqueta}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-600 font-medium">{conv.hora || '12:50 PM'}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 italic truncate pr-8 leading-tight">
                      {conv.resumenIA || "Sin resumen disponible..."}
                    </p>
                    <div className="absolute right-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onEditar(conv); }} className="p-1 hover:text-blue-400 text-gray-600 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onBorrar(conv.id); }} className="p-1 hover:text-red-400 text-gray-600 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <MessageSquare size={30} className="mx-auto text-gray-800 mb-2" />
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No hay registros</p>
                </div>
              )}
            </div>
          </>
        )}

        {view === 'grupal' && (
          <div className="flex-1 px-4 space-y-2">
            <h4 className="text-[10px] font-black text-purple-400 uppercase mb-4 tracking-widest px-1">Canales de Oficina</h4>
            <div 
              onClick={() => setSelectedId('general')}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                selectedId === 'general' 
                  ? 'bg-purple-600/20 border-purple-500/50 shadow-lg' 
                  : 'hover:bg-purple-600/10 border-transparent'
              }`}
            >
              <div className="size-9 rounded-xl bg-purple-600 flex items-center justify-center text-sm font-black text-white shadow-inner">#</div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-200">General_Oficina</span>
                <span className="text-[9px] text-purple-400 font-medium uppercase tracking-tighter">Canal Principal</span>
              </div>
            </div>
          </div>
        )}

        {view === 'calendario' && (
          <div className="flex-1 px-4 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Calendar size={32} className="text-emerald-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Modo Agenda Activo</h4>
              <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                Revisa y gestiona las tareas<br />programadas para la oficina.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER DEL SIDEBAR */}
      <div className="p-4 border-t border-gray-800/50 bg-[#111827]/80">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">Servidor Activo</span>
          </div>
          <span className="text-[9px] text-gray-600 font-bold tracking-tighter">v2.4.0-PRO</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;