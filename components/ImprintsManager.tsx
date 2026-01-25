
import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState<Partial<Imprint>>({
    name: '',
    language: data.settings.defaultLanguage || '',
    logoUrl: ''
  });

  useEffect(() => {
    const loadLogos = async () => {
      const allMedia = await imageStore.getAll();
      setLogos(allMedia);
    };
    loadLogos();
  }, [data.imprints]);

  // Actualizar el idioma del formulario si cambia el ajuste predeterminado
  useEffect(() => {
    if (!editingId) {
      setFormData(prev => ({ ...prev, language: data.settings.defaultLanguage }));
    }
  }, [data.settings.defaultLanguage, editingId]);

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
    setFormData({ name: '', language: data.settings.defaultLanguage, logoUrl: '' });
    setEditingId(null);
  };

  const openEdit = async (imprint: Imprint) => {
    const fullLogo = await imageStore.get(imprint.id);
    setFormData({ ...imprint, logoUrl: fullLogo || imprint.logoUrl || '' });
    setEditingId(imprint.id);
  };

  return (
    <div className="space-y-8 text-slate-900 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Sellos Editoriales</h1>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden flex-shrink-0">
          {formData.logoUrl ? (
            <img src={formData.logoUrl} className="w-full h-full object-contain p-2" />
          ) : (
            <i className="fa-solid fa-upload text-slate-300"></i>
          )}
          <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <input placeholder="Nombre del sello" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" />
          <input placeholder="Idioma" value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-600 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div className="flex gap-2">
            <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black shadow-lg transition-transform active:scale-95 text-xs uppercase tracking-widest">
                {editingId ? 'Actualizar' : 'Añadir'}
            </button>
            {editingId && <button onClick={resetForm} className="bg-slate-100 text-slate-400 p-3 rounded-xl hover:text-red-500"><i className="fa-solid fa-xmark"></i></button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.imprints.map(imprint => {
          const displayLogo = logos[imprint.id] || imprint.logoUrl;
          
          return (
            <div key={imprint.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-xl transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                  {displayLogo ? <img src={displayLogo} className="w-full h-full object-contain p-1" /> : <i className="fa-solid fa-tag text-slate-200"></i>}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight leading-none">{imprint.name}</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{imprint.language}</p>
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
