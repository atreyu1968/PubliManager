
import React, { useState } from 'react';
import { AppData, Pseudonym } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const PseudonymsManager: React.FC<Props> = ({ data, refreshData }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [thanks, setThanks] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (name) {
      db.addItem('pseudonyms', { 
        id: Date.now().toString(), 
        name, 
        bio, 
        photoUrl, 
        standardAcknowledgments: thanks 
      });
      setName('');
      setBio('');
      setPhotoUrl('');
      setThanks('');
      refreshData();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Autores</h1>
          <p className="text-sm text-slate-500 font-medium">Controla tus identidades y sube sus fotos de perfil.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center mb-4 relative group cursor-pointer hover:border-amber-400 transition-colors">
            {photoUrl ? (
              <img src={photoUrl} className="w-full h-full object-cover" />
            ) : (
              <i className="fa-solid fa-camera text-slate-300 text-2xl"></i>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Cambiar</span>
            </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto de Autor</span>
        </div>
        <div className="md:col-span-2 space-y-4">
          <input 
            placeholder="Nombre o Seudónimo" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl px-6 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea 
              placeholder="Breve biografía..." 
              value={bio} 
              onChange={e => setBio(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-6 py-3 h-32 text-sm focus:ring-2 focus:ring-amber-500"
            />
            <textarea 
              placeholder="Agradecimientos estándar (se incluirán en cada libro)..." 
              value={thanks} 
              onChange={e => setThanks(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-6 py-3 h-32 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={handleAdd} className="w-full md:w-auto bg-amber-500 text-white px-10 py-3 rounded-xl font-black hover:bg-amber-600 transition shadow-lg shadow-amber-100 uppercase text-xs tracking-widest active:scale-95">
            Añadir Autor al Sistema
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.pseudonyms.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 relative group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                {p.photoUrl ? <img src={p.photoUrl} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-slate-200 text-xl m-4"></i>}
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-800 tracking-tight">{p.name}</h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 italic">{p.bio || 'Sin biografía.'}</p>
              </div>
            </div>
            {p.standardAcknowledgments && (
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Agradecimientos Maestro</p>
                <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight">{p.standardAcknowledgments}</p>
              </div>
            )}
            <button 
              onClick={() => { if(confirm('¿Borrar?')) { db.deleteItem('pseudonyms', p.id); refreshData(); } }}
              className="absolute top-4 right-4 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PseudonymsManager;
