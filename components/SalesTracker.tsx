
import React, { useState } from 'react';
import { AppData, SaleRecord } from '../types';
import { db } from '../db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: AppData;
  refreshData: () => void;
}

const SalesTracker: React.FC<Props> = ({ data, refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSale, setNewSale] = useState<Partial<SaleRecord>>({
    bookId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    units: 0,
    kenpc: 0,
    revenue: 0,
    platform: 'KDP'
  });

  const handleAddSale = () => {
    if (newSale.bookId && newSale.revenue !== undefined) {
      db.addItem('sales', { ...newSale, id: 'sale-' + Date.now() } as SaleRecord);
      refreshData();
      setIsModalOpen(false);
    }
  };

  const getMonthName = (m: number) => {
    const dates = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return dates[m - 1] || 'N/A';
  };

  const chartData = data.sales.map(s => ({
    label: `${getMonthName(s.month)} ${s.year}`,
    revenue: s.revenue,
    kenpc: s.kenpc,
    platform: s.platform
  }));

  return (
    <div className="space-y-8 animate-fadeIn text-slate-900">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Registro de Operaciones</h1>
          <p className="text-sm text-slate-500 font-medium">Control unificado de ingresos KDP y Draft2Digital.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95 font-black text-xs tracking-widest uppercase">
          <i className="fa-solid fa-file-import"></i> Registrar Mes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Ingresos Consolidados</h2>
          <div className="h-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a'}} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} name="Euros (€)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Lecturas KENP (KDP Select)</h2>
          <div className="h-full pb-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" fontSize={10} stroke="#94a3b8" />
                <YAxis fontSize={10} stroke="#94a3b8" />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="kenpc" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Páginas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-8 py-4">Período</th>
              <th className="px-8 py-4">Libro</th>
              <th className="px-8 py-4">Distribuidora</th>
              <th className="px-8 py-4 text-right">Ventas</th>
              <th className="px-8 py-4 text-right">KENP</th>
              <th className="px-8 py-4 text-right">Ingresos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.sales.sort((a,b) => (b.year*12+b.month) - (a.year*12+a.month)).map(record => (
              <tr key={record.id} className="hover:bg-slate-50 transition">
                <td className="px-8 py-5 text-xs font-bold text-slate-600 uppercase">{getMonthName(record.month)} {record.year}</td>
                <td className="px-8 py-5 text-sm font-black text-slate-900">
                  {data.books.find(b => b.id === record.bookId)?.title || 'Libro eliminado'}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${record.platform === 'KDP' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                    {record.platform}
                  </span>
                </td>
                <td className="px-8 py-5 text-right font-mono text-xs text-slate-600">{record.units}</td>
                <td className="px-8 py-5 text-right font-mono text-xs text-indigo-500 font-bold">{record.kenpc.toLocaleString()}</td>
                <td className="px-8 py-5 text-right font-black text-emerald-600">{record.revenue.toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-scaleIn text-slate-900">
            <h2 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tighter uppercase leading-none">
              <i className="fa-solid fa-chart-line text-emerald-500"></i> Nuevo Reporte
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Obra Seleccionada</label>
                <select value={newSale.bookId} onChange={e => setNewSale({...newSale, bookId: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Seleccionar del catálogo...</option>
                  {data.books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mes</label>
                  <select value={newSale.month} onChange={e => setNewSale({...newSale, month: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-900 outline-none">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{getMonthName(m)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Año</label>
                  <input type="number" value={newSale.year} onChange={e => setNewSale({...newSale, year: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-mono text-slate-900 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Distribución</label>
                  <select value={newSale.platform} onChange={e => setNewSale({...newSale, platform: e.target.value as any})} className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-black text-indigo-600 outline-none shadow-sm">
                    <option value="KDP">Amazon KDP</option>
                    <option value="D2D">Draft2Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Unidades</label>
                  <input type="number" value={newSale.units} onChange={e => setNewSale({...newSale, units: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-mono text-slate-900 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Páginas KENP</label>
                  <input type="number" value={newSale.kenpc} onChange={e => setNewSale({...newSale, kenpc: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-mono text-slate-900 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ingresos (€)</label>
                  <input type="number" step="0.01" value={newSale.revenue} onChange={e => setNewSale({...newSale, revenue: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-mono font-bold text-emerald-600 outline-none" />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">Cancelar</button>
                <button onClick={handleAddSale} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-100 transition active:scale-95 uppercase text-[10px] tracking-widest">Guardar Reporte</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTracker;
