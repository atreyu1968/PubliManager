
import React, { useState } from 'react';
import { AppData, Series } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const LANGUAGES = ['Español', 'Inglés', 'Italiano', 'Portugués', 'Alemán', 'Francés', 'Catalán'];

const SeriesManager: React.FC<Props> = ({ data, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [langFilter, setLangFilter] = useState(data.settings.defaultLanguage || 'Todos');
  const [launchType, setLaunchType] = useState<'master' | 'single'>('master');

  const [formData, setFormData] = useState<Partial<Series>>({
    name: '',
    description: ''
  });

  const handleSave = () => {
    if (!formData.name) {
      alert("El nombre de la saga es obligatorio.");
      return;
    }

    const currentData = db.getData();
    let updatedData: AppData;

    if (editingId) {
      const index = currentData.series.findIndex(s => s.id === editingId);
      if (index !== -1) {
        currentData.series[index] = { ...formData, id: editingId } as Series;
      }
      updatedData = { ...currentData };
    } else {
      const timestamp = Date.now();
      const targetLangs = launchType === 'master' ? LANGUAGES : [data.settings.defaultLanguage];
      
      const newSeriesList: Series[] = targetLangs.map((lang, idx) => ({
        id: `s-${lang.toLowerCase().replace(/[^a-z]/g, '')}-${timestamp}-${idx}`,
        name: launchType === 'master' ? `${formData.name} (${lang})` : formData.name,
        description: formData.description || '',
        language: lang
      }));
      updatedData = { ...currentData, series: [...currentData.series, ...newSeriesList] };
    }

    if (db.saveData(updatedData)) {
      refreshData();
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setLaunchType('master');
    setFormData({ name: '', description: '' });
  };

  const openEdit = (s: Series) => {
    setFormData(s);
    setEditingId(s.id);
    setIsModalOpen(true);
  };

  const filteredSeries = data.series.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = langFilter === 'Todos' || s.language === langFilter;
    return matchesSearch && matchesLang;
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6 text-slate-900 pb-20 animate-fadeIn">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <i className="fa-solid fa-layer-group text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Arquitectura de Sagas</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Organización de universos literarios ASD</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-amber-600 shadow-xl transition-all active:scale-95 font-black text-[10px] tracking-[0.2em] uppercase">
            <i className="fa-solid fa-plus-circle mr-2"></i> Nueva Saga
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Buscar saga..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pl-16 pr-6 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-amber-500/10 transition-all outline-none"
          />
        </div>
        <select value={langFilter} onChange={e => setLangFilter(e.target.value)} className="bg-white border border-slate-200 rounded-[2rem] px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-600 outline-none shadow-sm transition-all cursor-pointer">
          <option value="Todos">Idiomas: Todos</option>
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSeries.map(s => (
          <div key={s.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">{s.language || 'Global'}</span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{s.name}</h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed italic mb-6 text-left">
                {s.description || "Sin descripción establecida."}
              </p>
            </div>
            <div className="flex gap-2 pt-6 border-t border-slate-50">
              <button onClick={() => openEdit(s)} className="flex-1 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm">
                <i className="fa-solid fa-edit mr-2"></i> Editar
              </button>
              <button onClick={() => { if(confirm('¿Eliminar?')) { db.deleteItem('series', s.id); refreshData(); } }} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl animate-scaleIn relative text-slate-900">
            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-amber-100/50">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                {editingId ? 'Editor de Saga' : 'Nueva Saga'}
              </h2>
            </div>

            <div className="space-y-6">
              {!editingId && (
                 <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  <button 
                    onClick={() => setLaunchType('master')}
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${launchType === 'master' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Maestra (7 Idiomas)
                  </button>
                  <button 
                    onClick={() => setLaunchType('single')}
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${launchType === 'single' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    Individual ({data.settings.defaultLanguage})
                  </button>
                </div>
              )}

              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Nombre de la Saga</label>
                <input 
                  type="text" 
                  placeholder="Ej: Crónicas de ASD" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold text-lg text-slate-900 outline-none transition-all shadow-inner" 
                />
              </div>
              <div className="text-left">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Descripción</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] p-6 h-40 text-sm leading-relaxed text-slate-900 outline-none transition-all shadow-inner resize-none" 
                  placeholder="Detalles de la trama..."
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={closeModal} className="flex-1 py-5 text-slate-400 font-black text-[11px] tracking-[0.4em] uppercase hover:text-slate-900 transition-colors">Cancelar</button>
                <button 
                  onClick={handleSave} 
                  className={`flex-[2] py-5 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl transition-all active:scale-95 ${launchType === 'master' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100'}`}
                >
                  {editingId ? 'Actualizar' : `Generar Saga ${launchType === 'master' ? 'Maestra' : 'Individual'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesManager;
