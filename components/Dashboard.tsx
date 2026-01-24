
import React, { useEffect, useState } from 'react';
import { AppData } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const Dashboard: React.FC<Props> = ({ data }) => {
  const [storageUsed, setStorageUsed] = useState(0);
  
  useEffect(() => {
    const calculateStorage = () => {
      let _lsTotal = 0, _xLen, _x;
      for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) continue;
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
      }
      setStorageUsed(Math.round(_lsTotal / 1024));
    };
    calculateStorage();
  }, [data]);

  const activeBooks = data.books.filter(b => b.status === 'Publicado').length;
  const pendingTasks = data.tasks.filter(t => !t.completed).length;
  const totalRevenue = data.sales.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalKenpc = data.sales.reduce((acc, curr) => acc + curr.kenpc, 0);

  const bookRevenue = data.books.map(b => ({
    title: b.title,
    rev: data.sales.filter(s => s.bookId === b.id).reduce((acc, curr) => acc + curr.revenue, 0)
  })).sort((a,b) => b.rev - a.rev)[0];

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Panel Editorial</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Control de operaciones Atreyu ASD</p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
            Sincronización: Activa
          </div>
          <p className="text-[9px] text-slate-400 font-bold uppercase mr-2">Uso: {storageUsed}kb / 5000kb</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Obras Publicadas" value={activeBooks} subtitle="Total catálogo activo" icon="fa-book-atlas" color="indigo" />
        <StatCard title="Ingresos Totales" value={`${totalRevenue.toFixed(2)}€`} subtitle="Acumulado bruto" icon="fa-sack-dollar" color="emerald" />
        <StatCard title="Páginas KENP" value={totalKenpc.toLocaleString()} subtitle="Lecturas KDP Select" icon="fa-book-open-reader" color="amber" />
        <StatCard title="Producto Estrella" value={bookRevenue?.title || 'N/A'} subtitle={`${bookRevenue?.rev.toFixed(2) || 0}€ generados`} icon="fa-crown" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Histórico de Facturación</h2>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                <i className="fa-solid fa-circle text-[6px]"></i> Ventas Netas
              </span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales.slice(-30)}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fa-solid fa-rocket text-9xl"></i>
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-8 text-indigo-400">Próximos Lanzamientos</h2>
          <div className="space-y-6 flex-1">
            {data.books.filter(b => b.status !== 'Publicado' && b.scheduledDate).slice(0, 5).map(book => (
              <div key={book.id} className="flex items-center gap-4 group cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform"></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight line-clamp-1">{book.title}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{book.scheduledDate}</p>
                </div>
              </div>
            ))}
            {data.books.filter(b => b.status !== 'Publicado').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <i className="fa-solid fa-calendar-check text-4xl mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Sin publicaciones <br/> programadas</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
            Ir a la Agenda
          </button>
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
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:translate-y-[-5px] transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm ${colors[color]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{value}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;
