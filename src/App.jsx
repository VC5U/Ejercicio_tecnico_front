import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AnalysisPanel from './components/AnalysisPanel';
import AuthScreen from './components/AuthScreen'; 
import CalendarioView from './components/CalendarioView'; 
import { chatService } from './services/api';
import CustomDialog from './components/CustomDialog';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [view, setView] = useState('ia'); 
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  
  // ESTADO PARA EL CALENDARIO
  const [tareasCalendario, setTareasCalendario] = useState([]);

  // ESTADOS DIÁLOGO
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: "", placeholder: "", onConfirm: () => {} });

  const selectedConv = conversaciones.find(c => c.id === selectedId);

  // 1. Cargar datos iniciales
  useEffect(() => {
    const guardadas = localStorage.getItem('tareas_calendario');
    if (guardadas) setTareasCalendario(JSON.parse(guardadas));

    const savedUser = localStorage.getItem('user_oficina');
    if (savedUser) setUsuario(JSON.parse(savedUser));
  }, []);

  // 2. Guardar automáticamente tareas
  useEffect(() => {
    localStorage.setItem('tareas_calendario', JSON.stringify(tareasCalendario));
  }, [tareasCalendario]);

  // --- LÓGICA DE AGENDAR ---
  const handleAbrirAgendar = (textoTarea) => {
    setDialogConfig({
      title: "Fecha de Entrega",
      placeholder: "Ej: 2026-03-30",
      onConfirm: (fecha) => {
        if(!fecha) return;
        const nuevaTarea = { 
          id: Date.now(), 
          texto: textoTarea, 
          fecha: fecha, 
          completada: false 
        };
        setTareasCalendario(prev => [...prev, nuevaTarea]);
        setNotificacion("Tarea añadida al calendario 📅");
      }
    });
    setIsDialogOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setUsuario(user);
    localStorage.setItem('user_oficina', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('user_oficina');
    setNotificacion("Sesión cerrada");
  };

  const cargarConversaciones = async () => {
    if (!usuario) return;
    try {
      const data = await chatService.getConversaciones(usuario.id);
      setConversaciones(data || []);
    } catch (err) { setError("Error al conectar con el servidor."); }
  };

  useEffect(() => { if (usuario) cargarConversaciones(); }, [usuario]);

  // 3. CARGAR MENSAJES (Corregido con usuario.id)
  useEffect(() => {
    const cargarMensajes = async () => {
      if (!usuario) return;
      if (view === 'ia' && !selectedId) { setMensajes([]); return; }
      
      setLoading(true);
      try {
        if (view === 'ia') {
          // CORRECCIÓN: Se añade usuario.id
          const data = await chatService.getMensajes(selectedId, usuario.id);
          setMensajes(data || []);
        } else if (view === 'equipo') {
          const res = await fetch('http://localhost:8080/api/chat-grupal/historial');
          const data = await res.json();
          setMensajes(data.map(m => ({
            id: m.id,
            emisor: m.usuario.id === usuario.id ? 'USER' : 'OTHER', 
            contenido: m.contenido,
            nombreUsuario: m.usuario.username
          })));
        }
      } catch (err) { 
        setError("No se pudieron cargar los mensajes."); 
        setMensajes([]); 
      } finally { setLoading(false); }
    };
    cargarMensajes();
  }, [selectedId, view, usuario]);

  // CRUD CHATS (Corregidos con usuario.id)
  const handleNuevoChat = () => {
    setDialogConfig({
      title: "Nuevo Registro",
      placeholder: "Nombre del caso...",
      onConfirm: async (titulo) => {
        try {
          const nuevo = await chatService.crearConversacion(usuario.id, titulo);
          await cargarConversaciones();
          setSelectedId(nuevo.id);
        } catch (err) { setError("Error al crear."); }
      }
    });
    setIsDialogOpen(true);
  };

  const handleEditarChat = (conv) => {
    setDialogConfig({
      title: "Editar Nombre",
      placeholder: conv.titulo,
      onConfirm: async (nuevoTitulo) => {
        try {
          // CORRECCIÓN: Se añade usuario.id
          await chatService.updateConversacion(conv.id, usuario.id, nuevoTitulo);
          await cargarConversaciones();
        } catch (err) { setError("Error al editar."); }
      }
    });
    setIsDialogOpen(true);
  };

  const handleBorrarChat = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    try {
      // CORRECCIÓN: Se añade usuario.id
      await chatService.deleteConversacion(id, usuario.id);
      if (selectedId === id) setSelectedId(null);
      await cargarConversaciones();
    } catch (err) { setError("Error al borrar."); }
  };

  const handleEnviar = async (texto) => {
    if (!texto.trim() || !usuario) return;
    try {
      if (view === 'ia') {
        // Optimismo: mostrar mensaje del usuario inmediatamente
        setMensajes(prev => [...prev, { emisor: 'USER', contenido: texto }]);
        
        // CORRECCIÓN: Orden de parámetros correcto según tu api.js
        // sendMessage(convId, usuarioId, emisor, contenido)
        await chatService.sendMessage(selectedId, usuario.id, "USER", texto);
        
        const data = await chatService.getMensajes(selectedId, usuario.id);
        setMensajes(data);
      } else {
        const resp = await fetch(`http://localhost:8080/api/chat-grupal/enviar/${usuario.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contenido: texto })
        });
        if (resp.ok) {
          const msg = await resp.json();
          setMensajes(prev => [...prev, { 
            id: msg.id, 
            emisor: 'USER', 
            contenido: msg.contenido, 
            nombreUsuario: usuario.username 
          }]);
        }
      }
    } catch (err) { setError("Error al enviar."); }
  };

  const handleClearIA = async (id) => {
    if (!window.confirm("¿Limpiar todo el historial de este chat?")) return;
    try {
      await chatService.clearChatMessages(id, usuario.id);
      setMensajes([]);
      setNotificacion("Historial limpio");
    } catch (err) { setError("Error al limpiar."); }
  };

  if (!usuario) return <AuthScreen onLogin={handleLoginSuccess} />;

  return (
    <div className="flex h-screen w-full bg-[#111827] text-gray-100 overflow-hidden text-sm">
      <Sidebar 
        view={view} 
        setView={(v) => { setView(v); setSelectedId(null); }} 
        conversaciones={conversaciones} 
        selectedId={selectedId} 
        setSelectedId={setSelectedId}
        onNuevoChat={handleNuevoChat}
        onBorrar={handleBorrarChat}
        onEditar={handleEditarChat}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex overflow-hidden border-x border-gray-800/50">
        {view === 'calendario' ? (
          <CalendarioView 
            tareas={tareasCalendario} 
            setTareas={setTareasCalendario} 
          />
        ) : (
          <ChatArea 
            view={view} 
            selectedId={selectedId}
            selectedConv={selectedConv}
            mensajes={mensajes} 
            onEnviar={handleEnviar} 
            usuarioActualId={usuario.id} 
            loading={loading}
            toggleAnalysis={() => setShowAnalysis(!showAnalysis)}
            onBorrarTodaIA={handleClearIA}
          />
        )}
      </main>

      {showAnalysis && view !== 'calendario' && (
        <AnalysisPanel 
          view={view} 
          selectedConv={selectedConv} 
          mensajes={mensajes} 
          onAgendar={handleAbrirAgendar} 
        />
      )}

      <CustomDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={dialogConfig.title}
        placeholder={dialogConfig.placeholder}
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  );
}

export default App;