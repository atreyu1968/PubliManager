
import React, { useState, useEffect } from 'react';
import { AppData, ExternalLink } from '../types';
import { imageStore } from '../imageStore';

interface Props {
  data: AppData;
}

const ToolsView: React.FC<Props> = ({ data }) => {
  const [toolLogos, setToolLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadLogos = async () => {
      const allMedia = await imageStore.getAll();
      setToolLogos(allMedia);
    };
    loadLogos();
  }, [data.settings.externalLinks]);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <i className="fa-solid fa-toolbox text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Herramientas Externas</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
              Acceso unificado a plataformas de producción editorial
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
               {data.settings.externalLinks.length} Accesos directos
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.settings.externalLinks.map(link => {
          const displayLogo = toolLogos[link.id] || link.logoUrl;
          return (
            <div key={link.id} className="bg-slate-900 p-6 rounded-[2.5rem] flex items-center justify-between border border-slate-800 group hover:border-[#1CB5B1] transition-all shadow-xl shadow-black/20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden shrink-0 group-hover:bg-white/10 transition-colors">
                  {displayLogo ? (
                    <img src={displayLogo} className="w-full h-full object-contain p-2" alt={link.name} />
                  ) : (
                    <i className={`fa-solid ${link.icon || 'fa-link'} text-2xl text-indigo-400`}></i>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1.5">{link.name}</h3>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60 truncate max-w-[180px]">
                    {link.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </div>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-[#1CB5B1] hover:text-white transition-all shadow-inner border border-white/5 group-hover:shadow-[0_0_15px_rgba(28,181,177,0.3)]"
              >
                <i className="fa-solid fa-arrow-up-right-from-square text-sm"></i>
              </a>
            </div>
          );
        })}
      </div>

      {/* RECURSOS ESTÁNDAR ASD */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
          <span className="w-12 h-[1px] bg-slate-200"></span>
          Recursos Estándar ASD
          <span className="flex-1 h-[1px] bg-slate-200"></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-slate-900 p-6 rounded-[2.5rem] flex items-center justify-between border border-slate-800 shadow-xl shadow-black/20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 border border-white/5">
                  <i className="fa-brands fa-amazon text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1.5">Amazon KDP Console</h3>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60">Gestión de Publicaciones</p>
                </div>
              </div>
              <a href="https://kdp.amazon.com" target="_blank" className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
                <i className="fa-solid fa-external-link text-sm"></i>
              </a>
           </div>

           <div className="bg-slate-900 p-6 rounded-[2.5rem] flex items-center justify-between border border-slate-800 shadow-xl shadow-black/20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5">
                  <i className="fa-brands fa-google-drive text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1.5">Google Drive Editorial</h3>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] opacity-60">Almacenamiento Central</p>
                </div>
              </div>
              <a href="https://drive.google.com" target="_blank" className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
                <i className="fa-solid fa-external-link text-sm"></i>
              </a>
           </div>
        </div>
      </div>

      {data.settings.externalLinks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
           <i className="fa-solid fa-toolbox text-5xl text-slate-100 mb-6"></i>
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No hay herramientas configuradas en Personalización</p>
        </div>
      )}
    </div>
  );
};

export default ToolsView;
