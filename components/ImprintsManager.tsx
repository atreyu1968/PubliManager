
import React, { useState } from 'react';
import { AppData, Imprint } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const ImprintsManager: React.FC<Props> = ({ data, refreshData }) => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (name && language) {
      db.addItem('imprints', { 
        id: Date.now().toString(), 
        name, 
        language,
        logoUrl
      });
      setName('');
      setLanguage('');
      setLogoUrl('');
      refreshData();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este sello?')) {
      db.deleteItem('imprints', id);
      refreshData();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sellos Editoriales</h1>
          <p className="text-sm text-slate-500 font-medium">Gestiona tus marcas por idioma.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden flex-shrink-0">
          {logoUrl ? (
            <img src={logoUrl} className="w-full h-full object-contain p-2" />
          ) : (
            <i className="fa-solid fa-upload text-slate-300"></i>
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <input 
            placeholder="Nombre del sello (ej: Sello Aurora)" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
          <input 
            placeholder="Idioma del sello" 
            value={language} 
            onChange={e => setLanguage(e.target.value)}
            className="bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-600 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button 
          onClick={handleAdd} 
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
        >
          Añadir Sello
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.imprints.map(imprint => (
          <div key={imprint.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 overflow-hidden">
                {imprint.logoUrl ? (
                  <img src={imprint.logoUrl} className="w-full h-full object-contain p-1" />
                ) : (
                  <i className="fa-solid fa-tag text-slate-200"></i>
                )}
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight">{imprint.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{imprint.language}</p>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(imprint.id)}
              className="text-slate-200 hover:text-red-500 p-2 transition opacity-0 group-hover:opacity-100"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImprintsManager;
