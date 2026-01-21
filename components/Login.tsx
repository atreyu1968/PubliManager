import React, { useState } from 'react';

interface Props {
  onLogin: () => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pass) return;
    
    setIsLoading(true);
    setTimeout(() => {
      if (pass === 'admin') {
        onLogin();
      } else {
        setError(true);
        setIsLoading(false);
        setPass('');
        setTimeout(() => setError(false), 3000);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center p-6 selection:bg-[#1CB5B1] selection:text-white overflow-hidden">
      
      <div className="w-full max-w-[440px] fade-in flex flex-col items-center">
        
        {/* LOGOTIPO ASD RECONSTRUIDO FIELMENTE */}
        <div className="mb-16 transform scale-125">
          <svg width="280" height="120" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradCyan" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2AD1CD" />
                <stop offset="100%" stopColor="#1B8A8E" />
              </linearGradient>
              <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F99F2A" />
                <stop offset="100%" stopColor="#E25424" />
              </linearGradient>
              <linearGradient id="gradShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#146669" />
                <stop offset="100%" stopColor="#0B3D40" />
              </linearGradient>
            </defs>
            
            {/* Letra A - Fluida */}
            <path d="M20 100L55 20L90 100H70L65 85H45L40 100H20ZM55 50L60 70H50L55 50Z" fill="url(#gradCyan)" />
            
            {/* Letra S - Ribbon Effect */}
            <path d="M100 80C100 95 115 105 135 105C155 105 165 95 165 80C165 70 155 65 135 60C115 55 105 50 105 40C105 30 115 20 135 20C155 20 165 30 165 40H145C145 35 140 32 135 32C130 32 125 35 125 40C125 45 130 48 140 52C155 58 175 65 175 82C175 100 155 115 135 115C115 115 95 105 95 82H100Z" fill="#1CB5B1" />
            <path d="M95 82C95 105 115 115 135 115V105C120 105 100 95 100 82H95Z" fill="url(#gradShadow)" />
            
            {/* Letra D - Bold Rounded */}
            <path d="M185 20H220C255 20 275 40 275 67C275 94 255 115 220 115H185V20ZM205 35V100H220C240 100 255 90 255 67C255 45 240 35 220 35H205Z" fill="url(#gradOrange)" />
          </svg>
        </div>

        {/* MARCA NOMINAL - CONTRASTE MÁXIMO */}
        <div className="text-center mb-12">
          <h2 className="text-white text-[13px] font-black uppercase tracking-[0.8em] mb-3 opacity-100">
            Atreyu Servicios Digitales
          </h2>
          <div className="h-[3px] w-16 bg-[#F99F2A] mx-auto"></div>
        </div>

        {/* FORMULARIO DE ACCESO TÉCNICO */}
        <div className="w-full space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input 
                type="password" 
                placeholder="PASSWORD"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                disabled={isLoading}
                autoFocus
                className={`w-full bg-black border-2 ${error ? 'border-red-600' : 'border-white focus:border-[#2AD1CD]'} py-5 px-8 text-white text-center font-black text-xl tracking-[0.6em] transition-all outline-none placeholder:text-zinc-800 placeholder:tracking-widest focus:ring-8 focus:ring-white/5`}
              />
              {isLoading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <i className="fa-solid fa-circle-notch animate-spin text-white opacity-50"></i>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading || !pass}
              className="w-full bg-white text-black py-5 font-black text-sm uppercase tracking-[0.5em] hover:bg-[#F99F2A] hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-10"
            >
              AUTORIZAR ENTRADA
            </button>
          </form>

          {error && (
            <div className="py-4 text-center">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-600/10 px-4 py-2">
                ACCESO RESTRINGIDO: CLAVE INCORRECTA
              </span>
            </div>
          )}
        </div>

        {/* FOOTER CORPORATIVO */}
        <footer className="mt-24 text-center opacity-30 group hover:opacity-100 transition-opacity">
          <p className="text-white text-[9px] font-bold uppercase tracking-[0.4em] mb-4">
            SISTEMA INTEGRAL DE GESTIÓN EDITORIAL
          </p>
          <div className="flex items-center justify-center gap-4">
             <div className="h-px w-8 bg-white/20"></div>
             <span className="text-[8px] text-white font-black uppercase tracking-widest">ASD ATREYU &copy; {new Date().getFullYear()}</span>
             <div className="h-px w-8 bg-white/20"></div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;