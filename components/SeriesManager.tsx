
import React, { useState } from 'react';
import { AppData, Series } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const SeriesManager: React.FC<Props> = ({ data, refreshData }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (name) {
      db.addItem('series', { id: 's-' + Date.now(), name, description: desc });
      setName('');
      setDesc('');
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Gestión de Sagas</h1>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <input 
          placeholder="Nombre de la Serie (ej: Trilogía del Sol)" 
          value={name} 
          onChange={e => setName(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500"
        />
        <textarea 
          placeholder="Descripción o premisa de la saga..." 
          value={desc} 
          onChange={e => setDesc(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-amber-500 h-20"
        />
        <button onClick={handleAdd} className="bg-amber-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600">
          Crear Nueva Serie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.series.map(s => {
          const count = data.books.filter(b => b.seriesId === s.id).length;
          return (
            <div key={s.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-slate-800">{s.name}</h3>
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{count} libros</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{s.description || 'Sin descripción.'}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <button className="text-xs font-bold text-indigo-600 hover:underline">Ver libros</button>
                <button className="text-xs font-bold text-red-400 opacity-0 group-hover:opacity-100 transition" onClick={() => { db.deleteItem('series', s.id); refreshData(); }}>Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeriesManager;
