
import React, { useState } from 'react';
import { AppData, AppSettings, ExternalLink } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';
import { ASDLogo } from '../App';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const LANGUAGES = ['Español', 'Inglés', 'Italiano', 'Portugués', 'Alemán', 'Francés', 'Catalán'];

const ICON_OPTIONS = [
  { value: 'fa-link', label: 'Enlace Genérico' },
  { value: 'fa-brands fa-amazon', label: 'Amazon / KDP' },
  { value: 'fa-robot', label: 'Inteligencia Artificial' },
  { value: 'fa-palette', label: 'Diseño / Canva' },
  { value: 'fa-google-drive', label: 'Google Drive' },
  { value: 'fa-chart-pie', label: 'Analíticas / Ventas' },
  { value: 'fa-envelope', label: 'Newsletter / Correo' },
  { value: 'fa-book-open', label: 'Lectura / Kindle' },
  { value: 'fa-code', label: 'Desarrollo / Tech' },
  { value: 'fa-microchip', label: 'Sistema / OS' }
];

const SettingsView: React.FC<Props> = ({ data, refreshData }) => {
  const [newAction, setNewAction] = useState('');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<Partial<ExternalLink>>({ 
    name: '', 
    url: '', 
    icon: 'fa-link' 
  });

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedData = {
      ...data,
      settings: { ...data.settings, ...newSettings }
    };
    db.saveData(updatedData);
    refreshData();
  };

  const saveExternalLink = () => {
    if (newLink.name && newLink.url) {
      let updatedLinks;
      
      if (editingLinkId) {
        // Modo Edición
        updatedLinks = data.settings.externalLinks.map(l => 
          l.id === editingLinkId ? { ...l, ...newLink } as ExternalLink : l
        );
      } else {
        // Modo Creación
        const link: ExternalLink = {
          id: `link-${Date.now()}`,
          name: newLink.name,
          url: newLink.url,
          icon: newLink.icon || 'fa-link'
        };
        updatedLinks = [...data.settings.externalLinks, link];
      }

      handleUpdateSettings({ externalLinks: updatedLinks });
      cancelEditLink();
    }
  };

  const startEditLink = (link: ExternalLink) => {
    setEditingLinkId(link.id);
    setNewLink({ name: link.name, url: link.url, icon: link.icon });
  };

  const cancelEditLink = () => {
    setEditingLinkId(null);
    setNewLink({ name: '', url: '', icon: 'fa-link' });
  };

  const removeExternalLink = (id: string) => {
    if (confirm('¿Eliminar este acceso directo?')) {
      handleUpdateSettings({
        externalLinks: data.settings.externalLinks.filter(l => l.id !== id)
      });
      if (editingLinkId === id) cancelEditLink();
    }
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

        {/* INTEGRACIONES MAESTRAS */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-cloud-bolt text-indigo-500"></i> Integraciones Maestras
          </h2>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Google Sheet Maestra (Amazon KDP)</label>
            <div className="relative">
               <i className="fa-solid fa-file-excel absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500"></i>
               <input 
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/..." 
                value={data.settings.googleSheetMasterUrl || ''}
                onChange={(e) => handleUpdateSettings({ googleSheetMasterUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-14 pr-6 py-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider ml-1">
              Este enlace habilitará un botón de acceso rápido en el panel principal.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Idioma Predeterminado</label>
            <select 
              value={data.settings.defaultLanguage}
              onChange={(e) => handleUpdateSettings({ defaultLanguage: e.target.value })}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-black uppercase tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* HERRAMIENTAS EXTERNAS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-toolbox text-indigo-500"></i> {editingLinkId ? 'Editando Herramienta' : 'Herramientas Externas (Enlaces)'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-100">
                  <i className={`fa-solid ${newLink.icon}`}></i>
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Icono Seleccionado</p>
                  <p className="text-[10px] font-bold text-slate-900 uppercase">Vista Previa</p>
                </div>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Nombre de la herramienta (Ej: Canva)" 
                  value={newLink.name}
                  onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <input 
                  type="text" 
                  placeholder="URL (https://...)" 
                  value={newLink.url}
                  onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                />
                <select 
                  value={newLink.icon}
                  onChange={(e) => setNewLink({...newLink, icon: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                >
                  {ICON_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button 
                    onClick={saveExternalLink}
                    className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
                  >
                    {editingLinkId ? 'Guardar Cambios' : 'Registrar Herramienta'}
                  </button>
                  {editingLinkId && (
                    <button 
                      onClick={cancelEditLink}
                      className="bg-slate-100 text-slate-500 px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 items-start content-start">
               {data.settings.externalLinks.map(link => (
                 <div key={link.id} className={`p-4 rounded-2xl flex items-center justify-between group border transition-all ${editingLinkId === link.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                   <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${editingLinkId === link.id ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-500 border border-slate-100'}`}>
                        <i className={`fa-solid ${link.icon}`}></i>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-800 uppercase truncate">{link.name}</p>
                        <p className="text-[8px] text-slate-400 font-bold truncate">{link.url.replace(/^https?:\/\//, '')}</p>
                      </div>
                   </div>
                   <div className="flex gap-1">
                     <button 
                      onClick={() => startEditLink(link)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                     >
                       <i className="fa-solid fa-pen text-[10px]"></i>
                     </button>
                     <button 
                      onClick={() => removeExternalLink(link.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                     >
                       <i className="fa-solid fa-trash-can text-[10px]"></i>
                     </button>
                   </div>
                 </div>
               ))}
               {data.settings.externalLinks.length === 0 && (
                 <p className="text-[10px] font-black text-slate-300 uppercase italic py-10 text-center">No hay herramientas configuradas</p>
               )}
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
