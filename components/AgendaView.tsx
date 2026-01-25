
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
  
  // Estado de navegación temporal
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // Filtros
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

  // Generar los 7 días a partir de la fecha de vista
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

  // Navegación
  const moveWeek = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + offset);
    setViewDate(newDate);
  };

  const resetToToday = () => {
    setViewDate(new Date());
  };

  // Lógica de filtrado avanzada
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

  // Tareas que NO están en la ventana de 7 días actual
  const outOfRangeTasks = useMemo(() => {
    const visibleStrings = visibleDays.map(d => d.toISOString().split('T')[0]);
    return filteredTasks.filter(t => !visibleStrings.includes(t.dueDate));
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

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900 pb-20">
      {/* HEADER Y ACCIONES */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <i className="fa-solid fa-calendar-days text-indigo-600"></i>
            Control de Agenda Temporal
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
            Navegación semana a semana con trazabilidad histórica
          </p>
        </div>
        <button 
          onClick={() => setShowTaskModal(true)}
          className="w-full lg:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 font-black text-[10px] tracking-[0.2em] uppercase"
        >
          <i className="fa-solid fa-plus-circle mr-2"></i> Nuevo Hito Editorial
        </button>
      </div>

      {/* FILTROS DE AGENDA */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Filtrar por Autor</label>
          <select 
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            <option value="Todos">Todos los autores</option>
            {data.pseudonyms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Filtrar por Libro</label>
          <select 
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            <option value="Todos">Todos los libros</option>
            {data.books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Estado</label>
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            {['Todas', 'Pendientes', 'Completadas'].map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt as any)}
                className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${statusFilter === opt ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* NAVEGACIÓN TEMPORAL */}
      <div className="flex items-center justify-between bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <button 
          onClick={() => moveWeek(-7)} 
          className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
          title="Semana Anterior"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Ventana Temporal</span>
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-900 uppercase">
              {visibleDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} 
              <span className="mx-2 text-slate-300">→</span>
              {visibleDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </h2>
            <button 
              onClick={resetToToday}
              className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              Hoy
            </button>
          </div>
        </div>

        <button 
          onClick={() => moveWeek(7)} 
          className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"
          title="Semana Siguiente"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {/* VISTA SEMANAL DINÁMICA */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {visibleDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayTasks = filteredTasks.filter(t => t.dueDate === dateStr);
            const isToday = dateStr === todayStr;

            return (
              <div key={dateStr} className={`flex flex-col md:flex-row gap-6 p-6 rounded-[2.5rem] border transition-all ${isToday ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100/50' : 'bg-white border-slate-100 shadow-sm hover:border-slate-200'}`}>
                <div className="w-full md:w-28 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 shrink-0">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                  <span className={`text-3xl font-black ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>{day.getDate()}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{day.toLocaleDateString('es-ES', { month: 'short' })}</span>
                </div>
                
                <div className="flex-1 space-y-3">
                  {dayTasks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayTasks.map(task => {
                        const book = data.books.find(b => b.id === task.bookId);
                        return (
                          <div 
                            key={task.id} 
                            onClick={() => openEdit(task)}
                            className={`p-4 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer group hover:shadow-md ${task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100'}`}
                          >
                            <button 
                              onClick={(e) => toggleTask(e, task)}
                              className={`mt-0.5 h-5 w-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 bg-white group-hover:border-indigo-400'}`}
                            >
                              {task.completed && <i className="fa-solid fa-check text-white text-[8px]"></i>}
                            </button>
                            <div className="min-w-0">
                              <p className={`text-xs font-black truncate leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                              {book && <p className="text-[7px] font-bold text-indigo-400 uppercase mt-1 truncate">{book.title}</p>}
                              <p className="text-[7px] text-slate-300 mt-0.5 uppercase font-black tracking-widest">{task.type}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 h-full opacity-20">
                      <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">Sin tareas este día</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN TAREAS FUERA DE RANGO VISUAL */}
      {outOfRangeTasks.length > 0 && (
        <div className="space-y-6 pt-10">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-8 h-[1px] bg-slate-200"></span>
            Otras Tareas (Fuera de rango)
            <span className="flex-1 h-[1px] bg-slate-200"></span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {outOfRangeTasks.sort((a,b) => b.dueDate.localeCompare(a.dueDate)).map(task => {
              const book = data.books.find(b => b.id === task.bookId);
              const isOverdue = !task.completed && task.dueDate < todayStr;
              
              return (
                <div 
                  key={task.id} 
                  onClick={() => openEdit(task)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer group hover:shadow-xl ${task.completed ? 'bg-slate-50 border-slate-100 opacity-50' : isOverdue ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${isOverdue ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {task.dueDate} {isOverdue ? '- VENCIDA' : ''}
                    </span>
                    <button 
                      onClick={(e) => toggleTask(e, task)}
                      className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : isOverdue ? 'border-red-300 bg-white' : 'border-slate-200 bg-white group-hover:border-indigo-400'}`}
                    >
                      {task.completed && <i className="fa-solid fa-check text-white text-[8px]"></i>}
                    </button>
                  </div>
                  <p className={`text-xs font-black leading-tight mb-2 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                  {book && <p className="text-[8px] font-bold text-indigo-400 uppercase mb-1">{book.title}</p>}
                  <p className="text-[8px] text-slate-400 font-black tracking-widest uppercase">{task.type}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE TAREA (CREACIÓN / EDICIÓN) */}
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
                <input 
                  type="text" 
                  value={taskForm.title} 
                  onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-inner"
                  placeholder="Ej: Revisar maquetación final"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vincular a Libro</label>
                <select 
                  value={taskForm.bookId} 
                  onChange={e => setTaskForm({...taskForm, bookId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[10px] font-black uppercase text-slate-600 outline-none"
                >
                  <option value="none">Tarea General (Sin libro)</option>
                  {data.books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha Límite</label>
                  <input 
                    type="date" 
                    value={taskForm.dueDate} 
                    onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[10px] font-black text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoría</label>
                  <select 
                    value={taskForm.type} 
                    onChange={e => setTaskForm({...taskForm, type: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-[10px] font-black uppercase text-slate-600"
                  >
                    <option value="Metadata">Metadatos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Publication">Publicación</option>
                    <option value="Production">Producción</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notas de Producción</label>
                <textarea 
                  value={taskForm.description} 
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 h-28 text-xs font-bold text-slate-600 outline-none shadow-inner resize-none"
                  placeholder="Instrucciones o detalles del hito..."
                />
              </div>

              <div className="flex gap-4 pt-6">
                {editingTaskId && (
                  <button 
                    onClick={() => { if(confirm('¿Eliminar esta tarea?')) { db.deleteItem('tasks', editingTaskId); refreshData(); closeModal(); } }}
                    className="p-4 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
                <button 
                  onClick={closeModal}
                  className="flex-1 py-4 text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveTask}
                  className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 uppercase"
                >
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
