import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Bot, Clock, BarChart2, PlusCircle, User, Layout, Users, Edit2, Trash2  } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatService } from './services/api';


const ChatBubble = ({ emisor, contenido, timestamp, nombreUsuario }) => {
  const isUser = emisor === 'USER';
  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {!isUser && (
        <div className="flex-shrink-0 size-9 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
          <Bot className="size-5 text-gray-400" />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Nombre para el chat grupal */}
        {nombreUsuario && !isUser && <span className="text-[10px] text-gray-500 mb-1 ml-2">{nombreUsuario}</span>}
        
        <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none'}`}>
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <ReactMarkdown>{contenido}</ReactMarkdown>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-gray-500 opacity-80">
          {formatTime(timestamp)}
          {isUser && <Clock className="size-3 text-blue-400" />}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 size-9 rounded-full bg-blue-700 flex items-center justify-center border border-blue-600">
          <User className="size-5 text-blue-100" />
        </div>
      )}
    </div>
  );
};

const AnalysisCard = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-5 shadow-sm hover:border-gray-600 transition-colors">
    <div className="flex items-center gap-2.5 mb-4 text-blue-400">
      <Icon className="size-5" />
      <h3 className="font-semibold text-white text-base tracking-tight">{title}</h3>
    </div>
    <div className="text-gray-300 text-sm leading-relaxed space-y-2">
      {children}
    </div>
  </div>
);

const SentimentBadge = ({ label, score }) => {
  const colors = {
    'Positivo': 'text-green-400 bg-green-400/10 border-green-400/20',
    'Negativo': 'text-red-400 bg-red-400/10 border-red-400/20',
    'Neutral': 'text-blue-400 bg-blue-400/10 border-blue-400/20'
  };
  const safeScore = score || 0;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[label] || colors['Neutral']}`}>
          {label || 'Analizando...'}
        </span>
        <span className="text-2xl font-black text-white">{safeScore}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div className="bg-blue-600 h-full transition-all duration-1000 ease-out" style={{ width: `${safeScore}%` }} />
      </div>
    </div>
  );
};

// --- COMPONENTE LOGIN ---

const LoginScreen = ({ onLogin }) => {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleLogin = async () => {
    try {
      const resp = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (resp.ok) {
        const user = await resp.json();
        onLogin(user);
      } else {
        alert("Usuario o clave incorrectos");
      }
    } catch (err) { alert("Backend apagado"); }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
      <div className="w-96 p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center tracking-tighter">ChatIA Oficina</h2>
        <input 
          type="text" placeholder="Usuario" 
          className="w-full bg-gray-800 p-3 rounded-xl mb-4 outline-none border border-transparent focus:border-blue-500"
          onChange={e => setForm({...form, username: e.target.value})}
        />
        <input 
          type="password" placeholder="Contraseña" 
          className="w-full bg-gray-800 p-3 rounded-xl mb-6 outline-none border border-transparent focus:border-blue-500"
          onChange={e => setForm({...form, password: e.target.value})}
        />
        <button onClick={handleLogin} className="w-full bg-blue-600 p-3 rounded-xl font-bold hover:bg-blue-500 transition-all active:scale-95">
          Entrar al Sistema
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE CHAT GRUPAL ---

const GroupChatView = ({ usuarioActual }) => {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMsg, setNuevoMsg] = useState("");
  const endRef = useRef(null);

  // 1. CARGAR HISTORIAL (Solo una vez al montar o si cambia el usuario)
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/chat-grupal/historial');
        const data = await res.json();
        
        const historialFormateado = data.map(m => ({
          // Identificamos si el mensaje es nuestro o de alguien más
          emisor: m.usuario.id === usuarioActual.id ? 'USER' : 'OTHER', 
          contenido: m.contenido,
          timestamp: m.fechaEnvio,
          nombreUsuario: m.usuario.username // O m.usuario.nombre, según tu entidad
        }));
        setMensajes(historialFormateado);
      } catch (err) {
        console.error("Error cargando historial:", err);
      }
    };

    if (usuarioActual?.id) {
      cargarHistorial();
    }
  }, [usuarioActual.id]);

  // 2. AUTO-SCROLL al recibir nuevos mensajes
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // 3. ENVIAR MENSAJE
  const enviarGrup = async () => {
    if (!nuevoMsg.trim()) return;

    try {
      const resp = await fetch(`http://localhost:8080/api/chat-grupal/enviar/${usuarioActual.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: nuevoMsg }) 
      });

      if (resp.ok) {
        const msgGuardado = await resp.json();
        
        // Agregamos el mensaje a la lista local con el formato correcto
        setMensajes(prev => [...prev, {
          emisor: 'USER',
          contenido: msgGuardado.contenido,
          timestamp: msgGuardado.fechaEnvio,
          nombreUsuario: usuarioActual.username
        }]);
        setNuevoMsg("");
      }
    } catch (err) {
      console.error("Error al enviar mensaje grupal:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* HEADER DEL CHAT */}
      <div className="p-4 border-b border-gray-800 bg-gray-950/40 flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold">Chat de Equipo</h1>
          <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Comunicación Interna</p>
        </div>
        <div className="text-right">
           <span className="text-[10px] text-gray-500 block uppercase">Estado del Equipo</span>
           <span className="text-sm font-bold text-green-400">En Línea</span>
        </div>
      </div>
      
      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
        {mensajes.length === 0 ? (
          <div className="text-center text-gray-600 mt-10 text-sm italic">
            No hay mensajes en el equipo aún...
          </div>
        ) : (
          mensajes.map((m, i) => (
            <ChatBubble 
              key={i} 
              emisor={m.emisor} 
              contenido={m.contenido} 
              timestamp={m.timestamp} 
              nombreUsuario={m.nombreUsuario} 
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* INPUT DE TEXTO */}
      <div className="p-5 bg-gray-950/80 border-t border-gray-800 flex gap-3">
        <input 
          value={nuevoMsg} 
          onChange={e => setNuevoMsg(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && enviarGrup()}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          placeholder="Escribe un mensaje al equipo..."
        />
        <button 
          onClick={enviarGrup} 
          className="bg-purple-600 p-3 rounded-xl hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-900/20"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [view, setView] = useState('ia'); 

  const [conversaciones, setConversaciones] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  
  const messagesEndRef = useRef(null);
  const selectedConv = conversaciones.find(c => c.id === selectedId);

  // Estados para Edición
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoTituloEdit, setNuevoTituloEdit] = useState("");

  // --- EFECTOS ---
  useEffect(() => {
    if (usuario?.id) {
      chatService.getConversaciones(usuario.id).then(data => {
        setConversaciones(data);
        if (data.length > 0) setSelectedId(data[0].id);
      });
    }
  }, [usuario, view]);

  useEffect(() => {
    if (selectedId && view === 'ia') {
      chatService.getMensajes(selectedId).then(setMensajes);
    }
  }, [selectedId, view]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // --- FUNCIONES CRUD ---
  const handleNuevoChat = async () => {
    try {
      const titulo = `Nuevo Caso #${conversaciones.length + 1}`;
      const nuevaConv = { titulo, usuario: { id: usuario.id } };
      const res = await fetch('http://localhost:8080/api/conversaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaConv)
      });
      if (res.ok) {
        const data = await res.json();
        setConversaciones([data, ...conversaciones]);
        setSelectedId(data.id);
        setMensajes([]);
      }
    } catch (error) { console.error(error); }
  };

  const manejarBorrado = async (id) => {
    if (!window.confirm("¿Eliminar esta conversación?")) return;
    try {
      const exito = await chatService.deleteConversacion(id);
      if (exito) {
        const nuevas = conversaciones.filter(c => c.id !== id);
        setConversaciones(nuevas);
        if (selectedId === id) setSelectedId(nuevas[0]?.id || null);
      }
    } catch (error) { console.error(error); }
  };

  const manejarEdicion = (conv) => {
    setEditandoId(conv.id);
    setNuevoTituloEdit(conv.titulo);
  };

  const guardarEdicion = async (id) => {
    if (!nuevoTituloEdit.trim()) { setEditandoId(null); return; }
    try {
      const actualizada = await chatService.updateConversacion(id, nuevoTituloEdit);
      setConversaciones(conversaciones.map(c => c.id === id ? actualizada : c));
      setEditandoId(null);
    } catch (error) { console.error(error); }
  };

  const enviar = async () => {
    if (!nuevoMensaje.trim() || !selectedId || loading) return;
    const texto = nuevoMensaje;
    setNuevoMensaje("");
    setLoading(true);
    try {
      setMensajes(prev => [...prev, { emisor: 'USER', contenido: texto, timestamp: new Date().toISOString() }]);
      await chatService.sendMessage(selectedId, "USER", texto);
      const [nuevosMsgs, nuevasConvs] = await Promise.all([
        chatService.getMensajes(selectedId),
        chatService.getConversaciones(usuario.id)
      ]);
      setMensajes(nuevosMsgs);
      setConversaciones(nuevasConvs);
    } finally { setLoading(false); }
  };

  if (!usuario) return <LoginScreen onLogin={setUsuario} />;

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-80 border-r border-gray-800 flex flex-col p-4 bg-gray-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40"><Layout size={20} /></div>
          <h2 className="font-bold text-lg tracking-tight">ChatIA Oficina</h2>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-gray-900/50 rounded-xl border border-gray-800">
          <button onClick={() => setView('ia')} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${view === 'ia' ? 'bg-blue-600' : 'text-gray-500'}`}><Bot size={14} /> IA Chat</button>
          <button onClick={() => setView('grupal')} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${view === 'grupal' ? 'bg-purple-600' : 'text-gray-500'}`}><Users size={14} /> Equipo</button>
        </div>

        {view === 'ia' && (
          <>
            <button onClick={handleNuevoChat} className="w-full bg-blue-600 hover:bg-blue-700 p-3.5 rounded-xl mb-6 flex items-center justify-center gap-2 font-semibold shadow-lg active:scale-95 transition-all">
              <PlusCircle size={19} /> Nuevo Chat
            </button>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {conversaciones.map(conv => (
                <div key={conv.id} className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all border ${selectedId === conv.id ? 'bg-gray-800 border-gray-700' : 'hover:bg-gray-900/60 border-transparent'}`}>
                  {editandoId === conv.id ? (
                    <input 
                      autoFocus value={nuevoTituloEdit} 
                      onChange={e => setNuevoTituloEdit(e.target.value)}
                      onBlur={() => guardarEdicion(conv.id)}
                      onKeyDown={e => e.key === 'Enter' && guardarEdicion(conv.id)}
                      className="flex-1 bg-gray-900 border border-blue-500 rounded px-2 py-1 text-sm outline-none"
                    />
                  ) : (
                    <>
                      <div onClick={() => setSelectedId(conv.id)} className="flex-1 cursor-pointer truncate">
                        <p className={`text-sm font-semibold truncate ${selectedId === conv.id ? 'text-white' : 'text-gray-400'}`}>{conv.titulo}</p>
                        <p className="text-[11px] text-gray-500 italic truncate">{conv.resumenIA || "Inicia el chat..."}</p>
                      </div>
                      <div className="hidden group-hover:flex gap-2 ml-2">
                        <button onClick={() => manejarEdicion(conv)} className="text-gray-500 hover:text-blue-400"><Edit2 size={14} /></button>
                        <button onClick={() => manejarBorrado(conv.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        {view === 'ia' ? (
          selectedId ? (
            <>
              <div className={`flex flex-col transition-all duration-500 ${showAnalysisPanel ? 'w-2/3' : 'w-full'} bg-gray-900`}>
                <div className="p-4 border-b border-gray-800 bg-gray-950/40 flex justify-between items-center">
                  <h1 className="text-base font-bold">{selectedConv?.titulo}</h1>
                  <button onClick={() => setShowAnalysisPanel(!showAnalysisPanel)} className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-700 transition-all">
                    <BarChart2 size={14} className="inline mr-1" /> {showAnalysisPanel ? 'Ocultar Análisis' : 'Ver Análisis'}
                  </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                  {mensajes.map((m, i) => <ChatBubble key={i} {...m} />)}
                  {loading && <div className="text-blue-400 text-xs animate-pulse font-bold ml-12">La IA está procesando...</div>}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-5 bg-gray-950/80 border-t border-gray-800 flex gap-3">
                  <input value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} onKeyPress={e => e.key === 'Enter' && enviar()} className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm" placeholder="Consulta a la IA..." />
                  <button onClick={enviar} className="bg-blue-600 p-3 rounded-xl hover:bg-blue-500 transition-all"><Send size={20} /></button>
                </div>
              </div>
              {showAnalysisPanel && (
                <div className="w-1/3 p-6 space-y-6 overflow-y-auto bg-gray-950/30 border-l border-gray-800/50">
                  <div className="flex items-center gap-2.5 mb-2"><Sparkles className="size-5 text-yellow-500" /><h2 className="text-lg font-bold">Insights</h2></div>
                  <AnalysisCard title="Resumen IA" icon={MessageSquare}><p className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 text-xs italic text-gray-400">{selectedConv?.resumenIA || "Esperando datos..."}</p></AnalysisCard>
                  <AnalysisCard title="Sentimiento" icon={BarChart2}><SentimentBadge label={selectedConv?.sentimientoLabel} score={selectedConv?.sentimientoScore} /></AnalysisCard>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 opacity-20"><Bot size={80} /><p className="mt-4">Selecciona un chat para comenzar</p></div>
          )
        ) : (
          <GroupChatView usuarioActual={usuario} />
        )}
      </div>
    </div>
  );
}

export default App;