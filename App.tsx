
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { db } from './db';
import { AppData } from './types';
import { ASD_LOGO_IMAGE } from './assets';
import Dashboard from './components/Dashboard';
import BooksManager from './components/BooksManager';
import SeriesManager from './components/SeriesManager';
import ImprintsManager from './components/ImprintsManager';
import PseudonymsManager from './components/PseudonymsManager';
import AgendaView from './components/AgendaView';
import SalesTracker from './components/SalesTracker';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';

const ASDLogo = ({ className = "w-16" }: { className?: string }) => (
  <img src={ASD_LOGO_IMAGE} alt="ASD Logo" className={className} />
);

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: 'fa-chart-line', label: 'Panel' },
    { path: '/agenda', icon: 'fa-calendar-days', label: 'Agenda 7 Días' },
    { path: '/books', icon: 'fa-book', label: 'Catálogo' },
    { path: '/series', icon: 'fa-layer-group', label: 'Sagas / Series' },
    { path: '/sales', icon: 'fa-money-bill-trend-up', label: 'Ventas y KENPC' },
    { path: '/imprints', icon: 'fa-tags', label: 'Sellos' },
    { path: '/pseudonyms', icon: 'fa-user-pen', label: 'Seudónimos' },
    { path: '/ai-assistant', icon: 'fa-robot', label: 'Asistente IA' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50">
      <div className="p-6 border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ASDLogo className="w-14" />
          <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Atreyu ASD</span>
        </div>
        <div className="mt-2 text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded inline-block w-fit">PUBLIMANAGER AI</div>
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
          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
        >
          <i className="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
        </button>
      </div>
      <div className="p-6 text-[9px] text-slate-500 border-t border-slate-800 flex flex-col gap-1">
        <span className="font-black uppercase tracking-widest">Atreyu Servicios Digitales</span>
        <span className="opacity-50">V2.5 PREMIUM</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pm_auth') === 'true';
  });
  const [data, setData] = useState<AppData>(db.getData());

  const refreshData = () => {
    const freshData = db.getData();
    setData(freshData);
  };

  const handleLogin = () => {
    localStorage.setItem('pm_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('pm_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar onLogout={handleLogout} />
        <main className="flex-1 ml-64 p-8 flex flex-col overflow-x-hidden">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard data={data} refreshData={refreshData} />} />
              <Route path="/agenda" element={<AgendaView data={data} refreshData={refreshData} />} />
              <Route path="/books" element={<BooksManager data={data} refreshData={refreshData} />} />
              <Route path="/series" element={<SeriesManager data={data} refreshData={refreshData} />} />
              <Route path="/sales" element={<SalesTracker data={data} refreshData={refreshData} />} />
              <Route path="/imprints" element={<ImprintsManager data={data} refreshData={refreshData} />} />
              <Route path="/pseudonyms" element={<PseudonymsManager data={data} refreshData={refreshData} />} />
              <Route path="/ai-assistant" element={<AIAssistant data={data} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <footer className="mt-auto py-8 border-t border-slate-200 flex items-center justify-center gap-4 opacity-60">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Atreyu servicios digitales</span>
            </div>
            <span className="text-slate-300">|</span>
            <p className="text-[9px] text-slate-400 font-medium tracking-tight">© {new Date().getFullYear()} Indie PubliManager</p>
          </footer>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
