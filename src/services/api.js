// src/services/api.js

const API_URL = "http://localhost:8080/api/conversaciones";

// Centralización de la lógica de respuesta con manejo de errores robusto
const handleResponse = async (res) => {
  if (!res.ok) {
    let errorMsg = `Error ${res.status}: `;
    try {
      const data = await res.json();
      errorMsg += data.error || data.message || "Petición fallida";
    } catch {
      errorMsg += res.statusText || "Error desconocido";
    }
    console.error("API Error:", errorMsg);
    throw new Error(errorMsg);
  }
  
  if (res.status === 204) return null;
  
  // Verificamos si hay contenido antes de intentar parsear JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return null;
};

export const chatService = {

  // -------------------- CONVERSACIONES --------------------

  getConversaciones: async (usuarioId) => {
    if (!usuarioId) return []; // Retorno seguro
    try {
      const res = await fetch(`${API_URL}/usuario/${usuarioId}`);
      return await handleResponse(res);
    } catch (err) {
      return []; // Si falla, devolvemos array vacío para no romper el Sidebar
    }
  },

  crearConversacion: async (usuarioId, titulo) => {
    if (!usuarioId || !titulo) throw new Error("Datos insuficientes");
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo,
        usuario: { id: usuarioId }
      })
    });
    return handleResponse(res);
  },

  // -------------------- MENSAJES --------------------

  getMensajes: async (convId, usuarioId) => {
    if (!convId || !usuarioId) return []; // Evita peticiones basura
    try {
      const res = await fetch(`${API_URL}/${convId}/mensajes?usuarioId=${usuarioId}`);
      const data = await handleResponse(res);
      return Array.isArray(data) ? data : []; // Garantiza que sea un array
    } catch (err) {
      return [];
    }
  },

  sendMessage: async (convId, usuarioId, emisor, contenido) => {
    if (!convId || !usuarioId || !contenido) return null;
    
    const params = new URLSearchParams({ usuarioId });
    const res = await fetch(
      `${API_URL}/${convId}/mensajes?${params}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emisor, contenido })
      }
    );
    return handleResponse(res);
  },

  // -------------------- ACCIONES --------------------

  deleteConversacion: async (id, usuarioId) => {
    if (!id || !usuarioId) return;
    const res = await fetch(
      `${API_URL}/${id}?usuarioId=${usuarioId}`,
      { method: 'DELETE' }
    );
    return handleResponse(res);
  },

  updateConversacion: async (id, usuarioId, titulo) => {
    if (!id || !usuarioId || !titulo) return;
    const res = await fetch(
      `${API_URL}/${id}?usuarioId=${usuarioId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo })
      }
    );
    return handleResponse(res);
  },

  clearChatMessages: async (id, usuarioId) => {
    if (!id || !usuarioId) return;
    const res = await fetch(
      `${API_URL}/${id}/mensajes/clear?usuarioId=${usuarioId}`,
      { method: 'DELETE' }
    );
    return handleResponse(res);
  }
};