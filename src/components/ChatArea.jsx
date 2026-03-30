import React, { useRef, useEffect, useState } from 'react';
// CORRECCIÓN: Se añaden Users y MessageSquare a la lista de imports
import { Send, Bot, Smile, BarChart2, Trash2, Mic, MicOff, Loader2, Users, MessageSquare } from 'lucide-react';
import ChatBubble from './ChatBubble';

const ChatArea = ({
  view,
  selectedId,
  selectedConv,
  mensajes = [],
  onEnviar,
  onEliminarMensaje,
  usuarioActualId,
  loading,
  toggleAnalysis,
  onBorrarTodaIA
}) => {
  const [input, setInput] = useState("");
  const [felicidad, setFelicidad] = useState(0.5);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  
  // CORRECCIÓN: Sincronizado con el valor 'equipo' que usas en App.js
  const isEquipo = view === 'equipo';

  // 1. SENTIMIENTO EQUIPO
  useEffect(() => {
    let isMounted = true;
    if (isEquipo) {
      fetch('http://localhost:8080/api/chat-grupal/sentimiento-equipo')
        .then(res => res.json())
        .then(data => {
          if (isMounted) setFelicidad(data);
        })
        .catch(() => {
          if (isMounted) setFelicidad(0.1);
        });
    }
    return () => { isMounted = false; };
  }, [isEquipo, mensajes.length]);

  // 2. AUTO SCROLL
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, loading]);

  // 3. RECONOCIMIENTO DE VOZ
  const handleVoz = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el dictado por voz. Prueba con Chrome o Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = () => setIsListening(false);

    if (!isListening) {
      recognition.start();
    }
  };

  // 4. ENVÍO DE FORMULARIO
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    onEnviar(input.trim());
    setInput("");
  };

  // PANTALLA VACÍA (Si no hay selección y no es modo equipo)
  if (!isEquipo && !selectedId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B0F1A] text-gray-700">
        <div className="p-8 rounded-full bg-gray-900/50 mb-4 border border-gray-800">
          <Bot size={60} className="opacity-20" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-30">Selecciona un registro para comenzar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0B0F1A] overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 px-6 bg-[#111827]/80 backdrop-blur-md border-b border-gray-800/50 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${isEquipo ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
            {/* CORRECCIÓN: Ya no darán error porque están importados arriba */}
            {isEquipo ? <Users size={18}/> : <MessageSquare size={18}/>}
          </div>
          <div>
            <h2 className="font-black uppercase tracking-tighter text-gray-100 text-sm">
              {isEquipo ? "Canal General" : selectedConv?.titulo || "Registro Detallado"}
            </h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
              {isEquipo ? "Colaboración en equipo" : "Asistente Inteligente"}
            </p>
          </div>

          {isEquipo && (
            <div className="ml-4 flex items-center gap-2 bg-gray-800/50 border border-gray-700/50 px-3 py-1.5 rounded-full">
              <Smile size={14} className="text-yellow-400" />
              <span className="text-[10px] font-black text-gray-300">
                FELICIDAD: {Math.round(felicidad * 100)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isEquipo && (
            <>
              <button 
                onClick={() => onBorrarTodaIA?.(selectedId)}
                className="p-2.5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-xl transition-all"
                title="Limpiar Historial"
              >
                <Trash2 size={18}/>
              </button>

              <button 
                onClick={toggleAnalysis}
                className="p-2.5 hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 rounded-xl transition-all"
                title="Análisis de Datos"
              >
                <BarChart2 size={18}/>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-[#0B0F1A] to-[#0d121f]">
        {mensajes && mensajes.length > 0 ? (
          mensajes.map((m, i) => (
            <ChatBubble 
              key={m.id || `msg-${i}`}
              {...m}
              onEliminar={onEliminarMensaje ? () => onEliminarMensaje(m.id) : undefined}
              esPropio={m.emisor === 'USER' || m.usuarioId === usuarioActualId}
            />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-2">
             <Bot size={40} />
             <p className="text-[10px] font-bold uppercase tracking-widest text-center">
               El historial está vacío.<br/>Inicia la conversación.
             </p>
          </div>
        )}
        
        {loading && (
          <div className="flex items-center gap-3 text-blue-400/60 animate-pulse ml-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-tighter">IA Procesando información...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FOOTER */}
      <footer className="p-4 bg-[#111827]/50 backdrop-blur-sm border-t border-gray-800/50">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex gap-3 bg-gray-900/80 border border-gray-800 rounded-2xl p-2.5 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all"
        >
          <button 
            type="button"
            onClick={handleVoz}
            className={`p-2.5 rounded-xl transition-all ${
              isListening
                ? 'text-red-500 bg-red-500/10 animate-pulse ring-2 ring-red-500/20'
                : 'text-gray-500 hover:text-white hover:bg-gray-800'
            }`}
          >
            {isListening ? <MicOff size={20}/> : <Mic size={20}/>}
          </button>

          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className="flex-1 bg-transparent outline-none px-2 text-white text-sm placeholder:text-gray-600 font-medium"
            placeholder={isEquipo ? "Enviar mensaje al grupo..." : "Escribe tu consulta..."}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 p-2.5 rounded-xl hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-20"
          >
            <Send size={20}/>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatArea;