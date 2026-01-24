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
    // Simulación de verificación de seguridad ASD
    setTimeout(() => {
      if (pass.toLowerCase() === 'admin') {
        onLogin();
      } else {
        setError(true);
        setIsLoading(false);
        setPass('');
        setTimeout(() => setError(false), 3000);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#000000] flex flex-col items-center justify-center p-6 selection:bg-[#F99F2A] selection:text-white overflow-hidden">
      
      {/* Elementos de fondo sutiles */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#1CB5B1] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#F99F2A] blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[420px] fade-in flex flex-col items-center relative z-10">
        
        {/* LOGOTIPO ASD - RECONSTRUCCIÓN EXACTA */}
        <div className="mb-14 transform scale-110">
          <svg width="280" height="110" viewBox="0 0 280 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoCyan" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1CB5B1" />
                <stop offset="100%" stopColor="#148380" />
              </linearGradient>
              <linearGradient id="logoOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F99F2A" />
                <stop offset="100%" stopColor="#E25424" />
              </linearGradient>
              <linearGradient id="logoShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D5A58" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#062E2D" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            
            {/* Letra A - Redondeada y fluida */}
            <path d="M15 95L50 15C52 10 58 10 60 15L95 95H75L55 50L35 95H15Z" fill="url(#logoCyan)" />
            <path d="M45 75H65L60 85H50L45 75Z" fill="white" fillOpacity="0.2" />
            
            {/* Letra S - Efecto Cinta (Ribbon) */}
            <path d="M100 80C100 95 115 105 135 105C155 105 165 95 165 80C165 70 155 65 135 60C115 55 105 50 105 40C105 30 115 20 135 20C155 20 165 30 165 40H145C145 35 140 32 135 32C130 32 125 35 125 40C125 45 130 48 140 52C155 58 175 65 175 82C175 100 155 115 135 115C115 115 95 105 95 82H100Z" fill="#1CB5B1" />
            {/* Sombra de la cinta */}
            <path d="M95 82C95 105 115 115 135 115V105C120 105 100 95 100 82H95Z" fill="url(#logoShadow)" />
            
            {/* Letra D - Sólida Naranja */}
            <path d="M185 15H225C255 15 275 35 275 60C275 85 255 105 225 105H185V15ZM205 30V90H225C245 90 255 80 255 60C255 40 245 30 225 30H205Z" fill="url(#logoOrange)" />
          </svg>
        </div>

        {/* IDENTIDAD CORPORATIVA */}
        <div className="text-center mb-10">
          <h2 className="text-white text-[12px] font-black uppercase tracking-[0.7em] mb-2 opacity-90">
            Atreyu Servicios Digitales
          </h2>
          <div className="h-[2px] w-12 bg-white/20 mx-auto"></div>
        </div>

        {/* FORMULARIO DE ACCESO */}
        <div className="w-full space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <input 
                type="password" 
                placeholder="CLAVE DE ACCESO"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                disabled={isLoading}
                autoFocus
                className={`w-full bg-black border-2 ${error ? 'border-red-600' : 'border-white focus:border-[#F99F2A]'} py-5 px-8 text-white text-center font-black text-lg tracking-[0.5em] transition-all outline-none focus:ring-8 focus:ring-white/5 placeholder:text-zinc-800 placeholder:tracking-widest`}
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
              className="w-full bg-white text-black py-5 font-black text-[11px] uppercase tracking-[0.6em] hover:bg-[#F99F2A] hover:text-white transition-all duration-500 active:scale-95 disabled:opacity-5"
            >
              INICIAR SESIÓN SEGURA
            </button>
          </form>

          {error ? (
            <div className="bg-red-600/10 border border-red-600/30 py-3 text-center">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                ERROR: CREDENCIALES INVÁLIDAS
              </span>
            </div>
          ) : (
            <p className="text-[9px] text-zinc-600 text-center uppercase font-bold tracking-widest pt-2">
              Clave por defecto: <span className="text-zinc-400">admin</span>
            </p>
          )}
        </div>

        {/* FOOTER TÉCNICO */}
        <footer className="mt-20 flex flex-col items-center opacity-20">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-px w-10 bg-white"></div>
            <i className="fa-solid fa-shield-halved text-white text-xs"></i>
            <div className="h-px w-10 bg-white"></div>
          </div>
          <p className="text-white text-[8px] font-black uppercase tracking-[0.4em] text-center leading-loose">
            PROPIEDAD DE ASD ATREYU <br/> 
            SISTEMA INTEGRAL V2.5
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;