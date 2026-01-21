
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
        bookId: 'none' // For now, general task
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Agenda Continua</h1>
          <p className="text-slate-500">Tareas y eventos para los próximos 7 días.</p>
        </div>
        <button 
          onClick={() => setShowTaskModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
        >
          <i className="fa-solid fa-plus"></i> Nueva Tarea
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day, idx) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayTasks = data.tasks.filter(t => t.dueDate === dateStr);
          const dayReleases = data.books.filter(b => b.releaseDate === dateStr);
          const isToday = idx === 0;

          return (
            <div key={dateStr} className={`flex gap-4 p-4 rounded-xl border ${isToday ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="w-24 flex flex-col items-center justify-center border-r border-slate-100 pr-4">
                <span className="text-xs font-bold uppercase text-slate-400">{day.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span className={`text-2xl font-bold ${isToday ? 'text-amber-600' : 'text-slate-700'}`}>{day.getDate()}</span>
                <span className="text-xs text-slate-400">{day.toLocaleDateString('es-ES', { month: 'short' })}</span>
              </div>
              
              <div className="flex-1 space-y-3">
                {dayReleases.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dayReleases.map(book => (
                      <div key={book.id} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-200">
                        <i className="fa-solid fa-rocket"></i> LANZAMIENTO: {book.title}
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayTasks.length > 0 ? dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-lg border flex items-start gap-3 transition-all cursor-pointer hover:shadow-md ${task.completed ? 'bg-slate-100 border-slate-200 grayscale opacity-70' : 'bg-white border-slate-200'}`}
                      onClick={() => toggleTask(task)}
                    >
                      <div className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                        {task.completed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{task.type}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-300 text-xs italic py-2">Sin tareas programadas.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-scaleIn">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Añadir Tarea</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input 
                  type="text" 
                  value={newTask.title} 
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Actualizar blurb KDP"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input 
                  type="date" 
                  value={newTask.dueDate} 
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select 
                  value={newTask.type} 
                  onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Metadata">Metadatos</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Publication">Publicación</option>
                  <option value="Other">Otros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea 
                  value={newTask.description} 
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="Detalles adicionales..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddTask}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md"
                >
                  Guardar
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
