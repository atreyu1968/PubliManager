
import React, { useState } from 'react';
import { AppData, AppSettings } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';
import { ASDLogo } from '../App';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const SettingsView: React.FC<Props> = ({ data, refreshData }) => {
  const [newAction, setNewAction] = useState('');

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedData = {
      ...data,
      settings: { ...data.settings, ...newSettings }
    };
    db.saveData(updatedData);
    refreshData();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await imageStore.save('SYSTEM_BRAND_LOGO', reader.result as string);
        window.dispatchEvent(new Event('brand_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await imageStore.save('SYSTEM_BRAND_FAVICON', reader.result as string);
        window.dispatchEvent(new Event('brand_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const addAction = () => {
    if (newAction.trim() && !data.settings.customActions.includes(newAction.trim())) {
      handleUpdateSettings({
        customActions: [...data.settings.customActions, newAction.trim()]
      });
      setNewAction('');
    }
  };

  const removeAction = (action: string) => {
    handleUpdateSettings({
      customActions: data.settings.customActions.filter(a => a !== action)
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
          <i className="fa-solid fa-gears text-indigo-600"></i>
          Configuración ASD
        </h1>
        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
          Personalización profunda del ecosistema editorial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IDENTIDAD VISUAL */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-palette text-indigo-500"></i> Identidad Visual
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Logo del Sistema</label>
              <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center relative group overflow-hidden">
                <ASDLogo className="w-24 h-auto" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                   <i className="fa-solid fa-upload text-white mb-1"></i>
                   <span className="text-[8px] font-black text-white uppercase">Cambiar Logo</span>
                </div>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Favicon (Pestaña)</label>
              <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center relative group overflow-hidden">
                <i className="fa-solid fa-window-maximize text-slate-300 text-3xl"></i>
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                   <i className="fa-solid fa-upload text-white mb-1"></i>
                   <span className="text-[8px] font-black text-white uppercase">Subir Icono</span>
                </div>
                <input type="file" accept="image/*" onChange={handleFaviconUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50">
            <button 
              onClick={async () => {
                await imageStore.delete('SYSTEM_BRAND_LOGO');
                await imageStore.delete('SYSTEM_BRAND_FAVICON');
                window.dispatchEvent(new Event('brand_updated'));
                location.reload();
              }}
              className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
            >
              Restablecer Valores Originales ASD
            </button>
          </div>
        </div>

        {/* INTERFAZ Y VISTA */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-display text-indigo-500"></i> Preferencias de Interfaz
          </h2>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Modo de Visualización (Catálogo)</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleUpdateSettings({ viewMode: 'grid' })}
                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${data.settings.viewMode === 'grid' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
              >
                <i className={`fa-solid fa-table-cells-large text-2xl ${data.settings.viewMode === 'grid' ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                <span className={`text-[10px] font-black uppercase tracking-widest ${data.settings.viewMode === 'grid' ? 'text-indigo-600' : 'text-slate-400'}`}>Modo Rejilla</span>
              </button>
              <button 
                onClick={() => handleUpdateSettings({ viewMode: 'list' })}
                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${data.settings.viewMode === 'list' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'}`}
              >
                <i className={`fa-solid fa-list-ul text-2xl ${data.settings.viewMode === 'list' ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                <span className={`text-[10px] font-black uppercase tracking-widest ${data.settings.viewMode === 'list' ? 'text-indigo-600' : 'text-slate-400'}`}>Modo Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* ACCIONES PERSONALIZADAS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-bolt text-indigo-500"></i> Acciones del Historial
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
               <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                 Define estados o hitos personalizados que podrás registrar en el historial de tus libros para un seguimiento granular.
               </p>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ej: Revisión Maqueta V1" 
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                  />
                  <button 
                    onClick={addAction}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-colors"
                  >
                    Añadir
                  </button>
               </div>
            </div>

            <div className="flex flex-wrap gap-2 items-start content-start">
               {data.settings.customActions.map(action => (
                 <div key={action} className="bg-slate-50 border border-slate-100 pl-4 pr-2 py-2 rounded-xl flex items-center gap-3 group">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{action}</span>
                   <button 
                    onClick={() => removeAction(action)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                   >
                     <i className="fa-solid fa-times text-[10px]"></i>
                   </button>
                 </div>
               ))}
               {data.settings.customActions.length === 0 && (
                 <p className="text-[10px] font-black text-slate-300 uppercase italic">No hay acciones personalizadas definidas</p>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
