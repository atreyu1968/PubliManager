import React, { useState } from 'react';
import { AppData, Task, Book } from '../types';
import { db } from '../db';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const AgendaView: React.FC<Props> = ({ data, refreshData }) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    type: 'Metadata',
    completed: false
  });

  const getDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const days = getDays();

  const handleAddTask = () => {
    if (newTask.title && newTask.dueDate) {
      db.addItem('tasks', {
        ...newTask,
        id: Date.now().toString(),
        bookId: 'none'
      } as Task);
      refreshData();
      setShowTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        type: 'Metadata',
        completed: false
      });
    }
  };

  const toggleTask = (task: Task) => {
    db.updateItem('tasks', { ...task, completed: !task.completed });
    refreshData();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Agenda de Lanzamientos</h1>
          <p className="text-slate-500 text-sm font-medium">Tareas y publicaciones programadas para la próxima semana.</p>
        </div>
        <button 
          onClick={() => setShowTaskModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-700 transition font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
        >
          <i className="fa-solid fa-plus mr-2"></i> Nueva Tarea
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = data.tasks.filter(t => t.dueDate === dateStr);
          // Filtrar libros por fecha programada
          const dayProgrammed = data.books.filter(b => b.scheduledDate === dateStr);
          const isToday = idx === 0;

          return (
            <div key={dateStr} className={`flex flex-col md:flex-row gap-6 p-6 rounded-[2.5rem] border transition-all ${isToday ? 'bg-indigo-50 border-indigo-200 shadow-xl shadow-indigo-100/50 scale-[1.02]' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="w-full md:w-32 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-1">{day.toLocaleDateString('es-ES', { weekday: 'long' })}</span>
                <span className={`text-4xl font-black ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>{day.getDate()}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day.toLocaleDateString('es-ES', { month: 'long' })}</span>
                {isToday && (
                  <span className="mt-2 bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Hoy</span>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                {dayProgrammed.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] ml-1">Lanzamientos Programados</p>
                    <div className="flex flex-wrap gap-2">
                      {dayProgrammed.map(book => (
                        <div key={book.id} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 shadow-lg shadow-emerald-100 uppercase tracking-widest border border-emerald-500">
                          <i className="fa-solid fa-rocket"></i> {book.title} ({book.language})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Hitos y Tareas</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayTasks.length > 0 ? dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-4 rounded-2xl border flex items-start gap-4 transition-all cursor-pointer hover:shadow-lg ${task.completed ? 'bg-slate-50 border-slate-100 grayscale opacity-50' : 'bg-white border-slate-200 shadow-sm'}`}
                        onClick={() => toggleTask(task)}
                      >
                        <div className={`mt-0.5 h-6 w-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                          {task.completed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>{task.title}</p>
                          <p className="text-[9px] text-slate-400 mt-1 uppercase font-black tracking-widest">{task.type}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="py-4 px-1">
                        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest italic italic">Agenda libre</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-scaleIn border border-white/20">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tighter">Nueva Tarea ASD</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Título de la Tarea</label>
                <input 
                  type="text" 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Revisar maquetación"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate} 
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo</label>
                  <select 
                    value={newTask.type} 
                    onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold text-slate-800"
                  >
                    <option value="Metadata">Metadatos</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Publication">Publicación</option>
                    <option value="Production">Producción</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notas</label>
                <textarea 
                  value={newTask.description} 
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 h-28 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Detalles del hito..."
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button 
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-4 text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddTask}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl transition-transform active:scale-95 uppercase"
                >
                  Guardar Hito
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