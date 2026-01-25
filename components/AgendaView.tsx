
import React, { useState, useMemo } from 'react';
import { AppData, Task, Book, Pseudonym } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const AgendaView: React.FC<Props> = ({ data, refreshData }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  const [authorFilter, setAuthorFilter] = useState<string>('Todos');
  const [bookFilter, setBookFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Pendientes' | 'Completadas'>('Todas');

  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    type: 'Metadata',
    completed: false,
    bookId: 'none'
  });

  const getVisibleDays = (baseDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const visibleDays = getVisibleDays(viewDate);
  const todayStr = new Date().toISOString().split('T')[0];

  const moveWeek = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + offset);
    setViewDate(newDate);
  };

  const resetToToday = () => {
    setViewDate(new Date());
  };

  const filteredTasks = useMemo(() => {
    return data.tasks.filter(t => {
      const book = data.books.find(b => b.id === t.bookId);
      const matchesAuthor = authorFilter === 'Todos' || (book && book.pseudonymId === authorFilter);
      const matchesBook = bookFilter === 'Todos' || t.bookId === bookFilter;
      const matchesStatus = statusFilter === 'Todas' || 
                           (statusFilter === 'Pendientes' && !t.completed) || 
                           (statusFilter === 'Completadas' && t.completed);
      return matchesAuthor && matchesBook && matchesStatus;
    });
  }, [data.tasks, data.books, authorFilter, bookFilter, statusFilter]);

  const outOfRangeTasks = useMemo(() => {
    const visibleStrings = visibleDays.map(d => d.toISOString().split('T')[0]);
    return filteredTasks.filter(t => !visibleStrings.includes(t.dueDate)).sort((a,b) => b.dueDate.localeCompare(a.dueDate));
  }, [filteredTasks, visibleDays]);

  const handleSaveTask = () => {
    if (taskForm.title && taskForm.dueDate) {
      if (editingTaskId) {
        db.updateItem('tasks', { ...taskForm, id: editingTaskId } as Task);
      } else {
        db.addItem('tasks', {
          ...taskForm,
          id: `task-${Date.now()}`,
          completed: false
        } as Task);
      }
      refreshData();
      closeModal();
    }
  };

  const openEdit = (task: Task) => {
    setTaskForm(task);
    setEditingTaskId(task.id);
    setShowTaskModal(true);
  };

  const closeModal = () => {
    setShowTaskModal(false);
    setEditingTaskId(null);
    setTaskForm({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      type: 'Metadata',
      completed: false,
      bookId: 'none'
    });
  };

  const toggleTask = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    db.updateItem('tasks', { ...task, completed: !task.completed });
    refreshData();
  };

  const getTaskTypeIcon = (type: string) => {
    switch(type) {
      case 'Metadata': return 'fa-tags text-blue-400';
      case 'Marketing': return 'fa-bullhorn text-amber-400';
      case 'Publication': return 'fa-rocket text-emerald-400';
      case 'Production': return 'fa-pen-nib text-indigo-400';
      default: return 'fa-circle text-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-900 pb-20">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <i className="fa-solid fa-calendar-days text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Plan Editorial</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Gestión de hitos y producción a 7 días vista</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button onClick={() => moveWeek(-7)} className="px-3 py-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all text-xs">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button onClick={resetToToday} className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">Hoy</button>
            <button onClick={() => moveWeek(7)} className="px-3 py-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all text-xs">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          <button 
            onClick={() => setShowTaskModal(true)}
            className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-4 rounded-2xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 font-black text-[10px] tracking-[0.1em] uppercase"
          >
            <i className="fa-solid fa-plus mr-2"></i> Nuevo Hito
          </button>
        </div>
      </div>

      {/* FILTROS AVANZADOS */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap gap-4">
        <select value={authorFilter} onChange={(e) => setAuthorFilter(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[9px] font-black uppercase text-slate-500 outline-none">
          <option value="Todos">Autores: Todos</option>
          {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={bookFilter} onChange={(e) => setBookFilter(e.target.value)} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[9px] font-black uppercase text-slate-500 outline-none flex-1 min-w-[150px]">
          <option value="Todos">Libros: Todos</option>
          {data.books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          {['Todas', 'Pendientes', 'Completadas'].map((opt) => (
            <button key={opt} onClick={() => setStatusFilter(opt as any)} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${statusFilter === opt ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* TABLERO SEMANAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 min-h-[500px]">
        {visibleDays.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr);
          const isToday = dateStr === todayStr;

          return (
            <div 
              key={dateStr} 
              className={`flex flex-col rounded-[2rem] border transition-all h-full ${isToday ? 'bg-indigo-50/40 border-indigo-200 shadow-lg ring-1 ring-indigo-100' : 'bg-white border-slate-100 shadow-sm'}`}
            >
              <div className={`p-4 text-center border-b ${isToday ? 'border-indigo-100' : 'border-slate-50'}`}>
                <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                </p>
                <p className={`text-xl font-black ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {day.getDate()}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                  {day.toLocaleDateString('es-ES', { month: 'short' })}
                </p>
              </div>

              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[400px] custom-scrollbar">
                {dayTasks.length > 0 ? (
                  dayTasks.map(task => {
                    const book = data.books.find(b => b.id === task.bookId);
                    return (
                      <div 
                        key={task.id} 
                        onClick={() => openEdit(task)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group hover:translate-y-[-2px] hover:shadow-md ${task.completed ? 'bg-slate-50/50 border-slate-100 opacity-50' : 'bg-white border-slate-100 shadow-sm'}`}
                      >
                        <div className="flex items-start gap-2">
                           <button 
                            onClick={(e) => toggleTask(e, task)}
                            className={`mt-0.5 h-3.5 w-3.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 bg-white group-hover:border-indigo-400'}`}
                          >
                            {task.completed && <i className="fa-solid fa-check text-white text-[6px]"></i>}
                          </button>
                          <div className="min-w-0 text-left">
                            <p className={`text-[10px] font-black leading-tight mb-1 line-clamp-2 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </p>
                            {book && (
                              <p className="text-[7px] font-bold text-slate-400 truncate mb-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {book.title}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5">
                              <i className={`fa-solid ${getTaskTypeIcon(task.type)} text-[8px]`}></i>
                              <span className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">{task.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 pt-10">
                    <i className="fa-solid fa-mug-hot text-2xl mb-2"></i>
                    <p className="text-[7px] font-black uppercase tracking-widest">Libre</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-scaleIn border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {editingTaskId ? 'Editar Hito' : 'Nuevo Hito ASD'}
              </h2>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-900 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Título de la Tarea</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner" placeholder="Ej: Revisar maquetación final" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vincular a Libro</label>
                <select value={taskForm.bookId} onChange={e => setTaskForm({...taskForm, bookId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[10px] font-black uppercase text-slate-600 outline-none">
                  <option value="none">Tarea General (Sin libro)</option>
                  {data.books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha Límite</label>
                  <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[10px] font-black text-slate-600" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoría</label>
                  <select value={taskForm.type} onChange={e => setTaskForm({...taskForm, type: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[10px] font-black uppercase text-slate-600">
                    <option value="Metadata">Metadatos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Publication">Publicación</option>
                    <option value="Production">Producción</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notas de Producción</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 h-28 text-xs font-bold text-slate-600 outline-none shadow-inner resize-none" placeholder="Instrucciones o detalles del hito..." />
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={closeModal} className="flex-1 py-4 text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase hover:text-slate-900 transition-colors">Cancelar</button>
                <button onClick={handleSaveTask} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 uppercase">
                  {editingTaskId ? 'Actualizar Hito' : 'Crear Hito'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaView;
