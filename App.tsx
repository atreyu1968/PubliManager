
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { db } from './db';
import { AppData } from './types';
import Dashboard from './components/Dashboard';
import BooksManager from './components/BooksManager';
import SeriesManager from './components/SeriesManager';
import ImprintsManager from './components/ImprintsManager';
import PseudonymsManager from './components/PseudonymsManager';
import AgendaView from './components/AgendaView';
import SalesTracker from './components/SalesTracker';
import AIAssistant from './components/AIAssistant';

const ASDLogo = ({ size = "text-xl" }: { size?: string }) => (
  <span className={`${size} asd-logo-text tracking-tighter`}>ASD</span>
);

const Sidebar = () => {
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
      <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-3">
        <i className="fa-solid fa-feather-pointed text-amber-400"></i>
        <span className="tracking-tight">PubliManager <span className="text-amber-400 text-xs align-top">AI</span></span>
      </div>
      <nav className="flex-1 mt-6 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-4 transition-all duration-200 ${
              location.pathname === item.path 
              ? 'bg-amber-500 text-white font-semibold shadow-inner' 
              : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6 text-center`}></i>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-6 text-[10px] text-slate-500 border-t border-slate-800 flex items-center justify-between">
        <span>EDICIÓN INDIE PREMIUM</span>
        <ASDLogo size="text-sm" />
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="mt-auto py-4 border-t border-slate-100 flex items-center justify-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
    <div className="flex items-center gap-2">
      <ASDLogo size="text-[10px]" />
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Atreyu servicios digitales</span>
    </div>
    <span className="text-slate-200">|</span>
    <p className="text-[9px] text-slate-400 font-medium tracking-tight">© {new Date().getFullYear()} Indie PubliManager</p>
  </footer>
);

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(db.getData());
  const refreshData = () => setData(db.getData());

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex flex-col">
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
            </Routes>
          </div>
          <Footer />
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
