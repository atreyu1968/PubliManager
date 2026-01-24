
import React, { useState } from 'react';
import { ASDLogo } from '../App';

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
      
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#1CB5B1] blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#F99F2A] blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[420px] fade-in flex flex-col items-center relative z-10">
        
        {/* LOGOTIPO DINÁMICO */}
        <div className="mb-14 transform scale-125">
          <ASDLogo className="w-[200px] h-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-white text-[10px] font-black uppercase tracking-[0.7em] mb-2 opacity-60">
            Atreyu Servicios Digitales
          </h2>
          <div className="h-[1px] w-12 bg-white/20 mx-auto"></div>
        </div>

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
                className={`w-full bg-black border-2 ${error ? 'border-red-600' : 'border-white/10 focus:border-[#1CB5B1]'} py-5 px-8 text-white text-center font-black text-lg tracking-[0.5em] transition-all outline-none placeholder:text-zinc-800 placeholder:tracking-widest rounded-2xl`}
              />
              {isLoading && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <i className="fa-solid fa-circle-notch animate-spin text-[#1CB5B1]"></i>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading || !pass}
              className="w-full bg-white text-black py-5 font-black text-[10px] uppercase tracking-[0.6em] hover:bg-[#1CB5B1] hover:text-white transition-all duration-500 active:scale-95 disabled:opacity-5 rounded-2xl shadow-xl"
            >
              ACCEDER AL SISTEMA
            </button>
          </form>

          {error && (
            <div className="bg-red-600/10 border border-red-600/30 py-3 text-center rounded-xl">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                ERROR DE AUTENTICACIÓN
              </span>
            </div>
          )}
        </div>

        <footer className="mt-20 flex flex-col items-center opacity-30">
          <p className="text-white text-[8px] font-black uppercase tracking-[0.4em] text-center leading-loose">
            PROPIEDAD DE ASD ATREYU <br/> 
            SISTEMA INTEGRAL V2.5 PREMIUM
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
