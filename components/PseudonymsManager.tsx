
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
    standardAcknowledgments: ''
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
    setNewAuthor({ name: '', bio: '', photoUrl: '', standardAcknowledgments: '' });
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Autores</h1>
          <p className="text-sm text-slate-500 font-medium">{editingId ? 'Editando autor...' : 'Añade una nueva identidad editorial.'}</p>
        </div>
        {editingId && (
          <button onClick={resetForm} className="text-xs font-bold text-red-500 uppercase tracking-widest">Cancelar Edición</button>
        )}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center mb-4 relative group cursor-pointer">
            {newAuthor.photoUrl ? (
              <img src={newAuthor.photoUrl} className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-camera text-slate-300 text-2xl"></i>
            )}
            <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto de Perfil</span>
        </div>
        <div className="md:col-span-2 space-y-4">
          <input 
            placeholder="Nombre o Seudónimo" 
            value={newAuthor.name} 
            onChange={e => setNewAuthor({...newAuthor, name: e.target.value})}
            className="w-full bg-slate-50 border-none rounded-xl px-6 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
          />
          <textarea 
            placeholder="Biografía..." 
            value={newAuthor.bio} 
            onChange={e => setNewAuthor({...newAuthor, bio: e.target.value})}
            className="w-full bg-slate-50 border-none rounded-xl px-6 py-3 h-20 text-sm"
          />
          <button onClick={handleSave} className="bg-amber-500 text-white px-10 py-3 rounded-xl font-black shadow-lg uppercase text-xs tracking-widest transition-transform active:scale-95">
            {editingId ? 'Actualizar Datos' : 'Añadir Autor'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.pseudonyms.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 relative group hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100">
                {photos[p.id] ? <img src={photos[p.id]} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-slate-200 text-xl m-4"></i>}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 tracking-tight">{p.name}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 italic">{p.bio}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => openEdit(p)} className="flex-1 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Editar</button>
               <button onClick={() => {if(confirm('¿Borrar?')) { db.deleteItem('pseudonyms', p.id); refreshData(); }}} className="px-3 bg-red-50 text-red-500 rounded-lg"><i className="fa-solid fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PseudonymsManager;
