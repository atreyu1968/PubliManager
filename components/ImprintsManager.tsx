
import React, { useState, useEffect, useMemo } from 'react';
import { AppData, Imprint } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const ImprintsManager: React.FC<Props> = ({ data, refreshData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [logoFilter, setLogoFilter] = useState<'Todos' | 'Con Logo' | 'Sin Logo'>('Todos');
  const [landingFilter, setLandingFilter] = useState<'Todos' | 'Con Landing' | 'Sin Landing'>('Todos');
  const [formData, setFormData] = useState<Partial<Imprint>>({
    name: '',
    language: data.settings.defaultLanguage || '',
    logoUrl: '',
    landingUrl: ''
  });

  useEffect(() => {
    const loadLogos = async () => {
      const allMedia = await imageStore.getAll();
      setLogos(allMedia);
    };
    loadLogos();
  }, [data.imprints]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (formData.name && formData.language) {
      const id = editingId || Date.now().toString();
      const tempLogo = formData.logoUrl;

      const imprintToSave = { 
        ...formData, 
        id, 
        logoUrl: '' 
      } as Imprint;

      if (editingId) {
        db.updateItem('imprints', imprintToSave);
      } else {
        db.addItem('imprints', imprintToSave);
      }

      if (tempLogo && tempLogo.startsWith('data:')) {
        await imageStore.save(id, tempLogo);
      }

      resetForm();
      refreshData();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', language: data.settings.defaultLanguage, logoUrl: '', landingUrl: '' });
    setEditingId(null);
  };

  const openEdit = async (imprint: Imprint) => {
    const fullLogo = await imageStore.get(imprint.id);
    setFormData({ ...imprint, logoUrl: fullLogo || imprint.logoUrl || '' });
    setEditingId(imprint.id);
  };

  const filteredImprints = useMemo(() => {
    return data.imprints.filter(imprint => {
      const hasLogo = !!(logos[imprint.id] || imprint.logoUrl);
      const hasLanding = !!imprint.landingUrl;
      
      const matchesLogo = logoFilter === 'Todos' || (logoFilter === 'Con Logo' ? hasLogo : !hasLogo);
      const matchesLanding = landingFilter === 'Todos' || (landingFilter === 'Con Landing' ? hasLanding : !hasLanding);
      
      return matchesLogo && matchesLanding;
    });
  }, [data.imprints, logos, logoFilter, landingFilter]);

  return (
    <div className="space-y-8 text-slate-900 pb-20">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <i className="fa-solid fa-tags text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Sellos Editoriales</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Branding y Landings Privadas por Sello</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-stretch gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden flex-shrink-0 group transition-all hover:border-amber-400">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} className="w-full h-full object-contain p-2" />
            ) : (
              <i className="fa-solid fa-upload text-slate-300"></i>
            )}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-3">
              <input placeholder="Nombre del sello" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="relative">
                <i className="fa-solid fa-globe absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input 
                  placeholder="URL Landing Privada del Sello..." 
                  value={formData.landingUrl}
                  onChange={e => setFormData({...formData, landingUrl: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <input placeholder="Idioma" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-600 outline-none" />
              <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-slate-900 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-transform active:scale-95 text-xs uppercase tracking-widest">
                      {editingId ? 'Actualizar' : 'Añadir Sello'}
                  </button>
                  {editingId && <button onClick={resetForm} className="bg-slate-100 text-slate-400 p-3 rounded-xl hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-wrap items-center gap-6 bg-white/50 p-5 rounded-3xl border border-slate-100">
         <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar Logo:</span>
           <div className="flex gap-2">
             {['Todos', 'Con Logo', 'Sin Logo'].map(f => (
               <button 
                 key={f}
                 onClick={() => setLogoFilter(f as any)}
                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${logoFilter === f ? 'bg-amber-500 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
               >
                 {f}
               </button>
             ))}
           </div>
         </div>
         <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar Landing:</span>
           <div className="flex gap-2">
             {['Todos', 'Con Landing', 'Sin Landing'].map(f => (
               <button 
                 key={f}
                 onClick={() => setLandingFilter(f as any)}
                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${landingFilter === f ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
               >
                 {f}
               </button>
             ))}
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImprints.map(imprint => {
          const displayLogo = logos[imprint.id] || imprint.logoUrl;
          return (
            <div key={imprint.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                  {displayLogo ? <img src={displayLogo} className="w-full h-full object-contain p-1" /> : <i className="fa-solid fa-tag text-slate-200"></i>}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight leading-none">{imprint.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{imprint.language}</span>
                    {imprint.landingUrl && (
                      <a href={imprint.landingUrl} target="_blank" className="text-indigo-500 hover:text-indigo-700"><i className="fa-solid fa-globe text-[10px]"></i></a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(imprint)} className="text-slate-300 hover:text-indigo-500 transition"><i className="fa-solid fa-pen-to-square"></i></button>
                  <button onClick={() => { if(confirm('¿Eliminar?')) { db.deleteItem('imprints', imprint.id); refreshData(); } }} className="text-slate-300 hover:text-red-500 transition"><i className="fa-solid fa-trash-can"></i></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImprintsManager;
