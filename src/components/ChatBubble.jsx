import React, { useState } from 'react';
import { User, Bot, Trash2, Edit2, Check, X } from 'lucide-react';

const ChatBubble = ({ emisor, contenido, nombreUsuario, esPropio, onEliminar, onEditar }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState(contenido);

  // --- Limpieza de JSON ---
  const renderContenido = (texto) => {
    try {
      const objeto = JSON.parse(texto);
      return objeto.contenido || texto;
    } catch (e) {
      return texto;
    }
  };

  const displayContent = renderContenido(contenido);

  return (
    <div className={`flex ${esPropio ? 'justify-end' : 'justify-start'} group mb-4 animate-in fade-in slide-in-from-bottom-2`}>
      <div className={`flex max-w-[75%] gap-3 ${esPropio ? 'flex-row-reverse' : ''}`}>
        <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${esPropio ? 'bg-blue-600' : 'bg-gray-800 border border-gray-700'}`}>
          {emisor === 'USER' ? <User size={14} className="text-white"/> : <Bot size={14} className="text-blue-400"/>}
        </div>
        
        <div className={`flex flex-col ${esPropio ? 'items-end' : ''}`}>
          <span className="text-[10px] text-gray-500 mb-1 px-1 font-bold uppercase tracking-widest">
            {esPropio ? 'Tú' : (nombreUsuario || 'Oficina')}
          </span>
          
          <div className={`p-3.5 rounded-2xl relative transition-all ${
            esPropio 
            ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20 shadow-xl' 
            : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none shadow-black/20 shadow-xl'
          }`}>
            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[200px]">
                <textarea 
                  value={temp} 
                  onChange={(e) => setTemp(e.target.value)} 
                  className="bg-gray-900 text-sm p-2 rounded-lg border border-gray-700 outline-none focus:border-blue-500 text-white" 
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { onEditar(temp); setIsEditing(false); }} className="p-1 hover:bg-green-500/20 rounded text-green-400"><Check size={16}/></button>
                  <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><X size={16}/></button>
                </div>
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{displayContent}</p>
            )}

            {esPropio && !isEditing && (
              <div className="absolute -top-2 -right-8 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0">
                <button onClick={() => setIsEditing(true)} className="p-1.5 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 hover:text-blue-400 shadow-xl"><Edit2 size={12}/></button>
                <button onClick={onEliminar} className="p-1.5 bg-gray-900 rounded-lg border border-gray-800 text-gray-400 hover:text-red-400 shadow-xl"><Trash2 size={12}/></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;