
import React, { useState, useMemo } from 'react';
import { AppData, HistoryRecord } from '../types';

interface Props {
  data: AppData;
}

const HistoryView: React.FC<Props> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('Todos');
  const [filterBookId, setFilterBookId] = useState<string>('Todos');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Obtener lista de libros únicos que aparecen en el historial para el filtro
  const historyBooks = useMemo(() => {
    const books = new Map<string, string>();
    data.history.forEach(h => {
      if (!books.has(h.bookId)) {
        books.set(h.bookId, h.bookTitle);
      }
    });
    return Array.from(books.entries()).map(([id, title]) => ({ id, title }));
  }, [data.history]);

  const filteredHistory = data.history.filter(record => {
    const matchesSearch = record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (record.details?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = filterAction === 'Todos' || record.action === filterAction;
    
    const matchesBook = filterBookId === 'Todos' || record.bookId === filterBookId;

    const recordDate = new Date(record.timestamp).toISOString().split('T')[0];
    const matchesStartDate = !startDate || recordDate >= startDate;
    const matchesEndDate = !endDate || recordDate <= endDate;

    return matchesSearch && matchesAction && matchesBook && matchesStartDate && matchesEndDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('Todos');
    setFilterBookId('Todos');
    setStartDate('');
    setEndDate('');
  };

  const getActionColor = (action: HistoryRecord['action']) => {
    switch (action) {
      case 'Creación': return 'bg-emerald-500 text-white';
      case 'Modificación': return 'bg-blue-500 text-white';
      case 'Eliminación': return 'bg-red-500 text-white';
      case 'Cambio de Estado': return 'bg-amber-500 text-white';
      case 'Publicación': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getActionIcon = (action: HistoryRecord['action']) => {
    switch (action) {
      case 'Creación': return 'fa-plus';
      case 'Modificación': return 'fa-pen';
      case 'Eliminación': return 'fa-trash-can';
      case 'Cambio de Estado': return 'fa-arrows-rotate';
      case 'Publicación': return 'fa-rocket';
      default: return 'fa-circle-info';
    }
  };

  const isFiltering = searchTerm || filterAction !== 'Todos' || filterBookId !== 'Todos' || startDate || endDate;

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <i className="fa-solid fa-clock-rotate-left text-indigo-600"></i>
            Historial del Sistema
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
            Auditoría en tiempo real de acciones editoriales
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isFiltering && (
            <button 
              onClick={clearFilters}
              className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-filter-circle-xmark"></i> Limpiar Filtros
            </button>
          )}
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[9px] font-black text-white uppercase tracking-widest">Sistema de Logs Activo</span>
          </div>
        </div>
      </div>

      {/* FILTROS AVANZADOS */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="relative group">
          <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          <input 
            type="text" 
            placeholder="Buscar por título de libro o detalles específicos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] py-4 pl-16 pr-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Acción</label>
            <select 
              value={filterAction} 
              onChange={e => setFilterAction(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="Todos">Todas las acciones</option>
              <option value="Creación">Creaciones</option>
              <option value="Modificación">Modificaciones</option>
              <option value="Eliminación">Eliminaciones</option>
              <option value="Cambio de Estado">Cambios de Estado</option>
              <option value="Publicación">Publicaciones</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Proyecto Específico</label>
            <select 
              value={filterBookId} 
              onChange={e => setFilterBookId(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
            >
              <option value="Todos">Todos los libros</option>
              {historyBooks.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde Fecha</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta Fecha</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
        </div>
      </div>

      {/* LINEA DE TIEMPO */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          {filteredHistory.length > 0 ? filteredHistory.map((record, index) => (
            <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
              
              {/* Icono Central */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 overflow-hidden">
                <div className={`w-full h-full flex items-center justify-center ${getActionColor(record.action)}`}>
                  <i className={`fa-solid ${getActionIcon(record.action)} text-xs`}></i>
                </div>
              </div>

              {/* Tarjeta de Contenido */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group-hover:border-indigo-100">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-black text-slate-900 uppercase text-[10px] tracking-tighter truncate">
                    {record.bookTitle}
                  </div>
                  <time className="font-bold text-[8px] text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {new Date(record.timestamp).toLocaleString()}
                  </time>
                </div>
                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                  {record.action}
                </div>
                {record.details && (
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {record.details}
                  </p>
                )}
              </div>
            </div>
          )) : (
            <div className="py-20 text-center opacity-30">
              <i className="fa-solid fa-box-open text-4xl mb-4 text-slate-300"></i>
              <p className="text-xs font-black uppercase tracking-widest">No hay registros que coincidan con los filtros</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HistoryView;
