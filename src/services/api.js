// src/services/api.js
const API_URL = "http://localhost:8080/api/conversaciones";

export const chatService = {
  getConversaciones: async (usuarioId) => {
    const res = await fetch(`${API_URL}/usuario/${usuarioId}`);
    if (!res.ok) throw new Error("Error al obtener conversaciones");
    return res.json();
  },

  crearConversacion: async (usuarioId, titulo) => { 
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, usuarioId }) 
    });
    if (!res.ok) throw new Error("Error al crear");
    return res.json();
  },

  getMensajes: async (id) => {
    const res = await fetch(`${API_URL}/${id}/mensajes`);
    if (!res.ok) return [];
    return res.json();
  },

  sendMessage: async (id, emisor, contenido) => {
    const res = await fetch(`${API_URL}/${id}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emisor, contenido })
    });
    return res.json();
  },

  deleteConversacion: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  updateConversacion: async (id, titulo) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo })
    });
    return res.json();
  }
};