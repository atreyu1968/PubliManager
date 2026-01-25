
import React, { useState } from 'react';
import { AppData } from '../types';
import { generateEditorialHelp } from '../geminiService';

interface Props {
  data: AppData;
}

const AIAssistant: React.FC<Props> = ({ data }) => {
  const [selectedBookId, setSelectedBookId] = useState('');
  const [tool, setTool] = useState<'blurb' | 'ads' | 'aplus' | 'translate' | 'summary' | 'thanks'>('blurb');
  const [targetLang, setTargetLang] = useState('Inglés');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const book = data.books.find(b => b.id === selectedBookId);
    if (!book) {
      alert('Selecciona un libro primero.');
      return;
    }

    const author = data.pseudonyms.find(p => p.id === book.pseudonymId);
    setLoading(true);
    
    let extra: string = '';
    if (tool === 'translate') extra = targetLang;
    if (tool === 'thanks') extra = author?.name || 'Autor';

    const contentToProcess = tool === 'thanks' 
      ? (author?.bio || book.description || '') 
      : (book.description || '');

    try {
      const output = await generateEditorialHelp(tool, book.title, contentToProcess, extra, book.kuStrategy);
      setResult(output || 'No se recibió respuesta del motor de análisis.');
    } catch (err) {
      setResult('Error crítico en el motor de análisis profundo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      {/* HEADER ESTANDARIZADO */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <i className="fa-solid fa-microchip text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">ASD Deep Intelligence</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
              Motor de razonamiento profundo para metadatos y SEO
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Core Seguro Activo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-400 mb-6 uppercase text-[10px] tracking-[0.2em]">Configuración de Análisis</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Obra para Procesar</label>
                <select 
                  className="w-full border-none rounded-xl bg-slate-50 p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
                  value={selectedBookId}
                  onChange={e => setSelectedBookId(e.target.value)}
                >
                  <option value="">Seleccione un título...</option>
                  {data.books.map(b => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Algoritmo</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'summary', icon: 'fa-bolt', label: 'Pitch de Ventas' },
                    { id: 'blurb', icon: 'fa-feather', label: 'Optimización Blurb' },
                    { id: 'translate', icon: 'fa-globe', label: 'Transcreación' },
                    { id: 'ads', icon: 'fa-bullhorn', label: 'Copy de Amazon Ads' },
                    { id: 'thanks', icon: 'fa-heart', label: 'Agradecimientos' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setTool(t.id as any)} 
                      className={`text-left px-4 py-4 rounded-xl border transition-all flex items-center gap-3 ${tool === t.id ? 'bg-slate-900 border-slate-900 text-white font-bold' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <i className={`fa-solid ${t.icon} w-5 text-center`}></i>
                      <span className="text-xs uppercase tracking-wider font-black">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {tool === 'translate' && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Idioma de Destino</label>
                  <select 
                    value={targetLang}
                    onChange={e => setTargetLang(e.target.value)}
                    className="w-full border-none rounded-xl bg-slate-50 p-4 text-sm font-black text-indigo-600"
                  >
                    <option value="Inglés">Inglés</option>
                    <option value="Alemán">Alemán</option>
                    <option value="Francés">Francés</option>
                    <option value="Italiano">Italiano</option>
                  </select>
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={loading || !selectedBookId}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 mt-2 uppercase text-xs tracking-[0.2em]"
              >
                {loading ? <i className="fa-solid fa-sync animate-spin"></i> : 'Ejecutar Análisis'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col min-h-[550px]">
          <div className="bg-black rounded-3xl shadow-2xl overflow-hidden flex flex-col flex-1 border border-zinc-900">
            <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex justify-between items-center text-zinc-500">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/20"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></span>
                </div>
                <span className="ml-3 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Deep_Analysis_Output.log</span>
              </div>
              {result && (
                <button onClick={() => {navigator.clipboard.writeText(result); alert('Copiado');}} className="hover:text-white transition flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]">
                  <i className="fa-solid fa-copy"></i> Copiar
                </button>
              )}
            </div>
            <div className="p-10 text-zinc-300 font-mono text-sm overflow-y-auto flex-1 leading-relaxed selection:bg-cyan-500 selection:text-white">
              {result ? (
                <div className="whitespace-pre-wrap animate-fadeIn text-cyan-50">
                   <div className="text-[10px] text-zinc-700 mb-6 uppercase tracking-widest border-b border-zinc-900 pb-2">Analysis Result:</div>
                   {result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <i className="fa-solid fa-terminal text-6xl text-zinc-800 mb-6"></i>
                  <p className="text-sm tracking-[0.2em] text-center uppercase font-black text-zinc-700">Esperando parámetros de entrada...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
