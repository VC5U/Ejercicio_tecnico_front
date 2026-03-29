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
  
  // ESTADO ÚNICO DE TAREAS (Persistente)
  const [tareas, setTareas] = useState([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: "", placeholder: "", onConfirm: () => {} });

  const selectedConv = conversaciones.find(c => c.id === selectedId);

  // Cargar usuario y tareas al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('user_oficina');
    if (savedUser) setUsuario(JSON.parse(savedUser));
    
    const guardadas = localStorage.getItem('tareas-oficina');
    if (guardadas) setTareas(JSON.parse(guardadas));
  }, []);

  // Guardar tareas automáticamente cuando cambien
  useEffect(() => {
    localStorage.setItem('tareas-oficina', JSON.stringify(tareas));
  }, [tareas]);

  // Lógica para agendar desde la IA (AnalysisPanel)
  const handleAbrirAgendar = (textoTarea) => {
    setDialogConfig({
      title: "Fecha de Entrega",
      placeholder: "Formato: YYYY-MM-DD",
      onConfirm: (fecha) => {
        if(!fecha) return;
        const nuevaTarea = { 
          id: Date.now(), 
          texto: textoTarea, 
          fecha: fecha, 
          completada: false 
        };
        setTareas(prev => [...prev, nuevaTarea]);
        setNotificacion("Tarea añadida al calendario 📅");
      }
    });
    setIsDialogOpen(true);
  };

  // --- Lógica de Autenticación y Chats ---
  const handleLoginSuccess = (user) => {
    setUsuario(user);
    localStorage.setItem('user_oficina', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('user_oficina');
  };

  const cargarConversaciones = async () => {
    if (!usuario) return;
    try {
      const data = await chatService.getConversaciones(usuario.id);
      setConversaciones(data || []);
    } catch (err) { setError("Error de conexión"); }
  };

  useEffect(() => { if (usuario) cargarConversaciones(); }, [usuario]);

  useEffect(() => {
    const cargarMensajes = async () => {
      if (!usuario || (view === 'ia' && !selectedId)) { setMensajes([]); return; }
      setLoading(true);
      try {
        if (view === 'ia') {
          const data = await chatService.getMensajes(selectedId);
          setMensajes(data || []);
        }
      } catch (err) { setError("Error al cargar mensajes"); } 
      finally { setLoading(false); }
    };
    cargarMensajes();
  }, [selectedId, view, usuario]);

  if (!usuario) return <AuthScreen onLogin={handleLoginSuccess} />;

  return (
    <div className="flex h-screen w-full bg-[#111827] text-gray-100 overflow-hidden text-sm">
      <Sidebar 
        view={view} 
        setView={(v) => { setView(v); setSelectedId(null); }} 
        conversaciones={conversaciones} 
        selectedId={selectedId} 
        setSelectedId={setSelectedId}
        onNuevoChat={() => {/* lógica de diálogo */}}
        onBorrar={async (id) => {/* lógica borrar */}}
        onEditar={(conv) => {/* lógica editar */}}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex overflow-hidden border-x border-gray-800/50">
        {view === 'calendario' ? (
          <CalendarioView tareas={tareas} setTareas={setTareas} />
        ) : (
          <ChatArea 
            view={view} 
            selectedId={selectedId}
            selectedConv={selectedConv}
            mensajes={mensajes} 
            onEnviar={() => {}} 
            usuarioActualId={usuario.id} 
            loading={loading}
            toggleAnalysis={() => setShowAnalysis(!showAnalysis)}
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