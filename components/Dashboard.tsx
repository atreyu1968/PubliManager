
import React from 'react';
import { AppData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const Dashboard: React.FC<Props> = ({ data }) => {
  const activeBooks = data.books.filter(b => b.status === 'Published').length;
  const pendingTasks = data.tasks.filter(t => !t.completed).length;
  
  // Forecast: Estimamos 70% de KDP y 60% de D2D (descontando fees aprox)
  const totalRevenue = data.sales.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalKenpc = data.sales.reduce((acc, curr) => acc + curr.kenpc, 0);

  // Mejor Libro (basado en ingresos totales)
  const bookRevenue = data.books.map(b => ({
    title: b.title,
    rev: data.sales.filter(s => s.bookId === b.id).reduce((acc, curr) => acc + curr.revenue, 0)
  })).sort((a,b) => b.rev - a.rev)[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Resumen Editorial</h1>
          <p className="text-slate-400 font-medium">Tienes {pendingTasks} tareas críticas para esta semana.</p>
        </div>
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-400 uppercase tracking-widest px-4">
          Status: <span className="text-emerald-500">Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Proyectos Activos" value={activeBooks} subtitle="Libros publicados" icon="fa-book-atlas" color="indigo" />
        <StatCard title="Ventas Acumuladas" value={`${totalRevenue.toFixed(2)}€`} subtitle="Bruto estimado" icon="fa-sack-dollar" color="emerald" />
        <StatCard title="Lectura KENPC" value={totalKenpc.toLocaleString()} subtitle="Páginas totales" icon="fa-book-open-reader" color="amber" />
        <StatCard title="Bestseller" value={bookRevenue?.title || 'N/A'} subtitle={`${bookRevenue?.rev.toFixed(2) || 0}€ generados`} icon="fa-crown" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Rendimiento Mensual</h2>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-500"><i className="fa-solid fa-circle text-[6px]"></i> INGRESOS</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales.slice(-30)}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <i className="fa-solid fa-bolt text-8xl"></i>
          </div>
          <h2 className="text-lg font-black uppercase tracking-widest mb-6 text-amber-400">Próximos Hitos</h2>
          <div className="space-y-6">
            {data.tasks.filter(t => !t.completed).slice(0, 4).map(task => (
              <div key={task.id} className="group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-150 transition-transform"></div>
                  <div>
                    <p className="text-sm font-bold leading-tight">{task.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{task.dueDate}</p>
                  </div>
                </div>
              </div>
            ))}
            {data.tasks.filter(t => !t.completed).length === 0 && (
              <p className="text-slate-500 italic text-sm py-10 text-center">Todo al día, comandante.</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black transition">VER AGENDA COMPLETA</button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:scale-[1.02] transition-transform">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${colors[color]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;
