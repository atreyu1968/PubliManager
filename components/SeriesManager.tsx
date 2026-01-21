import React, { useState } from 'react';
import { AppData, Series } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const SeriesManager: React.FC<Props> = ({ data, refreshData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSave = () => {
    if (name) {
      if (editingId) {
        db.updateItem('series', { id: editingId, name, description: desc });
      } else {
        db.addItem('series', { id: 's-' + Date.now(), name, description: desc });
      }
      resetForm();
      refreshData();
    }
  };

  const resetForm = () => {
    setName('');
    setDesc('');
    setEditingId(null);
  };

  const openEdit = (s: Series) => {
    setEditingId(s.id);
    setName(s.name);
    setDesc(s.description);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Gestión de Sagas</h1>
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
            <input 
              placeholder="Nombre de la Serie" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 font-bold"
            />
        </div>
        <textarea 
          placeholder="Descripción o premisa..." 
          value={desc} 
          onChange={e => setDesc(e.target.value)}
          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 h-24 text-sm"
        />
        <div className="flex gap-4">
            <button onClick={handleSave} className="bg-amber-500 text-white px-8 py-3 rounded-xl font-black shadow-lg">
                {editingId ? 'Actualizar Saga' : 'Crear Nueva Serie'}
            </button>
            {editingId && <button onClick={resetForm} className="px-8 py-3 text-slate-400 font-bold">Cancelar</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.series.map(s => {
          const count = data.books.filter(b => b.seriesId === s.id).length;
          return (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-slate-800">{s.name}</h3>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-full uppercase">{count} libros</span>
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 italic">"{s.description || 'Sin descripción.'}"</p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4">
                <button onClick={() => openEdit(s)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Editar</button>
                <button className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:underline" onClick={() => { if(confirm('¿Borrar?')) { db.deleteItem('series', s.id); refreshData(); } }}>Eliminar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeriesManager;