
import React from 'react';
import { AppData } from '../types';

interface Props {
  data: AppData;
}

const ToolsView: React.FC<Props> = ({ data }) => {
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

      {data.settings.externalLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.settings.externalLinks.map(link => (
            <a 
              key={link.id} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group flex flex-col items-center text-center gap-5"
            >
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <i className={`fa-solid ${link.icon || 'fa-link'} text-3xl`}></i>
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors mb-1">
                  {link.name}
                </h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest opacity-60 truncate max-w-[150px]">
                  {link.url.replace(/^https?:\/\//, '')}
                </p>
              </div>
              <div className="mt-2 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-arrow-up-right-from-square text-xs"></i>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
           <i className="fa-solid fa-toolbox text-5xl text-slate-100 mb-6"></i>
           <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No hay herramientas configuradas en Personalización</p>
        </div>
      )}

      {/* RECURSOS ESTÁNDAR ASD */}
      <div className="mt-12 space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-4">
          <span className="w-12 h-[1px] bg-slate-200"></span>
          Recursos Estándar ASD
          <span className="flex-1 h-[1px] bg-slate-200"></span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-slate-900 p-6 rounded-3xl flex items-center justify-between border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400">
                  <i className="fa-brands fa-amazon text-xl"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase">Amazon KDP Console</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Gestión de Publicaciones</p>
                </div>
              </div>
              <a href="https://kdp.amazon.com" target="_blank" className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
                <i className="fa-solid fa-external-link text-xs"></i>
              </a>
           </div>

           <div className="bg-slate-900 p-6 rounded-3xl flex items-center justify-between border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
                  <i className="fa-brands fa-google-drive text-xl"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase">Google Drive Editorial</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Almacenamiento Central</p>
                </div>
              </div>
              <a href="https://drive.google.com" target="_blank" className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
                <i className="fa-solid fa-external-link text-xs"></i>
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsView;
