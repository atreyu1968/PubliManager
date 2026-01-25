
import React, { useState, useEffect } from 'react';
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
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';

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
    { path: '/history', icon: 'fa-clock-rotate-left', label: 'Historial' },
    { path: '/series', icon: 'fa-layer-group', label: 'Sagas' },
    { path: '/sales', icon: 'fa-money-bill-trend-up', label: 'Ventas' },
    { path: '/imprints', icon: 'fa-tags', label: 'Sellos' },
    { path: '/pseudonyms', icon: 'fa-user-pen', label: 'Seudónimos' },
    { path: '/ai-assistant', icon: 'fa-robot', label: 'Asistente IA' },
    { path: '/settings', icon: 'fa-gears', label: 'Personalización' },
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
      <nav className="flex-1 mt-6 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
              location.pathname === item.path 
              ? 'bg-[#1CB5B1] text-white font-semibold shadow-inner' 
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-center`}></i>
            {item.label}
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

  useEffect(() => {
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
    return () => window.removeEventListener('brand_updated', applyFavicon);
  }, []);

  const refreshData = () => {
    setData(db.getData());
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar onLogout={() => { localStorage.removeItem('pm_auth'); setIsAuthenticated(false); }} />
        <main className="flex-1 ml-64 p-8 flex flex-col overflow-x-hidden">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard data={data} refreshData={refreshData} />} />
              <Route path="/agenda" element={<AgendaView data={data} refreshData={refreshData} />} />
              <Route path="/books" element={<BooksManager data={data} refreshData={refreshData} />} />
              <Route path="/history" element={<HistoryView data={data} />} />
              <Route path="/series" element={<SeriesManager data={data} refreshData={refreshData} />} />
              <Route path="/sales" element={<SalesTracker data={data} refreshData={refreshData} />} />
              <Route path="/imprints" element={<ImprintsManager data={data} refreshData={refreshData} />} />
              <Route path="/pseudonyms" element={<PseudonymsManager data={data} refreshData={refreshData} />} />
              <Route path="/ai-assistant" element={<AIAssistant data={data} />} />
              <Route path="/settings" element={<SettingsView data={data} refreshData={refreshData} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          
          <footer className="mt-40 pb-16 flex flex-col items-center justify-center gap-8">
            <div className="flex items-center gap-5 opacity-20">
              <div className="h-[1px] w-32 bg-slate-400"></div>
              <ASDLogo className="w-10 h-auto grayscale" forceDefault />
              <div className="h-[1px] w-32 bg-slate-400"></div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">
                Atreyu Servicios Digitales &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
