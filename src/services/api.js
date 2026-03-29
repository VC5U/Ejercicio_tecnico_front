const API_URL = "http://localhost:8080/api/conversaciones";

export const chatService = {
  getConversaciones: async (usuarioId) => {
    const res = await fetch(`${API_URL}/usuario/${usuarioId}`);
    if (!res.ok) throw new Error("Error al obtener conversaciones");
    return res.json();
  },
  createConversacion: async (titulo, usuarioId) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, usuarioId }) 
    });
    return res.json();
  },
  

  getMensajes: async (id) => {
    const res = await fetch(`${API_URL}/${id}/mensajes`);
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
    // En api.js o donde tengas chatService
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