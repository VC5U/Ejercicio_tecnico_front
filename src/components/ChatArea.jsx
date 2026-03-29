import React, { useRef, useEffect, useState } from 'react';
import { Send, Bot, Smile, BarChart2, Trash2, Mic, MicOff } from 'lucide-react';
import ChatBubble from './ChatBubble';

const ChatArea = ({ view, selectedId, selectedConv, mensajes, onEnviar, onEliminarMensaje, usuarioActualId, loading, toggleAnalysis, onBorrarTodaIA }) => {
  const [input, setInput] = useState("");
  const [felicidad, setFelicidad] = useState(0.5);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const isEquipo = view === 'equipo';

  useEffect(() => {
    if (isEquipo) {
      fetch('http://localhost:8080/api/chat-grupal/sentimiento-equipo')
        .then(res => res.json()).then(data => setFelicidad(data)).catch(() => setFelicidad(0.1));
    }
  }, [isEquipo, mensajes]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes]);

  // Lógica de Voz a Texto
  const handleVoz = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu dispositivo no soporta dictado por voz.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) { onEnviar(input); setInput(""); }
  };

  if (!isEquipo && !selectedId) return <div className="flex-1 flex items-center justify-center opacity-20"><Bot size={80}/></div>;

  return (
    <div className="flex-1 flex flex-col bg-[#0B0F1A]">
      <header className="p-4 bg-[#111827] border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="font-bold uppercase tracking-widest text-blue-400 text-xs">
            {isEquipo ? "OFICINA GENERAL" : selectedConv?.titulo}
          </h2>
          {isEquipo && (
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full">
              <Smile size={14} className="text-yellow-400" />
              <span className="text-[10px] font-bold">Satisfacción: {Math.round(felicidad * 100)}%</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isEquipo && (
            <>
              <button 
                onClick={() => onBorrarTodaIA(selectedId)}
                className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                title="Eliminar conversación completa"
              >
                <Trash2 size={18}/>
              </button>
              <button onClick={toggleAnalysis} className="p-2 hover:bg-gray-800 text-gray-400 rounded-lg transition-colors">
                <BarChart2 size={18}/>
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {mensajes.map((m, i) => (
          <ChatBubble 
            key={m.id || i} {...m} 
            onEliminar={() => onEliminarMensaje(m.id)}
            esPropio={m.usuarioId === usuarioActualId || m.emisor === 'USER'}
          />
        ))}
        <div ref={scrollRef} />
      </div>

      <footer className="p-4 bg-[#111827]">
        <form onSubmit={handleSubmit} className="flex gap-2 bg-gray-900 border border-gray-800 rounded-2xl p-2 focus-within:border-blue-500 transition-all shadow-inner">
          <button 
            type="button"
            onClick={handleVoz}
            className={`p-2 rounded-xl transition-all ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
          >
            {isListening ? <MicOff size={20}/> : <Mic size={20}/>}
          </button>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            className="flex-1 bg-transparent outline-none px-2 text-white text-sm" 
            placeholder={isEquipo ? "Mensaje al equipo..." : "Pregunta o dicta a la IA..."} 
          />
          <button type="submit" className="bg-blue-600 p-2.5 rounded-xl hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <Send size={18}/>
          </button>
        </form>
      </footer>
    </div>
  );
};
export default ChatArea;