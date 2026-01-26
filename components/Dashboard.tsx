
import React, { useEffect, useState } from 'react';
import { AppData } from '../types';
import { db } from '../db';
import { imageStore } from '../imageStore';
import { ASDLogo } from '../App';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: AppData;
  refreshData: () => void;
  dbSource: 'server' | 'local' | 'empty_server';
}

const Dashboard: React.FC<Props> = ({ data, refreshData, dbSource }) => {
  const [storageUsed, setStorageUsed] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
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

  const handleForceSync = async () => {
    if (!confirm('Esto subirá todos tus datos locales al servidor y los compartirá con todos tus dispositivos. ¿Continuar?')) return;
    setIsSyncing(true);
    const success = await db.forcePushToServer();
    if (success) {
      alert('¡Sincronización completada! Tus datos ya están en el servidor SQLite.');
      refreshData();
    } else {
      alert('Error en la sincronización. Verifica que el servidor esté activo.');
    }
    setIsSyncing(false);
  };

  const activeBooks = data.books.filter(b => b.status === 'Publicado').length;
  const totalRevenue = data.sales.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalKenpc = data.sales.reduce((acc, curr) => acc + curr.kenpc, 0);

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <i className="fa-solid fa-chart-line text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Panel Editorial</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Atreyu ASD Operating System v3.0</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {data.settings.googleSheetMasterUrl && (
            <a 
              href={data.settings.googleSheetMasterUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-md active:scale-95"
            >
              <i className="fa-solid fa-file-excel"></i> Hoja Amazon
            </a>
          )}
          <Link 
            to="/import"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          >
            <i className="fa-solid fa-file-import"></i> Importar
          </Link>
          <button 
            onClick={() => db.exportData()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all shadow-md active:scale-95"
          >
            <i className="fa-solid fa-download"></i> Backup
          </button>
        </div>
      </div>

      {/* ALERTA DE SINCRONIZACIÓN (Solo si está en modo local/vacío) */}
      {(dbSource === 'local' || dbSource === 'empty_server') && data.books.length > 0 && (
        <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse shadow-xl ${
          dbSource === 'empty_server' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-amber-500 border-amber-400 text-white'
        }`}>
          <div className="flex items-center gap-5 text-left">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
              <i className={`fa-solid ${dbSource === 'empty_server' ? 'fa-cloud-arrow-up' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter">
                {dbSource === 'empty_server' ? 'Servidor Listo para Datos' : 'Datos Locales Detectados'}
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
                Tus datos actuales solo viven en este navegador. Sincronízalos con el servidor SQLite para acceder desde cualquier lugar.
              </p>
            </div>
          </div>
          <button 
            onClick={handleForceSync}
            disabled={isSyncing}
            className="w-full md:w-auto px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <i className="fa-solid fa-sync animate-spin mr-2"></i> : <i className="fa-solid fa-cloud-upload mr-2"></i>}
            {isSyncing ? 'Sincronizando...' : 'Subir a la Nube ASD'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-lg shadow-slate-100/50 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
            <ASDLogo className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-sm font-black text-slate-900 uppercase">Identidad ASD</h2>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configuración de Marca</p>
          <Link to="/settings" className="mt-4 text-[9px] font-black text-[#1CB5B1] hover:text-slate-900 uppercase tracking-widest transition-colors">
            Gestionar Branding <i className="fa-solid fa-arrow-right ml-1"></i>
          </Link>
        </div>

        <StatCard title="Obras Publicadas" value={activeBooks} subtitle="Total catálogo activo" icon="fa-book-atlas" color="indigo" />
        <StatCard title="Ingresos Totales" value={`${totalRevenue.toFixed(2)}€`} subtitle="Acumulado bruto" icon="fa-sack-dollar" color="emerald" />
        <StatCard title="Páginas KENP" value={totalKenpc.toLocaleString()} subtitle="Lecturas KDP Select" icon="fa-book-open-reader" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-lg shadow-slate-100/50 border border-slate-200">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Histórico de Facturación</h2>
            <span className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              <i className="fa-solid fa-circle text-[6px]"></i> Rendimiento Global
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales.slice(-30)}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1CB5B1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1CB5B1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1CB5B1" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col border border-slate-800">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] mb-8 text-indigo-400">Próximos Hitos</h2>
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
            {data.books.filter(b => b.status !== 'Publicado' && b.scheduledDate).slice(0, 5).map(book => (
              <div key={book.id} className="flex items-center gap-4 group pb-4 border-b border-slate-900 last:border-0">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight line-clamp-1 text-white">{book.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{book.scheduledDate}</p>
                </div>
              </div>
            ))}
            {data.books.filter(b => b.status !== 'Publicado' && b.scheduledDate).length === 0 && (
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">No hay lanzamientos programados</p>
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-900">
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
               <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Estado del sistema</p>
               <p className="text-[10px] text-white font-bold tracking-tight">Capacidad: {storageUsed}kb / {dbSource === 'server' ? 'CloudSync Active' : 'LocalSafe Mode'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-md shadow-slate-100/50 border border-slate-200 flex flex-col justify-between hover:translate-y-[-5px] transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm border ${colors[color]} group-hover:scale-110 transition-transform`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">{value}</p>
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;
