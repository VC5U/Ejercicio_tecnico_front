import React, { useState, useEffect } from 'react';

const CustomDialog = ({ isOpen, onClose, onConfirm, title, placeholder }) => {
  const [val, setVal] = useState("");

  useEffect(() => { if (isOpen) setVal(""); }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-sm animate-in zoom-in duration-200">
        <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 text-center">
          {title}
        </h3>
        
        <input 
          autoFocus
          className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white mb-8 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-center text-sm"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && (onConfirm(val), onClose())}
        />

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => { onConfirm(val); onClose(); }}
            className="w-full bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95"
          >
            Confirmar Registro
          </button>
          <button 
            onClick={onClose} 
            className="w-full py-2 text-[10px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomDialog;