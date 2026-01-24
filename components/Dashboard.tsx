
import React, { useEffect, useState } from 'react';
import { AppData } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';
import { ASDLogo } from '../App';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const Dashboard: React.FC<Props> = ({ data, refreshData }) => {
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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm('Esto reemplazará todos los datos e IMÁGENES actuales. ¿Deseas continuar?')) {
        const success = await db.importData(file);
        if (success) {
          refreshData();
          window.dispatchEvent(new Event('brand_updated'));
          alert('Sistema restaurado íntegramente.');
        }
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await imageStore.save('SYSTEM_BRAND_LOGO', reader.result as string);
        window.dispatchEvent(new Event('brand_updated'));
        alert('Logo corporativo actualizado con éxito.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = async () => {
    if (confirm('¿Restablecer logo por defecto?')) {
      await imageStore.delete('SYSTEM_BRAND_LOGO');
      window.dispatchEvent(new Event('brand_updated'));
    }
  };

  const activeBooks = data.books.filter(b => b.status === 'Publicado').length;
  const totalRevenue = data.sales.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalKenpc = data.sales.reduce((acc, curr) => acc + curr.kenpc, 0);

  const bookRevenue = data.books.map(b => ({
    title: b.title,
    rev: data.sales.filter(s => s.bookId === b.id).reduce((acc, curr) => acc + curr.revenue, 0)
  })).sort((a,b) => b.rev - a.rev)[0];

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Panel Editorial</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Atreyu ASD Operating System</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => db.exportData()}
            className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <i className="fa-solid fa-download"></i> Backup Completo
          </button>
          
          <label className="flex items-center gap-2 bg-white border border-slate-100 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 cursor-pointer">
            <i className="fa-solid fa-upload"></i> Restaurar
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MÓDULO DE IDENTIDAD CORPORATIVA */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <i className="fa-solid fa-fingerprint text-[#1CB5B1]"></i> Identidad ASD
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden mb-6 group relative">
              <ASDLogo className="w-24 h-24 object-contain" />
              <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                <i className="fa-solid fa-camera text-white text-xl mb-1"></i>
                <span className="text-[8px] font-black text-white uppercase">Cambiar Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-black text-slate-900 uppercase">Logo Personalizado</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Aplica a Login y Sidebar</p>
            </div>
          </div>
          <button 
            onClick={handleResetLogo}
            className="mt-6 w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            Restablecer Original
          </button>
        </div>

        {/* STATS RÁPIDOS */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Obras Publicadas" value={activeBooks} subtitle="Total catálogo activo" icon="fa-book-atlas" color="indigo" />
          <StatCard title="Ingresos Totales" value={`${totalRevenue.toFixed(2)}€`} subtitle="Acumulado bruto" icon="fa-sack-dollar" color="emerald" />
          <StatCard title="Páginas KENP" value={totalKenpc.toLocaleString()} subtitle="Lecturas KDP Select" icon="fa-book-open-reader" color="amber" />
          <StatCard title="Producto Estrella" value={bookRevenue?.title || 'N/A'} subtitle={`${bookRevenue?.rev.toFixed(2) || 0}€ generados`} icon="fa-crown" color="purple" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Histórico de Facturación</h2>
            <span className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
              <i className="fa-solid fa-circle text-[6px]"></i> Rendimiento Global
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales.slice(-30)}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1CB5B1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1CB5B1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1CB5B1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-8 text-indigo-400">Próximos Hitos</h2>
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
            {data.books.filter(b => b.status !== 'Publicado' && b.scheduledDate).slice(0, 5).map(book => (
              <div key={book.id} className="flex items-center gap-4 group">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight line-clamp-1">{book.title}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{book.scheduledDate}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-900">
             <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
               <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Estado del sistema</p>
               <p className="text-[10px] text-white font-bold">Metadata: {storageUsed}kb / Media: IndexedDB</p>
             </div>
          </div>
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
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:translate-y-[-5px] transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-sm ${colors[color]}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2">{value}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;
