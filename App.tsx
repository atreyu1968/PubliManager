
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { db } from './db';
import { AppData } from './types';
import { ASD_LOGO_IMAGE } from './assets';
import { imageStore } from './imageStore';
import Dashboard from './components/Dashboard';
import BooksManager from './components/BooksManager';
import SeriesManager from './components/SeriesManager';
import ImprintsManager from './components/ImprintsManager';
import PseudonymsManager from './components/PseudonymsManager';
import AgendaView from './components/AgendaView';
import SalesTracker from './components/SalesTracker';
import Login from './components/Login';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import ToolsView from './components/ToolsView';
import ImportManager from './components/ImportManager';

export const ASDLogo = ({ className = "w-16", forceDefault = false }: { className?: string, forceDefault?: boolean }) => {
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const loadBrand = async () => {
      const logo = await imageStore.get('SYSTEM_BRAND_LOGO');
      setCustomLogo(logo);
    };
    loadBrand();
    window.addEventListener('brand_updated', loadBrand);
    return () => window.removeEventListener('brand_updated', loadBrand);
  }, []);

  return (
    <img 
      src={(!forceDefault && customLogo) ? customLogo : ASD_LOGO_IMAGE} 
      alt="ASD Logo" 
      className={className}
      style={{ filter: 'none' }} 
    />
  );
};

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: 'fa-chart-line', label: 'Panel' },
    { path: '/agenda', icon: 'fa-calendar-days', label: 'Agenda' },
    { path: '/books', icon: 'fa-book', label: 'Catálogo' },
    { path: '/import', icon: 'fa-file-import', label: 'Importar' },
    { path: '/tools', icon: 'fa-toolbox', label: 'Herramientas' },
    { path: '/history', icon: 'fa-clock-rotate-left', label: 'Historial' },
    { path: '/series', icon: 'fa-layer-group', label: 'Sagas' },
    { path: '/sales', icon: 'fa-money-bill-trend-up', label: 'Ventas' },
    { path: '/imprints', icon: 'fa-tags', label: 'Sellos' },
    { path: '/pseudonyms', icon: 'fa-user-pen', label: 'Seudónimos' },
    { path: '/settings', icon: 'fa-sliders', label: 'Personalización', special: true },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ASDLogo className="w-10 h-auto" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase leading-none">Atreyu ASD</span>
            <span className="text-[8px] font-bold text-[#1CB5B1] uppercase mt-1.5">Elite OS v3.0</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 mt-6 overflow-y-auto no-scrollbar pb-10">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
              location.pathname === item.path 
              ? 'bg-[#1CB5B1] text-white font-semibold shadow-inner' 
              : item.special 
                ? 'text-[#1CB5B1] font-black hover:bg-slate-800' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-center`}></i>
            <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
        >
          <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pm_auth') === 'true';
  });
  const [data, setData] = useState<AppData>(db.getData());
  const [dbSource, setDbSource] = useState<'server' | 'local' | 'empty_server'>('local');
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const { data: newData, source } = await db.fetchData();
    setData(newData);
    setDbSource(source);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();

    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setData(e.detail);
      } else {
        refreshData();
      }
    };

    window.addEventListener('storage_updated', handleStorageUpdate);
    window.addEventListener('storage', refreshData);

    const applyFavicon = async () => {
      const fav = await imageStore.get('SYSTEM_BRAND_FAVICON');
      if (fav) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = fav;
      }
    };

    applyFavicon();
    window.addEventListener('brand_updated', applyFavicon);

    return () => {
      window.removeEventListener('storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('brand_updated', applyFavicon);
    };
  }, [refreshData]);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;
  if (isLoading) return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-6">
       <ASDLogo className="w-24 h-auto animate-pulse" />
       <p className="text-[10px] font-black text-[#1CB5B1] uppercase tracking-[0.5em]">Verificando Estación ASD...</p>
    </div>
  );

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 relative">
        <Sidebar onLogout={() => { localStorage.removeItem('pm_auth'); setIsAuthenticated(false); }} />
        
        <div className="flex-1 flex flex-col ml-64 min-h-screen">
          {/* BARRA DE ESTADO DE CONEXIÓN */}
          <div className={`px-6 py-1 text-center border-b transition-all duration-500 ${
            dbSource === 'server' ? 'bg-emerald-500/10 border-emerald-500/20' : 
            dbSource === 'empty_server' ? 'bg-blue-500/10 border-blue-500/20' : 
            'bg-amber-500/10 border-amber-500/20'
          }`}>
            <p className={`text-[8px] font-black uppercase tracking-widest ${
              dbSource === 'server' ? 'text-emerald-600' : 
              dbSource === 'empty_server' ? 'text-blue-600' : 
              'text-amber-600'
            }`}>
              <i className={`fa-solid ${
                dbSource === 'server' ? 'fa-cloud-check' : 
                dbSource === 'empty_server' ? 'fa-server' : 
                'fa-triangle-exclamation'
              } mr-2`}></i>
              {dbSource === 'server' ? 'Sincronizado con SQLite en Servidor' : 
               dbSource === 'empty_server' ? 'Servidor Conectado (Base de datos vacía)' : 
               'Modo Local (Sin conexión al servidor)'}
            </p>
          </div>

          <main className="flex-1 p-8 pb-16 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard data={data} refreshData={refreshData} dbSource={dbSource} />} />
              <Route path="/agenda" element={<AgendaView data={data} refreshData={refreshData} />} />
              <Route path="/books" element={<BooksManager data={data} refreshData={refreshData} />} />
              <Route path="/import" element={<ImportManager data={data} refreshData={refreshData} />} />
              <Route path="/tools" element={<ToolsView data={data} />} />
              <Route path="/history" element={<HistoryView data={data} />} />
              <Route path="/series" element={<SeriesManager data={data} refreshData={refreshData} />} />
              <Route path="/sales" element={<SalesTracker data={data} refreshData={refreshData} />} />
              <Route path="/imprints" element={<ImprintsManager data={data} refreshData={refreshData} />} />
              <Route path="/pseudonyms" element={<PseudonymsManager data={data} refreshData={refreshData} />} />
              <Route path="/settings" element={<SettingsView data={data} refreshData={refreshData} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <footer className="fixed bottom-0 right-0 left-64 bg-white/95 backdrop-blur-md border-t border-slate-100 py-1.5 px-6 flex items-center justify-between z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
             <div className="flex items-center gap-2">
                <ASDLogo className="w-5 h-auto grayscale opacity-40 hover:opacity-100 transition-opacity" forceDefault />
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest border-l border-slate-100 pl-2">Atreyu Digital Ecosystem</span>
             </div>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                ASD Atreyu &copy; {new Date().getFullYear()}
             </p>
          </footer>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
