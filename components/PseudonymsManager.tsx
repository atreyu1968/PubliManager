
import React, { useState, useEffect } from 'react';
import { AppData, Pseudonym } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const PseudonymsManager: React.FC<Props> = ({ data, refreshData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [newAuthor, setNewAuthor] = useState<Partial<Pseudonym>>({
    name: '',
    bio: '',
    photoUrl: '',
    standardAcknowledgments: '',
    driveFolderUrl: ''
  });

  useEffect(() => {
    const loadPhotos = async () => {
      const allMedia = await imageStore.getAll();
      setPhotos(allMedia);
    };
    loadPhotos();
  }, [data.pseudonyms]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAuthor(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (newAuthor.name) {
      const id = editingId || Date.now().toString();
      const tempPhoto = newAuthor.photoUrl;

      const authorToSave = { 
        ...newAuthor, 
        id, 
        photoUrl: '' 
      } as Pseudonym;

      if (editingId) {
        db.updateItem('pseudonyms', authorToSave);
      } else {
        db.addItem('pseudonyms', authorToSave);
      }

      if (tempPhoto && tempPhoto.startsWith('data:')) {
        await imageStore.save(id, tempPhoto);
      }

      resetForm();
      refreshData();
    }
  };

  const openEdit = async (p: Pseudonym) => {
    const fullPhoto = await imageStore.get(p.id);
    setNewAuthor({ ...p, photoUrl: fullPhoto || '' });
    setEditingId(p.id);
  };

  const resetForm = () => {
    setNewAuthor({ name: '', bio: '', photoUrl: '', standardAcknowledgments: '', driveFolderUrl: '' });
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-inner">
            <i className="fa-solid fa-user-pen text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Gestión de Identidades</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{editingId ? 'Editando autor seleccionado' : 'Añade una nueva identidad editorial al ecosistema ASD'}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {editingId && (
            <button onClick={resetForm} className="bg-slate-100 text-slate-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              Cancelar Edición
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
               {data.pseudonyms.length} Autores Registrados
             </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-slate-50 pb-10 lg:pb-0 lg:pr-10">
          <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center mb-6 relative group cursor-pointer transition-all hover:border-indigo-400">
            {newAuthor.photoUrl ? (
              <img src={newAuthor.photoUrl} className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-camera text-slate-200 text-4xl"></i>
            )}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrato Corporativo</span>
        </div>
        
        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre o Seudónimo Maestro</label>
              <input 
                placeholder="Ej: Elena R. S." 
                value={newAuthor.name} 
                onChange={e => setNewAuthor({...newAuthor, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Carpeta Google Drive (Producción)</label>
              <div className="relative">
                 <i className="fa-brands fa-google-drive absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                 <input 
                  placeholder="https://drive.google.com/..." 
                  value={newAuthor.driveFolderUrl} 
                  onChange={e => setNewAuthor({...newAuthor, driveFolderUrl: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner text-xs"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil Biográfico</label>
            <textarea 
              placeholder="Escribe aquí la biografía comercial que se usará en Amazon y otros canales..." 
              value={newAuthor.bio} 
              onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 h-32 text-xs font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner resize-none leading-relaxed"
            />
          </div>

          <button onClick={handleSave} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black shadow-2xl uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95 hover:bg-indigo-600 w-full md:w-auto">
            {editingId ? 'Actualizar Identidad' : 'Registrar Nueva Identidad'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.pseudonyms.map(p => (
          <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-6 relative group hover:shadow-2xl transition-all">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100 shadow-inner flex-shrink-0">
                {photos[p.id] ? <img src={photos[p.id]} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-slate-200 text-2xl m-6"></i>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 tracking-tight truncate leading-none mb-2">{p.name}</h3>
                <div className="flex gap-2">
                  {p.driveFolderUrl && (
                    <a href={p.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                      <i className="fa-brands fa-google-drive mr-1"></i> Drive
                    </a>
                  )}
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest">
                    ID: {p.id.slice(0, 5)}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 font-medium line-clamp-3 leading-relaxed italic border-l-2 border-slate-100 pl-4">
              {p.bio || "Sin biografía definida."}
            </p>

            <div className="flex gap-2 pt-4 border-t border-slate-50">
               <button onClick={() => openEdit(p)} className="flex-1 py-3 bg-slate-50 text-slate-900 text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm">
                 <i className="fa-solid fa-edit mr-2"></i> Editar
               </button>
               <button onClick={() => {if(confirm('¿Borrar identidad editorial?')) { db.deleteItem('pseudonyms', p.id); refreshData(); }}} className="px-4 py-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-100 shadow-sm">
                 <i className="fa-solid fa-trash-can"></i>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PseudonymsManager;
