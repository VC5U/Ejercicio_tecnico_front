import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Determinamos la URL según si es Login o Registro
    const endpoint = isLogin ? 'login' : 'registro';
    const url = `http://localhost:8080/api/auth/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const user = await response.json();
        // Llamamos a la función onLogin de App.js con los datos reales del usuario
        onLogin(user); 
      } else {
        const data = await response.json();
        setError(data.message || 'Error en la autenticación');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor de Spring Boot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F1A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-2xl">
        
        {/* LOGO Y TÍTULO */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? 'Bienvenida de nuevo' : 'Crear cuenta nueva'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">Panel Administrativo de Oficina</p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
              <input 
                type="email" required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all mt-1"
                placeholder="correo@oficina.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Usuario</label>
            <input 
              type="text" required
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all mt-1"
              placeholder="Ej: adriana_admin"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Contraseña</label>
            <input 
              type="password" required
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all mt-1"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isLogin ? <><LogIn size={18}/> Entrar</> : <><UserPlus size={18}/> Registrarme</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); // Limpiamos errores al cambiar de modo
            }}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;